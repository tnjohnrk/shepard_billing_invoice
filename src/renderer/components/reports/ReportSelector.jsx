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
    <div className="inline-flex flex-wrap items-center gap-2 p-1.5 bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-300 dark:border-slate-700 shadow-none w-fit">
      {types.map((t) => (
        <Button
          key={t.id}
          variant={activeType === t.id ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => onSelectType(t.id)}
        >
          {t.label}
        </Button>
      ))}
    </div>
  );
}
