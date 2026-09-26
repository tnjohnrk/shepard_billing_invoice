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

  // Description auto-suggest dropdown states
  const [descSuggestions, setDescSuggestions] = useState([]);
  const [showDescSuggestions, setShowDescSuggestions] = useState(false);
  const [isSavedInCatalog, setIsSavedInCatalog] = useState(false);

  const descContainerRef = useRef(null);
  const descDebounceRef = useRef(null);

  // Close suggestion dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (descContainerRef.current && !descContainerRef.current.contains(e.target)) {
        setShowDescSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
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

    setShowDescSuggestions(false);
  };

  // 2. Description Input Change Handler
  const handleDescChange = (val) => {
    onChange(index, 'description', val || '');
    const trimmed = (val || '').trim();

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

      {/* 2. Description with Auto-Suggest (No character limits, fluid multiline wrap) */}
      <td className="px-3 py-3 border-r border-slate-200 dark:border-slate-800 relative" ref={descContainerRef}>
        <div className="relative">
          <input
            type="text"
            placeholder="Description of Goods / Services"
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-sky-500 shadow-none font-medium"
            value={item.description || ''}
            onChange={(e) => handleDescChange(e.target.value)}
            onFocus={() => {
              if (item.description && item.description.trim().length >= 1) {
                handleDescChange(item.description);
              }
            }}
          />
        </div>

        {showDescSuggestions && descSuggestions.length > 0 && (
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

        {/* Inline Quick Save to Catalog */}
        {(isNewCustomProduct || isSavedInCatalog) && (
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

      {/* 3. HSN / SAC (Pure Manual Entry, Mandatory Required, No Suggestions) */}
      <td className="px-3 py-3 border-r border-slate-200 dark:border-slate-800">
        <input
          type="text"
          placeholder="HSN / SAC *"
          title="Enter HSN/SAC code (Mandatory)"
          className={`w-full bg-slate-50 dark:bg-slate-800 border rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 text-left placeholder-slate-400 focus:outline-none shadow-none font-mono font-bold ${
            !item.hsn_sac || !String(item.hsn_sac).trim()
              ? 'border-rose-400 dark:border-rose-600 focus:border-rose-500 bg-rose-50/20' 
              : 'border-slate-300 dark:border-slate-700 focus:border-sky-500'
          }`}
          value={item.hsn_sac || ''}
          onChange={(e) => onChange(index, 'hsn_sac', e.target.value)}
          required
        />

        {/* Missing HSN indicator */}
        {(!item.hsn_sac || !String(item.hsn_sac).trim()) && (
          <div className="text-[9px] text-rose-500 font-semibold mt-0.5 text-left pl-0.5">
            Required *
          </div>
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
