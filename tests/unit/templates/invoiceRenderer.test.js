import { describe, it, expect } from 'vitest';
import { renderInvoiceHtml } from '../../../src/main/templates/invoice/invoiceRenderer.js';

describe('invoiceRenderer HTML generation', () => {
  it('should render an invoice with all details', () => {
    const invoiceData = {
      invoice_number: 'INV-2026-001',
      invoice_date: '2026-09-25',
      buyer_name: 'Acme Corp',
      subtotal: 1000,
      cgst_rate: 9,
      cgst_amount: 90,
      sgst_rate: 9,
      sgst_amount: 90,
      grand_total: 1180,
      amount_in_words: 'Rupees One Thousand One Hundred Eighty Only',
      items: [
        { description: 'Testing Hardware Service', hsn_sac: '9987', quantity: 1, rate: 1000, amount: 1000 }
      ]
    };

    const html = renderInvoiceHtml(invoiceData);
    expect(html).toContain('INV-2026-001');
    expect(html).toContain('Testing Hardware Service');
    expect(html).toContain('TOTAL AMOUNT IN WORDS:');
    expect(html).toContain('TOTAL AMOUNT AFTER TAX:');
  });

  it('should format long multiline paragraph descriptions cleanly without breaking', () => {
    const longDesc = 'Detailed precision calibration and maintenance of industrial high-voltage power inverter units, including component level micro-soldering, thermal paste re-application, capacitor leakage testing, oscilloscope signal verification, and ISO compliance testing certification.';
    const invoiceData = {
      invoice_number: 'INV-2026-003',
      invoice_date: '2026-09-25',
      buyer_name: 'Tech Labs',
      subtotal: 5000,
      grand_total: 5900,
      items: [
        { description: longDesc, hsn_sac: '9987', quantity: 1, rate: 5000, amount: 5000 }
      ]
    };

    const html = renderInvoiceHtml(invoiceData);
    expect(html).toContain('item-desc-text');
    expect(html).toContain('Detailed precision calibration');
  });

  it('should render single page invoice format with all totals and Director signatory', () => {
    const items = [
      {
        description: 'Industrial Supply / Service Item',
        hsn_sac: '998513',
        quantity: 3,
        rate: 160,
        amount: 480
      }
    ];

    const invoiceData = {
      invoice_number: 'INV-017',
      invoice_date: '2026-09-24',
      buyer_name: 'rohith1',
      buyer_address: '34a',
      subtotal: 480,
      cgst_rate: 9,
      cgst_amount: 43.2,
      sgst_rate: 9,
      sgst_amount: 43.2,
      grand_total: 566,
      amount_in_words: 'Five Hundred Sixty Six Rupees Only',
      items
    };

    const html = renderInvoiceHtml(invoiceData);
    expect(html).toContain('Director');
    expect(html).toContain('TOTAL AMOUNT IN WORDS:');
    expect(html).toContain('Five Hundred Sixty Six Rupees Only');
    expect(html).toContain('TOTAL AMOUNT AFTER TAX:');
  });
});
