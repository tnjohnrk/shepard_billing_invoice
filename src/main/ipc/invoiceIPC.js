import { ipcMain, app } from 'electron';
import path from 'path';
import { saveNewInvoice, fetchInvoice, fetchInvoiceByNumber, queryInvoices, getNextInvoiceNumber, duplicateExistingInvoice } from '../services/invoiceService.js';
import { exportInvoiceToExcel } from '../services/excelService.js';
import { generateInvoicePdf } from '../services/pdfService.js';

export function registerInvoiceIPC() {
  ipcMain.handle('invoice:create', async (_, formData) => {
    return await saveNewInvoice(formData);
  });

  ipcMain.handle('invoice:get', async (_, id) => {
    return fetchInvoice(id);
  });

  ipcMain.handle('invoice:getByNumber', async (_, number) => {
    return fetchInvoiceByNumber(number);
  });

  ipcMain.handle('invoice:list', async (_, filters) => {
    return queryInvoices(filters);
  });

  ipcMain.handle('invoice:getNextNumber', async () => {
    return getNextInvoiceNumber();
  });

  ipcMain.handle('invoice:duplicate', async (_, id) => {
    return duplicateExistingInvoice(id);
  });

  ipcMain.handle('invoice:exportPdf', async (_, invoiceData) => {
    const docNum = (invoiceData.invoice_number || invoiceData.proforma_number || 'invoice').replace(/[\/\\?%*:|"<>]/g, '-');
    const downloadsFolder = app.getPath('downloads');
    const filePath = path.join(downloadsFolder, `${docNum}.pdf`);

    const savedPath = await generateInvoicePdf(invoiceData, filePath);
    return { canceled: false, path: savedPath };
  });

  ipcMain.handle('invoice:exportExcel', async (_, invoiceData) => {
    const docNum = (invoiceData.invoice_number || invoiceData.proforma_number || 'invoice').replace(/[\/\\?%*:|"<>]/g, '-');
    const downloadsFolder = app.getPath('downloads');
    const filePath = path.join(downloadsFolder, `${docNum}.xlsx`);

    const savedPath = await exportInvoiceToExcel(invoiceData, filePath);
    return { canceled: false, path: savedPath };
  });
}
