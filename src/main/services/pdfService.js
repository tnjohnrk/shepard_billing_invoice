import path from 'path';
import fs from 'fs';
import { BrowserWindow } from 'electron';
import { renderInvoiceHtml } from '../templates/invoice/invoiceRenderer.js';
import { ensureDirectoriesExist } from '../utils/filesystem.js';

export async function generateInvoicePdf(invoiceData, targetFilePathOverride = null) {
  const htmlContent = renderInvoiceHtml(invoiceData);
  const docNum = (invoiceData.invoice_number || invoiceData.proforma_number || `DOC-${Date.now()}`).replace(/[\/\\?%*:|"<>]/g, '-');
  
  let pdfPath = targetFilePathOverride;
  if (!pdfPath) {
    const { invoicesDir } = ensureDirectoriesExist();
    const targetFolder = path.join(invoicesDir, docNum);
    if (!fs.existsSync(targetFolder)) {
      fs.mkdirSync(targetFolder, { recursive: true });
    }
    pdfPath = path.join(targetFolder, 'invoice.pdf');
  } else {
    const parentDir = path.dirname(pdfPath);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }
  }

  // Create offscreen BrowserWindow for crisp PDF rendering
  const win = new BrowserWindow({
    show: false,
    webPreferences: {
      offscreen: true,
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  try {
    const dataUrl = `data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`;
    await win.loadURL(dataUrl);

    const pdfBuffer = await win.webContents.printToPDF({
      marginsType: 1, // No margins, handled by CSS
      pageSize: 'A4',
      printBackground: true,
      landscape: false
    });

    fs.writeFileSync(pdfPath, pdfBuffer);
    return pdfPath;
  } finally {
    if (!win.isDestroyed()) {
      win.close();
    }
  }
}
