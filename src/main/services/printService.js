import { BrowserWindow } from 'electron';
import { renderInvoiceHtml } from '../templates/invoice/invoiceRenderer.js';

export async function printInvoiceDocument(invoiceData, options = {}) {
  const htmlContent = renderInvoiceHtml(invoiceData);

  const printWin = new BrowserWindow({
    width: 1200,
    height: 1600,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  const dataUrl = `data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`;
  await printWin.loadURL(dataUrl);

  // Wait until document layout, images, and fonts are completely rendered
  await printWin.webContents.executeJavaScript(`
    new Promise(resolve => {
      if (document.readyState === 'complete') {
        setTimeout(resolve, 300);
      } else {
        window.addEventListener('load', () => setTimeout(resolve, 300));
      }
    })
  `);

  return new Promise((resolve, reject) => {
    printWin.webContents.print(
      {
        silent: options.silent || false,
        printBackground: true,
        deviceName: options.deviceName || '',
        pageSize: 'A4'
      },
      (success, errorType) => {
        if (!printWin.isDestroyed()) {
          printWin.close();
        }
        if (!success) {
          if (errorType === 'Print job canceled' || String(errorType).toLowerCase().includes('cancel')) {
            resolve({ success: false, canceled: true });
          } else {
            reject(new Error(`Physical printing failed: ${errorType}`));
          }
        } else {
          resolve({ success: true, canceled: false });
        }
      }
    );
  });
}

export async function getAvailablePrinters() {
  const dummyWin = new BrowserWindow({ show: false });
  try {
    const list = await dummyWin.webContents.getPrintersAsync();
    return list;
  } finally {
    if (!dummyWin.isDestroyed()) {
      dummyWin.close();
    }
  }
}
