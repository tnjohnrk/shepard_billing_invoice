import React from 'react';
import { Select } from '../common/Select';
import { Input } from '../common/Input';

export function HistoryFilters({ filters, setFilters }) {
  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-300 dark:border-slate-700 shadow-none">
      <div className="w-40">
        <Select
          value={filters.invoiceType || ''}
          onChange={(e) => setFilters({ ...filters, invoiceType: e.target.value })}
          options={[
            { value: '', label: 'All Document Types' },
            { value: 'NORMAL', label: 'Tax Invoices' },
            { value: 'PROFORMA', label: 'Proforma Invoices' }
          ]}
        />
      </div>

      <div className="w-36">
        <Input
          type="date"
          placeholder="Start Date"
          value={filters.startDate || ''}
          onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
        />
      </div>

      <div className="w-36">
        <Input
          type="date"
          placeholder="End Date"
          value={filters.endDate || ''}
          onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
        />
      </div>

      {(filters.invoiceType || filters.startDate || filters.endDate) && (
        <button
          onClick={() => setFilters({ invoiceType: '', startDate: '', endDate: '' })}
          className="text-xs text-rose-400 hover:text-rose-300 font-semibold cursor-pointer underline px-2"
        >
          Reset Filters
        </button>
      )}
    </div>
  );
}
