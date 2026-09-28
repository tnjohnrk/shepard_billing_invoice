import path from 'path';
import Database from 'better-sqlite3';
import { ensureDirectoriesExist } from '../utils/filesystem.js';

let dbInstance = null;

export function getDatabase(dbPathOverride = null) {
  if (dbInstance && !dbPathOverride) {
    return dbInstance;
  }

  const { databaseDir } = ensureDirectoriesExist();
  const dbPath = dbPathOverride || path.join(databaseDir, 'invoices.db');

  const db = new Database(dbPath, {
    timeout: 5000
  });
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.pragma('synchronous = NORMAL');
  db.pragma('busy_timeout = 5000');
  db.pragma('temp_store = MEMORY');
  db.pragma('cache_size = -64000');

  if (!dbPathOverride) {
    dbInstance = db;
  }

  return db;
}

export function closeDatabase() {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}
