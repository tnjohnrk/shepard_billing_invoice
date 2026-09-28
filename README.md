# Shepherd Enterprises Private Limited — Invoice Billing System

[![Electron](https://img.shields.io/badge/Electron-34.x-47848F?logo=electron&logoColor=white)](https://www.electronjs.org/)
[![React](https://img.shields.io/badge/React-19.x-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![SQLite](https://img.shields.io/badge/SQLite-better--sqlite3-003B57?logo=sqlite&logoColor=white)](https://github.com/WiseLibs/better-sqlite3)
[![Tests](https://img.shields.io/badge/Tests-64%20Passed-22C55E?logo=vitest&logoColor=white)](https://vitest.dev/)
[![Platform](https://img.shields.io/badge/Platform-Windows%20x64-0078D6?logo=windows&logoColor=white)](https://www.microsoft.com/windows)

A high-performance, **offline-first Windows desktop invoice billing application** built specifically for **Shepherd Enterprises Private Limited**. Engineered with zero cloud dependencies, instant local SQLite persistence, automated backup redundancy, audit-compliant A4 printing, and machine-locked licensing.

---

> 📖 **Comprehensive Developer Guide**: For exhaustive architectural deep-dives, file-by-file catalogs, database schemas, and onboarding guides, refer to **[PROJECT_DOCUMENTATION.md](file:///c:/Main_Projects/Vibe-2-Code/Vibe2Code-Billing/PROJECT_DOCUMENTATION.md)**.

---

## Key Features

- 🧾 **GST-Compliant Invoicing & Quotations**:
  - Full support for both **Tax Invoices** and **Proforma Invoices (Quotations)** with one-click conversion.
  - Automatic Indian GST tax engine (Intra-state Maharashtra `27`: CGST 50% + SGST 50% vs. Inter-state: IGST 100%).
  - Commercial round-off calculations and automated Indian currency Number-to-Words formatting.
- 🚀 **Connected-Pipeline 8-Step Wizard**:
  - Intuitive step-by-step workflow with real-time field validation, active step indicators, and back-navigation.
  - Strict **8-digit numeric limit** on HSN/SAC code inputs.
  - Invoice Notes / Remarks limit set to **120 characters** with an interactive character counter.
- 🔒 **Security PIN & Developer Master Controls**:
  - Modern **4-digit individual PIN input boxes** with auto-focus progression, backspace navigation, and paste support.
  - Salted SHA-256 password hashing stored locally in SQLite with rate-limiting brute-force lockouts.
  - Developer Master Password console (`VIBE2CODE_DEV_2025`) for emergency PIN reset, 30-day trial extensions (`5 Days` / `10 Days` presets), and direct license activation.
- 🔑 **Hardware-Tied Licensing & 30-Day Trial System**:
  - Machine ID hashing (SHA-256) binding product keys (`V2C-XXXX-XXXX-XXXX`) to physical hardware.
  - 30-day built-in trial mode with live countdown indicators and blocking overlays upon expiration.
  - Tamper-proof `license.dat` verified using cryptographic HMAC-SHA256 signatures.
- 🖨️ **Locked A4 Printing & Vector PDF Export**:
  - Fixed, audit-compliant A4 layout preventing tampering with company bank details, GSTIN, and legal terms.
  - Silent or interactive physical printing via Chromium `webContents.print()`.
  - Pixel-perfect vector A4 PDF export via `printToPDF()`.
- 📊 **Excel Reports & Analytics**:
  - Daily, Monthly, Financial Year (April 1 – March 31), and Customer-wise billing summaries.
  - Interactive charts powered by Recharts.
  - One-click multi-sheet Excel spreadsheet export powered by `ExcelJS`.
- 📦 **Automated Disaster Recovery & Offline Email Queue**:
  - Automatic timestamped `.zip` database snapshots generated on every invoice creation.
  - Safe restoration workflow with automatic pre-restore safety backups.
  - Background email queue worker monitoring network connectivity to dispatch PDF invoices and database backups to `tnjohnrk@gmail.com` via SMTP with exponential backoff retries.

---

## Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Desktop Shell** | Electron 34, Node.js 20+ |
| **Frontend Framework** | React 19, Vite 6, Tailwind CSS v4, Lucide React Icons |
| **Database & Storage** | SQLite (`better-sqlite3` in WAL Mode), Adm-Zip |
| **Export & Reporting** | Chromium PDF Engine, ExcelJS, Recharts |
| **Networking & Email** | Nodemailer (SMTP), Electron IPC with Context Isolation |
| **Validation & Testing** | Zod Schemas, Vitest (64 Unit & Integration Tests) |
| **Packaging & Installer** | electron-builder, NSIS Installer Script |

---

## Quick Start (Development)

### 1. Prerequisites
- **Node.js**: `v20.x` or `v22.x` recommended
- **Windows C++ Build Tools & Python** (for native `better-sqlite3` compilation)

### 2. Installation & Setup
```bash
# Clone or open the project folder
cd c:\Main_Projects\Vibe-2-Code\Vibe2Code-Billing

# Install dependencies
npm install

# Rebuild native modules if needed
npm run rebuild
```

### 3. Running Development Servers
```bash
# Option A: Start both Vite React server and Electron together (Recommended)
npm run dev:all

# Option B: Run in separate terminals
npm run dev          # Terminal 1: Vite frontend (http://localhost:5173)
npm run electron:dev # Terminal 2: Electron desktop container
```

---

## Running Automated Tests

The test suite runs with **Vitest** and tests calculations, schemas, security, licensing, and database transactions:

```bash
# Run all 64 automated tests
npm test

# Run tests in interactive UI mode
npm run test:ui
```

```text
 ✓ tests/unit/utils/errorHandler.test.js (11 tests)
 ✓ tests/unit/calculation/sharedCalculations.test.js (18 tests)
 ✓ tests/unit/services/pinService.test.js (9 tests)
 ✓ tests/unit/calculation/invoicePagination.test.js (4 tests)
 ✓ tests/unit/services/licenseService.test.js (7 tests)
 ✓ tests/unit/services/activationService.test.js (7 tests)
 ✓ tests/unit/templates/invoiceRenderer.test.js (4 tests)
 ✓ tests/unit/services/emailService.test.js (4 tests)

 Test Files  8 passed (8)
      Tests  64 passed (64)
```

---

## Building Production Windows Executable

To compile and package the standalone Windows application and installer:

```bash
npm run dist
```

Packaging outputs will be generated in `dist_electron/`:
- `Shepherd-Invoice-Setup-1.0.0.exe` (Windows NSIS Setup Installer)
- `Shepherd-Invoice-1.0.0.exe` (Standalone Portable Executable)

---

## Project Structure Overview

```text
├── installer/                # Custom NSIS Windows installer script
├── scripts/                  # Production packaging build script
├── src/
│   ├── main/                 # Electron Main Process (Node.js)
│   │   ├── config/           # Locked company legal information
│   │   ├── database/         # SQLite connection, migrations, and schema
│   │   ├── ipc/              # IPC message handlers (Invoice, Reports, Auth, etc.)
│   │   ├── repositories/     # SQLite SQL data access layer
│   │   ├── services/         # Business logic (Activation, PIN, Invoices, PDF, Email)
│   │   └── templates/        # Locked A4 HTML/CSS invoice templates
│   ├── renderer/             # React 19 Frontend (Vite)
│   │   ├── assets/           # App icons and media assets
│   │   ├── components/       # UI components (Auth, Common, Invoice, Reports, Settings)
│   │   ├── pages/            # Application views (Dashboard, Create, History, etc.)
│   │   └── services/         # Typed IPC Client (ipcClient.js)
│   └── shared/               # Shared across Main and Renderer
│       ├── constants/        # State codes, invoice types, shortcuts
│       ├── schemas/          # Zod validation schemas
│       └── utils/            # GST calculations and error handling
└── tests/                    # Vitest unit and integration test suites
```

---

## License & Support

Proprietary software developed for **Shepherd Enterprises Private Limited**.  
For technical support or developer inquiries, contact: `tnjohnrk@gmail.com`.
