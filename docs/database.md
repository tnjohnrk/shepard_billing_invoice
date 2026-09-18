# Database Specification & Migration Schema

## Database Engine
- **Engine**: SQLite 3 via `better-sqlite3`
- **Location**: `%LOCALAPPDATA%\ShepherdInvoice\database\invoices.db`
- **Pragmas**: `journal_mode = WAL`, `foreign_keys = ON`

## Table Schemas
1. `companies`: Developer-locked company details.
2. `customers`: Directory of buyers for autofill.
3. `proformas` & `proforma_items`: Proforma invoices and line items.
4. `invoices` & `invoice_items`: Official tax invoices and line items.
5. `email_queue`: Offline email retry queue.
6. `settings`: Key-value application settings & hashed security PIN.
7. `schema_migrations`: Version tracking.
