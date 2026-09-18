import React from 'react';
import { Trash2 } from 'lucide-react';
import { calculateLineAmount } from '../../../shared/utils/sharedCalculations';

export function ItemRow({ index, item, onChange, onDelete, canDelete }) {
  const lineAmount = calculateLineAmount(item.quantity, item.rate);

  return (
    <tr className="hover:bg-slate-800/40 transition-colors">
      <td className="px-3 py-3 text-center text-xs font-semibold text-slate-400">
        {index + 1}
      </td>
      <td className="px-3 py-3">
        <input
          type="text"
          placeholder="Description of Goods / Services"
          className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          value={item.description || ''}
          onChange={(e) => onChange(index, 'description', e.target.value)}
        />
      </td>
      <td className="px-3 py-3">
        <input
          type="text"
          placeholder="HSN/SAC"
          className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-100 text-center focus:outline-none focus:ring-1 focus:ring-indigo-500"
          value={item.hsn_sac || ''}
          onChange={(e) => onChange(index, 'hsn_sac', e.target.value)}
        />
      </td>
      <td className="px-3 py-3">
        <input
          type="number"
          step="any"
          min="0"
          placeholder="Qty"
          className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-100 text-right focus:outline-none focus:ring-1 focus:ring-indigo-500"
          value={item.quantity || ''}
          onChange={(e) => onChange(index, 'quantity', parseFloat(e.target.value) || 0)}
        />
      </td>
      <td className="px-3 py-3">
        <input
          type="number"
          step="any"
          min="0"
          placeholder="Rate"
          className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-100 text-right focus:outline-none focus:ring-1 focus:ring-indigo-500"
          value={item.rate || ''}
          onChange={(e) => onChange(index, 'rate', parseFloat(e.target.value) || 0)}
        />
      </td>
      <td className="px-3 py-3 text-right font-bold text-slate-100 text-xs">
        ₹{lineAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
      </td>
      <td className="px-3 py-3 text-center">
        <button
          onClick={() => onDelete(index)}
          disabled={!canDelete}
          className="p-1 rounded text-slate-400 hover:text-rose-400 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
          title="Remove Item"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </td>
    </tr>
  );
}
