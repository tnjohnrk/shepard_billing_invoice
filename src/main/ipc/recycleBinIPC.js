import { ipcMain } from 'electron';
import { 
  softDeleteInvoice, 
  restoreInvoice, 
  permanentlyDeleteInvoice, 
  getDeletedInvoices 
} from '../services/invoiceService.js';
import { 
  softDeleteProforma, 
  restoreProforma, 
  permanentlyDeleteProforma, 
  getDeletedProformas 
} from '../services/proformaService.js';

export function registerRecycleBinIPC() {
  // Soft Delete single invoice or proforma
  ipcMain.handle('invoice:delete', async (_, id) => {
    return softDeleteInvoice(id);
  });

  ipcMain.handle('proforma:delete', async (_, id) => {
    return softDeleteProforma(id);
  });

  // Recycle Bin Listing
  ipcMain.handle('bin:list', async () => {
    const deletedInvoices = (getDeletedInvoices() || []).map(i => ({
      ...i,
      invoice_type: i.invoice_type || 'NORMAL',
      doc_number: i.invoice_number,
      doc_date: i.invoice_date,
      item_type: 'invoice'
    }));

    const deletedProformas = (getDeletedProformas() || []).map(p => ({
      ...p,
      invoice_type: 'PROFORMA',
      doc_number: p.proforma_number || p.invoice_number,
      doc_date: p.proforma_date || p.invoice_date,
      invoice_number: p.proforma_number || p.invoice_number,
      invoice_date: p.proforma_date || p.invoice_date,
      item_type: 'proforma'
    }));

    const combined = [...deletedInvoices, ...deletedProformas].sort((a, b) => {
      const dateA = a.deleted_at || a.created_at || '';
      const dateB = b.deleted_at || b.created_at || '';
      return dateB.localeCompare(dateA);
    });

    return combined;
  });

  // Restore single item
  ipcMain.handle('bin:restore', async (_, { id, type }) => {
    const isProforma = String(type).toUpperCase() === 'PROFORMA';
    if (isProforma) {
      return restoreProforma(id);
    }
    return restoreInvoice(id);
  });

  // Permanent Delete single item
  ipcMain.handle('bin:deletePermanent', async (_, { id, type }) => {
    const isProforma = String(type).toUpperCase() === 'PROFORMA';
    if (isProforma) {
      return permanentlyDeleteProforma(id);
    }
    return permanentlyDeleteInvoice(id);
  });

  // Empty Entire Bin
  ipcMain.handle('bin:empty', async () => {
    const deletedInvoices = getDeletedInvoices() || [];
    const deletedProformas = getDeletedProformas() || [];

    for (const inv of deletedInvoices) {
      permanentlyDeleteInvoice(inv.id);
    }
    for (const pro of deletedProformas) {
      permanentlyDeleteProforma(pro.id);
    }

    return { success: true, count: deletedInvoices.length + deletedProformas.length };
  });
}
