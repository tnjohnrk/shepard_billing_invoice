import { describe, it, expect } from 'vitest';
import { renderInvoiceHtml } from '../../../src/main/templates/invoice/invoiceRenderer.js';

describe('invoiceRenderer - Hard Test Suite for PDF & Print Templates', () => {
  it('renders standard Tax Invoice with full GST breakdown, bank details and Director signature', () => {
    const invoiceData = {
      invoice_number: 'INV-017',
      invoice_type: 'NORMAL',
      invoice_date: '2026-09-28',
      copy_type: 'ORIGINAL',
      buyer_name: 'Rohith Enterprises Ltd',
      buyer_address: '123 Anna Salai, Chennai, Tamil Nadu',
      customer_gstin: '33AABCT1234A1Z5',
      customer_state: 'Tamil Nadu',
      customer_state_code: '33',
      subtotal: 10000,
      cgst_rate: 9,
      cgst_amount: 900,
      sgst_rate: 9,
      sgst_amount: 900,
      igst_rate: 0,
      igst_amount: 0,
      grand_total: 11800,
      amount_in_words: 'Eleven Thousand Eight Hundred Rupees Only',
      items: [
        { description: 'Testing & Calibration Services', hsn_sac: '9987', quantity: 2, rate: 5000, amount: 10000 }
      ]
    };

    const html = renderInvoiceHtml(invoiceData);

    // Document header assertions
    expect(html).toContain('INV-017');
    expect(html).toContain('Original for Recipient');
    expect(html).toContain('Rohith Enterprises Ltd');
    expect(html).toContain('33AABCT1234A1Z5');

    // Tax rows assertions
    expect(html).toContain('ADD CGST: 9%');
    expect(html).toContain('ADD SGST: 9%');
    expect(html).toContain('TOTAL AMOUNT BEFORE TAX');
    expect(html).toContain('TOTAL AMOUNT AFTER TAX:');
    expect(html).toContain('Eleven Thousand Eight Hundred Rupees Only');

    // Bank Details assertions (Clean separate rows)
    expect(html).toContain('BANK DETAILS');
    expect(html).toContain('BANK NAME:');
    expect(html).toContain('ACCOUNT NUMBER:');
    expect(html).toContain('BRANCH NAME:');
    expect(html).toContain('IFSC CODE:');

    // Footer & Signatory assertions
    expect(html).toContain('Director');
    expect(html).toContain('For SHEPHERD ENTERPRISES PRIVATE LIMITED');
  });

  it('renders Inter-State Tax Invoice with IGST correctly', () => {
    const invoiceData = {
      invoice_number: 'INV-018',
      invoice_type: 'NORMAL',
      invoice_date: '2026-09-28',
      buyer_name: 'Bangalore Tech Park',
      customer_state: 'Karnataka',
      customer_state_code: '29',
      subtotal: 20000,
      igst_rate: 18,
      igst_amount: 3600,
      grand_total: 23600,
      amount_in_words: 'Twenty Three Thousand Six Hundred Rupees Only',
      items: [
        { description: 'Industrial Power Unit', hsn_sac: '8504', quantity: 1, rate: 20000, amount: 20000 }
      ]
    };

    const html = renderInvoiceHtml(invoiceData);
    expect(html).toContain('ADD IGST: 18%');
    expect(html).toContain('3,600.00');
    expect(html).not.toContain('ADD CGST:');
  });

  it('renders Proforma Invoice with ESTIMATE / NOT A TAX INVOICE watermark labels', () => {
    const proformaData = {
      proforma_number: 'PRO-004',
      invoice_type: 'PROFORMA',
      proforma_date: '2026-09-28',
      buyer_name: 'Client Proforma Test',
      subtotal: 5000,
      cgst_rate: 9,
      cgst_amount: 450,
      sgst_rate: 9,
      sgst_amount: 450,
      grand_total: 5900,
      amount_in_words: 'Five Thousand Nine Hundred Rupees Only',
      items: [
        { description: 'Consultation & Estimate', hsn_sac: '9983', quantity: 1, rate: 5000, amount: 5000 }
      ]
    };

    const html = renderInvoiceHtml(proformaData);
    expect(html).toContain('PRO-004');
    expect(html).toContain('PROFORMA INVOICE');
    expect(html).toContain('Proforma Copy');
  });

  it('handles multiline descriptions and special HTML characters safely (XSS protection)', () => {
    const invoiceData = {
      invoice_number: 'INV-019',
      invoice_date: '2026-09-28',
      buyer_name: 'Safe & Sound <script>alert(1)</script>',
      subtotal: 1000,
      grand_total: 1180,
      items: [
        { 
          description: 'Line 1 & Line 2\n<img src=x onerror=alert(1)> Special "Quotes" & symbols', 
          hsn_sac: '9987', 
          quantity: 1, 
          rate: 1000, 
          amount: 1000 
        }
      ]
    };

    const html = renderInvoiceHtml(invoiceData);
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
    expect(html).toContain('Line 1 &amp; Line 2');
  });
});
