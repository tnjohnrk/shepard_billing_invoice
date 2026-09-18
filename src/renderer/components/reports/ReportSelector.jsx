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
    <div className="flex flex-wrap items-center gap-2 p-1.5 glass-panel rounded-xl border border-slate-800">
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
