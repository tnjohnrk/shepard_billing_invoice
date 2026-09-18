import fs from 'fs';
import path from 'path';
import { COMPANY_CONFIG } from '../../config/companyConfig.js';

export function runMigrations(db) {
  // Ensure schema_migrations table exists first
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY,
      applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const currentVersionRow = db.prepare('SELECT MAX(version) as max_version FROM schema_migrations').get();
  const currentVersion = currentVersionRow?.max_version || 0;

  if (currentVersion < 1) {
    const migrationPath = path.join(__dirname, '..', 'schema', '001_initial.sql');
    let sqlContent = '';

    if (fs.existsSync(migrationPath)) {
      sqlContent = fs.readFileSync(migrationPath, 'utf8');
    } else {
      // Fallback inline schema string if running packaged
      sqlContent = `
        CREATE TABLE IF NOT EXISTS companies (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          address TEXT NOT NULL,
          phone TEXT,
          email TEXT,
          gstin TEXT NOT NULL,
          state TEXT NOT NULL,
          state_code TEXT NOT NULL,
          bank_name TEXT NOT NULL,
          account_number TEXT NOT NULL,
          ifsc_code TEXT NOT NULL,
          branch_name TEXT NOT NULL,
          upi_id TEXT,
          backup_email TEXT,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS customers (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          address TEXT NOT NULL,
          gstin TEXT,
          state TEXT NOT NULL,
          state_code TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS proformas (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          proforma_number TEXT NOT NULL UNIQUE,
          proforma_date DATE NOT NULL,
          status TEXT NOT NULL DEFAULT 'PENDING',
          transportation_mode TEXT,
          vehicle_number TEXT,
          date_of_supply DATE,
          delivery_address TEXT,
          buyer_name TEXT NOT NULL,
          buyer_address TEXT NOT NULL,
          customer_gstin TEXT,
          customer_state TEXT NOT NULL,
          customer_state_code TEXT NOT NULL,
          so_po_number TEXT,
          so_po_date DATE,
          gemc_number TEXT,
          additional_reference TEXT,
          subtotal REAL NOT NULL,
          cgst_rate REAL DEFAULT 0,
          cgst_amount REAL DEFAULT 0,
          sgst_rate REAL DEFAULT 0,
          sgst_amount REAL DEFAULT 0,
          igst_rate REAL DEFAULT 0,
          igst_amount REAL DEFAULT 0,
          grand_total REAL NOT NULL,
          amount_in_words TEXT NOT NULL,
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS proforma_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          proforma_id INTEGER NOT NULL REFERENCES proformas(id) ON DELETE CASCADE,
          sort_order INTEGER NOT NULL,
          description TEXT NOT NULL,
          hsn_sac TEXT NOT NULL,
          quantity REAL NOT NULL,
          rate REAL NOT NULL,
          amount REAL NOT NULL
        );
        CREATE TABLE IF NOT EXISTS invoices (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          invoice_number TEXT NOT NULL UNIQUE,
          invoice_type TEXT NOT NULL DEFAULT 'NORMAL',
          invoice_date DATE NOT NULL,
          copy_type TEXT NOT NULL DEFAULT 'ORIGINAL',
          proforma_id INTEGER REFERENCES proformas(id),
          transportation_mode TEXT,
          vehicle_number TEXT,
          date_of_supply DATE,
          delivery_address TEXT,
          buyer_name TEXT NOT NULL,
          buyer_address TEXT NOT NULL,
          customer_gstin TEXT,
          customer_state TEXT NOT NULL,
          customer_state_code TEXT NOT NULL,
          so_po_number TEXT,
          so_po_date DATE,
          gemc_number TEXT,
          additional_reference TEXT,
          subtotal REAL NOT NULL,
          cgst_rate REAL DEFAULT 0,
          cgst_amount REAL DEFAULT 0,
          sgst_rate REAL DEFAULT 0,
          sgst_amount REAL DEFAULT 0,
          igst_rate REAL DEFAULT 0,
          igst_amount REAL DEFAULT 0,
          grand_total REAL NOT NULL,
          amount_in_words TEXT NOT NULL,
          notes TEXT,
          pdf_path TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS invoice_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          invoice_id INTEGER NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
          sort_order INTEGER NOT NULL,
          description TEXT NOT NULL,
          hsn_sac TEXT NOT NULL,
          quantity REAL NOT NULL,
          rate REAL NOT NULL,
          amount REAL NOT NULL
        );
        CREATE TABLE IF NOT EXISTS email_queue (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          invoice_id INTEGER NOT NULL REFERENCES invoices(id),
          backup_path TEXT NOT NULL,
          recipient TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'PENDING',
          attempt_count INTEGER DEFAULT 0,
          last_attempt DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          sent_at DATETIME,
          error_message TEXT
        );
        CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `;
    }

    db.exec(sqlContent);
    db.prepare('INSERT INTO schema_migrations (version) VALUES (1)').run();
  }

  // Seed default company details if not present
  const companyCount = db.prepare('SELECT COUNT(*) as count FROM companies').get().count;
  if (companyCount === 0) {
    db.prepare(`
      INSERT INTO companies (
        name, address, phone, email, gstin, state, state_code,
        bank_name, account_number, ifsc_code, branch_name, upi_id, backup_email
      ) VALUES (
        @name, @address, @phone, @email, @gstin, @state, @state_code,
        @bank_name, @account_number, @ifsc_code, @branch_name, @upi_id, @backup_email
      )
    `).run(COMPANY_CONFIG);
  }
}
