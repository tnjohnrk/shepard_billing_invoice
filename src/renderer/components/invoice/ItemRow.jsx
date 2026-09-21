import React from 'react';
import { Trash2 } from 'lucide-react';
import { calculateLineAmount } from '../../../shared/utils/sharedCalculations';

export function ItemRow({ index, item, onChange, onDelete, canDelete }) {
  const lineAmount = calculateLineAmount(item.quantity, item.rate);

  return (
    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
      <td className="px-3 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 border-r border-slate-200 dark:border-slate-800">
        {index + 1}
      </td>
      <td className="px-3 py-3 border-r border-slate-200 dark:border-slate-800">
        <input
          type="text"
          placeholder="Description of Goods / Services"
          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-sky-500 shadow-none font-medium"
          value={item.description || ''}
          onChange={(e) => onChange(index, 'description', e.target.value)}
        />
      </td>
      <td className="px-3 py-3 border-r border-slate-200 dark:border-slate-800">
        <input
          type="text"
          placeholder="HSN/SAC"
          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 text-center placeholder-slate-400 focus:outline-none focus:border-sky-500 shadow-none font-mono"
          value={item.hsn_sac || ''}
          onChange={(e) => onChange(index, 'hsn_sac', e.target.value)}
        />
      </td>
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
      <td className="px-3 py-3 border-r border-slate-200 dark:border-slate-800">
        <input
          type="number"
          step="any"
          min="0"
          placeholder="Rate"
          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 text-right placeholder-slate-400 focus:outline-none focus:border-sky-500 shadow-none font-mono"
          value={item.rate || ''}
          onChange={(e) => onChange(index, 'rate', parseFloat(e.target.value) || 0)}
        />
      </td>
      <td className="px-3 py-3 text-right font-bold text-slate-900 dark:text-slate-100 text-xs border-r border-slate-200 dark:border-slate-800">
        ₹{lineAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
      </td>
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
