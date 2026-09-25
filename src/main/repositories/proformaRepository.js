import { getDatabase } from '../database/connection.js';

export function createProforma(proformaData, items) {
  const db = getDatabase();
  const insertTransaction = db.transaction(() => {
    const res = db.prepare(`
      INSERT INTO proformas (
        proforma_number, proforma_date, status,
        transportation_mode, vehicle_number, date_of_supply, delivery_address,
        buyer_name, buyer_address, customer_gstin, customer_state, customer_state_code,
        so_po_number, so_po_date, gemc_number, additional_reference,
        subtotal, cgst_rate, cgst_amount, sgst_rate, sgst_amount, igst_rate, igst_amount,
        grand_total, amount_in_words, notes, is_deleted
      ) VALUES (
        @proforma_number, @proforma_date, @status,
        @transportation_mode, @vehicle_number, @date_of_supply, @delivery_address,
        @buyer_name, @buyer_address, @customer_gstin, @customer_state, @customer_state_code,
        @so_po_number, @so_po_date, @gemc_number, @additional_reference,
        @subtotal, @cgst_rate, @cgst_amount, @sgst_rate, @sgst_amount, @igst_rate, @igst_amount,
        @grand_total, @amount_in_words, @notes, 0
      )
    `).run({
      ...proformaData,
      status: proformaData.status || 'PENDING'
    });

    const proformaId = res.lastInsertRowid;

    const itemStmt = db.prepare(`
      INSERT INTO proforma_items (
        proforma_id, sort_order, description, hsn_sac, quantity, rate, amount
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    items.forEach((item, idx) => {
      itemStmt.run(
        proformaId,
        item.sort_order ?? (idx + 1),
        item.description,
        item.hsn_sac,
        item.quantity,
        item.rate,
        item.amount
      );
    });

    return proformaId;
  });

  return insertTransaction();
}

export function updateProformaStatus(id, newStatus) {
  const db = getDatabase();
  db.prepare('UPDATE proformas SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(newStatus, id);
}

export function getProformaById(id) {
  const db = getDatabase();
  const proforma = db.prepare('SELECT * FROM proformas WHERE id = ?').get(id);
  if (!proforma) return null;

  const items = db.prepare('SELECT * FROM proforma_items WHERE proforma_id = ? ORDER BY sort_order ASC').all(id);
  return { ...proforma, items };
}

export function getProformaByNumber(number) {
  const db = getDatabase();
  const proforma = db.prepare('SELECT * FROM proformas WHERE proforma_number = ?').get(number);
  if (!proforma) return null;

  const items = db.prepare('SELECT * FROM proforma_items WHERE proforma_id = ? ORDER BY sort_order ASC').all(proforma.id);
  return { ...proforma, items };
}

export function listProformas({ page = 1, limit = 20, search = '', status = '', includeDeleted = false } = {}) {
  const db = getDatabase();
  const offset = (page - 1) * limit;
  let whereClauses = [];
  let params = [];

  if (!includeDeleted) {
    whereClauses.push('(is_deleted = 0 OR is_deleted IS NULL)');
  }

  if (search && search.trim()) {
    const q = `%${search.trim()}%`;
    whereClauses.push('(proforma_number LIKE ? OR buyer_name LIKE ? OR customer_gstin LIKE ?)');
    params.push(q, q, q);
  }

  if (status) {
    whereClauses.push('status = ?');
    params.push(status);
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  const totalRow = db.prepare(`SELECT COUNT(*) as count FROM proformas ${whereSql}`).get(...params);
  const rows = db.prepare(`
    SELECT * FROM proformas 
    ${whereSql} 
    ORDER BY created_at DESC, id DESC 
    LIMIT ? OFFSET ?
  `).all(...params, limit, offset);

  const itemStmt = db.prepare('SELECT * FROM proforma_items WHERE proforma_id = ? ORDER BY sort_order ASC');
  const proformasWithItems = rows.map(pro => ({
    ...pro,
    items: itemStmt.all(pro.id)
  }));

  return {
    data: proformasWithItems,
    total: totalRow ? totalRow.count : 0,
    page,
    limit,
    totalPages: Math.ceil((totalRow ? totalRow.count : 0) / limit)
  };
}

export function softDeleteProforma(id) {
  const db = getDatabase();
  return db.prepare('UPDATE proformas SET is_deleted = 1, deleted_at = CURRENT_TIMESTAMP WHERE id = ?').run(id);
}

export function restoreProforma(id) {
  const db = getDatabase();
  return db.prepare('UPDATE proformas SET is_deleted = 0, deleted_at = NULL WHERE id = ?').run(id);
}

export function permanentlyDeleteProforma(id) {
  const db = getDatabase();
  const delTransaction = db.transaction(() => {
    db.prepare('DELETE FROM proforma_items WHERE proforma_id = ?').run(id);
    db.prepare('DELETE FROM proformas WHERE id = ?').run(id);
  });
  return delTransaction();
}

export function listDeletedProformas() {
  const db = getDatabase();
  const rows = db.prepare(`
    SELECT * FROM proformas 
    WHERE is_deleted = 1 
    ORDER BY deleted_at DESC, id DESC
  `).all();

  const itemStmt = db.prepare('SELECT * FROM proforma_items WHERE proforma_id = ? ORDER BY sort_order ASC');
  return rows.map(pro => ({
    ...pro,
    items: itemStmt.all(pro.id)
  }));
}

export function generateNextProformaNumber() {
  const db = getDatabase();
  const rows = db.prepare(`SELECT proforma_number FROM proformas`).all();

  let maxNum = 0;
  for (const r of rows) {
    const match = (r.proforma_number || '').match(/PRO-(\d+)/i);
    if (match) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num > maxNum) {
        maxNum = num;
      }
    }
  }

  return `PRO-${String(maxNum + 1).padStart(3, '0')}`;
}

