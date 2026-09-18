import { getDatabase } from '../database/connection.js';

export function createInvoice(invoiceData, items) {
  const db = getDatabase();
  const insertTransaction = db.transaction(() => {
    const existing = db.prepare('SELECT id FROM invoices WHERE invoice_number = ?').get(invoiceData.invoice_number);
    if (existing) {
      throw new Error(`Invoice number "${invoiceData.invoice_number}" already exists. Overwriting historical invoices is strictly prohibited.`);
    }

    const res = db.prepare(`
      INSERT INTO invoices (
        invoice_number, invoice_type, invoice_date, copy_type, proforma_id,
        transportation_mode, vehicle_number, date_of_supply, delivery_address,
        buyer_name, buyer_address, customer_gstin, customer_state, customer_state_code,
        so_po_number, so_po_date, gemc_number, additional_reference,
        subtotal, cgst_rate, cgst_amount, sgst_rate, sgst_amount, igst_rate, igst_amount,
        grand_total, amount_in_words, notes, pdf_path
      ) VALUES (
        @invoice_number, @invoice_type, @invoice_date, @copy_type, @proforma_id,
        @transportation_mode, @vehicle_number, @date_of_supply, @delivery_address,
        @buyer_name, @buyer_address, @customer_gstin, @customer_state, @customer_state_code,
        @so_po_number, @so_po_date, @gemc_number, @additional_reference,
        @subtotal, @cgst_rate, @cgst_amount, @sgst_rate, @sgst_amount, @igst_rate, @igst_amount,
        @grand_total, @amount_in_words, @notes, @pdf_path
      )
    `).run({
      ...invoiceData,
      copy_type: invoiceData.copy_type || 'ORIGINAL',
      proforma_id: invoiceData.proforma_id || null,
      pdf_path: invoiceData.pdf_path || null
    });

    const invoiceId = res.lastInsertRowid;

    const itemStmt = db.prepare(`
      INSERT INTO invoice_items (
        invoice_id, sort_order, description, hsn_sac, quantity, rate, amount
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    items.forEach((item, idx) => {
      itemStmt.run(
        invoiceId,
        item.sort_order ?? (idx + 1),
        item.description,
        item.hsn_sac,
        item.quantity,
        item.rate,
        item.amount
      );
    });

    return invoiceId;
  });

  return insertTransaction();
}

export function updateInvoicePdfPath(id, pdfPath) {
  const db = getDatabase();
  db.prepare('UPDATE invoices SET pdf_path = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(pdfPath, id);
}

export function getInvoiceById(id) {
  const db = getDatabase();
  const invoice = db.prepare('SELECT * FROM invoices WHERE id = ?').get(id);
  if (!invoice) return null;

  const items = db.prepare('SELECT * FROM invoice_items WHERE invoice_id = ? ORDER BY sort_order ASC').all(id);
  return { ...invoice, items };
}

export function getInvoiceByNumber(number) {
  const db = getDatabase();
  const invoice = db.prepare('SELECT * FROM invoices WHERE invoice_number = ?').get(number);
  if (!invoice) return null;

  const items = db.prepare('SELECT * FROM invoice_items WHERE invoice_id = ? ORDER BY sort_order ASC').all(invoice.id);
  return { ...invoice, items };
}

export function listInvoices({
  page = 1,
  limit = 20,
  search = '',
  invoiceType = '',
  startDate = '',
  endDate = '',
  minAmount = null,
  maxAmount = null
} = {}) {
  const db = getDatabase();
  const offset = (page - 1) * limit;
  let whereClauses = [];
  let params = [];

  if (search && search.trim()) {
    const q = `%${search.trim()}%`;
    whereClauses.push('(invoice_number LIKE ? OR buyer_name LIKE ? OR customer_gstin LIKE ?)');
    params.push(q, q, q);
  }

  if (invoiceType) {
    whereClauses.push('invoice_type = ?');
    params.push(invoiceType);
  }

  if (startDate) {
    whereClauses.push('invoice_date >= ?');
    params.push(startDate);
  }

  if (endDate) {
    whereClauses.push('invoice_date <= ?');
    params.push(endDate);
  }

  if (minAmount !== null && minAmount !== undefined && minAmount !== '') {
    whereClauses.push('grand_total >= ?');
    params.push(parseFloat(minAmount));
  }

  if (maxAmount !== null && maxAmount !== undefined && maxAmount !== '') {
    whereClauses.push('grand_total <= ?');
    params.push(parseFloat(maxAmount));
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  const totalRow = db.prepare(`SELECT COUNT(*) as count FROM invoices ${whereSql}`).get(...params);
  const rows = db.prepare(`
    SELECT * FROM invoices 
    ${whereSql} 
    ORDER BY created_at DESC, id DESC 
    LIMIT ? OFFSET ?
  `).all(...params, limit, offset);

  return {
    data: rows,
    total: totalRow ? totalRow.count : 0,
    page,
    limit,
    totalPages: Math.ceil((totalRow ? totalRow.count : 0) / limit)
  };
}

export function generateNextInvoiceNumber() {
  const db = getDatabase();
  const row = db.prepare(`
    SELECT invoice_number FROM invoices 
    ORDER BY id DESC LIMIT 1
  `).get();

  if (!row) {
    return 'INV-001';
  }

  const match = row.invoice_number.match(/INV-(\d+)/);
  if (match) {
    const nextNum = parseInt(match[1], 10) + 1;
    return `INV-${String(nextNum).padStart(3, '0')}`;
  }

  return `INV-${Date.now().toString().slice(-4)}`;
}
