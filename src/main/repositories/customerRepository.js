import { getDatabase } from '../database/connection.js';

export function searchCustomers(query = '') {
  const db = getDatabase();
  const trimmed = query.trim();
  const q = `%${trimmed}%`;
  
  // 1. Get from customers directory table
  const custStmt = db.prepare(`
    SELECT DISTINCT id, name, address, gstin, state, state_code 
    FROM customers 
    WHERE name LIKE ? OR gstin LIKE ? 
    ORDER BY name ASC LIMIT 25
  `);
  const fromCust = custStmt.all(q, q);

  // 2. Retrieve from historical invoices
  const invStmt = db.prepare(`
    SELECT DISTINCT buyer_name as name, buyer_address as address, customer_gstin as gstin, customer_state as state, customer_state_code as state_code
    FROM invoices
    WHERE (buyer_name LIKE ? OR customer_gstin LIKE ?) AND buyer_name IS NOT NULL AND buyer_name != ''
    ORDER BY id DESC LIMIT 25
  `);
  const fromInvs = invStmt.all(q, q);

  // 3. Retrieve from proformas
  const proStmt = db.prepare(`
    SELECT DISTINCT buyer_name as name, buyer_address as address, customer_gstin as gstin, customer_state as state, customer_state_code as state_code
    FROM proformas
    WHERE (buyer_name LIKE ? OR customer_gstin LIKE ?) AND buyer_name IS NOT NULL AND buyer_name != ''
    ORDER BY id DESC LIMIT 25
  `);
  const fromPros = proStmt.all(q, q);

  // Merge and deduplicate by lowercased name / gstin
  const map = new Map();
  for (const c of [...fromCust, ...fromInvs, ...fromPros]) {
    const nameKey = (c.name || '').trim().toLowerCase();
    if (nameKey) {
      if (!map.has(nameKey)) {
        map.set(nameKey, {
          id: c.id || Math.random(),
          name: c.name.trim(),
          address: c.address || '',
          gstin: c.gstin ? c.gstin.trim().toUpperCase() : '',
          state: c.state || 'Maharashtra',
          state_code: c.state_code || '27'
        });
      } else {
        // Enrich existing entry if richer fields are available
        const current = map.get(nameKey);
        if (!current.gstin && c.gstin) current.gstin = c.gstin.trim().toUpperCase();
        if (!current.address && c.address) current.address = c.address;
      }
    }
  }

  return Array.from(map.values()).slice(0, 25);
}

export function saveOrUpdateCustomer(customerData) {
  if (!customerData || !customerData.name) return null;
  const db = getDatabase();
  const gstin = customerData.gstin ? customerData.gstin.trim().toUpperCase() : null;
  const name = customerData.name.trim();

  let existing = null;
  if (gstin) {
    existing = db.prepare('SELECT id FROM customers WHERE gstin = ?').get(gstin);
  }
  if (!existing && name) {
    existing = db.prepare('SELECT id FROM customers WHERE LOWER(TRIM(name)) = LOWER(TRIM(?))').get(name);
  }

  if (existing) {
    db.prepare(`
      UPDATE customers 
      SET name = @name, address = @address, gstin = @gstin, state = @state, state_code = @state_code 
      WHERE id = @id
    `).run({
      name,
      address: customerData.address || '',
      gstin: gstin || null,
      state: customerData.state || 'Maharashtra',
      state_code: customerData.state_code || '27',
      id: existing.id
    });
    return existing.id;
  } else {
    const res = db.prepare(`
      INSERT INTO customers (name, address, gstin, state, state_code)
      VALUES (@name, @address, @gstin, @state, @state_code)
    `).run({
      name,
      address: customerData.address || '',
      gstin: gstin || null,
      state: customerData.state || 'Maharashtra',
      state_code: customerData.state_code || '27'
    });
    return res.lastInsertRowid;
  }
}
