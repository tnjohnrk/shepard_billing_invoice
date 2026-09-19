# Shepherd Enterprises Billing System — Developer Onboarding & Architecture Guide

Welcome to the **Shepherd Enterprises Private Limited Billing System** codebase! This comprehensive documentation is designed so that any new engineer can instantly understand the project's purpose, design principles, full directory and file structure, business workflows, and step-by-step instructions for development and maintenance.

---

## Table of Contents
1. [Project Overview & Core Objective](#1-project-overview--core-objective)
2. [Technology Stack & Core Decisions](#2-technology-stack--core-decisions)
3. [System Architecture & Data Flow](#3-system-architecture--data-flow)
4. [File-by-File Catalog (Purpose & Usage)](#4-file-by-file-catalog-purpose--usage)
   - [Root Configuration Files](#root-configuration-files)
   - [Documentation & Testing](#documentation--testing)
   - [Main Process (`src/main`)](#main-process-srcmain)
   - [Shared Layer (`src/shared`)](#shared-layer-srcshared)
   - [Renderer Process (`src/renderer`)](#renderer-process-srcrenderer)
5. [Key Business Logic & Core Workflows](#5-key-business-logic--core-workflows)
   - [Invoice Generation Wizard](#invoice-generation-wizard)
   - [GST Calculation & Tax Splitting](#gst-calculation--tax-splitting)
   - [Locked A4 HTML/CSS Printing & PDF Generation](#locked-a4-htmlcss-printing--pdf-generation)
   - [Offline-First Email Backup Queue](#offline-first-email-backup-queue)
   - [Security PIN Authorization](#security-pin-authorization)
6. [Developer Onboarding & How-To Guide](#6-developer-onboarding--how-to-guide)
   - [Prerequisites & Local Setup](#prerequisites--local-setup)
   - [Common Developer Recipes](#common-developer-recipes)
   - [Troubleshooting & Native Module Notes](#troubleshooting--native-module-notes)

---

## 1. Project Overview & Core Objective

### Primary Objective
The **Shepherd Enterprises Billing System** is an **offline-first Windows desktop application** built for **Shepherd Enterprises Private Limited** (an industrial supply and service enterprise in Thane, Maharashtra). Its primary goal is to generate, print, store, and manage **GST-compliant Tax Invoices** and **Proforma Invoices (Quotations)** reliably without needing a continuous internet connection.

### Core Problems Solved
1. **Audit & Compliance Safety**: Uses a developer-locked, pixel-perfect A4 invoice template that prevents unauthorized modifications to company information (GSTIN, bank details, legal declarations).
2. **Offline Independence**: All records (customers, invoices, items, settings) are persisted locally in a high-performance SQLite database on the machine.
3. **Automated Redundancy**: Every time an invoice is finalized, a backup zip archive is created and a PDF copy is queued to be emailed to management (`tnjohnrk@gmail.com`). If internet is unavailable, an automatic retry queue handles delivery when connection returns.
4. **GST Accuracy**: Calculates Indian GST splits based on buyer state code (Intra-state: CGST + SGST vs. Inter-state: IGST).
5. **Role & PIN Protection**: Sensitive actions (viewing financial reports, database reset, restoring backups) are protected by a 4-digit SHA-256 hashed PIN.

---

## 2. Technology Stack & Core Decisions

| Technology | Role | Why It Was Chosen |
| :--- | :--- | :--- |
| **Electron** (v34) | Desktop Container | Provides native OS integration (silent printing, A4 PDF generation via Chromium, local file system, offline capability) on Windows. |
| **Node.js** | Backend Runtime | Powers background services, SQLite transactions, ZIP archiving, and SMTP email delivery. |
| **SQLite (`better-sqlite3`)** | Local Database | Fast synchronous SQLite driver for Node. Supports WAL (Write-Ahead Logging) and zero-network overhead. |
| **React** (v19) | User Interface | Declarative UI state management for multi-step wizards, interactive tables, charts, and modal dialogs. |
| **Vite** (v6) | Frontend Bundler | Fast Hot Module Replacement (HMR) during development and optimized frontend bundling. |
| **Tailwind CSS** (v4) | Styling & Design System | Utility-first CSS configured with a sleek dark slate & indigo theme matching modern desktop productivity tools. |
| **Lucide React** | Iconography | Consistent, lightweight SVG icon set without emojis. |
| **Recharts** | Analytics & Graphs | Declarative SVG charting for revenue trends, monthly sales, and invoice activity. |
| **ExcelJS** | Data Export | Formats and exports financial reports and invoice summaries directly into `.xlsx` spreadsheets. |
| **Nodemailer** | Backup Emailing | Dispatches backup ZIP archives and PDF invoices via SMTP. |
| **Adm-Zip** | Backup Compression | Compresses and extracts database backups without external system dependencies. |
| **Zod** | Validation | Runtime schema validation for buyer details, invoice items, and tax numbers. |
| **Vitest** | Unit & Integration Testing | Fast test runner for GST calculation logic and database integration tests. |

---

## 3. System Architecture & Data Flow

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                       ELECTRON RENDERER (Vite + React)                      │
│                                                                             │
│  [Pages: Dashboard, CreateInvoice, History, Reports, Settings]             │
│        │                                                                    │
│        ▼                                                                    │
│  [src/renderer/services/ipcClient.js]                                       │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ window.electronAPI (Typed IPC bridge)
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                     PRELOAD SCRIPT (src/main/preload.js)                    │
│   contextBridge.exposeInMainWorld('electronAPI', { ... })                   │
│   (Enforces contextIsolation: true, nodeIntegration: false)                 │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ ipcRenderer.invoke / ipcMain.handle
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    ELECTRON MAIN PROCESS (Node.js Backend)                  │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │ IPC Handlers (`src/main/ipc/*.js`)                                    │  │
│  │ [invoiceIPC, proformaIPC, reportIPC, backupIPC, settingsIPC, etc.]    │  │
│  └───────────────────────────────────┬───────────────────────────────────┘  │
│                                      │                                       │
│  ┌───────────────────────────────────▼───────────────────────────────────┐  │
│  │ Service Layer (`src/main/services/*.js`)                              │  │
│  │ [invoiceService, calculationService, pdfService, backupService, etc.] │  │
│  └───────────────────────────────────┬───────────────────────────────────┘  │
│                                      │                                       │
│  ┌───────────────────────────────────▼───────────────────────────────────┐  │
│  │ Repository Layer (`src/main/repositories/*.js`)                       │  │
│  │ [invoiceRepository, proformaRepository, customerRepository, etc.]    │  │
│  └───────────────────────────────────┬───────────────────────────────────┘  │
│                                      │                                       │
│  ┌───────────────────────────────────▼───────────────────────────────────┐  │
│  │ SQLite Database (`better-sqlite3`)                                    │  │
│  │ Path: %LOCALAPPDATA%\ShepherdInvoice\database\invoices.db             │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. File-by-File Catalog (Purpose & Usage)

### Root Configuration Files

| File | Purpose & Why It Is Used |
| :--- | :--- |
| **`package.json`** | Defines project metadata, dependencies (React 19, Electron 34, better-sqlite3, ExcelJS, Tailwind, etc.), and npm scripts (`npm run dev`, `npm run electron:dev`, `npm run build`, `npm test`, `npm run dist`). |
| **`vite.config.js`** | Configuration for Vite dev server and React bundler. Configured with `@vitejs/plugin-react` and `@tailwindcss/vite`, serving on port 5173. |
| **`electron-builder.yml`** | Packaging configuration for generating Windows portable executables or NSIS installers targeting x64 architectures. |
| **`vitest.config.js`** | Configuration for Vitest test runner to execute unit and calculation test suites. |
| **`README.md`** | Quick-start documentation and project overview for getting started. |
| **`.gitignore`** | Specifies ignored paths including `node_modules`, `dist`, local builds, SQLite temp files, and logs. |

---

### Documentation & Testing

| File | Purpose & Why It Is Used |
| :--- | :--- |
| **`docs/architecture.md`** | High-level architectural notes on process isolation and security boundaries. |
| **`docs/database.md`** | Specification of SQLite engine parameters (`WAL` mode, foreign keys) and table definitions. |
| **`tests/unit/calculation/sharedCalculations.test.js`** | Unit tests for GST calculation, tax splits (CGST/SGST vs IGST), discount applications, and rounding rules. |
| **`tests/integration/database/database.test.js`** | Automated tests checking database initialization, schema migrations, and CRUD operations. |

---

### Main Process (`src/main`)

The Main process runs Node.js and controls OS-level features, database access, background queues, and native windows.

#### Core Entry & Preload
- **`src/main/main.js`**:
  - The entry point for Electron.
  - Initializes the SQLite database, runs migrations, registers all IPC handler modules, and launches the BrowserWindow.
  - Starts background services: online/offline network monitor, auto-backup timers, and the offline email queue worker.
- **`src/main/preload.js`**:
  - The secure bridge between Electron's Node runtime and the browser Renderer.
  - Uses `contextBridge.exposeInMainWorld('electronAPI', ...)` to expose strictly typed methods (`getInvoices`, `saveInvoice`, `printInvoice`, `exportPDF`, etc.) without exposing `ipcRenderer` directly.

#### Configuration (`src/main/config/`)
- **`companyConfig.js`**: Contains developer-locked, uneditable company constants for Shepherd Enterprises Private Limited (Name, Address: `No.4 & 5 Jenila nagar, Thirumullaivayol salai, Kovilpadagai, Poonamallee, Tiruvallur- 600062`, GSTIN `27AAACS1234F1Z5`, State Code `27`, Bank Details, and management backup email `tnjohnrk@gmail.com`).

#### Database & Migrations (`src/main/database/`)
- **`connection.js`**: Initializes `better-sqlite3` connecting to `%LOCALAPPDATA%\ShepherdInvoice\database\invoices.db`. Enables WAL journal mode and foreign key constraints.
- **`database.js`**: Wraps database lifecycle management, transaction execution helpers, and closing hooks.
- **`migrations/migrationRunner.js`**: Automatically checks and executes SQL schema migration files in order, recording applied versions in `schema_migrations`.
- **`schema/001_initial.sql`**: Initial database schema definition creating `companies`, `customers`, `invoices`, `invoice_items`, `proformas`, `proforma_items`, `email_queue`, `settings`, and indexes.

#### IPC Handlers (`src/main/ipc/`)
Each file listens to `ipcMain.handle` requests from the renderer and calls the appropriate service:
- **`appIPC.js`**: System and window operations (minimize, maximize, close, get app version, check online status).
- **`invoiceIPC.js`**: Tax invoice operations (get invoices, search, get next sequential invoice number `INV-XXX`, save invoice, delete invoice).
- **`proformaIPC.js`**: Proforma invoice operations (get proformas, get next number `PRO-XXX`, save proforma, convert proforma to tax invoice).
- **`reportIPC.js`**: Financial and GST report generation (Daily, Monthly, Financial Year, Customer summaries, and Excel export trigger).
- **`backupIPC.js`**: Database backup creation, manual backup export to chosen file path, and database restore from a zip file.
- **`printIPC.js`**: Native printing via hidden `webContents` and PDF export via `printToPDF`.
- **`settingsIPC.js`**: Fetching and updating application settings, PIN verification, and PIN reset.

#### Services Layer (`src/main/services/`)
Encapsulates business rules:
- **`invoiceService.js`**: Validates invoice data, computes final totals, persists the invoice and line items in a transaction, initiates automatic zip backup, and queues email backup.
- **`proformaService.js`**: Handles quotation lifecycle, status transitions (DRAFT, SENT, CONVERTED, CANCELLED), and conversion to official tax invoices.
- **`calculationService.js`**: Server-side tax computations: taxable amounts, CGST/SGST/IGST breakdown, round-off, and number-to-words currency formatting.
- **`customerService.js`**: Manages the buyer directory and provides search/autofill suggestions.
- **`pdfService.js`**: Renders the locked HTML/CSS template with invoice data in a background window and outputs an A4 PDF stream or file.
- **`printService.js`**: Coordinates physical printer dispatching using Electron's `webContents.print()`.
- **`emailService.js`**: Configures Nodemailer transport to dispatch emails with PDF/ZIP attachments.
- **`emailQueueService.js`**: Scans the `email_queue` table every 60 seconds; if network connectivity is detected, attempts re-sending failed/pending emails and marks them completed.
- **`backupService.js`**: Creates timestamped zip archives containing the SQLite database and exports/restores snapshots.
- **`excelService.js`**: Uses `ExcelJS` to build styled multi-column Excel workbooks for tax audits and date-range billing reports.
- **`reportService.js`**: Queries and aggregates invoice data by date ranges, tax slabs, and customer GSTINs.
- **`pinService.js`**: Implements 4-digit security PIN checking using SHA-256 hashing.
- **`companyService.js`**: Provides locked company profile information to templates and reports.
- **`settingsService.js`**: Reads and writes key-value configuration values in the `settings` table.
- **`updateService.js`**: Integrates `electron-updater` for desktop software update checks.

#### Repositories Layer (`src/main/repositories/`)
Performs SQL queries via `better-sqlite3`:
- **`invoiceRepository.js`**: Inserts, queries, filters, and deletes records in `invoices` and `invoice_items`.
- **`proformaRepository.js`**: CRUD operations on `proformas` and `proforma_items`.
- **`customerRepository.js`**: Reads and updates buyer profiles in `customers`.
- **`companyRepository.js`**: Database access to the `companies` table.
- **`emailQueueRepository.js`**: Enqueues email backup tasks, retrieves pending tasks, and updates retry counts/status.
- **`settingsRepository.js`**: Reads and stores key-value pairs in the `settings` table.

#### Templates & Rendering (`src/main/templates/invoice/`)
- **`invoiceTemplate.html`**: The fixed, audit-compliant A4 invoice layout. Displays company header, buyer details, tax tables, HSN breakdown, bank details, terms, and authorized signature section.
- **`invoiceTemplate.css`**: Strict A4 print styling (210mm x 297mm dimensions, `@media print`, crisp borders, tabular typography).
- **`invoiceRenderer.js`**: Hydrates `invoiceTemplate.html` with dynamic invoice values (items, tax breakdowns, numbers in words).
- **`templateConfig.js`**: Template layout rules, margins, and paper dimension definitions.

#### Utilities (`src/main/utils/`)
- **`filesystem.js`**: Ensures application directories (`%LOCALAPPDATA%\ShepherdInvoice\backups`, `\database`, `\temp`) exist and handles safe file reading/writing.

---

### Shared Layer (`src/shared`)

Shared across both Main and Renderer processes:
- **`constants/application.js`**: Global app constants, list of 38 Indian State Codes (Maharashtra `27`, Gujarat `24`, etc.), and default configuration.
- **`constants/invoiceTypes.js`**: Invoice type definitions (`NORMAL` vs `PROFORMA`).
- **`constants/copyTypes.js`**: GST copy indicators (`ORIGINAL` for Recipient, `DUPLICATE` for Transporter, `TRIPLICATE` for Supplier).
- **`constants/proformaStatuses.js`**: Status enums for proformas (`DRAFT`, `SENT`, `CONVERTED`, `CANCELLED`).
- **`schemas/buyerSchema.js`**: Zod validation schema for buyer name, address, state, and 15-character GSTIN format.
- **`schemas/itemSchema.js`**: Zod validation schema for invoice line items (description, HSN/SAC code, quantity, rate, discount).
- **`schemas/invoiceSchema.js`**: Schema for complete invoice payloads.
- **`schemas/proformaSchema.js`**: Schema for proforma payloads.
- **`utils/sharedCalculations.js`**: Unified calculation logic for item subtotals, tax rate calculations, and rounding, guaranteeing identical calculations in both frontend preview and backend storage.

---

### Renderer Process (`src/renderer`)

The React frontend single-page application:

#### Entry & Core Setup
- **`src/renderer/index.html`**: HTML wrapper loaded by Vite and Electron.
- **`src/renderer/main.jsx`**: React root rendering `<App />`.
- **`src/renderer/App.jsx`**: Main application component managing active views (`dashboard`, `create`, `history`, `reports`, `settings`), PIN lock protection, and toast notifications.
- **`src/renderer/services/ipcClient.js`**: Type-safe client service wrapping all calls to `window.electronAPI`.
- **`src/renderer/styles/index.css`**: Tailwind CSS imports, custom scrollbar styling, glassmorphic card utilities, and dark theme definitions.
- **`src/renderer/styles/print.css`**: Print-specific stylesheet hiding navigation bars and adjusting margins during browser printing.

#### Layout Components (`src/renderer/components/layout/`)
- **`AppLayout.jsx`**: Main shell combining Sidebar, Header, PageContainer, and StatusBar.
- **`Header.jsx`**: Top application bar showing current company GSTIN badge, system lock status, and online connectivity indicator.
- **`Sidebar.jsx`**: Navigation menu with routes for Dashboard, Create Invoice, History, Reports, and Settings.
- **`PageContainer.jsx`**: Standard container providing consistent padding and transitions across pages.
- **`StatusBar.jsx`**: Bottom status bar displaying current database status, offline email queue pending count, and app version.

#### Common UI Components (`src/renderer/components/common/`)
- **`Button.jsx`**: Reusable button with variants (`primary`, `secondary`, `danger`, `success`), icon support, and loading states.
- **`Input.jsx`**: Accessible form input with labels, error states, and keyboard support.
- **`Select.jsx`**: Dropdown select component styled for dark theme.
- **`Table.jsx`**: Data table with sorting headers, empty states, and pagination.
- **`Modal.jsx`**: Accessible modal overlay for confirmations and popups.
- **`Dialog.jsx`**: Confirmation dialog for destructive actions (e.g. database restore, deleting records).
- **`Toast.jsx`**: Floating alert notifications (`success`, `error`, `info`, `warning`).
- **`Loading.jsx`**: Loading spinner and skeleton placeholders.
- **`EmptyState.jsx`**: Visual placeholder shown when tables or search results are empty.

#### Invoice Creation Components (`src/renderer/components/invoice/`)
- **`InvoiceStepper.jsx`**: 8-step wizard progress bar allowing navigation between completed steps.
- **`InvoiceTypeSelector.jsx`**: Step 1 selector between **Tax Invoice (Normal)** and **Proforma Invoice (Estimate)**. Clicking either card immediately selects it and advances to Step 2.
- **`InvoiceDetailsForm.jsx`**: Step 2 form for document number, invoice date, copy type, and transportation details (Vehicle No, Mode, Date of Supply).
- **`BuyerDetailsForm.jsx`**: Step 3 form for Buyer Name, Address, GSTIN, and State Code dropdown with instant GSTIN format validation.
- **`ReferenceDetailsForm.jsx`**: Step 4 form for PO Number, PO Date, GeM Contract Number (`gemc_number`), and additional references.
- **`ItemTable.jsx`**: Step 5 dynamic line-item grid supporting row addition, deletion, and recalculations.
- **`ItemRow.jsx`**: Individual row component for item description, HSN/SAC code, quantity, and rate.
- **`TaxSection.jsx`**: Displays automated GST computation, CGST + SGST vs IGST split, and customizable tax rates (5%, 12%, 18%, 28%).
- **`AdditionalDetailsForm.jsx`**: Step 6 form for optional notes, payment terms, and remarks.
- **`InvoiceReview.jsx`**: Step 7 pre-generation summary reviewing buyer, items, and tax totals before creating the final invoice.
- **`InvoicePreview.jsx`**: Step 8 rendered view of the finalized A4 invoice with buttons for **Print Invoice**, **Download PDF**, and **Back to Dashboard**.

#### Dashboard Components (`src/renderer/components/dashboard/`)
- **`StatCard.jsx`**: Metrics card displaying Total Revenue, Total Invoices Created, Proformas Issued, and Pending Queue items.
- **`BillingAmountChart.jsx`**: Recharts Bar/Area chart showing monthly revenue trends.
- **`InvoiceActivityChart.jsx`**: Line chart showing invoice generation frequency.
- **`RecentInvoices.jsx`**: Quick-access table displaying the most recently issued invoices.

#### History Components (`src/renderer/components/history/`)
- **`HistoryTable.jsx`**: Searchable, paginated table of all saved Tax and Proforma Invoices.
- **`HistorySearch.jsx`**: Real-time search bar filtering by Invoice Number, Buyer Name, or GSTIN.
- **`HistoryFilters.jsx`**: Date range and document type filter controls.
- **`HistoryActions.jsx`**: Row action buttons (View, Print, Download PDF, Convert Proforma to Invoice).

#### Reports Components (`src/renderer/components/reports/`)
- **`ReportSelector.jsx`**: Report period selector (Daily, Monthly, Financial Year, or Custom Date Range).
- **`ReportSummary.jsx`**: High-level tax summaries (Total Taxable Value, CGST, SGST, IGST, Gross Total).
- **`ReportTable.jsx`**: Detailed breakdown of invoices within the selected period with an **Export to Excel** button.

#### Settings Components (`src/renderer/components/settings/`)
- **`PinSettings.jsx`**: Setup, change, or remove the 4-digit security PIN.
- **`BackupRestore.jsx`**: Trigger manual SQLite database backup exports or restore from a previous `.zip` backup.
- **`AppearanceSettings.jsx`**: Theme and visual preferences.
- **`About.jsx`**: App version, developer credits, and system paths.

#### Security & Splash
- **`SplashScreen.jsx`**: PIN unlock screen displayed on application startup when PIN protection is enabled.

---

## 5. Key Business Logic & Core Workflows

### Invoice Generation Wizard
The invoice wizard consists of 8 linear steps:
1. **Select Type**: Click **Tax Invoice** or **Proforma Invoice** (instantly advances to step 2).
2. **Invoice Details**: Auto-generates the next sequential number (`INV-XXX` or `PRO-XXX`) and captures supply/transport information.
3. **Buyer Details**: Captures customer details; validating state code against Maharashtra (`27`).
4. **References**: Purchase Order (PO) & GeM contract details.
5. **Items & Tax**: Line items with automatic subtotal, CGST+SGST or IGST tax calculations, and round-off.
6. **Additional Details**: Custom notes and remarks.
7. **Review**: Comprehensive audit of data before submission.
8. **Generate & Preview**: Persists invoice to SQLite, triggers automatic backup zip, queues email, and opens the print/PDF view.

### GST Calculation & Tax Splitting
Indian GST rules require determining whether a transaction is **Intra-state** or **Inter-state**:
- **Supplier State**: Shepherd Enterprises is located in **Maharashtra (State Code: 27)**.
- **Intra-state (`buyer_state_code == '27'`)**:
  - GST is split equally into **CGST (Central GST)** and **SGST (State GST)**.
  - Example (18% tax): `CGST = 9%`, `SGST = 9%`, `IGST = 0%`.
- **Inter-state (`buyer_state_code != '27'`)**:
  - Entire tax is levied as **IGST (Integrated GST)**.
  - Example (18% tax): `CGST = 0%`, `SGST = 0%`, `IGST = 18%`.
- **Rounding**: Invoices are rounded to the nearest integer rupee using standard commercial rounding (`Round-Off Amount = Math.round(Total) - Total`).

### Locked A4 HTML/CSS Printing & PDF Generation
To prevent tampering and ensure legal compliance:
- The template (`src/main/templates/invoice/invoiceTemplate.html`) is rendered inside a hidden Electron `BrowserWindow`.
- For printing: `win.webContents.print()` sends the rendered page directly to the physical printer.
- For PDF: `win.webContents.printToPDF({ pageSize: 'A4', marginsType: 0 })` generates a high-resolution vector PDF saved to disk.

### Offline-First Email Backup Queue
- When an invoice is created, a background task saves an entry into `email_queue` with status `'PENDING'`.
- `emailQueueService` periodically checks for internet connectivity.
- When online, it uses `nodemailer` to dispatch the PDF invoice and database snapshot to `tnjohnrk@gmail.com`.
- If sending fails, retry counter increments up to 5 times with exponential backoff before being flagged.

### Security PIN Authorization
- Stored as a salted SHA-256 hash in SQLite's `settings` table (`security_pin`).
- Required on startup (if enabled) and before sensitive operations (database restoration, clearing data).

---

## 6. Developer Onboarding & How-To Guide

### Prerequisites & Local Setup
1. **Node.js**: Recommended Node.js LTS (v18 or v20+).
2. **Windows Build Tools**: Because `better-sqlite3` is a C++ native addon, ensure Python and Visual Studio C++ build tools are installed (or run with prebuilt binaries matching Electron).

#### Installation Steps
```bash
# 1. Clone or open the repository in terminal
cd d:\billing_system

# 2. Install all dependencies
npm install

# 3. If better-sqlite3 throws a NODE_MODULE_VERSION mismatch with Electron:
npm run rebuild

# 4. Start the Vite React development server
npm run dev

# 5. In a second terminal window, start the Electron desktop app
npm run electron:dev
```

### Common Developer Recipes

#### A. Adding a New Column to Invoices
1. Add a new migration script in `src/main/database/migrations/` (e.g., `002_add_field.sql`).
2. Update the Zod validation schema in `src/shared/schemas/invoiceSchema.js`.
3. Update `src/main/repositories/invoiceRepository.js` SQL query parameters.
4. Add the form input in the corresponding form component in `src/renderer/components/invoice/`.
5. Update `src/main/templates/invoice/invoiceTemplate.html` to display the field in print/PDF.

#### B. Adding a New IPC Channel
1. In `src/main/ipc/<feature>IPC.js`, register `ipcMain.handle('feature:action', async (event, args) => { ... })`.
2. In `src/main/preload.js`, expose the method under `electronAPI`.
3. In `src/renderer/services/ipcClient.js`, add the typed wrapper method.
4. Call it from your React component.

#### C. Running Tests
```bash
# Run unit tests
npm test
```

#### D. Packaging for Windows Production
```bash
# Build the production executable installer
npm run dist
```
Output files will be generated in `dist/`.

---

*Documentation maintained for Shepherd Enterprises Private Limited Billing System.*
