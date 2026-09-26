import fs from 'fs';
import { 
  enqueueEmail, 
  getPendingEmails,
  getPendingEmailsBatch,
  updateEmailQueueStatus, 
  getEmailQueueSummary as repoGetSummary,
  clearSentEmails as repoClearSent
} from '../repositories/emailQueueRepository.js';
import { getInvoiceById } from '../repositories/invoiceRepository.js';
import { getProformaById } from '../repositories/proformaRepository.js';
import { generateInvoicePdf } from './pdfService.js';
import { sendInvoicePdfEmail } from './emailService.js';
import { COMPANY_CONFIG } from '../config/companyConfig.js';
import { getSetting } from '../repositories/settingsRepository.js';

export async function handleInvoiceSavedEmailBackup(invoiceId, backupPath) {
  const recipient = getSetting('backup_email', '') || COMPANY_CONFIG.backup_email;

  // Always queue cleanly to database with PENDING status (offline-first architecture)
  const queueId = enqueueEmail({
    invoice_id: invoiceId,
    backup_path: backupPath || '',
    recipient
  });

  console.log(`[EmailQueue] Document #${invoiceId} queued for email dispatch (Queue ID: ${queueId})`);
  return { success: true, queued: true, queueId, recipient };
}

export function getEmailQueueStatus() {
  return repoGetSummary();
}

export function clearSentEmailQueue() {
  return repoClearSent();
}

export async function processPendingEmailQueue(overrideSettings = {}, batchSize = 10) {
  const safeLimit = Math.max(1, parseInt(batchSize, 10) || 10);
  const pending = getPendingEmailsBatch(safeLimit);

  if (!pending || pending.length === 0) {
    const summary = repoGetSummary();
    return {
      success: true,
      batchSize: safeLimit,
      total: 0,
      sent: 0,
      failed: 0,
      remainingPending: summary.pendingCount,
      totalSentOverall: summary.sentCount,
      message: 'No pending backup emails in queue.'
    };
  }

  const activeRecipient = overrideSettings.backup_email || getSetting('backup_email', '') || COMPANY_CONFIG.backup_email;
  let sentCount = 0;
  let failedCount = 0;
  const errors = [];

  for (const item of pending) {
    try {
      updateEmailQueueStatus(item.id, { status: 'SENDING' });

      // 1. Fetch document record (either Tax Invoice or Proforma)
      let docData = getInvoiceById(item.invoice_id);
      let docType = 'NORMAL';

      if (!docData) {
        docData = getProformaById(item.invoice_id);
        docType = 'PROFORMA';
      }

      const isProforma = docType === 'PROFORMA' || Boolean(docData?.proforma_number) || String(docData?.invoice_type).toUpperCase() === 'PROFORMA';
      const docNumber = (isProforma ? docData?.proforma_number : docData?.invoice_number) || `DOC-${item.invoice_id}`;

      // 2. Ensure we have the valid PDF file to attach
      let pdfPath = item.backup_path;
      const hasValidPdf = pdfPath && fs.existsSync(pdfPath) && pdfPath.toLowerCase().endsWith('.pdf');

      if (!hasValidPdf) {
        if (docData) {
          pdfPath = await generateInvoicePdf({ ...docData, invoice_type: isProforma ? 'PROFORMA' : 'NORMAL' });
        } else if (pdfPath && fs.existsSync(pdfPath)) {
          // Keep existing file path fallback if available
        } else {
          throw new Error(`Invoice record #${item.invoice_id} not found to generate PDF.`);
        }
      }

      // 3. Dispatch email with PDF attachment only (no internal file paths displayed)
      await sendInvoicePdfEmail({
        pdfPath,
        docNumber,
        docType: isProforma ? 'PROFORMA' : 'NORMAL',
        invoiceData: docData,
        recipient: activeRecipient || item.recipient,
        overrideSettings
      });

      updateEmailQueueStatus(item.id, { status: 'SENT' });
      sentCount++;
    } catch (err) {
      failedCount++;
      const userFriendlyMsg = err.message || 'Transmission failed.';
      errors.push(userFriendlyMsg);
      updateEmailQueueStatus(item.id, {
        status: 'FAILED',
        error_message: userFriendlyMsg
      });
    }
  }

  const updatedSummary = repoGetSummary();

  return {
    success: failedCount === 0,
    batchSize: safeLimit,
    batchAttempted: pending.length,
    sent: sentCount,
    failed: failedCount,
    remainingPending: updatedSummary.pendingCount,
    totalSentOverall: updatedSummary.sentCount,
    recipient: activeRecipient,
    errors,
    message: failedCount === 0 
      ? `Successfully sent batch of ${sentCount} invoice(s) to ${activeRecipient}.` 
      : `Dispatched ${sentCount} invoice(s), but ${failedCount} encountered errors.`
  };
}


