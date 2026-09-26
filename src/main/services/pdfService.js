import path from 'path';
import fs from 'fs';
import os from 'os';
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

  const tempHtmlPath = path.join(os.tmpdir(), `shepherd_invoice_${Date.now()}_${Math.random().toString(36).substring(7)}.html`);
  fs.writeFileSync(tempHtmlPath, htmlContent, 'utf8');

  // Create hidden BrowserWindow with A4 dimensions for PDF rendering
  const win = new BrowserWindow({
    width: 1200,
    height: 1600,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  try {
    await win.loadFile(tempHtmlPath);

    // Wait until document layout, images, and fonts are completely rendered
    await win.webContents.executeJavaScript(`
      new Promise(resolve => {
        if (document.readyState === 'complete') {
          setTimeout(resolve, 250);
        } else {
          window.addEventListener('load', () => setTimeout(resolve, 250));
        }
      })
    `);

    const pdfBuffer = await win.webContents.printToPDF({
      pageSize: 'A4',
      printBackground: true,
      landscape: false,
      preferCSSPageSize: true,
      displayHeaderFooter: false,
      margins: {
        marginType: 'none'
      }
    });

    fs.writeFileSync(pdfPath, pdfBuffer);
    return pdfPath;
  } finally {
    if (!win.isDestroyed()) {
      win.close();
    }
    try {
      if (fs.existsSync(tempHtmlPath)) {
        fs.unlinkSync(tempHtmlPath);
      }
    } catch {}
  }
}
