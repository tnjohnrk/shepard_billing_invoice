import { getDatabase } from './connection.js';
import { runMigrations } from './migrations/migrationRunner.js';

export function initializeDatabase(dbPathOverride = null) {
  const db = getDatabase(dbPathOverride);
  runMigrations(db);
  return db;
}
