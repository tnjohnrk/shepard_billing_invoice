import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';
import { ensureDirectoriesExist } from '../utils/filesystem.js';
import { getDatabase, closeDatabase } from '../database/connection.js';
import { initializeDatabase } from '../database/database.js';

export function createAutomaticBackup() {
  const { databaseDir, autoBackupDir } = ensureDirectoriesExist();
  const dbPath = path.join(databaseDir, 'invoices.db');

  if (!fs.existsSync(dbPath)) {
    return null;
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFileName = `auto_backup_${timestamp}.zip`;
  const backupPath = path.join(autoBackupDir, backupFileName);

  const zip = new AdmZip();
  zip.addLocalFile(dbPath);
  zip.addFile('backup_metadata.json', Buffer.from(JSON.stringify({
    timestamp,
    type: 'AUTOMATIC',
    app: 'Shepherd Enterprises Billing System'
  }, null, 2)));

  zip.writeZip(backupPath);

  // Rotate automatic backups to keep latest 50
  rotateBackups(autoBackupDir, 50);

  return backupPath;
}

export function createManualBackup(targetPath) {
  const { databaseDir } = ensureDirectoriesExist();
  const dbPath = path.join(databaseDir, 'invoices.db');

  if (!fs.existsSync(dbPath)) {
    throw new Error('Database file does not exist to perform backup.');
  }

  let destinationPath = targetPath;
  if (!destinationPath.toLowerCase().endsWith('.zip')) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFileName = `Shepherd_Data_Migration_${timestamp}.zip`;
    destinationPath = path.join(targetPath, backupFileName);
  }

  const zip = new AdmZip();
  zip.addLocalFile(dbPath);

  let invCount = 0;
  let proCount = 0;
  let custCount = 0;
  let companyName = 'Shepherd Enterprises Private Limited';

  try {
    const db = getDatabase();
    invCount = db.prepare('SELECT COUNT(*) as c FROM invoices WHERE (is_deleted = 0 OR is_deleted IS NULL)').get()?.c || 0;
    proCount = db.prepare('SELECT COUNT(*) as c FROM proformas WHERE (is_deleted = 0 OR is_deleted IS NULL)').get()?.c || 0;
    custCount = db.prepare('SELECT COUNT(*) as c FROM customers').get()?.c || 0;
    const comp = db.prepare('SELECT name FROM companies LIMIT 1').get();
    if (comp?.name) companyName = comp.name;
  } catch {}

  const timestamp = new Date().toISOString();
  zip.addFile('backup_metadata.json', Buffer.from(JSON.stringify({
    timestamp,
    type: 'MIGRATION_BACKUP',
    app: 'Shepherd Enterprises Billing System',
    companyName,
    stats: {
      invoices: invCount,
      proformas: proCount,
      customers: custCount
    }
  }, null, 2)));

  zip.writeZip(destinationPath);
  return {
    destinationPath,
    stats: { invoices: invCount, proformas: proCount, customers: custCount }
  };
}

export function restoreFromBackup(backupZipPath) {
  if (!fs.existsSync(backupZipPath)) {
    throw new Error('Selected backup file does not exist.');
  }

  const zip = new AdmZip(backupZipPath);
  const dbEntry = zip.getEntry('invoices.db');

  if (!dbEntry) {
    throw new Error('Invalid backup file: "invoices.db" missing from archive.');
  }

  let metadata = null;
  const metaEntry = zip.getEntry('backup_metadata.json');
  if (metaEntry) {
    try {
      metadata = JSON.parse(zip.readAsText(metaEntry));
    } catch {}
  }

  const { databaseDir, manualBackupDir } = ensureDirectoriesExist();
  const currentDbPath = path.join(databaseDir, 'invoices.db');

  // Step 1: Create safety snapshot before restoring
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const safetySnapshotPath = path.join(manualBackupDir, `safety_snapshot_before_restore_${timestamp}.db`);
  if (fs.existsSync(currentDbPath)) {
    fs.copyFileSync(currentDbPath, safetySnapshotPath);
  }

  try {
    // Step 2: Close active SQLite connections
    closeDatabase();

    // Step 3: Extract and replace database
    zip.extractEntryTo(dbEntry, databaseDir, false, true);

    // Step 4: Re-initialize and test database
    const db = initializeDatabase();
    const company = db.prepare('SELECT name FROM companies LIMIT 1').get();
    const invCount = db.prepare('SELECT COUNT(*) as c FROM invoices WHERE (is_deleted = 0 OR is_deleted IS NULL)').get()?.c || 0;
    const proCount = db.prepare('SELECT COUNT(*) as c FROM proformas WHERE (is_deleted = 0 OR is_deleted IS NULL)').get()?.c || 0;
    const custCount = db.prepare('SELECT COUNT(*) as c FROM customers').get()?.c || 0;

    return {
      success: true,
      message: 'Database restored and migrated successfully.',
      companyName: company?.name || 'Shepherd Enterprises Private Limited',
      safetySnapshot: safetySnapshotPath,
      stats: {
        invoices: invCount,
        proformas: proCount,
        customers: custCount
      },
      metadata
    };
  } catch (err) {
    // Rollback from safety snapshot if restore failed
    closeDatabase();
    if (fs.existsSync(safetySnapshotPath)) {
      fs.copyFileSync(safetySnapshotPath, currentDbPath);
      initializeDatabase();
    }
    throw new Error(`Restore failed: ${err.message}. Current database was safely rolled back.`);
  }
}

function rotateBackups(dirPath, maxKeep = 50) {
  try {
    const files = fs.readdirSync(dirPath)
      .filter(f => f.endsWith('.zip'))
      .map(f => ({
        name: f,
        path: path.join(dirPath, f),
        time: fs.statSync(path.join(dirPath, f)).mtime.getTime()
      }))
      .sort((a, b) => b.time - a.time);

    if (files.length > maxKeep) {
      files.slice(maxKeep).forEach(file => {
        fs.unlinkSync(file.path);
      });
    }
  } catch (e) {
    // Non-blocking cleanup error
  }
}
