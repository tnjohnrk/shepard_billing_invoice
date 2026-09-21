import { app, BrowserWindow } from 'electron';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { initializeDatabase } from './database/database.js';
import { registerInvoiceIPC } from './ipc/invoiceIPC.js';
import { registerProformaIPC } from './ipc/proformaIPC.js';
import { registerReportIPC } from './ipc/reportIPC.js';
import { registerBackupIPC } from './ipc/backupIPC.js';
import { registerPrintIPC } from './ipc/printIPC.js';
import { registerSettingsIPC } from './ipc/settingsIPC.js';
import { registerRecycleBinIPC } from './ipc/recycleBinIPC.js';
import { registerAppIPC } from './ipc/appIPC.js';
import { initializeAutoUpdater } from './services/updateService.js';
import { processPendingEmailQueue } from './services/emailQueueService.js';

let mainWindow = null;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 850,
    minWidth: 1024,
    minHeight: 700,
    title: 'Shepherd Enterprises Private Limited - Billing System',
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  const distPath = path.join(__dirname, '../../dist/renderer/index.html');
  const hasDist = fs.existsSync(distPath);
  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
  const devServerUrl = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173';

  if (!isDev) {
    mainWindow.loadFile(distPath);
  } else {
    mainWindow.loadURL(devServerUrl).catch((err) => {
      console.warn(`[Electron] Could not connect to dev server at ${devServerUrl} (${err.code || err.message}).`);
      if (hasDist) {
        console.log(`[Electron] Falling back to built bundle at: ${distPath}`);
        mainWindow.loadFile(distPath);
      } else {
        mainWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(`
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8" />
              <title>Shepherd Enterprises - Dev Server Waiting</title>
              <style>
                body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                  background-color: #0f172a;
                  color: #f8fafc;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  height: 100vh;
                  margin: 0;
                  text-align: center;
                }
                .card {
                  background: #1e293b;
                  padding: 2.5rem;
                  border-radius: 12px;
                  box-shadow: 0 10px 25px rgba(0,0,0,0.5);
                  max-width: 520px;
                  border: 1px solid #334155;
                }
                h2 { margin-top: 0; color: #38bdf8; font-size: 1.5rem; }
                p { color: #94a3b8; line-height: 1.6; font-size: 0.95rem; }
                code { background: #0f172a; padding: 3px 8px; border-radius: 4px; color: #38bdf8; font-weight: 600; }
                .spinner {
                  border: 3px solid #334155;
                  border-top: 3px solid #38bdf8;
                  border-radius: 50%;
                  width: 32px;
                  height: 32px;
                  animation: spin 1s linear infinite;
                  margin: 1.5rem auto;
                }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                .btn {
                  display: inline-block;
                  background: #2563eb;
                  color: white;
                  border: none;
                  padding: 10px 20px;
                  border-radius: 6px;
                  cursor: pointer;
                  font-weight: 500;
                  margin-top: 1rem;
                }
                .btn:hover { background: #1d4ed8; }
                .hint { font-size: 0.82rem; color: #64748b; margin-top: 1.5rem; }
              </style>
            </head>
            <body>
              <div class="card">
                <h2>Vite Dev Server Not Running</h2>
                <p>Electron is looking for <code>${devServerUrl}</code>, but the Vite dev server has not been started.</p>
                <div class="spinner"></div>
                <p>Run the dev server in your terminal:<br /><br /><code>npm run dev</code> or <code>npm run dev:all</code></p>
                <button class="btn" onclick="window.location.reload()">Retry Connection</button>
                <div class="hint">Auto-checking every 2 seconds...</div>
              </div>
              <script>
                setInterval(() => {
                  fetch('${devServerUrl}', { mode: 'no-cors' })
                    .then(() => { window.location.href = '${devServerUrl}'; })
                    .catch(() => {});
                }, 2000);
              </script>
            </body>
          </html>
        `)}`);
      }
    });
  }

  mainWindow.webContents.on('before-input-event', (event, input) => {
    if ((input.control && input.shift && input.key.toLowerCase() === 'i') || input.key === 'F12') {
      if (isDev) {
        mainWindow.webContents.toggleDevTools();
      }
      event.preventDefault();
    }
    if ((input.control && input.key.toLowerCase() === 'r') || input.key === 'F5') {
      if (isDev) {
        mainWindow.reload();
      }
      event.preventDefault();
    }
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  initializeAutoUpdater(mainWindow.webContents);
}

app.name = 'ShepherdInvoice';

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
    // 1. Initialize SQLite database & migrations
    initializeDatabase();

    // 2. Register all IPC handlers
    registerInvoiceIPC();
    registerProformaIPC();
    registerReportIPC();
    registerBackupIPC();
    registerPrintIPC();
    registerSettingsIPC();
    registerRecycleBinIPC();
    registerAppIPC();

    // 3. Create primary app window
    createMainWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createMainWindow();
      }
    });
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });
}
