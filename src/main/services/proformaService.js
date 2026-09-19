import { 
  createProforma, 
  getProformaById, 
  listProformas, 
  generateNextProformaNumber, 
  updateProformaStatus,
  softDeleteProforma as repoSoftDelete,
  restoreProforma as repoRestore,
  permanentlyDeleteProforma as repoPermanentDelete,
  listDeletedProformas as repoListDeleted
} from '../repositories/proformaRepository.js';
import { generateNextInvoiceNumber } from '../repositories/invoiceRepository.js';
import { saveOrUpdateCustomer } from '../repositories/customerRepository.js';
import { computeCompleteInvoiceTotals } from '../../shared/utils/sharedCalculations.js';
import { COMPANY_CONFIG } from '../config/companyConfig.js';
import { saveNewInvoice } from './invoiceService.js';
import { createAutomaticBackup } from './backupService.js';
import { handleInvoiceSavedEmailBackup } from './emailQueueService.js';

export function saveNewProforma(formData) {
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

  const proformaNumber = formData.proforma_number || generateNextProformaNumber();

  const proformaModel = {
    proforma_number: proformaNumber,
    proforma_date: formData.proforma_date || new Date().toISOString().split('T')[0],
    status: formData.status || 'PENDING',

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

  const id = createProforma(proformaModel, totals.items);
  proformaModel.id = id;

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

  // Automatic backup & email backup
  try {
    const backupPath = createAutomaticBackup();
    if (backupPath) {
      handleInvoiceSavedEmailBackup(id, backupPath).catch(() => {});
    }
  } catch (e) {
    // Non-blocking
  }

  return {
    ...proformaModel,
    items: totals.items
  };
}

export function fetchProforma(id) {
  return getProformaById(id);
}

export function queryProformas(filters) {
  return listProformas(filters);
}

export function getNextProformaNumber() {
  return generateNextProformaNumber();
}

export async function convertProformaToTaxInvoice(proformaId, modifiedFormData = null) {
  const proforma = getProformaById(proformaId);
  if (!proforma) {
    throw new Error('Proforma invoice not found for conversion.');
  }

  const isModified = Boolean(modifiedFormData);
  const newStatus = isModified ? 'CONFIRMED_CHANGED' : 'CONFIRMED_UNCHANGED';
  updateProformaStatus(proformaId, newStatus);

  const sourceData = modifiedFormData || proforma;
  const nextInvNum = generateNextInvoiceNumber();

  const newInvoicePayload = {
    ...sourceData,
    invoice_number: nextInvNum,
    invoice_type: 'PROFORMA_CONVERTED',
    invoice_date: new Date().toISOString().split('T')[0],
    proforma_id: proformaId,
    copy_type: 'ORIGINAL'
  };

  const savedInvoice = await saveNewInvoice(newInvoicePayload);
  return savedInvoice;
}

export function softDeleteProforma(id) {
  return repoSoftDelete(id);
}

export function restoreProforma(id) {
  return repoRestore(id);
}

export function permanentlyDeleteProforma(id) {
  return repoPermanentDelete(id);
}

export function getDeletedProformas() {
  return repoListDeleted();
}
