/**
 * Application Feature Flags & Locking Configuration
 * 
 * Toggle DETAILS_PANEL_ENABLED:
 * - false (Locked): Details panel is hidden from sidebar, catalog auto-suggestions are disabled,
 *   HSN code is restricted to a mandatory dropdown of allowed codes.
 * - true (Unlocked): Details panel is visible in sidebar, full directory & catalog auto-suggestions active.
 * 
 * Toggle SINGLE_PAGE_INVOICE_LOCKED:
 * - true: Caps line items to MAX_ITEMS_PER_INVOICE and locks invoice to a single A4 page.
 */
export const FEATURE_FLAGS = {
  // Controls visibility and access to the Directory & Master Details Panel
  DETAILS_PANEL_ENABLED: false,

  // Allowed HSN codes when restricted to dropdown
  ALLOWED_HSN_CODES: ['998513', '998514', '998519', '998515'],

  // Controls single-page invoice lock & maximum allowed line items
  SINGLE_PAGE_INVOICE_LOCKED: true,
  MAX_ITEMS_PER_INVOICE: 12,

  // Maximum character limit for product/service name & description
  MAX_PRODUCT_NAME_LENGTH: 60
};

