import { describe, it, expect } from 'vitest';
import { paginateInvoiceItems, estimateItemRowHeight } from '../../../src/shared/utils/invoicePagination.js';

describe('invoicePagination - Pagination & Layout Hard Tests', () => {
  it('returns a single page with 1/1 for 1 to 3 items', () => {
    const items = [
      { description: 'Industrial Calibration', quantity: 2, rate: 500, amount: 1000 },
      { description: 'Testing Charges', quantity: 1, rate: 300, amount: 300 }
    ];
    const pages = paginateInvoiceItems(items, {});
    expect(pages.length).toBe(1);
    expect(pages[0].pageNumber).toBe(1);
    expect(pages[0].totalPages).toBe(1);
    expect(pages[0].isFirstPage).toBe(true);
    expect(pages[0].isLastPage).toBe(true);
    expect(pages[0].hasTotalsAndFooter).toBe(true);
    expect(pages[0].items.length).toBe(2);
  });

  it('handles empty items array gracefully with default fallback item without crashing', () => {
    const pages = paginateInvoiceItems([], {});
    expect(pages.length).toBe(1);
    expect(pages[0].pageNumber).toBe(1);
    expect(pages[0].items.length).toBeGreaterThanOrEqual(1);
    expect(pages[0].hasTotalsAndFooter).toBe(true);
  });

  it('calculates accurate row heights based on description length and multiline line breaks', () => {
    const singleLine = { description: 'Simple item' };
    const multiLine = { description: 'Line 1\nLine 2\nLine 3\nLine 4' };
    const paragraph = { 
      description: 'Comprehensive annual maintenance contract covering complete component diagnostics, transformer coil rewinding, motherboard rework, thermal testing, high voltage insulation test, and safety compliance certification under ISO protocol.' 
    };

    const hSingle = estimateItemRowHeight(singleLine);
    const hMulti = estimateItemRowHeight(multiLine);
    const hPara = estimateItemRowHeight(paragraph);

    expect(hMulti).toBeGreaterThan(hSingle);
    expect(hPara).toBeGreaterThan(hSingle);
  });

  it('preserves items and total items across pages', () => {
    const items = [
      { description: 'Item 1', quantity: 1, rate: 100, amount: 100 },
      { description: 'Item 2', quantity: 2, rate: 200, amount: 400 },
      { description: 'Item 3', quantity: 3, rate: 300, amount: 900 }
    ];

    const pages = paginateInvoiceItems(items, {});
    const totalRenderedItems = pages.reduce((acc, p) => acc + p.items.length, 0);
    expect(totalRenderedItems).toBe(items.length);
  });
});
