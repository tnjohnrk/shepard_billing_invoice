import { getDatabase } from '../database/connection.js';

export function searchCustomers(query = '') {
  const db = getDatabase();
  const q = `%${query.trim()}%`;
  const stmt = db.prepare(`
    SELECT * FROM customers 
    WHERE name LIKE ? OR gstin LIKE ? 
    ORDER BY name ASC LIMIT 20
  `);
  return stmt.all(q, q);
}

export function saveOrUpdateCustomer(customerData) {
  const db = getDatabase();
  const existing = db.prepare('SELECT id FROM customers WHERE gstin = ? AND gstin IS NOT NULL AND gstin != ""').get(customerData.gstin);

  if (existing) {
    db.prepare(`
      UPDATE customers 
      SET name = @name, address = @address, state = @state, state_code = @state_code 
      WHERE id = @id
    `).run({ ...customerData, id: existing.id });
    return existing.id;
  } else {
    const res = db.prepare(`
      INSERT INTO customers (name, address, gstin, state, state_code)
      VALUES (@name, @address, @gstin, @state, @state_code)
    `).run({
      name: customerData.name,
      address: customerData.address,
      gstin: customerData.gstin || null,
      state: customerData.state,
      state_code: customerData.state_code
    });
    return res.lastInsertRowid;
  }
}
