import React, { useState, useEffect, useRef } from 'react';
import { Trash2, Sparkles, Plus, Check, AlertCircle } from 'lucide-react';
import { calculateLineAmount } from '../../../shared/utils/sharedCalculations';
import { ipcClient } from '../../services/ipcClient';
import { FEATURE_FLAGS } from '../../../shared/constants/featureFlags';

export function ItemRow({ 
  index, 
  item, 
  catalogProducts = [], 
  onCatalogUpdated, 
  onChange, 
  onBatchChange, 
  onDelete, 
  canDelete 
}) {
  const lineAmount = calculateLineAmount(item.quantity, item.rate);

  // Auto-suggest dropdown states
  const [hsnSuggestions, setHsnSuggestions] = useState([]);
  const [showHsnSuggestions, setShowHsnSuggestions] = useState(false);
  const [descSuggestions, setDescSuggestions] = useState([]);
  const [showDescSuggestions, setShowDescSuggestions] = useState(false);

  const [isSavedInCatalog, setIsSavedInCatalog] = useState(false);
  const [hsnError, setHsnError] = useState('');
  const [hsnSuccess, setHsnSuccess] = useState('');

  const hsnContainerRef = useRef(null);
  const descContainerRef = useRef(null);
  const hsnDebounceRef = useRef(null);
  const descDebounceRef = useRef(null);

  // Close suggestion dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (hsnContainerRef.current && !hsnContainerRef.current.contains(e.target)) {
        setShowHsnSuggestions(false);
      }
      if (descContainerRef.current && !descContainerRef.current.contains(e.target)) {
        setShowDescSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (hsnDebounceRef.current) clearTimeout(hsnDebounceRef.current);
      if (descDebounceRef.current) clearTimeout(descDebounceRef.current);
    };
  }, []);

  // Atomically apply product details to row state
  const selectProduct = (prod) => {
    if (!prod) return;
    const newValues = {
      description: prod.name || item.description || '',
      hsn_sac: String(prod.hsn_sac || item.hsn_sac || ''),
      rate: prod.rate != null ? Number(prod.rate) : Number(item.rate || 0),
      quantity: prod.default_quantity != null ? Number(prod.default_quantity) : Number(item.quantity || 1)
    };

    if (typeof onBatchChange === 'function') {
      onBatchChange(index, newValues);
    } else {
      onChange(index, 'description', newValues.description);
      onChange(index, 'hsn_sac', newValues.hsn_sac);
      onChange(index, 'rate', newValues.rate);
      onChange(index, 'quantity', newValues.quantity);
    }

    setHsnError('');
    setHsnSuccess(`Found: ${prod.name}`);
    setShowHsnSuggestions(false);
    setShowDescSuggestions(false);
    setTimeout(() => setHsnSuccess(''), 3500);
  };

  // 1. HSN Input Change Handler
  const handleHsnChange = (val) => {
    onChange(index, 'hsn_sac', val);
    if (hsnError) setHsnError('');
    if (hsnSuccess) setHsnSuccess('');

    const trimmed = (val || '').trim();
    if (!trimmed) {
      setHsnSuggestions([]);
      setShowHsnSuggestions(false);
      return;
    }

    // Immediate local in-memory filter
    const localMatches = (catalogProducts || []).filter(p => {
      if (!p || !p.hsn_sac) return false;
      return String(p.hsn_sac).trim().toLowerCase().includes(trimmed.toLowerCase());
    });

    if (localMatches.length > 0) {
      setHsnSuggestions(localMatches);
      setShowHsnSuggestions(true);
    }

    // Debounced IPC query for complete DB & past invoices
    if (hsnDebounceRef.current) clearTimeout(hsnDebounceRef.current);
    hsnDebounceRef.current = setTimeout(async () => {
      try {
        const results = await ipcClient.searchProducts(trimmed);
        if (Array.isArray(results) && results.length > 0) {
          setHsnSuggestions(results);
          setShowHsnSuggestions(true);
        } else if (localMatches.length === 0) {
          setHsnSuggestions([]);
          setShowHsnSuggestions(false);
        }
      } catch (e) {
        if (localMatches.length === 0) setHsnSuggestions([]);
      }
    }, 120);
  };

  // HSN Enter Key Handler
  const handleHsnKeyDown = async (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const currentVal = (e.target.value || item.hsn_sac || '').trim();
      if (!currentVal) return;

      try {
        const match = await ipcClient.getProductByHsn(currentVal);
        if (match) {
          selectProduct(match);
        } else {
          setHsnError('No product found for this HSN number');
        }
      } catch {
        setHsnError('No product found for this HSN number');
      }
      setShowHsnSuggestions(false);
    }
  };

  // HSN Blur Handler
  const handleHsnBlur = async (e) => {
    const currentVal = (e.target.value || item.hsn_sac || '').trim();
    if (!currentVal) {
      setHsnError('');
      return;
    }

    // If description is empty or user typed full HSN, attempt autofill
    if (!item.description || item.description.trim() === '') {
      try {
        const match = await ipcClient.getProductByHsn(currentVal);
        if (match) {
          selectProduct(match);
        } else {
          setHsnError('No product found for this HSN');
        }
      } catch {}
    }
  };

  // 2. Description Input Change Handler
  const handleDescChange = (val) => {
    const limitedVal = (val || '').slice(0, FEATURE_FLAGS.MAX_PRODUCT_NAME_LENGTH || 60);
    onChange(index, 'description', limitedVal);
    const trimmed = limitedVal.trim();

    if (!trimmed) {
      setDescSuggestions([]);
      setShowDescSuggestions(false);
      return;
    }

    const localMatches = (catalogProducts || []).filter(p => {
      if (!p || !p.name) return false;
      return p.name.toLowerCase().includes(trimmed.toLowerCase());
    });

    if (localMatches.length > 0) {
      setDescSuggestions(localMatches);
      setShowDescSuggestions(true);
    }

    if (descDebounceRef.current) clearTimeout(descDebounceRef.current);
    descDebounceRef.current = setTimeout(async () => {
      try {
        const results = await ipcClient.searchProducts(trimmed);
        if (Array.isArray(results) && results.length > 0) {
          setDescSuggestions(results);
          setShowDescSuggestions(true);
        } else if (localMatches.length === 0) {
          setDescSuggestions([]);
          setShowDescSuggestions(false);
        }
      } catch (e) {
        if (localMatches.length === 0) setDescSuggestions([]);
      }
    }, 150);
  };

  // 3. Quick-Save new custom product to catalog
  const handleQuickSaveToCatalog = async () => {
    const name = (item.description || '').trim();
    const hsn = (item.hsn_sac || '').trim();
    if (!name || !hsn) return;

    try {
      await ipcClient.saveProduct({
        name,
        hsn_sac: hsn,
        default_quantity: Number(item.quantity) || 1,
        rate: Number(item.rate) || 0
      });
      setIsSavedInCatalog(true);
      setHsnError('');
      if (typeof onCatalogUpdated === 'function') onCatalogUpdated();
      setTimeout(() => setIsSavedInCatalog(false), 3500);
    } catch (e) {
      console.error('Failed to quick-save product:', e);
    }
  };

  const itemDesc = (item.description || '').trim().toLowerCase();
  const itemHsn = (item.hsn_sac || '').trim().toLowerCase();

  const isAlreadyInCatalog = Boolean(
    (catalogProducts || []).some(p => {
      if (!p) return false;
      const pHsn = String(p.hsn_sac || '').trim().toLowerCase();
      const pName = String(p.name || '').trim().toLowerCase();
      return (pHsn === itemHsn && pName === itemDesc) || (pHsn === itemHsn && itemDesc.length > 0);
    })
  );

  const isNewCustomProduct = Boolean(itemDesc && itemHsn && !isAlreadyInCatalog);

  return (
    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors align-top">
      {/* 1. S.No */}
      <td className="px-3 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 border-r border-slate-200 dark:border-slate-800">
        {index + 1}
      </td>

      {/* 2. Description with Auto-Suggest & Character Limit */}
      <td className="px-3 py-3 border-r border-slate-200 dark:border-slate-800 relative" ref={descContainerRef}>
        <div className="relative">
          <input
            type="text"
            placeholder="Description of Goods / Services"
            maxLength={FEATURE_FLAGS.MAX_PRODUCT_NAME_LENGTH || 60}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg pl-2.5 pr-12 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-sky-500 shadow-none font-medium"
            value={item.description || ''}
            onChange={(e) => handleDescChange(e.target.value)}
            onFocus={() => {
              if (item.description && item.description.trim().length >= 1) {
                handleDescChange(item.description);
              }
            }}
          />
          <span 
            className={`absolute right-2 top-1/2 -translate-y-1/2 text-[9.5px] font-mono select-none pointer-events-none ${
              (item.description || '').length >= (FEATURE_FLAGS.MAX_PRODUCT_NAME_LENGTH || 60)
                ? 'text-amber-600 dark:text-amber-400 font-bold'
                : 'text-slate-400 dark:text-slate-500'
            }`}
            title={`Character limit: ${FEATURE_FLAGS.MAX_PRODUCT_NAME_LENGTH || 60}`}
          >
            {(item.description || '').length}/{FEATURE_FLAGS.MAX_PRODUCT_NAME_LENGTH || 60}
          </span>
        </div>

        {FEATURE_FLAGS.DETAILS_PANEL_ENABLED && showDescSuggestions && descSuggestions.length > 0 && (
          <div className="absolute left-3 right-3 top-full z-50 mt-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl max-h-48 overflow-y-auto divide-y divide-slate-200 dark:divide-slate-800 text-left">
            <div className="p-1.5 text-[9.5px] font-bold uppercase tracking-wider bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Matching Catalog Items:</span>
            </div>
            {descSuggestions.map((p, idx) => (
              <div
                key={p.id || idx}
                onMouseDown={(e) => {
                  e.preventDefault();
                  selectProduct(p);
                }}
                className="p-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-between gap-2"
              >
                <div>
                  <div className="font-bold text-xs text-slate-900 dark:text-slate-100">{p.name}</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">HSN: {p.hsn_sac}</div>
                </div>
                <div className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400 shrink-0">
                  ₹{Number(p.rate || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Inline Quick Save to Catalog - ONLY for new products not yet in catalog */}
        {FEATURE_FLAGS.DETAILS_PANEL_ENABLED && (isNewCustomProduct || isSavedInCatalog) && (
          <div className="mt-1">
            {isSavedInCatalog ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                <Check className="w-3 h-3" />
                <span>Saved to Product Catalog!</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={handleQuickSaveToCatalog}
                className="inline-flex items-center gap-1 text-[10px] font-bold text-sky-600 dark:text-sky-400 hover:text-sky-700 hover:underline cursor-pointer"
                title="Save this new item and HSN to product master catalog"
              >
                <Plus className="w-3 h-3" />
                <span>Save to Product Catalog</span>
              </button>
            )}
          </div>
        )}
      </td>

      {/* 3. HSN / SAC (Restricted Dropdown when locked, Auto-Suggest input when unlocked) */}
      <td className="px-3 py-3 border-r border-slate-200 dark:border-slate-800 relative" ref={hsnContainerRef}>
        {!FEATURE_FLAGS.DETAILS_PANEL_ENABLED ? (
          <div>
            <select
              className={`w-full bg-slate-50 dark:bg-slate-800 border rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 text-left focus:outline-none shadow-none font-medium cursor-pointer transition-colors ${
                !item.hsn_sac
                  ? 'border-rose-400 dark:border-rose-600 focus:border-rose-500 bg-rose-50/20'
                  : 'border-slate-300 dark:border-slate-700 focus:border-sky-500'
              }`}
              value={item.hsn_sac || ''}
              onChange={(e) => onChange(index, 'hsn_sac', e.target.value)}
              required
            >
              <option value="" className="text-slate-500">Select HSN *</option>
              {FEATURE_FLAGS.ALLOWED_HSN_CODES.map((code) => (
                <option key={code} value={code} className="font-mono font-bold text-slate-900 dark:text-slate-100">
                  {code}
                </option>
              ))}
            </select>
            {!item.hsn_sac && (
              <div className="text-[9px] text-rose-500 font-semibold mt-0.5 text-left pl-1">Required *</div>
            )}
          </div>
        ) : (
          <>
            <input
              type="text"
              placeholder="HSN Code"
              title="Type HSN code or press Enter to auto-fill product details"
              className={`w-full bg-slate-50 dark:bg-slate-800 border rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 text-left placeholder-slate-400 focus:outline-none shadow-none font-mono font-bold ${
                hsnError 
                  ? 'border-rose-400 dark:border-rose-600 focus:border-rose-500' 
                  : 'border-slate-300 dark:border-slate-700 focus:border-sky-500'
              }`}
              value={item.hsn_sac || ''}
              onChange={(e) => handleHsnChange(e.target.value)}
              onKeyDown={handleHsnKeyDown}
              onBlur={handleHsnBlur}
              onFocus={() => {
                if (item.hsn_sac && item.hsn_sac.trim().length >= 1) {
                  handleHsnChange(item.hsn_sac);
                }
              }}
            />

            {/* HSN Suggestions Dropdown */}
            {showHsnSuggestions && hsnSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full z-50 mt-1 min-w-[220px] rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl max-h-48 overflow-y-auto divide-y divide-slate-200 dark:divide-slate-800 text-left">
                <div className="p-1.5 text-[9.5px] font-bold uppercase tracking-wider bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-500" />
                  <span>Matching HSN Products:</span>
                </div>
                {hsnSuggestions.map((p, idx) => (
                  <div
                    key={p.id || idx}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      selectProduct(p);
                    }}
                    className="p-2.5 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                        {p.hsn_sac}
                      </span>
                      <span className="text-[11px] font-bold font-mono text-slate-800 dark:text-slate-200">
                        ₹{Number(p.rate || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 mt-1 truncate">
                      {p.name}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Not Found Error */}
            {hsnError && (
              <div className="mt-1 flex items-start gap-1 text-[10px] font-semibold text-rose-600 dark:text-rose-400 leading-tight">
                <AlertCircle className="w-3 h-3 shrink-0 mt-0.5" />
                <span>{hsnError}</span>
              </div>
            )}

            {/* Found Success Badge */}
            {hsnSuccess && (
              <div className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 truncate">
                <Check className="w-3 h-3 shrink-0" />
                <span className="truncate">{hsnSuccess}</span>
              </div>
            )}
          </>
        )}
      </td>

      {/* 4. Quantity */}
      <td className="px-3 py-3 border-r border-slate-200 dark:border-slate-800">
        <input
          type="number"
          step="any"
          min="0"
          placeholder="Qty"
          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 text-right placeholder-slate-400 focus:outline-none focus:border-sky-500 shadow-none font-mono"
          value={item.quantity || ''}
          onChange={(e) => onChange(index, 'quantity', parseFloat(e.target.value) || 0)}
        />
      </td>

      {/* 5. Rate */}
      <td className="px-3 py-3 border-r border-slate-200 dark:border-slate-800">
        <input
          type="number"
          step="any"
          min="0"
          placeholder="Rate"
          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 text-right placeholder-slate-400 focus:outline-none focus:border-sky-500 shadow-none font-mono font-medium"
          value={item.rate || ''}
          onChange={(e) => onChange(index, 'rate', parseFloat(e.target.value) || 0)}
        />
      </td>

      {/* 6. Amount */}
      <td className="px-3 py-3 text-right font-bold text-slate-900 dark:text-slate-100 text-xs border-r border-slate-200 dark:border-slate-800 font-mono">
        ₹{lineAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
      </td>

      {/* 7. Delete Action */}
      <td className="px-3 py-3 text-center">
        <button
          onClick={() => onDelete(index)}
          disabled={!canDelete}
          className="p-1 rounded text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors cursor-pointer"
          title="Remove Item"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </td>
    </tr>
  );
}
