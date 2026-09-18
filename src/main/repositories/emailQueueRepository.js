import { getDatabase } from '../database/connection.js';

export function enqueueEmail({ invoice_id, backup_path, recipient }) {
  const db = getDatabase();
  const res = db.prepare(`
    INSERT INTO email_queue (invoice_id, backup_path, recipient, status)
    VALUES (?, ?, ?, 'PENDING')
  `).run(invoice_id, backup_path, recipient);
  return res.lastInsertRowid;
}

export function getPendingEmails() {
  const db = getDatabase();
  return db.prepare(`
    SELECT * FROM email_queue 
    WHERE status IN ('PENDING', 'FAILED') AND attempt_count < 5
    ORDER BY created_at ASC
  `).all();
}

export function updateEmailQueueStatus(id, { status, error_message = null }) {
  const db = getDatabase();
  if (status === 'SENT') {
    db.prepare(`
      UPDATE email_queue 
      SET status = 'SENT', sent_at = CURRENT_TIMESTAMP, attempt_count = attempt_count + 1, error_message = NULL 
      WHERE id = ?
    `).run(id);
  } else {
    db.prepare(`
      UPDATE email_queue 
      SET status = ?, last_attempt = CURRENT_TIMESTAMP, attempt_count = attempt_count + 1, error_message = ? 
      WHERE id = ?
    `).run(status, error_message, id);
  }
}
