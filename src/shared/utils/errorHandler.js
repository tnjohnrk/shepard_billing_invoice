/**
 * Centralized human-readable error formatting utility.
 * Transforms technical SQLite, Electron IPC, Node.js, and network exceptions
 * into clean, actionable, human-friendly messages for end users.
 */
export function formatHumanReadableError(err) {
  if (!err) return 'An unexpected error occurred. Please try again.';

  const rawMsg = typeof err === 'string' ? err : (err.message || String(err));

  // 1. SQLite Unique Constraint Violations
  if (/UNIQUE constraint failed:\s*proformas\.proforma_number/i.test(rawMsg)) {
    return 'This Proforma invoice number already exists in your records. Please use a unique proforma number or let the system generate the next number.';
  }
  if (/UNIQUE constraint failed:\s*invoices\.invoice_number/i.test(rawMsg)) {
    return 'This Tax Invoice number already exists in your records. Please use a unique invoice number.';
  }
  if (/UNIQUE constraint failed:\s*customers\.name/i.test(rawMsg)) {
    return 'A client company with this name is already saved in your directory.';
  }
  if (/UNIQUE constraint failed:\s*products\.name/i.test(rawMsg)) {
    return 'A product item with this description is already saved in your catalog.';
  }
  if (/UNIQUE constraint failed/i.test(rawMsg)) {
    return 'A duplicate entry with this number or name already exists in the system.';
  }

  // 2. Database Concurrency & Locked States
  if (/database is locked|SQLITE_BUSY/i.test(rawMsg)) {
    return 'The database is currently busy saving data. Please wait a moment and try again.';
  }
  if (/FOREIGN KEY constraint failed/i.test(rawMsg)) {
    return 'Cannot delete or modify this record because it is currently referenced by other documents.';
  }

  // 3. File System & OS Errors
  if (/EBUSY|resource busy or locked/i.test(rawMsg)) {
    return 'The export file is currently open in Excel or another program. Please close the file and try again.';
  }
  if (/EACCES|permission denied/i.test(rawMsg)) {
    return 'Permission denied when saving file. Please choose a different folder or run as administrator.';
  }
  if (/ENOENT|no such file or directory/i.test(rawMsg)) {
    return 'The specified file or destination folder could not be found.';
  }

  // 4. SMTP Email & Network Errors
  if (/Invalid login|Username and Password not accepted|535-5\.7\.8/i.test(rawMsg)) {
    return 'Email authentication failed. Please verify your Google 16-character App Password in Settings > Backup & Email.';
  }
  if (/ECONNREFUSED|ENOTFOUND|ETIMEDOUT|getaddrinfo|network error/i.test(rawMsg)) {
    return 'Network connection could not be established. Please check your internet connection.';
  }

  // 5. Security Password Verification
  if (/Invalid current PIN|Invalid current password|Incorrect PIN|Incorrect password/i.test(rawMsg)) {
    return 'The current security password you entered is incorrect. Please try again.';
  }

  // Strip Electron IPC wrapper prefixes
  let cleaned = rawMsg
    .replace(/^Error invoking remote method '[^']+':\s*/is, '')
    .replace(/^Error:\s*/is, '')
    .replace(/^SqliteError:\s*/is, '')
    .trim();

  // 6. Clean and return readable first line
  const firstLine = cleaned.split('\n')[0].trim();
  if (firstLine.length > 0 && !firstLine.includes('at file://') && !firstLine.includes('at node:') && !firstLine.includes('SqliteError:')) {
    return firstLine;
  }

  return 'An error occurred while processing your request. Please try again.';
}
