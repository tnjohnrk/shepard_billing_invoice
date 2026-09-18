# System Architecture & Technical Specification

## Overview
The Shepherd Enterprises Invoice Billing System is designed as a single-user offline-first Windows desktop application.

```text
React Renderer (Vite + Tailwind) 
  ─── Secure ContextBridge (IPC) ───► Electron Main Process (Node.js) 
                                         ├── SQLite (better-sqlite3)
                                         ├── AppData Storage (%LOCALAPPDATA%\ShepherdInvoice)
                                         ├── Fixed Template Renderer (HTML/CSS)
                                         ├── PDF & Printing Engine
                                         ├── Backup & Restoration Engine
                                         └── Email Queue Retry Engine
```

## Security & IPC Isolation
- `contextIsolation: true`
- `nodeIntegration: false`
- `sandbox: false`
- Renderer process interacts with native capabilities strictly via `window.electronAPI` contextBridge wrappers.
