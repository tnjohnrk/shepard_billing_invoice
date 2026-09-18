import { ipcMain } from 'electron';
import { printInvoiceDocument, getAvailablePrinters } from '../services/printService.js';

export function registerPrintIPC() {
  ipcMain.handle('print:invoice', async (_, { invoiceData, options }) => {
    return await printInvoiceDocument(invoiceData, options);
  });

  ipcMain.handle('print:getPrinters', async () => {
    return await getAvailablePrinters();
  });
}
