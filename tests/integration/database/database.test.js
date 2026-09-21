import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import path from 'path';
import fs from 'fs';
import { initializeDatabase } from '../../../src/main/database/database.js';
import { getCompanyDetails } from '../../../src/main/repositories/companyRepository.js';
import { createInvoice, getInvoiceById, listInvoices, generateNextInvoiceNumber } from '../../../src/main/repositories/invoiceRepository.js';
import { createProforma, getProformaById, generateNextProformaNumber } from '../../../src/main/repositories/proformaRepository.js';
import { saveOrUpdateCustomer, searchCustomers } from '../../../src/main/repositories/customerRepository.js';

const tempDbPath = path.join(__dirname, 'test_invoices.db');

describe('SQLite Repositories Integration Tests', () => {
  let db;

  beforeEach(() => {
    if (fs.existsSync(tempDbPath)) {
      fs.unlinkSync(tempDbPath);
    }
    db = initializeDatabase(tempDbPath);
  });

  afterEach(() => {
    if (db) {
      db.close();
    }
    if (fs.existsSync(tempDbPath)) {
      fs.unlinkSync(tempDbPath);
    }
  });

  it('initializes schema and seeds Shepherd Enterprises company details', () => {
    const company = getCompanyDetails();
    expect(company).not.toBeNull();
    expect(company.name).toBe('SHEPHERD ENTERPRISES PRIVATE LIMITED');
    expect(company.gstin).toBe('27AAACS1234F1Z5');
  });

  it('creates and retrieves a proforma invoice with items', () => {
    const proformaNum = generateNextProformaNumber();
    expect(proformaNum).toBe('PRO-001');

    const proformaData = {
      proforma_number: proformaNum,
      proforma_date: '2026-09-17',
      buyer_name: 'Acme Logistics Ltd',
      buyer_address: 'Andheri East, Mumbai',
      customer_gstin: '27AABCA1234A1Z1',
      customer_state: 'Maharashtra',
      customer_state_code: '27',
      subtotal: 10000,
      cgst_rate: 9,
      cgst_amount: 900,
      sgst_rate: 9,
      sgst_amount: 900,
      igst_rate: 0,
      igst_amount: 0,
      grand_total: 11800,
      amount_in_words: 'Eleven Thousand Eight Hundred Rupees Only'
    };

    const items = [
      { description: 'Consulting Services', hsn_sac: '9983', quantity: 2, rate: 5000, amount: 10000 }
    ];

    const id = createProforma(proformaData, items);
    expect(id).toBeGreaterThan(0);

    const retrieved = getProformaById(id);
    expect(retrieved.proforma_number).toBe('PRO-001');
    expect(retrieved.items.length).toBe(1);
    expect(retrieved.items[0].description).toBe('Consulting Services');
  });

  it('creates and retrieves a Tax Invoice with auto-generated invoice number', () => {
    const invNum = generateNextInvoiceNumber();
    expect(invNum).toBe('INV-001');

    const invoiceData = {
      invoice_number: invNum,
      invoice_type: 'NORMAL',
      invoice_date: '2026-09-17',
      buyer_name: 'Tech Solutions Pvt Ltd',
      buyer_address: 'Bangalore, Karnataka',
      customer_gstin: '29AAACT9999K1Z0',
      customer_state: 'Karnataka',
      customer_state_code: '29',
      subtotal: 20000,
      cgst_rate: 0,
      cgst_amount: 0,
      sgst_rate: 0,
      sgst_amount: 0,
      igst_rate: 18,
      igst_amount: 3600,
      grand_total: 23600,
      amount_in_words: 'Twenty Three Thousand Six Hundred Rupees Only'
    };

    const items = [
      { description: 'Server Equipment', hsn_sac: '8471', quantity: 1, rate: 20000, amount: 20000 }
    ];

    const id = createInvoice(invoiceData, items);
    const retrieved = getInvoiceById(id);
    expect(retrieved.invoice_number).toBe('INV-001');
    expect(retrieved.customer_state_code).toBe('29');
    expect(retrieved.igst_amount).toBe(3600);

    const list = listInvoices({ search: 'Tech Solutions' });
    expect(list.total).toBe(1);
  });

  it('prevents duplicate invoice creation', () => {
    const invData = {
      invoice_number: 'INV-DUP-TEST',
      invoice_type: 'NORMAL',
      invoice_date: '2026-09-17',
      buyer_name: 'Test Buyer',
      buyer_address: 'Test Address',
      customer_state: 'Maharashtra',
      customer_state_code: '27',
      subtotal: 100,
      grand_total: 118,
      amount_in_words: 'One Hundred Eighteen Rupees Only'
    };
    const items = [{ description: 'Test', hsn_sac: '1234', quantity: 1, rate: 100, amount: 100 }];

    createInvoice(invData, items);
    expect(() => createInvoice(invData, items)).toThrow();
  });

  it('saves and searches customer records', () => {
    saveOrUpdateCustomer({
      name: 'Reliance Retail',
      address: 'Navi Mumbai',
      gstin: '27AAACR5555R1Z9',
      state: 'Maharashtra',
      state_code: '27'
    });

    const results = searchCustomers('Reliance');
    expect(results.length).toBe(1);
    expect(results[0].name).toBe('Reliance Retail');
  });

  it('enqueues backup emails and provides accurate queue summary and clear functions', async () => {
    const { enqueueEmail, getEmailQueueSummary, getPendingEmails, updateEmailQueueStatus, clearSentEmails } = await import('../../../src/main/repositories/emailQueueRepository.js');
    
    // Create an invoice to reference
    const invNum = generateNextInvoiceNumber();
    const invId = createInvoice({
      invoice_number: invNum,
      invoice_type: 'NORMAL',
      invoice_date: '2026-09-21',
      buyer_name: 'Queue Test Corp',
      buyer_address: 'Mumbai',
      customer_state: 'Maharashtra',
      customer_state_code: '27',
      subtotal: 1000,
      grand_total: 1180,
      amount_in_words: 'One Thousand One Hundred Eighty Rupees Only'
    }, [{ description: 'Item 1', hsn_sac: '9983', quantity: 1, rate: 1000, amount: 1000 }]);

    // Initial summary
    let summary = getEmailQueueSummary();
    expect(summary.pendingCount).toBe(0);

    // Enqueue 2 items
    const q1 = enqueueEmail({ invoice_id: invId, backup_path: 'C:/fake/backup1.zip', recipient: 'receiver@example.com' });
    const q2 = enqueueEmail({ invoice_id: invId, backup_path: 'C:/fake/backup2.zip', recipient: 'receiver@example.com' });
    expect(q1).toBeGreaterThan(0);
    expect(q2).toBeGreaterThan(0);

    // Pending check
    summary = getEmailQueueSummary();
    expect(summary.pendingCount).toBe(2);
    expect(summary.sentCount).toBe(0);

    const pending = getPendingEmails();
    expect(pending.length).toBe(2);

    // Mark 1 as SENT
    updateEmailQueueStatus(q1, { status: 'SENT' });
    summary = getEmailQueueSummary();
    expect(summary.pendingCount).toBe(1);
    expect(summary.sentCount).toBe(1);
    expect(summary.lastRecipient).toBe('receiver@example.com');

    // Clear sent
    clearSentEmails();
    summary = getEmailQueueSummary();
    expect(summary.sentCount).toBe(0);
    expect(summary.pendingCount).toBe(1);
  });
});
