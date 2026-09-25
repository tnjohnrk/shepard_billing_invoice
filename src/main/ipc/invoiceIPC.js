import { ipcMain, app, dialog, BrowserWindow } from 'electron';
import path from 'path';
import { saveNewInvoice, fetchInvoice, fetchInvoiceByNumber, queryInvoices, getNextInvoiceNumber, duplicateExistingInvoice } from '../services/invoiceService.js';
import { exportInvoiceToExcel } from '../services/excelService.js';
import { generateInvoicePdf } from '../services/pdfService.js';
import { formatHumanReadableError } from '../../shared/utils/errorHandler.js';

export function registerInvoiceIPC() {
  ipcMain.handle('invoice:create', async (_, formData) => {
    try {
      return await saveNewInvoice(formData);
    } catch (err) {
      throw new Error(formatHumanReadableError(err));
    }
  });

  ipcMain.handle('invoice:get', async (_, id) => {
    try {
      return await fetchInvoice(id);
    } catch (err) {
      throw new Error(formatHumanReadableError(err));
    }
  });

  ipcMain.handle('invoice:getByNumber', async (_, number) => {
    try {
      return await fetchInvoiceByNumber(number);
    } catch (err) {
      throw new Error(formatHumanReadableError(err));
    }
  });

  ipcMain.handle('invoice:list', async (_, filters) => {
    try {
      return await queryInvoices(filters);
    } catch (err) {
      throw new Error(formatHumanReadableError(err));
    }
  });

  ipcMain.handle('invoice:getNextNumber', async () => {
    try {
      return await getNextInvoiceNumber();
    } catch (err) {
      throw new Error(formatHumanReadableError(err));
    }
  });

  ipcMain.handle('invoice:duplicate', async (_, id) => {
    try {
      return await duplicateExistingInvoice(id);
    } catch (err) {
      throw new Error(formatHumanReadableError(err));
    }
  });

  ipcMain.handle('invoice:exportPdf', async (event, invoiceData) => {
    const isProforma = String(invoiceData.invoice_type).toUpperCase() === 'PROFORMA';
    const docNum = (invoiceData.invoice_number || invoiceData.proforma_number || (isProforma ? 'proforma' : 'invoice')).replace(/[\/\\?%*:|"<>]/g, '-');
    const defaultFileName = `${docNum}.pdf`;
    const defaultFolder = app.getPath('documents') || app.getPath('downloads');
    const defaultPath = path.join(defaultFolder, defaultFileName);

    const win = BrowserWindow.fromWebContents(event.sender);
    const { canceled, filePath } = await dialog.showSaveDialog(win, {
      title: 'Save Invoice PDF',
      defaultPath,
      filters: [
        { name: 'PDF Documents (*.pdf)', extensions: ['pdf'] },
        { name: 'All Files (*.*)', extensions: ['*'] }
      ]
    });

    if (canceled || !filePath) {
      return { canceled: true };
    }

    const savedPath = await generateInvoicePdf(invoiceData, filePath);
    return { canceled: false, path: savedPath };
  });

  ipcMain.handle('invoice:exportExcel', async (event, invoiceData) => {
    const isProforma = String(invoiceData.invoice_type).toUpperCase() === 'PROFORMA';
    const docNum = (invoiceData.invoice_number || invoiceData.proforma_number || (isProforma ? 'proforma' : 'invoice')).replace(/[\/\\?%*:|"<>]/g, '-');
    const defaultFileName = `${docNum}.xlsx`;
    const defaultFolder = app.getPath('documents') || app.getPath('downloads');
    const defaultPath = path.join(defaultFolder, defaultFileName);

    const win = BrowserWindow.fromWebContents(event.sender);
    const { canceled, filePath } = await dialog.showSaveDialog(win, {
      title: 'Save Invoice Excel',
      defaultPath,
      filters: [
        { name: 'Excel Spreadsheets (*.xlsx)', extensions: ['xlsx'] },
        { name: 'All Files (*.*)', extensions: ['*'] }
      ]
    });

    if (canceled || !filePath) {
      return { canceled: true };
    }

    const savedPath = await exportInvoiceToExcel(invoiceData, filePath);
    return { canceled: false, path: savedPath };
  });
}
