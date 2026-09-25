import React from 'react';
import { Search, RotateCcw, FileText } from 'lucide-react';
import { Select } from '../common/Select';
import { Input } from '../common/Input';

export function HistoryFilters({
  search = '',
  setSearch,
  totalCount = 0,
  filters = {},
  setFilters,
  onReset
}) {
  const hasActiveFilters = Boolean(search || filters.invoiceType || filters.startDate || filters.endDate);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-300 dark:border-slate-700 shadow-none">
      {/* Left Section: Search Input + Total Count Pill */}
      <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[300px]">
        <div className="w-full sm:w-80">
          <Input
            icon={Search}
            placeholder="Search invoice no, buyer, or GSTIN..."
            value={search}
            onChange={(e) => setSearch && setSearch(e.target.value)}
          />
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
          <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>Total Count:</span>
          <span className="font-extrabold text-slate-950 dark:text-white px-2 py-0.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md text-xs">
            {totalCount}
          </span>
        </div>
      </div>

      {/* Right Section: Type Filter + Date Range + Reset */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="w-44">
          <Select
            value={filters.invoiceType || ''}
            onChange={(e) => setFilters && setFilters({ ...filters, invoiceType: e.target.value })}
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
            onChange={(e) => setFilters && setFilters({ ...filters, startDate: e.target.value })}
          />
        </div>

        <div className="w-36">
          <Input
            type="date"
            placeholder="End Date"
            value={filters.endDate || ''}
            onChange={(e) => setFilters && setFilters({ ...filters, endDate: e.target.value })}
          />
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 dark:text-rose-400 font-bold cursor-pointer px-2.5 py-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        )}
      </div>
    </div>
  );
}

