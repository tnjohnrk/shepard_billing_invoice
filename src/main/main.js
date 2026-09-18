import { app, BrowserWindow } from 'electron';
import path from 'path';
import { initializeDatabase } from './database/database.js';
import { registerInvoiceIPC } from './ipc/invoiceIPC.js';
import { registerProformaIPC } from './ipc/proformaIPC.js';
import { registerReportIPC } from './ipc/reportIPC.js';
import { registerBackupIPC } from './ipc/backupIPC.js';
import { registerPrintIPC } from './ipc/printIPC.js';
import { registerSettingsIPC } from './ipc/settingsIPC.js';
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
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../dist/renderer/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  initializeAutoUpdater(mainWindow.webContents);
}

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
  registerAppIPC();

  // 3. Process pending offline email queue in background
  processPendingEmailQueue().catch(() => {});

  // 4. Create primary app window
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
