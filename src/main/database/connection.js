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

  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

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
