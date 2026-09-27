import path from 'path';
import fs from 'fs';
import { app, BrowserWindow } from 'electron';
import { renderInvoiceHtml } from '../src/main/templates/invoice/invoiceRenderer.js';

app.whenReady().then(async () => {
  try {
    const blankInvoice = {
      invoice_type: 'TAX',
      invoice_number: 'SEPL/2024-25/____',
      invoice_date: '___ / ___ / 2026',
      buyer_name: '',
      buyer_address: '',
      customer_gstin: '',
      customer_state: 'TAMIL NADU',
      customer_state_code: '33',
      transportation_mode: '',
      vehicle_number: '',
      date_of_supply: '',
      date_of_supply_from: '',
      date_of_supply_to: '',
      delivery_address: '',
      items: [
        {
          description: '',
          hsn_sac: '',
          quantity: '',
          rate: '',
          amount: ''
        },
        {
          description: '',
          hsn_sac: '',
          quantity: '',
          rate: '',
          amount: ''
        }
      ],
      subtotal: 0,
      cgst_rate: 9,
      cgst_amount: 0,
      sgst_rate: 9,
      sgst_amount: 0,
      igst_rate: 0,
      igst_amount: 0,
      round_off: 0,
      grand_total: 0,
      amount_in_words: '',
      notes: ''
    };

    const htmlContent = renderInvoiceHtml(blankInvoice);
    const outputPath = path.resolve(process.cwd(), 'Blank_Invoice.pdf');
    const htmlOutputPath = path.resolve(process.cwd(), 'Blank_Invoice.html');

    fs.writeFileSync(htmlOutputPath, htmlContent, 'utf8');
    console.log('Saved HTML to:', htmlOutputPath);

    const win = new BrowserWindow({
      width: 1200,
      height: 1600,
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true
      }
    });

    await win.loadURL(`file://${htmlOutputPath}`);

    await win.webContents.executeJavaScript(`
      new Promise(resolve => {
        if (document.readyState === 'complete') {
          setTimeout(resolve, 300);
        } else {
          window.addEventListener('load', () => setTimeout(resolve, 300));
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

    fs.writeFileSync(outputPath, pdfBuffer);
    console.log('Successfully generated clean Blank Invoice PDF:', outputPath);
  } catch (err) {
    console.error('Error generating PDF:', err);
  } finally {
    app.quit();
  }
});
