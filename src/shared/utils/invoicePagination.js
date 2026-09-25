import { FEATURE_FLAGS } from '../constants/featureFlags.js';

/**
 * Invoice Pagination Utility for Shepherd Enterprises Invoicing System
 * Exact A4 page partitioning matching official invoice PDF specification.
 */

const PAGE_TOTAL_HEIGHT = 1050; // Available inner height in px for A4 sheet (281mm)

// Height allowances for header and footer components (in pixels)
const HEIGHT_PAGE1_TOP = 345;         // Full Header (115) + Subheader (32) + Meta Grid (160) + Table Header (28) + padding (10)
const HEIGHT_CONT_PAGE_TOP = 65;      // Subheader (32) + Table Header (28) + padding (5)
const HEIGHT_TOTALS_AND_FOOTER = 295; // Words Strip (26) + Bank/Tax with page subtotals (150) + Terms/Signatures (115) + padding (4)
const HEIGHT_PAGE_SUBTOTAL = 30;      // Page-wise subtotal row at bottom of table
const SAFETY_MARGIN = 20;

/**
 * Estimate the pixel height of a line item row
 */
export function estimateItemRowHeight(item, isFirstItem = false, refsCount = 0) {
  const baseHeight = 22;
  const desc = String(item?.description || '');
  
  // Count explicit line breaks
  const explicitLines = desc.split(/\r\n|\r|\n/).length;
  
  // In a 54% column on 194mm width (~400px), approx 40-45 chars per line
  const charLines = Math.max(1, Math.ceil(desc.length / 42));
  const estimatedLines = Math.max(explicitLines, charLines);
  
  const extraLineHeight = (estimatedLines - 1) * 15;
  const refHeight = isFirstItem ? (refsCount * 14) : 0;
  
  return baseHeight + extraLineHeight + refHeight;
}

/**
 * Count reference fields present in invoiceData
 */
export function countReferenceLines(invoiceData) {
  let count = 0;
  if (invoiceData?.so_po_number) count++;
  if (invoiceData?.gemc_number) count++;
  if (invoiceData?.reference_number) count++;
  return count;
}

/**
 * Partition items across A4 pages deterministically
 * @param {Array} items - Invoice line items
 * @param {Object} invoiceData - Full invoice document data
 * @returns {Array} Array of page objects with partitioned items and layout flags
 */
export function paginateInvoiceItems(items = [], invoiceData = {}) {
  const safeItems = (items && items.length > 0) ? items : [
    {
      description: 'Industrial Supply / Service Charges',
      hsn_sac: '-',
      quantity: 1,
      rate: Number(invoiceData.subtotal || invoiceData.grand_total || 0),
      amount: Number(invoiceData.subtotal || invoiceData.grand_total || 0)
    }
  ];

  const refsCount = countReferenceLines(invoiceData);

  // Single page capacity check:
  const singlePageItemCapacity = PAGE_TOTAL_HEIGHT - HEIGHT_PAGE1_TOP - HEIGHT_TOTALS_AND_FOOTER - SAFETY_MARGIN; // ~570px (~34-35 single-line items)

  // Calculate total height of all items
  const itemHeights = safeItems.map((item, idx) => 
    estimateItemRowHeight(item, idx === 0, refsCount)
  );
  const totalItemsHeight = itemHeights.reduce((sum, h) => sum + h, 0);

  // If single-page invoice is locked or all items fit into a single page
  if (FEATURE_FLAGS?.SINGLE_PAGE_INVOICE_LOCKED || totalItemsHeight <= singlePageItemCapacity) {
    return [
      {
        pageNumber: 1,
        totalPages: 1,
        items: safeItems,
        isFirstPage: true,
        isLastPage: true,
        hasFullHeader: true,
        hasFullMeta: true,
        hasTotalsAndFooter: true,
        spacerHeight: 0,
        itemStartIndex: 0
      }
    ];
  }

  // Multi-page distribution
  const pages = [];
  let currentItems = [];
  let currentAccumulatedHeight = 0;
  let itemStartIndex = 0;
  let isFirstPage = true;

  const page1Capacity = PAGE_TOTAL_HEIGHT - HEIGHT_PAGE1_TOP - HEIGHT_PAGE_SUBTOTAL - SAFETY_MARGIN; // ~755px
  const midPageCapacity = PAGE_TOTAL_HEIGHT - HEIGHT_CONT_PAGE_TOP - HEIGHT_PAGE_SUBTOTAL - SAFETY_MARGIN; // ~975px
  const lastPageCapacity = PAGE_TOTAL_HEIGHT - HEIGHT_CONT_PAGE_TOP - HEIGHT_TOTALS_AND_FOOTER - HEIGHT_PAGE_SUBTOTAL - SAFETY_MARGIN; // ~765px

  for (let i = 0; i < safeItems.length; i++) {
    const item = safeItems[i];
    const height = itemHeights[i];
    const capacity = isFirstPage ? page1Capacity : midPageCapacity;

    if (currentAccumulatedHeight + height > capacity && currentItems.length > 0) {
      pages.push({
        pageNumber: pages.length + 1,
        items: currentItems,
        isFirstPage,
        isLastPage: false,
        hasFullHeader: isFirstPage,
        hasFullMeta: isFirstPage,
        hasTotalsAndFooter: false,
        spacerHeight: 0,
        itemStartIndex
      });

      isFirstPage = false;
      currentItems = [item];
      currentAccumulatedHeight = height;
      itemStartIndex = i;
    } else {
      currentItems.push(item);
      currentAccumulatedHeight += height;
    }
  }

  // Handle the remaining items
  if (currentItems.length > 0) {
    const finalCapacity = isFirstPage ? singlePageItemCapacity : lastPageCapacity;
    if (currentAccumulatedHeight <= finalCapacity) {
      pages.push({
        pageNumber: pages.length + 1,
        items: currentItems,
        isFirstPage,
        isLastPage: true,
        hasFullHeader: isFirstPage,
        hasFullMeta: isFirstPage,
        hasTotalsAndFooter: true,
        spacerHeight: 0,
        itemStartIndex
      });
    } else {
      pages.push({
        pageNumber: pages.length + 1,
        items: currentItems,
        isFirstPage,
        isLastPage: false,
        hasFullHeader: isFirstPage,
        hasFullMeta: isFirstPage,
        hasTotalsAndFooter: false,
        spacerHeight: 0,
        itemStartIndex
      });

      pages.push({
        pageNumber: pages.length + 1,
        items: [],
        isFirstPage: false,
        isLastPage: true,
        hasFullHeader: false,
        hasFullMeta: false,
        hasTotalsAndFooter: true,
        spacerHeight: 0,
        itemStartIndex: safeItems.length
      });
    }
  }

  const totalPages = pages.length;
  return pages.map(p => ({
    ...p,
    totalPages
  }));
}
