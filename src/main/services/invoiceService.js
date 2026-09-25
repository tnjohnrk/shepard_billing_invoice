import { 
  createInvoice, 
  getInvoiceById, 
  getInvoiceByNumber, 
  listInvoices, 
  generateNextInvoiceNumber, 
  updateInvoicePdfPath,
  softDeleteInvoice as repoSoftDelete,
  restoreInvoice as repoRestore,
  permanentlyDeleteInvoice as repoPermanentDelete,
  listDeletedInvoices as repoListDeleted
} from '../repositories/invoiceRepository.js';
import { saveOrUpdateCustomer } from '../repositories/customerRepository.js';
import { computeCompleteInvoiceTotals } from '../../shared/utils/sharedCalculations.js';
import { COMPANY_CONFIG } from '../config/companyConfig.js';
import { generateInvoicePdf } from './pdfService.js';
import { createAutomaticBackup } from './backupService.js';
import { handleInvoiceSavedEmailBackup } from './emailQueueService.js';

export async function saveNewInvoice(formData) {
  // Compute exact totals with user-entered tax rates if provided
  const sellerStateCode = COMPANY_CONFIG.state_code;
  const totals = computeCompleteInvoiceTotals(
    formData.items || [],
    sellerStateCode,
    formData.customer_state_code,
    18,
    formData.cgst_rate,
    formData.sgst_rate,
    formData.igst_rate
  );

  let invoiceNumber = formData.invoice_number;
  if (!invoiceNumber) {
    invoiceNumber = generateNextInvoiceNumber();
  } else if (!formData.id) {
    const existing = getInvoiceByNumber(invoiceNumber);
    if (existing) {
      invoiceNumber = generateNextInvoiceNumber();
    }
  }

  const invoiceModel = {
    invoice_number: invoiceNumber,
    invoice_type: formData.invoice_type || 'NORMAL',
    invoice_date: formData.invoice_date || new Date().toISOString().split('T')[0],
    copy_type: formData.copy_type || 'ORIGINAL',
    proforma_id: formData.proforma_id || null,

    transportation_mode: formData.transportation_mode || null,
    vehicle_number: formData.vehicle_number || null,
    date_of_supply: formData.date_of_supply || null,
    delivery_address: formData.delivery_address || null,

    buyer_name: formData.buyer_name,
    buyer_address: formData.buyer_address,
    customer_gstin: formData.customer_gstin || null,
    customer_state: formData.customer_state,
    customer_state_code: formData.customer_state_code,

    so_po_number: formData.so_po_number || null,
    so_po_date: formData.so_po_date || null,
    gemc_number: formData.gemc_number || null,
    additional_reference: formData.additional_reference || null,

    subtotal: totals.subtotal,
    cgst_rate: totals.cgstRate,
    cgst_amount: totals.cgstAmount,
    sgst_rate: totals.sgstRate,
    sgst_amount: totals.sgstAmount,
    igst_rate: totals.igstRate,
    igst_amount: totals.igstAmount,
    grand_total: totals.grandTotal,
    amount_in_words: totals.amountInWords,
    notes: formData.notes || null
  };

  // Step 1: Save Invoice to SQLite Database
  const invoiceId = createInvoice(invoiceModel, totals.items);
  invoiceModel.id = invoiceId;

  // Step 2: Auto-save buyer details to customers repository
  try {
    saveOrUpdateCustomer({
      name: formData.buyer_name,
      address: formData.buyer_address,
      gstin: formData.customer_gstin,
      state: formData.customer_state,
      state_code: formData.customer_state_code
    });
  } catch (e) {
    // Non-blocking
  }

  // Step 3: Generate PDF file
  let pdfPath = null;
  try {
    pdfPath = await generateInvoicePdf({ ...invoiceModel, items: totals.items });
    if (pdfPath) {
      updateInvoicePdfPath(invoiceId, pdfPath);
    }
  } catch (e) {
    // PDF error does NOT block invoice saving
  }

  // Step 4: Create automatic local backup
  let backupPath = null;
  try {
    backupPath = createAutomaticBackup();
  } catch (e) {
    // Backup error does NOT block invoice saving
  }

  // Step 5: Queue invoice PDF for email dispatch
  handleInvoiceSavedEmailBackup(invoiceId, pdfPath || backupPath).catch(() => {});

  return {
    ...invoiceModel,
    items: totals.items,
    pdf_path: pdfPath
  };
}

export function fetchInvoice(id) {
  return getInvoiceById(id);
}

export function fetchInvoiceByNumber(number) {
  return getInvoiceByNumber(number);
}

export function queryInvoices(filters) {
  return listInvoices(filters);
}

export function getNextInvoiceNumber() {
  return generateNextInvoiceNumber();
}

export function duplicateExistingInvoice(id) {
  const original = getInvoiceById(id);
  if (!original) {
    throw new Error('Invoice not found to duplicate.');
  }

  const nextNum = generateNextInvoiceNumber();
  return {
    ...original,
    id: undefined,
    invoice_number: nextNum,
    invoice_date: new Date().toISOString().split('T')[0],
    created_at: undefined,
    updated_at: undefined
  };
}

export function softDeleteInvoice(id) {
  return repoSoftDelete(id);
}

export function restoreInvoice(id) {
  return repoRestore(id);
}

export function permanentlyDeleteInvoice(id) {
  return repoPermanentDelete(id);
}

export function getDeletedInvoices() {
  return repoListDeleted();
}
