import React from 'react';
import { Button } from '../common/Button';

export function ReportSelector({ activeType, onSelectType }) {
  const types = [
    { id: 'daily', label: 'Daily Report' },
    { id: 'monthly', label: 'Monthly Report' },
    { id: 'financialYear', label: 'Financial Year (Apr-Mar)' },
    { id: 'customer', label: 'Customer Billing Summary' }
  ];

  return (
    <div className="inline-flex flex-wrap items-center gap-1 p-1 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs w-fit">
      {types.map((t) => {
        const isActive = activeType === t.id;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onSelectType(t.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              isActive
                ? 'bg-indigo-600 text-white shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
