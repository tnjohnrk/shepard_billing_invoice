import { getDatabase } from '../database/connection.js';
import { COMPANY_CONFIG } from '../config/companyConfig.js';

export function getCompanyDetails() {
  const db = getDatabase();
  const row = db.prepare('SELECT * FROM companies ORDER BY id ASC LIMIT 1').get();
  if (row && row.backup_email !== COMPANY_CONFIG.backup_email) {
    db.prepare('UPDATE companies SET backup_email = ? WHERE id = ?').run(COMPANY_CONFIG.backup_email, row.id);
    row.backup_email = COMPANY_CONFIG.backup_email;
  }
  return row || null;
}
