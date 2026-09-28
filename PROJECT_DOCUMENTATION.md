# Shepherd Enterprises Billing System — Developer Onboarding & Architecture Guide

Welcome to the **Shepherd Enterprises Private Limited Billing System** codebase. This documentation serves as the single source of truth for software engineers, architects, and maintainers. It covers the system's architecture, file structure, domain business logic, licensing engine, security protocols, database schemas, automated testing, and developer workflows.

---

## Table of Contents
1. [Project Overview & Core Objective](#1-project-overview--core-objective)
2. [Technology Stack & Core Decisions](#2-technology-stack--core-decisions)
3. [System Architecture & Security Model](#3-system-architecture--security-model)
4. [Complete File-by-File Catalog](#4-complete-file-by-file-catalog)
   - [Root Configuration & Build Scripts](#root-configuration--build-scripts)
   - [Main Process (`src/main`)](#main-process-srcmain)
   - [Shared Layer (`src/shared`)](#shared-layer-srcshared)
   - [Renderer Process (`src/renderer`)](#renderer-process-srcrenderer)
   - [Automated Test Suite (`tests/`)](#automated-test-suite-tests)
5. [Key Business Logic & Core Workflows](#5-key-business-logic--core-workflows)
   - [Invoice & Proforma 8-Step Wizard](#invoice--proforma-8-step-wizard)
   - [Indian GST Calculation & Tax Engine](#indian-gst-calculation--tax-engine)
   - [Licensing, Trial Management & Machine Lock](#licensing-trial-management--machine-lock)
   - [4-Digit Security PIN & Developer Emergency Access](#4-digit-security-pin--developer-emergency-access)
   - [Locked A4 Print & Vector PDF Engine](#locked-a4-print--vector-pdf-engine)
   - [Offline-First Email Backup Queue](#offline-first-email-backup-queue)
   - [Database Management, Migrations & Safe Restores](#database-management-migrations--safe-restores)
6. [Testing & Quality Assurance](#6-testing--quality-assurance)
7. [Build, Packaging & Windows Deployment](#7-build-packaging--windows-deployment)
8. [Developer Onboarding & Step-by-Step Recipes](#8-developer-onboarding--step-by-step-recipes)
   - [Prerequisites & Local Environment Setup](#prerequisites--local-environment-setup)
   - [Common Developer Recipes](#common-developer-recipes)
   - [Troubleshooting & Windows Native Modules](#troubleshooting--windows-native-modules)

---

## 1. Project Overview & Core Objective

### Primary Objective
The **Shepherd Enterprises Billing System** is an **offline-first Windows desktop application** built for **Shepherd Enterprises Private Limited** (an industrial supply and service enterprise located in Poonamallee / Tiruvallur, Tamil Nadu / Thane, Maharashtra). Its primary purpose is to generate, print, store, and manage **GST-compliant Tax Invoices** and **Proforma Invoices (Quotations)** reliably with zero cloud latency and complete offline resilience.

### Core Problems Solved
1. **Audit & Regulatory Compliance**: Enforces a developer-locked, pixel-perfect A4 invoice template that prevents unauthorized changes to legal declarations, GSTIN numbers, and bank settlement details.
2. **Offline Independence**: All records (customers, invoices, products, quotes, settings, recycle bin) reside in a local SQLite database with Write-Ahead Logging (WAL).
3. **Automated Redundancy & Disaster Recovery**: Finalizing any invoice automatically generates a timestamped `.zip` database snapshot and queues an email containing the PDF and database backup to management (`tnjohnrk@gmail.com`).
4. **GST Accuracy**: Automatically computes Intra-state (CGST 50% + SGST 50%) versus Inter-state (IGST 100%) splits based on buyer state code comparison with supplier state.
5. **Role & Hardware Security**: Features machine-locked licensing (SHA-256 Machine ID), 30-day trial modes, 4-digit PIN access control, and a developer master recovery console.

---

## 2. Technology Stack & Core Decisions

| Layer / Library | Technology | Version | Purpose & Architectural Decision |
| :--- | :--- | :--- | :--- |
| **Desktop Shell** | Electron | `^34.x` | Native OS integration on Windows: silent physical printing, Chromium vector PDF rendering, local filesystem access, and process isolation. |
| **Backend Runtime** | Node.js | `^20.x` | Coordinates background workers, native database connections, cryptographic hashing, and SMTP network dispatch. |
| **Database Engine** | SQLite (`better-sqlite3`) | `^11.x` | High-performance synchronous SQLite driver with WAL mode enabled. Zero-network latency and ACID compliance. |
| **Frontend Framework** | React | `^19.x` | Declarative UI state management for multi-step invoice generation, live calculations, charts, and modal dialogs. |
| **Frontend Bundler** | Vite | `^6.x` | Rapid Hot Module Replacement (HMR) in development and optimized production asset compilation. |
| **Styling System** | Tailwind CSS | `^4.x` | Modern, responsive dark-slate design system engineered specifically for desktop productivity applications. |
| **Iconography** | Lucide React | `^1.x` | Clean, lightweight SVG icon system across all UI views. |
| **Data Analytics** | Recharts | `^2.x` | Declarative SVG charting for monthly revenue trajectories and invoice volume trends. |
| **Excel Export** | ExcelJS | `^4.x` | Generates formatted, multi-column `.xlsx` audit reports directly from invoice queries. |
| **Email Delivery** | Nodemailer | `^6.x` | Asynchronous SMTP delivery for offline-queued PDF attachments and database backup archives. |
| **Archive Utilities** | Adm-Zip | `^0.5.x` | In-memory and file-based `.zip` compression for automated and manual database snapshots. |
| **Data Validation** | Zod | `^3.x` | Strict runtime schema validation for buyer records, line items, tax numbers, and invoice payloads. |
| **Testing Suite** | Vitest | `^3.x` | Fast unit and integration testing framework executing 64 automated test assertions. |

---

## 3. System Architecture & Security Model

The system strictly adheres to Electron's security best practices: **`contextIsolation: true`**, **`nodeIntegration: false`**, and typed communication over IPC.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    ELECTRON RENDERER PROCESS (React 19 + Vite)              │
│                                                                             │
│  [Views: Dashboard, CreateInvoice, History, Details, Reports, Settings]     │
│  [Auth: LockScreen, ProductKeyActivation, TrialExpiredOverlay]              │
│  [Error Handling: Top-Level Global React ErrorBoundary]                     │
│                                │                                            │
│                                ▼                                            │
│                    [src/renderer/services/ipcClient.js]                     │
└────────────────────────────────┬────────────────────────────────────────────┘
                                 │ window.electronAPI (Exposed via contextBridge)
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                     PRELOAD SCRIPT (src/main/preload.cjs / .js)             │
│   contextBridge.exposeInMainWorld('electronAPI', { ... })                   │
│   (Typed IPC Invocation Bridge - No Direct Node Access in DOM)              │
└────────────────────────────────┬────────────────────────────────────────────┘
                                 │ ipcRenderer.invoke / ipcMain.handle
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    ELECTRON MAIN PROCESS (Node.js Backend)                  │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │ IPC Layer (`src/main/ipc/*.js`)                                       │  │
│  │ [invoiceIPC, proformaIPC, reportIPC, backupIPC, settingsIPC, etc.]    │  │
│  └───────────────────────────────────┬───────────────────────────────────┘  │
│                                      │                                       │
│  ┌───────────────────────────────────▼───────────────────────────────────┐  │
│  │ Services Layer (`src/main/services/*.js`)                             │  │
│  │ [invoiceService, calculationService, activationService, pdfService]   │  │
│  └───────────────────────────────────┬───────────────────────────────────┘  │
│                                      │                                       │
│  ┌───────────────────────────────────▼───────────────────────────────────┐  │
│  │ Repositories Layer (`src/main/repositories/*.js`)                     │  │
│  │ [invoiceRepository, customerRepository, emailQueueRepository, etc.]   │  │
│  └───────────────────────────────────┬───────────────────────────────────┘  │
│                                      │                                       │
│  ┌───────────────────────────────────▼───────────────────────────────────┐  │
│  │ SQLite Database (`better-sqlite3` in WAL Mode)                        │  │
│  │ Location: %LOCALAPPDATA%\ShepherdInvoice\database\invoices.db         │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Complete File-by-File Catalog

### Root Configuration & Build Scripts

| File | Purpose & Architectural Usage |
| :--- | :--- |
| **`package.json`** | Defines project metadata, npm scripts (`dev:all`, `build`, `dist`, `test`), and dependencies. |
| **`vite.config.js`** | Configures Vite React plugin, Tailwind CSS v4 compiler, base path resolution (`./`), and dev server port 5173. |
| **`electron-builder.yml`** | Defines Electron packaging targets for Windows (NSIS installer & portable `.exe` with custom icon and installation scripts). |
| **`scripts/build-electron.js`** | Custom Node.js build pipeline that triggers Vite bundling and executes `electron-builder` with production asset validation. |
| **`installer/installer.nsh`** | Custom NSIS installer script handling Windows installation hooks, shortcut creation, and registry registrations. |
| **`vitest.config.js`** | Configuration for Vitest test execution covering unit and integration test directories. |
| **`README.md`** | High-level quickstart and feature overview guide for developers. |
| **`PROJECT_DOCUMENTATION.md`** | This comprehensive developer onboarding, architecture, and maintenance guide. |

---

### Main Process (`src/main`)

#### Entry & Security Bridge
- **`src/main/main.js`**: Main Electron process entry point. Handles single-instance lock (`app.requestSingleInstanceLock()`), initializes SQLite database and runs migrations, registers all IPC handler modules, creates the main `BrowserWindow`, sets up the offline email queue timer (60s interval), and manages window state.
- **`src/main/preload.js`** / **`src/main/preload.cjs`**: Preload scripts exposing safe, typed APIs to the renderer via `contextBridge.exposeInMainWorld('electronAPI', ...)`.

#### Configuration & Constants
- **`src/main/config/companyConfig.js`**: Developer-locked company details for Shepherd Enterprises Private Limited (Name, Address, GSTIN `27AAACS1234F1Z5`, State Code `27`, Bank Name, Account Number, IFSC Code, and management backup email `tnjohnrk@gmail.com`).

#### Database & Migrations (`src/main/database/`)
- **`connection.js`**: Initializes the `better-sqlite3` database instance at `%LOCALAPPDATA%\ShepherdInvoice\database\invoices.db`. Enables `journal_mode = WAL` and `foreign_keys = ON`.
- **`database.js`**: Wraps database lifecycle hooks, transactions, and graceful shutdown handlers.
- **`migrations/migrationRunner.js`**: Discovers SQL files in `schema/`, applies pending migrations sequentially inside a transaction, and updates `schema_migrations`.
- **`schema/001_initial.sql`**: Initial database schema defining `companies`, `customers`, `products`, `invoices`, `invoice_items`, `proformas`, `proforma_items`, `email_queue`, `settings`, and indexing structures.

#### IPC Handlers (`src/main/ipc/`)
- **`appIPC.js`**: Window actions (minimize, maximize, close), version information, and online status queries.
- **`invoiceIPC.js`**: Tax invoice management (get next invoice number `INV-XXX`, save, search, fetch by ID, delete to recycle bin).
- **`proformaIPC.js`**: Proforma invoice operations (get next number `PRO-XXX`, save, convert to tax invoice).
- **`detailsIPC.js`**: Handles company information updates and product catalog management.
- **`recycleBinIPC.js`**: Manages soft-deleted invoices, restoration, and permanent purge operations.
- **`reportIPC.js`**: Aggregates date-range financial summaries and triggers Excel workbook generation.
- **`backupIPC.js`**: Creates manual database backup exports and handles safe database restoration from `.zip` files.
- **`printIPC.js`**: Manages silent physical printing and Chromium vector A4 PDF export.
- **`settingsIPC.js`**: Reads/writes key-value application settings, PIN verification, product key activation, and developer overrides.

#### Services Layer (`src/main/services/`)
- **`activationService.js`**: Handles hardware-tied Machine ID generation (SHA-256), product key activation (`V2C-XXXX-XXXX-XXXX`), 30-day trial status calculation, and developer master password overrides.
- **`licenseService.js`**: Cryptographic validation and storage of `license.dat` using HMAC-SHA256 signature verification.
- **`pinService.js`**: Manages 4-digit security PIN setup, SHA-256 salted hashing, verification, and rate-limiting lockouts.
- **`invoiceService.js`**: Validates invoice payloads, executes transactional database insertions, triggers auto-backup `.zip`, and enqueues offline emails.
- **`proformaService.js`**: Manages quotation lifecycles (`DRAFT`, `SENT`, `CONVERTED`, `CANCELLED`) and handles one-click conversion to Tax Invoices.
- **`calculationService.js`**: Backend tax calculation engine: taxable subtotal, CGST/SGST/IGST breakdown, commercial rounding, and Indian currency words formatting.
- **`customerService.js`**: Manages buyer records, search suggestions, and GSTIN auto-fill.
- **`productService.js`**: Product and HSN/SAC catalog management.
- **`pdfService.js`**: Renders locked A4 HTML templates in a hidden `BrowserWindow` and generates vector PDF files via `printToPDF`.
- **`printService.js`**: Dispatches print jobs to physical printers using Electron's `webContents.print()`.
- **`emailService.js`**: Dispatches SMTP emails with attached PDF invoices and database backup files via Nodemailer.
- **`emailQueueService.js`**: Scans the `email_queue` table every 60 seconds; if network connectivity is detected, attempts delivery with exponential backoff.
- **`backupService.js`**: Generates timestamped `.zip` archives containing the SQLite database and handles safe restores with pre-restore safety backups.
- **`excelService.js`**: Builds multi-sheet, formatted Excel workbooks (`.xlsx`) via `ExcelJS` for tax audits and date-range billing reports.
- **`reportService.js`**: Queries and aggregates financial metrics by day, month, financial year, and customer GSTIN.
- **`companyService.js`**: Supplies locked company profile information to rendering engines and reports.
- **`settingsService.js`**: Key-value store abstraction over the `settings` table.
- **`updateService.js`**: Integrates `electron-updater` for desktop software update checks.

#### Repositories Layer (`src/main/repositories/`)
- **`invoiceRepository.js`**: CRUD operations and SQL queries on `invoices` and `invoice_items`.
- **`proformaRepository.js`**: CRUD operations on `proformas` and `proforma_items`.
- **`customerRepository.js`**: Queries and updates buyer profiles in `customers`.
- **`productRepository.js`**: Queries and updates items in `products`.
- **`companyRepository.js`**: Queries and updates records in `companies`.
- **`emailQueueRepository.js`**: Enqueues email backup tasks, retrieves pending tasks, and updates status/retry counts.
- **`settingsRepository.js`**: Key-value persistence in the `settings` table.

#### Templates & Rendering (`src/main/templates/invoice/`)
- **`invoiceTemplate.html`**: The fixed, audit-compliant A4 invoice layout. Displays company header, buyer details, tax tables, HSN breakdown, bank details, terms, and authorized signature section.
- **`invoiceTemplate.css`**: Strict A4 print styling (210mm x 297mm dimensions, `@media print`, crisp borders, tabular typography).
- **`invoiceRenderer.js`**: Hydrates `invoiceTemplate.html` with dynamic invoice values (items, tax breakdowns, numbers in words).
- **`templateConfig.js`**: Template layout rules, margins, and paper dimension definitions.

#### Utilities (`src/main/utils/`)
- **`filesystem.js`**: Ensures application directories (`%LOCALAPPDATA%\ShepherdInvoice\backups`, `\database`, `\temp`) exist and handles safe file I/O.

---

### Shared Layer (`src/shared`)

Shared code utilized by both Main and Renderer processes:
- **`constants/application.js`**: Global app constants, list of 38 Indian State Codes (Maharashtra `27`, Gujarat `24`, Tamil Nadu `33`, etc.), and default configuration.
- **`constants/companyLogo.js`**: Base64 encoded company logo asset for zero-filesystem-dependency rendering.
- **`constants/copyTypes.js`**: GST copy indicators (`ORIGINAL` for Recipient, `DUPLICATE` for Transporter, `TRIPLICATE` for Supplier).
- **`constants/invoiceTypes.js`**: Document type definitions (`NORMAL` vs `PROFORMA`).
- **`constants/proformaStatuses.js`**: Status enums for proformas (`DRAFT`, `SENT`, `CONVERTED`, `CANCELLED`).
- **`constants/security.js`**: Security configurations and rate limiting constants.
- **`constants/shortcuts.js`**: Global desktop keyboard shortcut definitions.
- **`schemas/buyerSchema.js`**: Zod validation schema for buyer name, address, state, and 15-character GSTIN format.
- **`schemas/itemSchema.js`**: Zod validation schema for invoice line items enforcing 8-digit numeric HSN/SAC codes, quantities, and rates.
- **`schemas/invoiceSchema.js`**: Zod schema for full tax invoice payloads (notes limit: 120 chars).
- **`schemas/proformaSchema.js`**: Zod schema for proforma invoice payloads (remarks limit: 120 chars).
- **`utils/errorHandler.js`**: Centralized error formatting and user-friendly message mapping.
- **`utils/invoicePagination.js`**: Pagination helper for multi-page print layout calculations.
- **`utils/sharedCalculations.js`**: Single source of truth for GST calculation, tax splits, discounts, and rounding across frontend and backend.

---

### Renderer Process (`src/renderer`)

#### Entry & Core Setup
- **`src/renderer/index.html`**: HTML entry loaded by Vite and Electron.
- **`src/renderer/main.jsx`**: React root rendering `<App />` protected by a top-level **`ErrorBoundary`** to prevent white screens on runtime exceptions.
- **`src/renderer/App.jsx`**: Main application container managing active views, authentication screens, trial status, and notifications.
- **`src/renderer/services/ipcClient.js`**: Typed client service wrapping all calls to `window.electronAPI`.
- **`src/renderer/styles/index.css`**: Tailwind CSS v4 design system, glassmorphism cards, and dark theme definitions.
- **`src/renderer/styles/print.css`**: Dedicated print stylesheet optimizing A4 output.

#### Authentication & Security Components (`src/renderer/components/auth/`)
- **`ProductKeyActivation.jsx`**: Initial setup screen for entering product keys (`V2C-XXXX-XXXX-XXXX`), starting 30-day trials, and setting up initial 4-digit security PINs with individual digit input boxes.
- **`LockScreen.jsx`**: Desktop security lockscreen featuring 4-digit individual PIN input boxes, auto-focus, paste handling, and a Developer Emergency PIN Reset modal.
- **`TrialExpiredOverlay.jsx`**: Blocking modal shown when a 30-day trial expires, with a Developer Master Panel (preset buttons for `5 Days`, `10 Days`, custom extensions, and instant license activation).

#### Layout Components (`src/renderer/components/layout/`)
- **`AppLayout.jsx`**: Main shell combining Sidebar, Header, PageContainer, and StatusBar.
- **`Header.jsx`**: Top application bar displaying company GSTIN badge, system lock status, trial days remaining indicator, and online connectivity badge.
- **`Sidebar.jsx`**: Left navigation menu for Dashboard, Create Invoice, History, Details, Reports, and Settings.
- **`PageContainer.jsx`**: Standard container providing consistent padding and transitions across pages.
- **`StatusBar.jsx`**: Bottom status bar displaying database connectivity, pending offline email queue items, and application version.

#### Invoice Creation Components (`src/renderer/components/invoice/`)
- **`InvoiceStepper.jsx`**: Modern connected-pipeline 8-step wizard progress bar with status checkmarks and responsive navigation.
- **`InvoiceTypeSelector.jsx`**: Step 1 selector between **Tax Invoice** and **Proforma Invoice** (instantly advances on card click).
- **`InvoiceDetailsForm.jsx`**: Step 2 form for document number, invoice date, copy type, and transport details.
- **`BuyerDetailsForm.jsx`**: Step 3 form for Buyer Name, Address, GSTIN, and State Code dropdown with instant GSTIN format validation.
- **`ReferenceDetailsForm.jsx`**: Step 4 form for PO Number, PO Date, GeM Contract Number, and additional references.
- **`ItemTable.jsx`**: Step 5 dynamic line-item grid supporting row addition, deletion, and recalculations.
- **`ItemRow.jsx`**: Individual row component with strict 8-digit numeric HSN/SAC validation, quantity, rate, and discount.
- **`TaxSection.jsx`**: Displays automated GST computation, CGST + SGST vs IGST split, and customizable tax rates.
- **`AdditionalDetailsForm.jsx`**: Step 6 form for payment terms, bank details, and notes/remarks with a 120-character visual counter.
- **`InvoiceReview.jsx`**: Step 7 pre-generation summary reviewing buyer, items, and tax totals before creating the final invoice.
- **`InvoicePreview.jsx`**: Step 8 rendered view of the finalized A4 invoice with buttons for **Print Invoice**, **Download PDF**, and **Back to Dashboard**.

#### Dashboard & Analytics (`src/renderer/components/dashboard/`)
- **`StatCard.jsx`**: Metric cards for Total Revenue, Invoices Issued, Proformas Created, and Queue Items.
- **`BillingAmountChart.jsx`**: Recharts Bar/Area chart showing monthly revenue trends.
- **`InvoiceActivityChart.jsx`**: Line chart showing invoice generation frequency.
- **`RecentInvoices.jsx`**: Quick-access table displaying the most recently issued invoices.

#### History & Archive (`src/renderer/components/history/`)
- **`HistoryTable.jsx`**: Searchable, paginated table of all saved Tax and Proforma Invoices.
- **`HistorySearch.jsx`**: Real-time search bar filtering by Invoice Number, Buyer Name, or GSTIN.
- **`HistoryFilters.jsx`**: Date range and document type filter controls.
- **`HistoryActions.jsx`**: Row action buttons (View, Print, Download PDF, Convert Proforma to Invoice).

#### Reports & Audits (`src/renderer/components/reports/`)
- **`ReportSelector.jsx`**: Report period selector (Daily, Monthly, Financial Year, or Custom Date Range).
- **`ReportSummary.jsx`**: High-level tax summaries (Total Taxable Value, CGST, SGST, IGST, Gross Total).
- **`ReportTable.jsx`**: Detailed breakdown of invoices with an **Export to Excel** button.

#### Settings & Maintenance (`src/renderer/components/settings/`)
- **`PinSettings.jsx`**: Modern 4-digit PIN setup, change, or removal screen using individual digit boxes.
- **`BackupRestore.jsx`**: Trigger manual SQLite database backup exports or restore from previous `.zip` snapshots.
- **`RecycleBin.jsx`**: View soft-deleted invoices with one-click restore or permanent deletion.
- **`AppearanceSettings.jsx`**: Theme and visual preferences.
- **`ShortcutsSettings.jsx`**: Overview of desktop keyboard shortcuts.
- **`About.jsx`**: System information, software version, and database file paths.

---

### Automated Test Suite (`tests/`)

- **`tests/unit/calculation/sharedCalculations.test.js`**: Tests GST splits (CGST/SGST vs IGST), discount applications, taxable subtotals, and commercial rounding.
- **`tests/unit/calculation/invoicePagination.test.js`**: Tests item pagination logic for multi-page invoice printing.
- **`tests/unit/services/activationService.test.js`**: Tests Machine ID generation, product key validation, trial calculation, and developer master password verification.
- **`tests/unit/services/licenseService.test.js`**: Tests cryptographic signature verification and license persistence.
- **`tests/unit/services/pinService.test.js`**: Tests PIN hashing, verification, lockout counters, and rate limiting.
- **`tests/unit/services/emailService.test.js`**: Tests email transport configuration, attachment formatting, and error handling.
- **`tests/unit/templates/invoiceRenderer.test.js`**: Tests A4 HTML template rendering, bank details presence, and GST table population.
- **`tests/unit/utils/errorHandler.test.js`**: Tests error normalization and user-friendly error string extraction.
- **`tests/integration/database/database.test.js`**: Tests SQLite database initialization, table creation, migrations, and CRUD operations.

---

## 5. Key Business Logic & Core Workflows

### Invoice & Proforma 8-Step Wizard
1. **Document Type**: Choose between **Tax Invoice (Normal)** or **Proforma Invoice (Estimate)**.
2. **Document Details**: Auto-generates sequential numbering (`INV-XXX` or `PRO-XXX`), sets issue date, copy type, and supply/vehicle details.
3. **Buyer Details**: Captures Buyer Name, Address, GSTIN, and State Code dropdown with instant GSTIN format validation.
4. **References**: Captures PO Number, PO Date, GeM Contract Number (`gemc_number`), and additional references.
5. **Items & Pricing**: Line item table enforcing **8-digit numeric HSN/SAC codes**, quantities, rates, discounts, and GST rates (0%, 5%, 12%, 18%, 28%).
6. **Additional Details**: Custom notes and remarks limited to **120 characters** with an interactive character counter.
7. **Review & Verify**: Pre-submission audit summary calculating all tax splits and gross totals.
8. **Finalize & Preview**: Persists invoice to SQLite, creates an automatic `.zip` backup, enqueues an offline email, and opens the print/PDF preview.

### Indian GST Calculation & Tax Engine
GST rules are computed based on the comparison of the buyer's state code against the supplier's state code (**Maharashtra - State Code: 27**):

- **Intra-state (`buyer_state_code === '27'`)**:
  - Tax is split 50/50 between **CGST** and **SGST**.
  - Example (18% GST on ₹10,000): `CGST = ₹900 (9%)`, `SGST = ₹900 (9%)`, `IGST = ₹0 (0%)`.
- **Inter-state (`buyer_state_code !== '27'`)**:
  - Entire tax is levied as **IGST**.
  - Example (18% GST on ₹10,000): `CGST = ₹0 (0%)`, `SGST = ₹0 (0%)`, `IGST = ₹1,800 (18%)`.
- **Commercial Rounding**:
  $$\text{Round-Off Amount} = \text{Math.round}(\text{Gross Total}) - \text{Gross Total}$$
- **Number to Words**: Automatically converts the rounded total into Indian currency text (e.g., `INR 11,800` $\rightarrow$ *"Rupees Eleven Thousand Eight Hundred Only"*).

### Licensing, Trial Management & Machine Lock
- **Machine Identification**: Computes a SHA-256 hash of the system's hostname, architecture, and network profile to bind licenses to specific hardware.
- **Product Key Format**: Validates product keys matching `V2C-XXXX-XXXX-XXXX`.
- **30-Day Trial Mode**: When first started without a key, the system activates a 30-day trial with live days-remaining tracking in the UI header.
- **Trial Expiration & Blocking Overlay**: When the trial reaches 0 days, a blocking modal prevents further billing until activated or extended.
- **Developer Master Console**:
  - Protected by developer master password `VIBE2CODE_DEV_2025`.
  - Provides quick-extension presets (`5 Days`, `10 Days`, custom days).
  - Allows direct emergency PIN reset and full permanent license activation.

### 4-Digit Security PIN & Developer Emergency Access
- **Storage**: Salted SHA-256 hash stored in SQLite's `settings` table (`security_pin`).
- **UI UX**: Modern 4-digit individual input boxes with automatic focus progression, backspace backward focus, arrow navigation, and numeric paste support.
- **Rate-Limiting Protection**: Locks the user out after consecutive failed attempts to prevent brute-force attacks.
- **Developer Override**: Allows instant PIN resetting using the developer master password.

### Locked A4 Print & Vector PDF Engine
- **Tamper Prevention**: Uses a fixed HTML/CSS template (`src/main/templates/invoice/invoiceTemplate.html`) rendered in a hidden Chromium `BrowserWindow`.
- **Physical Printing**: Dispatches directly to connected printers via `webContents.print()`.
- **PDF Generation**: Generates high-resolution vector A4 PDFs via `webContents.printToPDF({ pageSize: 'A4', marginsType: 0 })`.

### Offline-First Email Backup Queue
- When an invoice is created, a background task saves an entry into `email_queue` with status `'PENDING'`.
- `emailQueueService` periodically checks for internet connectivity.
- When online, it uses `nodemailer` to dispatch the PDF invoice and database snapshot to `tnjohnrk@gmail.com`.
- If sending fails, retry counter increments up to 5 times with exponential backoff before being flagged.

### Database Management, Migrations & Safe Restores
- **WAL Journaling**: Enables SQLite Write-Ahead Logging for non-blocking concurrent reads and writes.
- **Automated Backups**: Creates a `.zip` archive in `%LOCALAPPDATA%\ShepherdInvoice\backups\` on every invoice generation.
- **Safe Restores**: Automatically creates a pre-restore safety backup before applying an imported backup file, ensuring zero data loss if a corrupted archive is uploaded.

---

## 6. Testing & Quality Assurance

The codebase includes an automated test suite executed via **Vitest** covering **64 tests across 8 test suites**:

```bash
# Run all unit and calculation tests
npm test

# Run tests with graphical browser UI
npm run test:ui
```

### Test Coverage Summary
1. **`sharedCalculations.test.js`** (18 tests): Validates taxable values, CGST/SGST/IGST tax splits, discount calculations, and commercial rounding.
2. **`errorHandler.test.js`** (11 tests): Validates structured error responses, boundary exceptions, and user-friendly error mappings.
3. **`pinService.test.js`** (9 tests): Validates PIN hashing, verification, lockout counters, and rate limiting.
4. **`activationService.test.js`** (7 tests): Validates machine ID generation, trial countdowns, product key format, and developer master password validation.
5. **`licenseService.test.js`** (7 tests): Validates cryptographic license signatures, tampering detection, and license persistence.
6. **`invoiceRenderer.test.js`** (4 tests): Validates HTML template rendering, bank details presence, and table structures.
7. **`emailService.test.js`** (4 tests): Validates email payload construction and attachment handling.
8. **`invoicePagination.test.js`** (4 tests): Validates multi-page item splitting for large invoices.

---

## 7. Build, Packaging & Windows Deployment

### Production Packaging Pipeline
The project uses `scripts/build-electron.js` and `electron-builder` to produce production-ready Windows installers and portable executables:

```bash
# 1. Compile frontend assets with Vite and package with electron-builder
npm run dist
```

### Output Artifacts (Generated in `dist_electron/`):
- **`Shepherd-Invoice-Setup-1.0.0.exe`**: Full Windows NSIS installer with desktop shortcuts and uninstaller.
- **`Shepherd-Invoice-1.0.0.exe`**: Standalone portable Windows executable.

### Production Path Resolution & Singleton Lock
- Normalizes application paths using `app.isPackaged ? app.getAppPath() : process.cwd()` to ensure HTML templates, preload scripts, and assets resolve correctly inside `app.asar`.
- Windows Singleton Lock (`app.requestSingleInstanceLock()`) ensures that secondary process launches focus the existing running instance rather than creating orphaned zombie locks.

---

## 8. Developer Onboarding & Step-by-Step Recipes

### Prerequisites & Local Environment Setup
1. **Node.js**: Node.js LTS (`v20.x` or `v22.x` recommended).
2. **Build Tools**: Visual Studio C++ Build Tools and Python (required for compiling native `better-sqlite3` on Windows).

```bash
# 1. Clone repository and navigate to project directory
cd c:\Main_Projects\Vibe-2-Code\Vibe2Code-Billing

# 2. Install all dependencies
npm install

# 3. If native modules need rebuilding for Electron:
npm run rebuild

# 4. Start both Vite and Electron concurrently
npm run dev:all
```

---

### Common Developer Recipes

#### A. Adding a New Field to Invoices
1. **Database Schema**: Add a new migration script in `src/main/database/schema/` or update migration runner.
2. **Schema Validation**: Update `src/shared/schemas/invoiceSchema.js` with the new Zod field definition.
3. **Repository Layer**: Update SQL insert and select queries in `src/main/repositories/invoiceRepository.js`.
4. **Frontend Form**: Add the input field in the relevant form under `src/renderer/components/invoice/`.
5. **HTML Template**: Update `src/main/templates/invoice/invoiceTemplate.html` and `invoiceRenderer.js` to render the field in A4 print/PDF.

#### B. Adding a New IPC Channel
1. **Main Process Handler**: Register `ipcMain.handle('domain:action', async (event, args) => { ... })` in `src/main/ipc/<feature>IPC.js`.
2. **Preload Exposure**: Add the typed method to `src/main/preload.js` and `src/main/preload.cjs`.
3. **Client Wrapper**: Add the corresponding invocation wrapper in `src/renderer/services/ipcClient.js`.
4. **Renderer Consumption**: Call `ipcClient.<feature>.<method>()` from your React component.

#### C. Updating Company Default Details
- Edit `src/main/config/companyConfig.js` to update locked company legal information, bank details, or backup recipient emails.

---

### Troubleshooting & Windows Native Modules

- **`NODE_MODULE_VERSION` Mismatch**: Run `npm run rebuild` to recompile `better-sqlite3` against Electron's internal Node ABI.
- **Zombie Electron Processes**: If the database is locked by an old instance, terminate background Electron processes via PowerShell:
  ```powershell
  Stop-Process -Name "electron", "Shepherd-Invoice" -Force -ErrorAction SilentlyContinue
  ```
- **White Screen on Launch**: Check `src/renderer/main.jsx` ErrorBoundary logs or verify that `npm run build` generated `dist/index.html`.

---

*Documentation maintained for Shepherd Enterprises Private Limited Billing System.*
