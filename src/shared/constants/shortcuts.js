/**
 * Centralized Keyboard Shortcuts Configuration
 * Shepherd Invoice Application
 */
import { FEATURE_FLAGS } from './featureFlags';

export const SHORTCUT_CATEGORIES = {
  NAVIGATION: 'navigation',
  INVOICE: 'invoice',
  DOCUMENT: 'document'
};

const navigationShortcuts = [
  // 1. Global Navigation Shortcuts
  {
    id: 'nav_dashboard',
    category: SHORTCUT_CATEGORIES.NAVIGATION,
    label: 'Dashboard',
    description: 'Jump to Analytics & Overview',
    keys: ['Alt', '1'],
    altKeys: ['Ctrl', 'Shift', '1'],
    targetTab: 'dashboard',
    isGlobal: true
  },
  {
    id: 'nav_create',
    category: SHORTCUT_CATEGORIES.NAVIGATION,
    label: 'Create Invoice',
    description: 'Start a new Tax Invoice / Proforma',
    keys: ['Alt', '2'],
    altKeys: ['Ctrl', 'Shift', 'N'],
    targetTab: 'create',
    isGlobal: true
  },
  {
    id: 'nav_history',
    category: SHORTCUT_CATEGORIES.NAVIGATION,
    label: 'Invoice History',
    description: 'Open full invoice list & search records',
    keys: ['Alt', '3'],
    altKeys: ['Ctrl', 'Shift', 'H'],
    targetTab: 'history',
    isGlobal: true
  },
  ...(FEATURE_FLAGS.DETAILS_PANEL_ENABLED ? [
    {
      id: 'nav_details',
      category: SHORTCUT_CATEGORIES.NAVIGATION,
      label: 'Master Directory',
      description: 'Open Buyers & Product Catalog Directory',
      keys: ['Alt', '4'],
      altKeys: ['Ctrl', 'Shift', 'D'],
      targetTab: 'details',
      isGlobal: true
    },
    {
      id: 'nav_reports',
      category: SHORTCUT_CATEGORIES.NAVIGATION,
      label: 'Reports',
      description: 'Open Daily, Monthly, and FY Reports',
      keys: ['Alt', '5'],
      altKeys: ['Ctrl', 'Shift', 'R'],
      targetTab: 'reports',
      isGlobal: true
    },
    {
      id: 'nav_settings',
      category: SHORTCUT_CATEGORIES.NAVIGATION,
      label: 'Settings',
      description: 'Open Backup, Passwords, Themes & Support',
      keys: ['Alt', '6'],
      altKeys: ['Ctrl', 'Shift', 'S'],
      targetTab: 'settings',
      isGlobal: true
    }
  ] : [
    {
      id: 'nav_reports',
      category: SHORTCUT_CATEGORIES.NAVIGATION,
      label: 'Reports',
      description: 'Open Daily, Monthly, and FY Reports',
      keys: ['Alt', '4'],
      altKeys: ['Ctrl', 'Shift', 'R'],
      targetTab: 'reports',
      isGlobal: true
    },
    {
      id: 'nav_settings',
      category: SHORTCUT_CATEGORIES.NAVIGATION,
      label: 'Settings',
      description: 'Open Backup, Passwords, Themes & Support',
      keys: ['Alt', '5'],
      altKeys: ['Ctrl', 'Shift', 'S'],
      targetTab: 'settings',
      isGlobal: true
    }
  ]),
  {
    id: 'nav_lock',
    category: SHORTCUT_CATEGORIES.NAVIGATION,
    label: 'Lock Application',
    description: 'Instantly lock application with PIN screen',
    keys: ['Ctrl', 'Shift', 'L'],
    isGlobal: true
  },
  {
    id: 'nav_help',
    category: SHORTCUT_CATEGORIES.NAVIGATION,
    label: 'Shortcuts Help',
    description: 'Open quick cheat sheet modal',
    keys: ['F1'],
    altKeys: ['Shift', '?'],
    isGlobal: true
  }
];

export const KEYBOARD_SHORTCUTS = [
  ...navigationShortcuts,

  // 2. Invoice Wizard & Form Data Entry
  {
    id: 'form_next_field',
    category: SHORTCUT_CATEGORIES.INVOICE,
    label: 'Next Field / Advance Step',
    description: 'Jump to next input; advances wizard at the end of a step',
    keys: ['Enter'],
    isGlobal: false
  },
  {
    id: 'form_new_line',
    category: SHORTCUT_CATEGORIES.INVOICE,
    label: 'New Line in Text',
    description: 'Insert multiline wrap inside address & notes text boxes',
    keys: ['Shift', 'Enter'],
    isGlobal: false
  },
  {
    id: 'form_next_step',
    category: SHORTCUT_CATEGORIES.INVOICE,
    label: 'Next Wizard Step',
    description: 'Advance to next step in invoice creation wizard',
    keys: ['Alt', 'N'],
    isGlobal: false
  },
  {
    id: 'form_prev_step',
    category: SHORTCUT_CATEGORIES.INVOICE,
    label: 'Previous Wizard Step',
    description: 'Go back to previous step without losing entered data',
    keys: ['Alt', 'P'],
    isGlobal: false
  },
  {
    id: 'form_add_item',
    category: SHORTCUT_CATEGORIES.INVOICE,
    label: 'Add Line Item',
    description: 'Append a new row in line items table',
    keys: ['Alt', 'A'],
    isGlobal: false
  },
  {
    id: 'form_save_invoice',
    category: SHORTCUT_CATEGORIES.INVOICE,
    label: 'Save & Generate',
    description: 'Save invoice and generate official PDF',
    keys: ['Ctrl', 'S'],
    isGlobal: false
  },
  {
    id: 'form_reset_draft',
    category: SHORTCUT_CATEGORIES.INVOICE,
    label: 'Reset Draft',
    description: 'Clear current draft and start fresh',
    keys: ['Alt', 'R'],
    isGlobal: false
  },

  // 3. History, Tables & Document Actions
  {
    id: 'doc_search',
    category: SHORTCUT_CATEGORIES.DOCUMENT,
    label: 'Focus Search',
    description: 'Jump focus directly into the active search box',
    keys: ['Ctrl', 'F'],
    isGlobal: true
  },
  {
    id: 'doc_print',
    category: SHORTCUT_CATEGORIES.DOCUMENT,
    label: 'Print Active Document',
    description: 'Open native print dialog for the current invoice',
    keys: ['Ctrl', 'P'],
    isGlobal: true
  },
  {
    id: 'doc_excel',
    category: SHORTCUT_CATEGORIES.DOCUMENT,
    label: 'Export to Excel',
    description: 'Export current report or invoice to .xlsx spreadsheet',
    keys: ['Ctrl', 'E'],
    isGlobal: true
  },
  {
    id: 'doc_duplicate',
    category: SHORTCUT_CATEGORIES.DOCUMENT,
    label: 'Duplicate Invoice',
    description: 'Clone selected invoice into a new draft',
    keys: ['Ctrl', 'D'],
    isGlobal: false
  },
  {
    id: 'doc_close',
    category: SHORTCUT_CATEGORIES.DOCUMENT,
    label: 'Close / Go Back',
    description: 'Close active modal, dialog, or preview screen',
    keys: ['Escape'],
    isGlobal: true
  }
];

export const CATEGORY_LABELS = {
  [SHORTCUT_CATEGORIES.NAVIGATION]: 'Global Navigation',
  [SHORTCUT_CATEGORIES.INVOICE]: 'Invoice Creation & Form Entry',
  [SHORTCUT_CATEGORIES.DOCUMENT]: 'Document Actions & History'
};
