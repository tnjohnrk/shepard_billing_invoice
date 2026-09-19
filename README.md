# Shepherd Enterprises Private Limited - Invoice Billing System

Professional, reliable, offline-first Windows desktop invoice billing application for **Shepherd Enterprises Private Limited**.

Built with **Electron + React + Vite + SQLite (`better-sqlite3`) + Tailwind CSS**.

> 📖 **Developer Guide & Architecture**: For an exhaustive file-by-file breakdown, system architecture, and onboarding instructions, see **[PROJECT_DOCUMENTATION.md](file:///d:/billing_system/PROJECT_DOCUMENTATION.md)**.

## Key Features

- **Proforma & Tax Invoices**: Step-by-step creation wizard for Proforma and Tax Invoices with GST tax splits (CGST + SGST vs IGST).
- **Developer-Locked Fixed Invoice Template**: Fixed, unalterable A4 HTML/CSS invoice layout for audit compliance.
- **Physical Printing & PDF / Excel Export**: One-click printing via `webContents.print()`, A4 PDF generation via `printToPDF()`, and Excel exports via `ExcelJS`.
- **Offline-First Resilience**: All business data resides in SQLite (`%LOCALAPPDATA%\ShepherdInvoice\database\invoices.db`). Email backups queue automatically when offline and retry when internet returns.
- **Reports & Analytics**: Daily, Monthly, Financial Year (April 1 – March 31), and Customer-wise billing summaries with Recharts visualizations.
- **Automatic & Manual Backup**: Automatic zip backups on every invoice creation, manual backup export, and safe restoration with automatic safety snapshots.
- **4-Digit Security PIN**: SHA256 hashed PIN lock protection.

## Quick Start (Development)

```bash
# 1. Install dependencies
npm install

# Option A: Start both Vite and Electron together (Recommended)
npm run dev:all

# Option B: Run separately in two terminals
npm run dev          # Terminal 1: React renderer (Vite)
npm run electron:dev # Terminal 2: Electron desktop shell
```

## Running Unit Tests

```bash
npm test
```

## Packaging for Windows

```bash
npm run dist
```
