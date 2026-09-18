import path from 'path';
import fs from 'fs';

let app = null;
try {
  const electron = require('electron');
  app = electron.app;
} catch (e) {
  app = null;
}

export function getAppDataPath() {
  const baseDir = app && typeof app.getPath === 'function' 
    ? app.getPath('userData') 
    : path.join(process.env.LOCALAPPDATA || process.env.HOME || '.', 'ShepherdInvoice');
  return baseDir;
}

export function ensureDirectoriesExist() {
  const appData = getAppDataPath();
  const dirs = [
    path.join(appData, 'database'),
    path.join(appData, 'documents', 'invoices'),
    path.join(appData, 'documents', 'proformas'),
    path.join(appData, 'backups', 'automatic'),
    path.join(appData, 'backups', 'manual'),
    path.join(appData, 'email-queue'),
    path.join(appData, 'logs'),
    path.join(appData, 'settings')
  ];

  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  return {
    appData,
    databaseDir: path.join(appData, 'database'),
    invoicesDir: path.join(appData, 'documents', 'invoices'),
    proformasDir: path.join(appData, 'documents', 'proformas'),
    autoBackupDir: path.join(appData, 'backups', 'automatic'),
    manualBackupDir: path.join(appData, 'backups', 'manual'),
    emailQueueDir: path.join(appData, 'email-queue'),
    logsDir: path.join(appData, 'logs'),
    settingsDir: path.join(appData, 'settings')
  };
}

