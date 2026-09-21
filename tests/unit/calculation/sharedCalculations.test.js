import { describe, it, expect } from 'vitest';
import {
  calculateLineAmount,
  calculateSubtotal,
  calculateTax,
  calculateGrandTotal,
  numberToWordsIndian,
  computeCompleteInvoiceTotals,
  formatRateValue
} from '../../../src/shared/utils/sharedCalculations.js';

describe('sharedCalculations Unit Tests', () => {
  it('calculates line amount with rounding to 2 decimals', () => {
    expect(calculateLineAmount(2.5, 100)).toBe(250);
    expect(calculateLineAmount(3, 33.333)).toBe(100);
  });

  it('calculates subtotal correctly from items', () => {
    const items = [
      { quantity: 2, rate: 500 },
      { quantity: 10, rate: 25.5 }
    ];
    expect(calculateSubtotal(items)).toBe(1255);
  });

  it('calculates Intra-State tax (CGST + SGST) when state codes match', () => {
    const tax = calculateTax(10000, '27', '27', 18);
    expect(tax.isIntraState).toBe(true);
    expect(tax.cgstRate).toBe(9);
    expect(tax.cgstAmount).toBe(900);
    expect(tax.sgstRate).toBe(9);
    expect(tax.sgstAmount).toBe(900);
    expect(tax.igstAmount).toBe(0);
  });

  it('calculates Inter-State tax (IGST) when state codes differ', () => {
    const tax = calculateTax(10000, '27', '07', 18);
    expect(tax.isIntraState).toBe(false);
    expect(tax.cgstAmount).toBe(0);
    expect(tax.sgstAmount).toBe(0);
    expect(tax.igstRate).toBe(18);
    expect(tax.igstAmount).toBe(1800);
  });

  it('calculates rounded grand total and roundOff amount', () => {
    const result = calculateGrandTotal(100.33, 9.03, 9.03, 0);
    expect(result.grandTotal).toBe(118);
  });

  it('converts numbers to Indian currency words format accurately', () => {
    expect(numberToWordsIndian(309006)).toBe('Three Lakh Nine Thousand Six Rupees Only');
    expect(numberToWordsIndian(1500)).toBe('One Thousand Five Hundred Rupees Only');
    expect(numberToWordsIndian(0)).toBe('Zero Rupees Only');
  });

  it('computes full invoice totals structure seamlessly', () => {
    const items = [
      { description: 'Testing Item', hsn_sac: '9983', quantity: 1, rate: 10000 }
    ];
    const full = computeCompleteInvoiceTotals(items, '27', '27', 18);
    expect(full.subtotal).toBe(10000);
    expect(full.cgstAmount).toBe(900);
    expect(full.sgstAmount).toBe(900);
    expect(full.grandTotal).toBe(11800);
    expect(full.amountInWords).toBe('Eleven Thousand Eight Hundred Rupees Only');
  });

  describe('formatRateValue Unit Tests', () => {
    it('formats single-digit rates with a leading zero', () => {
      expect(formatRateValue(0)).toBe('00');
      expect(formatRateValue('0')).toBe('00');
      expect(formatRateValue(5)).toBe('05');
      expect(formatRateValue('5')).toBe('05');
      expect(formatRateValue('05')).toBe('05');
      expect(formatRateValue(9)).toBe('09');
      expect(formatRateValue('9')).toBe('09');
    });

    it('formats two-digit or greater rates without leading zeroes', () => {
      expect(formatRateValue(10)).toBe('10');
      expect(formatRateValue('10')).toBe('10');
      expect(formatRateValue(18)).toBe('18');
      expect(formatRateValue('18')).toBe('18');
      expect(formatRateValue('018')).toBe('18');
      expect(formatRateValue(28)).toBe('28');
      expect(formatRateValue('28')).toBe('28');
      expect(formatRateValue('028')).toBe('28');
    });

    it('formats decimal rates correctly', () => {
      expect(formatRateValue(2.5)).toBe('2.5');
      expect(formatRateValue('2.5')).toBe('2.5');
      expect(formatRateValue('02.5')).toBe('2.5');
      expect(formatRateValue(0.5)).toBe('0.5');
    });

    it('handles empty and invalid values gracefully', () => {
      expect(formatRateValue('')).toBe('');
      expect(formatRateValue(null)).toBe('');
      expect(formatRateValue(undefined)).toBe('');
    });
  });
});
