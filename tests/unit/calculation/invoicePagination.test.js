import { describe, it, expect } from 'vitest';
import { paginateInvoiceItems, estimateItemRowHeight } from '../../../src/shared/utils/invoicePagination.js';

describe('invoicePagination', () => {
  it('should return a single page with 1/1 for a small list of items', () => {
    const items = [
      { description: 'Item 1', quantity: 2, rate: 100, amount: 200 },
      { description: 'Item 2', quantity: 1, rate: 300, amount: 300 }
    ];
    const pages = paginateInvoiceItems(items, {});
    expect(pages.length).toBe(1);
    expect(pages[0].pageNumber).toBe(1);
    expect(pages[0].totalPages).toBe(1);
    expect(pages[0].isFirstPage).toBe(true);
    expect(pages[0].isLastPage).toBe(true);
    expect(pages[0].hasTotalsAndFooter).toBe(true);
  });

  it('should split into multiple pages when many items are present', () => {
    const items = Array.from({ length: 45 }, (_, i) => ({
      description: `Test Product Item ${i + 1}`,
      quantity: 1,
      rate: 100,
      amount: 100
    }));

    const pages = paginateInvoiceItems(items, {});
    expect(pages.length).toBeGreaterThan(1);
    expect(pages[0].pageNumber).toBe(1);
    expect(pages[0].totalPages).toBe(pages.length);
    expect(pages[pages.length - 1].isLastPage).toBe(true);
    expect(pages[pages.length - 1].hasTotalsAndFooter).toBe(true);
  });

  it('should calculate larger height for long paragraph descriptions', () => {
    const shortItem = { description: 'Short Item' };
    const longItem = { 
      description: 'This is a very long descriptive paragraph of technical services rendered, including comprehensive hardware diagnostics, component level troubleshooting, board repair, precision alignment, calibration, quality testing, and final certification under standard testing protocol.' 
    };

    const shortHeight = estimateItemRowHeight(shortItem);
    const longHeight = estimateItemRowHeight(longItem);

    expect(longHeight).toBeGreaterThan(shortHeight);
  });
});
