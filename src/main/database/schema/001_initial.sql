-- Initial Migration Schema for Shepherd Enterprises Private Limited Billing System

CREATE TABLE IF NOT EXISTS schema_migrations (
    version INTEGER PRIMARY KEY,
    applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

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
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK(status IN ('DRAFT', 'PENDING', 'CONFIRMED_UNCHANGED', 'CONFIRMED_CHANGED')),
    
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
    invoice_type TEXT NOT NULL DEFAULT 'NORMAL' CHECK(invoice_type IN ('NORMAL', 'PROFORMA_CONVERTED')),
    invoice_date DATE NOT NULL,
    copy_type TEXT NOT NULL DEFAULT 'ORIGINAL' CHECK(copy_type IN ('ORIGINAL', 'DUPLICATE', 'TRIPLICATE')),
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
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK(status IN ('PENDING', 'SENDING', 'SENT', 'FAILED')),
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

CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(invoice_date);
CREATE INDEX IF NOT EXISTS idx_invoices_customer ON invoices(buyer_name);
CREATE INDEX IF NOT EXISTS idx_invoices_gstin ON invoices(customer_gstin);
CREATE INDEX IF NOT EXISTS idx_invoices_proforma ON invoices(proforma_id);
CREATE INDEX IF NOT EXISTS idx_proformas_number ON proformas(proforma_number);
CREATE INDEX IF NOT EXISTS idx_email_queue_status ON email_queue(status);
