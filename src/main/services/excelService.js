import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';
import { COMPANY_CONFIG } from '../config/companyConfig.js';
import { ensureDirectoriesExist } from '../utils/filesystem.js';

export async function exportInvoiceToExcel(invoiceData, targetFilePathOverride = null) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = COMPANY_CONFIG.name;
  const sheet = workbook.addWorksheet('Invoice');

  // Title & Header
  sheet.mergeCells('A1:F1');
  const titleCell = sheet.getCell('A1');
  titleCell.value = COMPANY_CONFIG.name;
  titleCell.font = { bold: true, size: 14 };
  titleCell.alignment = { horizontal: 'center' };

  sheet.mergeCells('A2:F2');
  const addressCell = sheet.getCell('A2');
  addressCell.value = `${COMPANY_CONFIG.address} | GSTIN: ${COMPANY_CONFIG.gstin}`;
  addressCell.alignment = { horizontal: 'center' };

  sheet.mergeCells('A4:F4');
  const docTypeCell = sheet.getCell('A4');
  docTypeCell.value = invoiceData.invoice_type === 'PROFORMA' ? 'PROFORMA INVOICE' : 'TAX INVOICE';
  docTypeCell.font = { bold: true, size: 12 };
  docTypeCell.alignment = { horizontal: 'center' };

  // Meta Info
  sheet.addRow(['Invoice No:', invoiceData.invoice_number || invoiceData.proforma_number, '', 'Date:', invoiceData.invoice_date || invoiceData.proforma_date, '']);
  sheet.addRow(['Buyer:', invoiceData.buyer_name, '', 'Buyer GSTIN:', invoiceData.customer_gstin || 'N/A', '']);
  sheet.addRow([]);

  // Table Headers
  const headerRow = sheet.addRow(['#', 'Description', 'HSN/SAC', 'Quantity', 'Rate (INR)', 'Amount (INR)']);
  headerRow.font = { bold: true };
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'F1F5F9' }
    };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
  });

  // Items
  (invoiceData.items || []).forEach((item, idx) => {
    const row = sheet.addRow([
      idx + 1,
      item.description,
      item.hsn_sac || '',
      item.quantity,
      item.rate,
      item.amount
    ]);
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
  });

  // Totals
  sheet.addRow([]);
  sheet.addRow(['', '', '', '', 'Subtotal:', invoiceData.subtotal]);
  if (invoiceData.cgst_amount > 0) {
    sheet.addRow(['', '', '', '', `CGST (${invoiceData.cgst_rate}%):`, invoiceData.cgst_amount]);
    sheet.addRow(['', '', '', '', `SGST (${invoiceData.sgst_rate}%):`, invoiceData.sgst_amount]);
  }
  if (invoiceData.igst_amount > 0) {
    sheet.addRow(['', '', '', '', `IGST (${invoiceData.igst_rate}%):`, invoiceData.igst_amount]);
  }
  const grandRow = sheet.addRow(['', '', '', '', 'Grand Total:', invoiceData.grand_total]);
  grandRow.font = { bold: true };

  sheet.columns.forEach((col) => {
    col.width = 18;
  });

  let excelPath = targetFilePathOverride;
  if (!excelPath) {
    const docNum = (invoiceData.invoice_number || invoiceData.proforma_number || `DOC-${Date.now()}`).replace(/[\/\\?%*:|"<>]/g, '-');
    const { invoicesDir } = ensureDirectoriesExist();
    const folder = path.join(invoicesDir, docNum);
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }
    excelPath = path.join(folder, 'invoice.xlsx');
  } else {
    const parentDir = path.dirname(excelPath);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }
  }

  await workbook.xlsx.writeFile(excelPath);
  return excelPath;
}

export async function exportReportToExcel(reportData, reportTitle, targetFilePath) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = COMPANY_CONFIG.name;
  const sheet = workbook.addWorksheet('Report');

  sheet.mergeCells('A1:G1');
  const title = sheet.getCell('A1');
  title.value = `${COMPANY_CONFIG.name} - ${reportTitle}`;
  title.font = { bold: true, size: 14 };

  sheet.addRow([]);
  const headers = ['Doc No', 'Date', 'Type', 'Buyer Name', 'GSTIN', 'Taxable Amt', 'Grand Total'];
  const hRow = sheet.addRow(headers);
  hRow.font = { bold: true };

  (reportData.invoices || []).forEach(inv => {
    sheet.addRow([
      inv.invoice_number || inv.proforma_number,
      inv.invoice_date || inv.proforma_date,
      inv.invoice_type || 'PROFORMA',
      inv.buyer_name,
      inv.customer_gstin || 'N/A',
      inv.subtotal,
      inv.grand_total
    ]);
  });

  sheet.columns.forEach(col => { col.width = 18; });
  await workbook.xlsx.writeFile(targetFilePath);
  return targetFilePath;
}
