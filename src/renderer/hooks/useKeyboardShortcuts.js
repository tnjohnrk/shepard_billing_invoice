import { useEffect } from 'react';
import { FEATURE_FLAGS } from '../../shared/constants/featureFlags';

/**
 * Global Keyboard Shortcuts Hook
 * @param {Object} options
 * @param {Function} options.onNavigate - Callback with targetTab ('dashboard', 'create', 'history', 'details', 'reports', 'settings')
 * @param {Function} options.onLock - Callback to lock the application
 * @param {Function} options.onToggleHelp - Callback to open/close shortcuts cheat sheet modal
 * @param {Function} options.onPrint - Callback for Ctrl+P
 * @param {Function} options.onExportExcel - Callback for Ctrl+E
 * @param {boolean} options.isLocked - Whether the application is currently on LockScreen
 */
export function useKeyboardShortcuts({
  onNavigate,
  onLock,
  onToggleHelp,
  onPrint,
  onExportExcel,
  isLocked = false
}) {
  useEffect(() => {
    if (isLocked) return;

    const handleKeyDown = (e) => {
      const isCtrlOrMeta = e.ctrlKey || e.metaKey;
      const isAlt = e.altKey;
      const isShift = e.shiftKey;
      const key = e.key;

      // 1. Help Modal: F1 or Shift+? (when not in an input field)
      if (key === 'F1') {
        e.preventDefault();
        onToggleHelp?.();
        return;
      }
      if (isShift && (key === '?' || key === '/')) {
        const target = e.target;
        const tagName = target?.tagName?.toLowerCase();
        const isEditable = tagName === 'input' || tagName === 'textarea' || target?.isContentEditable;
        if (!isEditable) {
          e.preventDefault();
          onToggleHelp?.();
          return;
        }
      }

      // 2. Lock Screen: Ctrl + Shift + L
      if (isCtrlOrMeta && isShift && (key === 'L' || key === 'l')) {
        e.preventDefault();
        onLock?.();
        return;
      }

      // 3. Global Navigation via Alt + Number
      if (isAlt && !isCtrlOrMeta) {
        if (key === '1') { e.preventDefault(); onNavigate?.('dashboard'); return; }
        if (key === '2') { e.preventDefault(); onNavigate?.('create'); return; }
        if (key === '3') { e.preventDefault(); onNavigate?.('history'); return; }
        
        if (FEATURE_FLAGS.DETAILS_PANEL_ENABLED) {
          if (key === '4') { e.preventDefault(); onNavigate?.('details'); return; }
          if (key === '5') { e.preventDefault(); onNavigate?.('reports'); return; }
          if (key === '6') { e.preventDefault(); onNavigate?.('settings'); return; }
        } else {
          if (key === '4') { e.preventDefault(); onNavigate?.('reports'); return; }
          if (key === '5') { e.preventDefault(); onNavigate?.('settings'); return; }
        }
      }

      // 4. Global Navigation via Ctrl + Shift + Key
      if (isCtrlOrMeta && isShift) {
        const lowerKey = key.toLowerCase();
        if (lowerKey === '1') { e.preventDefault(); onNavigate?.('dashboard'); return; }
        if (lowerKey === 'n') { e.preventDefault(); onNavigate?.('create'); return; }
        if (lowerKey === 'h') { e.preventDefault(); onNavigate?.('history'); return; }
        if (FEATURE_FLAGS.DETAILS_PANEL_ENABLED && lowerKey === 'd') {
          e.preventDefault(); onNavigate?.('details'); return;
        }
        if (lowerKey === 'r') { e.preventDefault(); onNavigate?.('reports'); return; }
        if (lowerKey === 's') { e.preventDefault(); onNavigate?.('settings'); return; }
      }

      // 5. Global Actions: Ctrl + F (Focus Search Bar)
      if (isCtrlOrMeta && !isShift && !isAlt && (key === 'f' || key === 'F')) {
        const searchInput = document.querySelector('input[placeholder*="Search"], input[type="search"]');
        if (searchInput) {
          e.preventDefault();
          searchInput.focus();
          if (typeof searchInput.select === 'function') searchInput.select();
        }
        return;
      }

      // 6. Global Actions: Ctrl + P (Print Active View/Invoice)
      if (isCtrlOrMeta && !isShift && !isAlt && (key === 'p' || key === 'P')) {
        if (onPrint) {
          e.preventDefault();
          onPrint();
        }
        return;
      }

      // 7. Global Actions: Ctrl + E (Export to Excel)
      if (isCtrlOrMeta && !isShift && !isAlt && (key === 'e' || key === 'E')) {
        if (onExportExcel) {
          e.preventDefault();
          onExportExcel();
        }
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNavigate, onLock, onToggleHelp, onPrint, onExportExcel, isLocked]);
}
