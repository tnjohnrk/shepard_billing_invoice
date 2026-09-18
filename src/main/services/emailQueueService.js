import { enqueueEmail, getPendingEmails, updateEmailQueueStatus } from '../repositories/emailQueueRepository.js';
import { sendBackupEmail } from './emailService.js';
import { COMPANY_CONFIG } from '../config/companyConfig.js';
import { getSetting } from '../repositories/settingsRepository.js';

export async function handleInvoiceSavedEmailBackup(invoiceId, backupPath) {
  const recipient = getSetting('backup_email', '') || COMPANY_CONFIG.backup_email;

  try {
    // Attempt sending directly
    const info = await sendBackupEmail(backupPath, recipient);
    console.log(`[EmailBackup] Backup email successfully sent to ${recipient} for document #${invoiceId}`);
    return { success: true, recipient, messageId: info?.messageId };
  } catch (err) {
    // Offline or SMTP not configured -> Queue silently without blocking UI save
    console.warn(`[EmailBackup] Direct send failed (${err.message}). Enqueuing backup for document #${invoiceId}`);
    enqueueEmail({
      invoice_id: invoiceId,
      backup_path: backupPath,
      recipient
    });
    return { success: false, queued: true, error: err.message, recipient };
  }
}

export async function processPendingEmailQueue() {
  const pending = getPendingEmails();
  if (pending.length === 0) return;

  const activeRecipient = getSetting('backup_email', '') || COMPANY_CONFIG.backup_email;

  for (const item of pending) {
    try {
      updateEmailQueueStatus(item.id, { status: 'SENDING' });
      await sendBackupEmail(item.backup_path, activeRecipient || item.recipient);
      updateEmailQueueStatus(item.id, { status: 'SENT' });
    } catch (err) {
      updateEmailQueueStatus(item.id, {
        status: 'FAILED',
        error_message: err.message
      });
    }
  }
}
