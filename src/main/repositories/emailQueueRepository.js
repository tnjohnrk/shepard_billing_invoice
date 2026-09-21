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
    WHERE status IN ('PENDING', 'FAILED')
    ORDER BY created_at ASC
  `).all();
}

export function getEmailQueueSummary() {
  const db = getDatabase();
  const pendingRow = db.prepare(`
    SELECT COUNT(*) as count FROM email_queue WHERE status IN ('PENDING', 'FAILED')
  `).get();
  
  const sentRow = db.prepare(`
    SELECT COUNT(*) as count FROM email_queue WHERE status = 'SENT'
  `).get();

  const totalRow = db.prepare(`
    SELECT COUNT(*) as count FROM email_queue
  `).get();

  const lastSentRow = db.prepare(`
    SELECT sent_at, recipient FROM email_queue WHERE status = 'SENT' ORDER BY sent_at DESC LIMIT 1
  `).get();

  return {
    pendingCount: pendingRow ? pendingRow.count : 0,
    sentCount: sentRow ? sentRow.count : 0,
    totalCount: totalRow ? totalRow.count : 0,
    lastSentAt: lastSentRow ? lastSentRow.sent_at : null,
    lastRecipient: lastSentRow ? lastSentRow.recipient : null
  };
}

export function clearSentEmails() {
  const db = getDatabase();
  return db.prepare(`DELETE FROM email_queue WHERE status = 'SENT'`).run();
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

