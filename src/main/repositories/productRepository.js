import { getDatabase } from '../database/connection.js';

/**
 * Retrieve all products with optional search query
 */
export function getAllProducts(search = '') {
  const db = getDatabase();
  const trimmed = search.trim();
  if (trimmed) {
    const q = `%${trimmed}%`;
    return db.prepare(`
      SELECT id, name, hsn_sac, default_quantity, rate, created_at, updated_at
      FROM products
      WHERE name LIKE ? OR hsn_sac LIKE ?
      ORDER BY name ASC
    `).all(q, q);
  }

  return db.prepare(`
    SELECT id, name, hsn_sac, default_quantity, rate, created_at, updated_at
    FROM products
    ORDER BY name ASC
  `).all();
}

/**
 * Find product by exact or prefix HSN code
 */
export function getProductByHsn(hsnCode = '') {
  const db = getDatabase();
  const trimmed = String(hsnCode || '').trim();
  if (!trimmed) return null;

  // 1. Try exact match in products catalog
  const exact = db.prepare(`
    SELECT id, name, hsn_sac, default_quantity, rate
    FROM products
    WHERE TRIM(hsn_sac) = ? OR LOWER(TRIM(hsn_sac)) = LOWER(?)
    LIMIT 1
  `).get(trimmed, trimmed);
  if (exact) return exact;

  // 2. Try prefix / wildcard match in products catalog
  const prefix = db.prepare(`
    SELECT id, name, hsn_sac, default_quantity, rate
    FROM products
    WHERE hsn_sac LIKE ?
    ORDER BY LENGTH(hsn_sac) ASC, name ASC
    LIMIT 1
  `).get(`${trimmed}%`);
  if (prefix) return prefix;

  // 3. Fallback to invoice / proforma history
  const hist = db.prepare(`
    SELECT description as name, hsn_sac, quantity as default_quantity, rate
    FROM (
      SELECT description, hsn_sac, quantity, rate FROM invoice_items
      UNION ALL
      SELECT description, hsn_sac, quantity, rate FROM proforma_items
    )
    WHERE (TRIM(hsn_sac) = ? OR hsn_sac LIKE ?) AND description IS NOT NULL AND description != ''
    LIMIT 1
  `).get(trimmed, `${trimmed}%`);

  return hist || null;
}

/**
 * Search products giving preference to HSN Number matches over name matches.
 * Also integrates unique historical invoice line items for maximum auto-fill convenience.
 */
export function searchProducts(query = '') {
  const db = getDatabase();
  const trimmed = String(query || '').trim();
  if (!trimmed) {
    return getAllProducts('').slice(0, 25);
  }

  const exactStr = trimmed;
  const qPrefix = `${trimmed}%`;
  const qWildcard = `%${trimmed}%`;

  // 1. Get from products master catalog with HSN preference ranking
  const masterStmt = db.prepare(`
    SELECT id, name, hsn_sac, default_quantity, rate,
      CASE 
        WHEN TRIM(hsn_sac) = ? THEN 1
        WHEN hsn_sac LIKE ? THEN 2
        WHEN hsn_sac LIKE ? THEN 3
        WHEN name LIKE ? THEN 4
        ELSE 5
      END as match_priority
    FROM products
    WHERE hsn_sac LIKE ? OR name LIKE ?
    ORDER BY match_priority ASC, name ASC
    LIMIT 30
  `);
  const fromMaster = masterStmt.all(exactStr, qPrefix, qWildcard, qWildcard, qWildcard, qWildcard);

  // 2. Retrieve from historical invoice & proforma items
  const histStmt = db.prepare(`
    SELECT DISTINCT description as name, hsn_sac, quantity as default_quantity, rate,
      CASE 
        WHEN TRIM(hsn_sac) = ? THEN 1
        WHEN hsn_sac LIKE ? THEN 3
        WHEN description LIKE ? THEN 5
        ELSE 6
      END as match_priority
    FROM (
      SELECT description, hsn_sac, quantity, rate FROM invoice_items
      UNION ALL
      SELECT description, hsn_sac, quantity, rate FROM proforma_items
    )
    WHERE (hsn_sac LIKE ? OR description LIKE ?) AND description IS NOT NULL AND description != ''
    ORDER BY match_priority ASC LIMIT 30
  `);
  const fromHistory = histStmt.all(exactStr, qWildcard, qWildcard, qWildcard, qWildcard);

  // Deduplicate by Name + HSN key
  const map = new Map();
  for (const p of [...fromMaster, ...fromHistory]) {
    const key = `${(p.hsn_sac || '').trim()}_${(p.name || '').trim().toLowerCase()}`;
    if (!map.has(key)) {
      map.set(key, {
        id: p.id || null,
        name: (p.name || '').trim(),
        hsn_sac: (p.hsn_sac || '').trim(),
        default_quantity: Number(p.default_quantity) || 1,
        rate: Number(p.rate) || 0,
        match_priority: p.match_priority || 5
      });
    }
  }

  return Array.from(map.values())
    .sort((a, b) => a.match_priority - b.match_priority)
    .slice(0, 25);
}

/**
 * Create or update product item
 */
export function saveOrUpdateProduct(productData) {
  if (!productData || !productData.name) return null;
  const db = getDatabase();
  const name = productData.name.trim();
  const hsn = (productData.hsn_sac || '').trim();
  const qty = Number(productData.default_quantity) || 1;
  const rate = Number(productData.rate) || 0;

  if (productData.id) {
    db.prepare(`
      UPDATE products
      SET name = @name, hsn_sac = @hsn_sac, default_quantity = @default_quantity, rate = @rate, updated_at = CURRENT_TIMESTAMP
      WHERE id = @id
    `).run({
      id: productData.id,
      name,
      hsn_sac: hsn,
      default_quantity: qty,
      rate
    });
    return productData.id;
  }

  // Check if matching name & HSN exists
  const existing = db.prepare('SELECT id FROM products WHERE LOWER(TRIM(name)) = LOWER(TRIM(?)) AND TRIM(hsn_sac) = TRIM(?)').get(name, hsn);
  if (existing) {
    db.prepare(`
      UPDATE products
      SET name = @name, hsn_sac = @hsn_sac, default_quantity = @default_quantity, rate = @rate, updated_at = CURRENT_TIMESTAMP
      WHERE id = @id
    `).run({
      id: existing.id,
      name,
      hsn_sac: hsn,
      default_quantity: qty,
      rate
    });
    return existing.id;
  }

  const res = db.prepare(`
    INSERT INTO products (name, hsn_sac, default_quantity, rate)
    VALUES (@name, @hsn_sac, @default_quantity, @rate)
  `).run({
    name,
    hsn_sac: hsn,
    default_quantity: qty,
    rate
  });

  return res.lastInsertRowid;
}

/**
 * Delete product by ID
 */
export function deleteProduct(id) {
  const db = getDatabase();
  return db.prepare('DELETE FROM products WHERE id = ?').run(id);
}

/**
 * Get product by ID
 */
export function getProductById(id) {
  const db = getDatabase();
  return db.prepare('SELECT * FROM products WHERE id = ?').get(id);
}
