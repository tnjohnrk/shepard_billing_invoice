import { getDatabase } from '../database/connection.js';

export function getDailyReport(dateStr) {
  const db = getDatabase();
  const date = dateStr || new Date().toISOString().split('T')[0];

  const invoices = db.prepare('SELECT * FROM invoices WHERE invoice_date = ? ORDER BY created_at ASC').all(date);
  const proformas = db.prepare('SELECT * FROM proformas WHERE proforma_date = ? ORDER BY created_at ASC').all(date);

  const stats = calculateAggregateStats(invoices, proformas);
  return {
    date,
    stats,
    invoices,
    proformas
  };
}

export function getMonthlyReport(year, month) {
  const db = getDatabase();
  const monthStr = `${year}-${String(month).padStart(2, '0')}`;

  const invoices = db.prepare('SELECT * FROM invoices WHERE strftime("%Y-%m", invoice_date) = ? ORDER BY invoice_date ASC').all(monthStr);
  const proformas = db.prepare('SELECT * FROM proformas WHERE strftime("%Y-%m", proforma_date) = ? ORDER BY proforma_date ASC').all(monthStr);

  const stats = calculateAggregateStats(invoices, proformas);
  return {
    year,
    month,
    monthStr,
    stats,
    invoices,
    proformas
  };
}

export function getFinancialYearReport(startYear) {
  const db = getDatabase();
  const sYear = parseInt(startYear, 10);
  const startDate = `${sYear}-04-01`;
  const endDate = `${sYear + 1}-03-31`;

  const invoices = db.prepare('SELECT * FROM invoices WHERE invoice_date >= ? AND invoice_date <= ? ORDER BY invoice_date ASC').all(startDate, endDate);
  const proformas = db.prepare('SELECT * FROM proformas WHERE proforma_date >= ? AND proforma_date <= ? ORDER BY proforma_date ASC').all(startDate, endDate);

  const stats = calculateAggregateStats(invoices, proformas);
  return {
    financialYear: `${sYear}-${sYear + 1}`,
    startDate,
    endDate,
    stats,
    invoices,
    proformas
  };
}

export function getCustomerSummaryReport() {
  const db = getDatabase();
  const rows = db.prepare(`
    SELECT 
      buyer_name,
      customer_gstin,
      COUNT(id) as total_invoices,
      SUM(subtotal) as total_taxable,
      SUM(cgst_amount + sgst_amount + igst_amount) as total_tax,
      SUM(grand_total) as total_billing
    FROM invoices
    GROUP BY buyer_name
    ORDER BY total_billing DESC
  `).all();
  return rows;
}

function calculateAggregateStats(invoices = [], proformas = []) {
  const totalTaxable = invoices.reduce((sum, inv) => sum + (inv.subtotal || 0), 0);
  const totalCgst = invoices.reduce((sum, inv) => sum + (inv.cgst_amount || 0), 0);
  const totalSgst = invoices.reduce((sum, inv) => sum + (inv.sgst_amount || 0), 0);
  const totalIgst = invoices.reduce((sum, inv) => sum + (inv.igst_amount || 0), 0);
  const totalTax = totalCgst + totalSgst + totalIgst;
  const totalBilling = invoices.reduce((sum, inv) => sum + (inv.grand_total || 0), 0);

  const proformaTotal = proformas.reduce((sum, pro) => sum + (pro.grand_total || 0), 0);

  return {
    invoiceCount: invoices.length,
    proformaCount: proformas.length,
    totalTaxable: round(totalTaxable),
    totalCgst: round(totalCgst),
    totalSgst: round(totalSgst),
    totalIgst: round(totalIgst),
    totalTax: round(totalTax),
    totalBilling: round(totalBilling),
    proformaBilling: round(proformaTotal)
  };
}

function round(val) {
  return Math.round((Number(val) + Number.EPSILON) * 100) / 100;
}
