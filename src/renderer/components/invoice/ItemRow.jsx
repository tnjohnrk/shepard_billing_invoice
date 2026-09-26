import React from 'react';
import { Trash2 } from 'lucide-react';
import { calculateLineAmount } from '../../../shared/utils/sharedCalculations';

export function ItemRow({ 
  index, 
  item, 
  onChange, 
  onDelete, 
  canDelete 
}) {
  const lineAmount = calculateLineAmount(item.quantity, item.rate);

  return (
    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors align-top">
      {/* 1. S.No */}
      <td className="px-3 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 border-r border-slate-200 dark:border-slate-800">
        {index + 1}
      </td>

      {/* 2. Description (Manual entry, fluid wrapping, no character limit) */}
      <td className="px-3 py-3 border-r border-slate-200 dark:border-slate-800">
        <input
          type="text"
          placeholder="Description of Goods / Services"
          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-sky-500 shadow-none font-medium"
          value={item.description || ''}
          onChange={(e) => onChange(index, 'description', e.target.value)}
        />
      </td>

      {/* 3. HSN / SAC (Pure Manual Entry, Strictly Mandatory, Integers Only) */}
      <td className="px-3 py-3 border-r border-slate-200 dark:border-slate-800">
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="HSN Code *"
          title="HSN Code (Digits Only, Mandatory)"
          className={`w-full bg-slate-50 dark:bg-slate-800 border rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 text-left placeholder-slate-400 focus:outline-none shadow-none font-mono font-bold transition-colors ${
            !item.hsn_sac || !String(item.hsn_sac).trim()
              ? 'border-rose-500 bg-rose-50/40 dark:bg-rose-950/30 ring-1 ring-rose-500/20 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/40' 
              : 'border-slate-300 dark:border-slate-700 focus:border-sky-500'
          }`}
          value={item.hsn_sac || ''}
          onChange={(e) => {
            const onlyDigits = e.target.value.replace(/\D/g, '');
            onChange(index, 'hsn_sac', onlyDigits);
          }}
          onKeyDown={(e) => {
            if (['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Enter', 'Escape'].includes(e.key) ||
                (e.ctrlKey || e.metaKey)) {
              return;
            }
            if (!/^[0-9]$/.test(e.key)) {
              e.preventDefault();
            }
          }}
          required
        />

        {/* Missing HSN indicator */}
        {(!item.hsn_sac || !String(item.hsn_sac).trim()) && (
          <div className="text-[10px] text-rose-600 dark:text-rose-400 font-bold mt-1 text-left flex items-center gap-1">
            <span>* Mandatory</span>
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
