import React, { useState, useMemo } from 'react';
import { Table } from '../common/Table';
import { Search, Filter, X } from 'lucide-react';

export function RecentInvoices({ invoices = [], onViewInvoice }) {
  const [docTypeFilter, setDocTypeFilter] = useState('ALL'); // 'ALL' | 'TAX' | 'PROFORMA'
  const [searchQuery, setSearchQuery] = useState('');

  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const isProforma = String(inv.invoice_type).toUpperCase() === 'PROFORMA';
      
      // Type filter
      if (docTypeFilter === 'TAX' && isProforma) return false;
      if (docTypeFilter === 'PROFORMA' && !isProforma) return false;

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const docNum = (isProforma ? (inv.proforma_number || inv.invoice_number) : (inv.invoice_number || inv.proforma_number)) || '';
        const buyer = inv.buyer_name || '';
        const date = (isProforma ? inv.proforma_date : inv.invoice_date) || inv.invoice_date || '';
        
        if (
          !docNum.toLowerCase().includes(q) &&
          !buyer.toLowerCase().includes(q) &&
          !date.toLowerCase().includes(q)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [invoices, docTypeFilter, searchQuery]);

  const headers = [
    { label: 'S.No', align: 'center' },
    { label: 'Doc Number' },
    { label: 'Date' },
    { label: 'Buyer Name' },
    { label: 'Type' },
    { label: 'Amount (₹)', align: 'right' }
  ];

  return (
    <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-300 dark:border-slate-700 shadow-none">
      {/* Header & Filter Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Recent Invoices</h3>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {filteredInvoices.length} docs
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Quick Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search recent..."
              className="pl-8 pr-7 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-36 sm:w-48 placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Document Type Filter Tabs */}
          <div className="flex items-center p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setDocTypeFilter('ALL')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                docTypeFilter === 'ALL'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setDocTypeFilter('TAX')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                docTypeFilter === 'TAX'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              Tax Invoices
            </button>
            <button
              type="button"
              onClick={() => setDocTypeFilter('PROFORMA')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                docTypeFilter === 'PROFORMA'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              Proformas
            </button>
          </div>
        </div>
      </div>

      {filteredInvoices.length === 0 ? (
        <div className="text-xs text-slate-400 text-center py-8">
          {searchQuery || docTypeFilter !== 'ALL'
            ? 'No invoices match your active search and filter criteria.'
            : 'No recent invoices recorded yet.'}
        </div>
      ) : (
        <Table headers={headers}>
          {filteredInvoices.map((inv, idx) => {
            const isProforma = String(inv.invoice_type).toUpperCase() === 'PROFORMA';
            const docNum = isProforma ? (inv.proforma_number || inv.invoice_number) : (inv.invoice_number || inv.proforma_number);
            const docDate = (isProforma ? inv.proforma_date : inv.invoice_date) || inv.invoice_date || inv.proforma_date;

            return (
              <tr
                key={`${inv.id}-${inv.invoice_type || 'NORMAL'}`}
                onClick={() => onViewInvoice && onViewInvoice(inv)}
                className="hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
              >
                <td className="px-3 py-3 text-center font-bold text-slate-500 dark:text-slate-400 border-r border-slate-200 dark:border-slate-800">{idx + 1}</td>
                <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100 border-r border-slate-200 dark:border-slate-800">{docNum}</td>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800">{docDate}</td>
                <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100 border-r border-slate-200 dark:border-slate-800">{inv.buyer_name}</td>
                <td className="px-4 py-3 border-r border-slate-200 dark:border-slate-800">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                    isProforma 
                      ? 'bg-cyan-50 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800' 
                      : 'bg-indigo-50 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                  }`}>
                    {isProforma ? 'PROFORMA' : (inv.invoice_type || 'NORMAL')}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-bold text-slate-900 dark:text-slate-100">
                  ₹{Number(inv.grand_total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            );
          })}
        </Table>
      )}
    </div>
  );
}
