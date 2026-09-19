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
  titleCell.font = { bold: true, size: 14, color: { argb: '0F172A' } };
  titleCell.alignment = { horizontal: 'center' };

  sheet.mergeCells('A2:F2');
  const addressCell = sheet.getCell('A2');
  addressCell.value = `${COMPANY_CONFIG.address} | GSTIN: ${COMPANY_CONFIG.gstin} | Contact: ${COMPANY_CONFIG.phone}`;
  addressCell.alignment = { horizontal: 'center' };
  addressCell.font = { size: 10, color: { argb: '475569' } };

  sheet.mergeCells('A4:F4');
  const docTypeCell = sheet.getCell('A4');
  docTypeCell.value = invoiceData.invoice_type === 'PROFORMA' ? 'PROFORMA INVOICE' : 'TAX INVOICE';
  docTypeCell.font = { bold: true, size: 12, color: { argb: '4338CA' } };
  docTypeCell.alignment = { horizontal: 'center' };

  // Meta Info
  sheet.addRow(['Invoice No:', invoiceData.invoice_number || invoiceData.proforma_number, '', 'Date:', invoiceData.invoice_date || invoiceData.proforma_date, '']);
  sheet.addRow(['Buyer:', invoiceData.buyer_name, '', 'Buyer GSTIN:', invoiceData.customer_gstin || 'N/A', '']);
  sheet.addRow([]);

  // Table Headers
  const headerRow = sheet.addRow(['#', 'Description of Goods/Services', 'HSN/SAC', 'Quantity', 'Rate (INR)', 'Amount (INR)']);
  headerRow.font = { bold: true, color: { argb: '0F172A' } };
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'F1F5F9' }
    };
    cell.border = {
      top: { style: 'thin', color: { argb: 'CBD5E1' } },
      left: { style: 'thin', color: { argb: 'CBD5E1' } },
      bottom: { style: 'thin', color: { argb: 'CBD5E1' } },
      right: { style: 'thin', color: { argb: 'CBD5E1' } }
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
      item.amount || (Number(item.quantity || 0) * Number(item.rate || 0))
    ]);
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'E2E8F0' } },
        left: { style: 'thin', color: { argb: 'E2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'E2E8F0' } },
        right: { style: 'thin', color: { argb: 'E2E8F0' } }
      };
    });
  });

  // Totals
  sheet.addRow([]);
  sheet.addRow(['', '', '', '', 'Subtotal (Taxable):', Number(invoiceData.subtotal || 0)]);
  if (invoiceData.cgst_amount > 0) {
    sheet.addRow(['', '', '', '', `CGST (${invoiceData.cgst_rate}%):`, Number(invoiceData.cgst_amount || 0)]);
    sheet.addRow(['', '', '', '', `SGST (${invoiceData.sgst_rate}%):`, Number(invoiceData.sgst_amount || 0)]);
  }
  if (invoiceData.igst_amount > 0) {
    sheet.addRow(['', '', '', '', `IGST (${invoiceData.igst_rate}%):`, Number(invoiceData.igst_amount || 0)]);
  }
  const grandRow = sheet.addRow(['', '', '', '', 'Grand Total (INR):', Number(invoiceData.grand_total || 0)]);
  grandRow.font = { bold: true, color: { argb: '047857' } };

  sheet.columns.forEach((col) => {
    col.width = 20;
  });

  let excelPath = targetFilePathOverride;
  if (!excelPath || typeof excelPath !== 'string') {
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

export async function exportReportToExcel(reportData = {}, reportTitle = 'Billing_Report', targetFilePath = null, reportType = 'daily') {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = COMPANY_CONFIG.name;
  const sheet = workbook.addWorksheet('Billing Report');

  // Top Banner
  sheet.mergeCells('A1:I1');
  const title = sheet.getCell('A1');
  title.value = COMPANY_CONFIG.name;
  title.font = { bold: true, size: 14, color: { argb: '0F172A' } };
  title.alignment = { horizontal: 'center' };

  sheet.mergeCells('A2:I2');
  const subTitle = sheet.getCell('A2');
  subTitle.value = `${reportTitle || 'Financial & Tax Summary Report'} | Generated: ${new Date().toLocaleString('en-IN')}`;
  subTitle.font = { size: 10, color: { argb: '475569' } };
  subTitle.alignment = { horizontal: 'center' };

  sheet.addRow([]);

  // Check if Customer Summary Report
  const isCustomerReport = Array.isArray(reportData) || reportType === 'customer';

  if (isCustomerReport) {
    const customerList = Array.isArray(reportData) ? reportData : (reportData?.customers || []);
    
    const hRow = sheet.addRow(['#', 'Buyer / Customer Name', 'GSTIN', 'Total Invoices', 'Total Taxable Amt (INR)', 'Total GST Tax (INR)', 'Total Grand Total (INR)']);
    hRow.font = { bold: true, color: { argb: '0F172A' } };
    hRow.eachCell(cell => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E2E8F0' } };
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    });

    let sumInvoices = 0;
    let sumTaxable = 0;
    let sumTax = 0;
    let sumGrand = 0;

    customerList.forEach((c, idx) => {
      sumInvoices += Number(c.total_invoices || 0);
      sumTaxable += Number(c.total_taxable || 0);
      sumTax += Number(c.total_tax || 0);
      sumGrand += Number(c.total_billing || c.total_grand || 0);

      const row = sheet.addRow([
        idx + 1,
        c.buyer_name || c.customer_name,
        c.customer_gstin || 'N/A',
        Number(c.total_invoices || 0),
        Number(c.total_taxable || 0),
        Number(c.total_tax || 0),
        Number(c.total_billing || c.total_grand || 0)
      ]);
      row.eachCell(cell => {
        cell.border = { top: { style: 'thin', color: { argb: 'E2E8F0' } }, left: { style: 'thin', color: { argb: 'E2E8F0' } }, bottom: { style: 'thin', color: { argb: 'E2E8F0' } }, right: { style: 'thin', color: { argb: 'E2E8F0' } } };
      });
    });

    const totRow = sheet.addRow(['', 'TOTAL SUMMARY', '', sumInvoices, sumTaxable, sumTax, sumGrand]);
    totRow.font = { bold: true, color: { argb: '047857' } };
    totRow.eachCell(cell => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F1F5F9' } };
      cell.border = { top: { style: 'medium' }, bottom: { style: 'double' } };
    });
  } else {
    // Daily / Monthly / Financial Year Report
    const stats = reportData?.stats || {};
    const invoices = reportData?.invoices || [];
    const proformas = reportData?.proformas || [];

    // KPI Summary Section
    sheet.addRow(['KPI Metric', 'Value']);
    sheet.addRow(['Total Tax Invoices Issued:', stats.invoiceCount || invoices.length]);
    sheet.addRow(['Total Proformas Issued:', stats.proformaCount || proformas.length]);
    sheet.addRow(['Total Taxable Amount (INR):', stats.totalTaxable || 0]);
    sheet.addRow(['Total CGST (INR):', stats.totalCgst || 0]);
    sheet.addRow(['Total SGST (INR):', stats.totalSgst || 0]);
    sheet.addRow(['Total IGST (INR):', stats.totalIgst || 0]);
    sheet.addRow(['Total GST Tax Collected (INR):', stats.totalTax || 0]);
    sheet.addRow(['Total Grand Revenue (INR):', stats.totalBilling || 0]);
    sheet.addRow(['Total Proforma Estimates (INR):', stats.proformaBilling || 0]);
    sheet.addRow([]);

    // Document Details Section
    const allDocs = [
      ...invoices.map(i => ({ ...i, invoice_type: i.invoice_type || 'NORMAL', doc_number: i.invoice_number, doc_date: i.invoice_date })),
      ...proformas.map(p => ({ ...p, invoice_type: 'PROFORMA', doc_number: p.proforma_number || p.invoice_number, doc_date: p.proforma_date || p.invoice_date }))
    ].sort((a, b) => (b.created_at || b.doc_date || '').localeCompare(a.created_at || a.doc_date || ''));

    const hRow = sheet.addRow(['#', 'Doc Number', 'Date', 'Type', 'Buyer Name', 'GSTIN', 'Taxable Amt (INR)', 'Total Tax (INR)', 'Grand Total (INR)']);
    hRow.font = { bold: true, color: { argb: '0F172A' } };
    hRow.eachCell(cell => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E2E8F0' } };
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    });

    allDocs.forEach((doc, idx) => {
      const taxAmt = (Number(doc.cgst_amount || 0) + Number(doc.sgst_amount || 0) + Number(doc.igst_amount || 0));
      const row = sheet.addRow([
        idx + 1,
        doc.doc_number,
        doc.doc_date,
        doc.invoice_type || 'NORMAL',
        doc.buyer_name,
        doc.customer_gstin || 'N/A',
        Number(doc.subtotal || 0),
        taxAmt,
        Number(doc.grand_total || 0)
      ]);
      row.eachCell(cell => {
        cell.border = { top: { style: 'thin', color: { argb: 'E2E8F0' } }, left: { style: 'thin', color: { argb: 'E2E8F0' } }, bottom: { style: 'thin', color: { argb: 'E2E8F0' } }, right: { style: 'thin', color: { argb: 'E2E8F0' } } };
      });
    });

    const totRow = sheet.addRow(['', 'GRAND TOTALS', '', '', '', '', Number(stats.totalTaxable || 0), Number(stats.totalTax || 0), Number(stats.totalBilling || 0)]);
    totRow.font = { bold: true, color: { argb: '047857' } };
    totRow.eachCell(cell => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F1F5F9' } };
      cell.border = { top: { style: 'medium' }, bottom: { style: 'double' } };
    });
  }

  sheet.columns.forEach(col => { col.width = 20; });

  let finalPath = targetFilePath;
  if (!finalPath || typeof finalPath !== 'string') {
    const safeTitle = (reportTitle || 'Billing_Report').replace(/[\/\\?%*:|"<> ]/g, '_');
    const { invoicesDir } = ensureDirectoriesExist();
    finalPath = path.join(invoicesDir, `${safeTitle}_${Date.now()}.xlsx`);
  }

  const parentDir = path.dirname(finalPath);
  if (!fs.existsSync(parentDir)) {
    fs.mkdirSync(parentDir, { recursive: true });
  }

  await workbook.xlsx.writeFile(finalPath);
  return finalPath;
}
