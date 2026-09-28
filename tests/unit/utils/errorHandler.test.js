import { describe, it, expect } from 'vitest';
import { formatHumanReadableError } from '../../../src/shared/utils/errorHandler.js';

describe('errorHandler - Human Readable Translation Engine', () => {
  it('returns friendly message for null or empty error', () => {
    expect(formatHumanReadableError(null)).toBe('An unexpected error occurred. Please try again.');
    expect(formatHumanReadableError(undefined)).toBe('An unexpected error occurred. Please try again.');
  });

  it('translates duplicate Proforma SQLite constraint error', () => {
    const raw = 'SqliteError: UNIQUE constraint failed: proformas.proforma_number';
    const msg = formatHumanReadableError(raw);
    expect(msg).toContain('Proforma invoice number already exists');
  });

  it('translates duplicate Tax Invoice SQLite constraint error', () => {
    const raw = 'SqliteError: UNIQUE constraint failed: invoices.invoice_number';
    const msg = formatHumanReadableError(raw);
    expect(msg).toContain('Tax Invoice number already exists');
  });

  it('translates duplicate Customer and Product catalog errors', () => {
    expect(formatHumanReadableError('UNIQUE constraint failed: customers.name')).toContain('client company with this name is already saved');
    expect(formatHumanReadableError('UNIQUE constraint failed: products.name')).toContain('product item with this description is already saved');
  });

  it('translates SQLite busy / database locked error', () => {
    const raw = 'SqliteError: database is locked';
    expect(formatHumanReadableError(raw)).toContain('database is currently busy');
  });

  it('translates Foreign Key constraint violation error', () => {
    const raw = 'SqliteError: FOREIGN KEY constraint failed';
    expect(formatHumanReadableError(raw)).toContain('referenced by other documents');
  });

  it('translates file locking / EBUSY error when Excel file is open', () => {
    const raw = 'Error: EBUSY: resource busy or locked, open C:\\Reports\\invoice.xlsx';
    expect(formatHumanReadableError(raw)).toContain('open in Excel or another program');
  });

  it('translates SMTP App Password authentication failure', () => {
    const raw = 'Error: 535-5.7.8 Username and Password not accepted.';
    expect(formatHumanReadableError(raw)).toContain('Google 16-character App Password');
  });

  it('translates network offline and timeout errors', () => {
    expect(formatHumanReadableError('getaddrinfo ENOTFOUND smtp.gmail.com')).toContain('Network connection could not be established');
  });

  it('translates security password failure messages', () => {
    expect(formatHumanReadableError('Incorrect password provided')).toContain('security password you entered is incorrect');
  });

  it('strips internal stack trace and IPC noise from clean error messages', () => {
    const raw = "Error invoking remote method 'create-invoice': Custom validation failed for quantity\n at node:internal";
    expect(formatHumanReadableError(raw)).toBe('Custom validation failed for quantity');
  });
});
