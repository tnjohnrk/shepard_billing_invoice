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

describe('sharedCalculations - High-Intensity Hard Tests & Edge Cases', () => {
  describe('Line Amount & Subtotal Multiplications', () => {
    it('calculates line amount with rounding to 2 decimals', () => {
      expect(calculateLineAmount(2.5, 100)).toBe(250);
      expect(calculateLineAmount(3, 33.333)).toBe(100);
      expect(calculateLineAmount(0, 500)).toBe(0);
      expect(calculateLineAmount(10, 0)).toBe(0);
      expect(calculateLineAmount(7, 14.2857)).toBe(100);
    });

    it('calculates subtotal correctly from multiple item rows', () => {
      const items = [
        { quantity: 2, rate: 500 },
        { quantity: 10, rate: 25.5 },
        { quantity: 1, rate: 100.25 }
      ];
      expect(calculateSubtotal(items)).toBe(1355.25);
    });

    it('handles empty items array gracefully with 0 subtotal', () => {
      expect(calculateSubtotal([])).toBe(0);
      expect(calculateSubtotal(null)).toBe(0);
      expect(calculateSubtotal(undefined)).toBe(0);
    });
  });

  describe('GST Tax Calculation (Intra-State vs Inter-State)', () => {
    it('calculates Intra-State tax (CGST + SGST) when state codes match (e.g. TN 33 to TN 33)', () => {
      const tax = calculateTax(10000, '33', '33', 18);
      expect(tax.isIntraState).toBe(true);
      expect(tax.cgstRate).toBe(9);
      expect(tax.cgstAmount).toBe(900);
      expect(tax.sgstRate).toBe(9);
      expect(tax.sgstAmount).toBe(900);
      expect(tax.igstRate).toBe(0);
      expect(tax.igstAmount).toBe(0);
      expect(tax.cgstAmount + tax.sgstAmount).toBe(1800);
    });

    it('calculates Inter-State tax (IGST) when state codes differ (e.g. TN 33 to KA 29)', () => {
      const tax = calculateTax(10000, '33', '29', 18);
      expect(tax.isIntraState).toBe(false);
      expect(tax.cgstAmount).toBe(0);
      expect(tax.sgstAmount).toBe(0);
      expect(tax.igstRate).toBe(18);
      expect(tax.igstAmount).toBe(1800);
    });

    it('supports custom tax rates (e.g. 5%, 12%, 28%)', () => {
      // 5% Intra-state
      const tax5 = calculateTax(10000, '33', '33', 5);
      expect(tax5.cgstRate).toBe(2.5);
      expect(tax5.cgstAmount).toBe(250);
      expect(tax5.sgstRate).toBe(2.5);
      expect(tax5.sgstAmount).toBe(250);
      expect(tax5.cgstAmount + tax5.sgstAmount).toBe(500);

      // 28% Inter-state
      const tax28 = calculateTax(10000, '33', '27', 28);
      expect(tax28.igstRate).toBe(28);
      expect(tax28.igstAmount).toBe(2800);
    });

    it('handles 0% exempt tax rate properly without NaN', () => {
      const tax0 = calculateTax(5000, '33', '33', 0);
      expect(tax0.cgstAmount).toBe(0);
      expect(tax0.sgstAmount).toBe(0);
      expect(tax0.igstAmount).toBe(0);
    });
  });

  describe('Indian Rupee Round-Off Arithmetic', () => {
    it('rounds down when paise is less than 50', () => {
      const res = calculateGrandTotal(100, 4.20, 4.20, 0); // 108.40
      expect(res.exactTotal).toBe(108.4);
      expect(res.grandTotal).toBe(108);
      expect(res.roundOff).toBe(-0.4);
    });

    it('rounds up when paise is 50 or greater', () => {
      const res = calculateGrandTotal(100, 4.30, 4.30, 0); // 108.60
      expect(res.exactTotal).toBe(108.6);
      expect(res.grandTotal).toBe(109);
      expect(res.roundOff).toBe(0.4);
    });

    it('has 0 roundOff on exact integers', () => {
      const res = calculateGrandTotal(100, 9, 9, 0); // 118.00
      expect(res.grandTotal).toBe(118);
      expect(res.roundOff).toBe(0);
    });
  });

  describe('Indian Currency Number-to-Words Engine', () => {
    it('converts single digits and tens', () => {
      expect(numberToWordsIndian(0)).toBe('Zero Rupees Only');
      expect(numberToWordsIndian(5)).toBe('Five Rupees Only');
      expect(numberToWordsIndian(18)).toBe('Eighteen Rupees Only');
      expect(numberToWordsIndian(75)).toBe('Seventy Five Rupees Only');
    });

    it('converts hundreds and thousands', () => {
      expect(numberToWordsIndian(100)).toBe('One Hundred Rupees Only');
      expect(numberToWordsIndian(1180)).toBe('One Thousand One Hundred Eighty Rupees Only');
      expect(numberToWordsIndian(25400)).toBe('Twenty Five Thousand Four Hundred Rupees Only');
    });

    it('converts Lakhs and Crores in Indian numbering format', () => {
      expect(numberToWordsIndian(309006)).toBe('Three Lakh Nine Thousand Six Rupees Only');
      expect(numberToWordsIndian(2500000)).toBe('Twenty Five Lakh Rupees Only');
      expect(numberToWordsIndian(15000000)).toBe('One Crore Fifty Lakh Rupees Only');
      expect(numberToWordsIndian(12345678)).toBe('One Crore Twenty Three Lakh Forty Five Thousand Six Hundred Seventy Eight Rupees Only');
    });

    it('handles negative or invalid inputs without breaking', () => {
      expect(numberToWordsIndian(-500)).toBe('Zero Rupees Only');
      expect(numberToWordsIndian(null)).toBe('Zero Rupees Only');
      expect(numberToWordsIndian(undefined)).toBe('Zero Rupees Only');
    });
  });

  describe('Full Invoice Compute Engine (computeCompleteInvoiceTotals)', () => {
    it('computes full invoice totals structure with all properties', () => {
      const items = [
        { description: 'Testing Item 1', hsn_sac: '9983', quantity: 2, rate: 5000 },
        { description: 'Testing Item 2', hsn_sac: '9987', quantity: 1, rate: 2000 }
      ];
      const full = computeCompleteInvoiceTotals(items, '33', '33', 18);
      expect(full.subtotal).toBe(12000);
      expect(full.cgstRate).toBe(9);
      expect(full.cgstAmount).toBe(1080);
      expect(full.sgstRate).toBe(9);
      expect(full.sgstAmount).toBe(1080);
      expect(full.igstAmount).toBe(0);
      expect(full.grandTotal).toBe(14160);
      expect(full.amountInWords).toBe('Fourteen Thousand One Hundred Sixty Rupees Only');
      expect(full.items.length).toBe(2);
      expect(full.items[0].amount).toBe(10000);
      expect(full.items[1].amount).toBe(2000);
    });
  });

  describe('Rate Formatter (formatRateValue)', () => {
    it('formats single-digit rates with a leading zero', () => {
      expect(formatRateValue(0)).toBe('00');
      expect(formatRateValue('0')).toBe('00');
      expect(formatRateValue(5)).toBe('05');
      expect(formatRateValue('5')).toBe('05');
      expect(formatRateValue(9)).toBe('09');
    });

    it('formats multi-digit rates cleanly', () => {
      expect(formatRateValue(18)).toBe('18');
      expect(formatRateValue(28)).toBe('28');
      expect(formatRateValue('18')).toBe('18');
    });

    it('handles decimals and empty values cleanly', () => {
      expect(formatRateValue(2.5)).toBe('2.5');
      expect(formatRateValue('')).toBe('');
      expect(formatRateValue(null)).toBe('');
    });
  });
});
