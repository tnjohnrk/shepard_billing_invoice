import React, { useState, useMemo } from 'react';
import { Table } from '../common/Table';
import { Search, X, ArrowUpRight, FileText } from 'lucide-react';

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
    { label: '#', align: 'center' },
    { label: 'Document' },
    { label: 'Date' },
    { label: 'Customer / Buyer' },
    { label: 'Status / Type' },
    { label: 'Amount (₹)', align: 'right' }
  ];

  return (
    <div className="p-4 bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] shadow-xs">
      {/* Header & Filter Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3.5 pb-3 border-b border-slate-100 dark:border-[#30363d]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-[#21262d] border border-slate-200 dark:border-[#30363d] flex items-center justify-center text-slate-600 dark:text-slate-300">
            <FileText className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            Recent Invoices
          </h3>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#21262d] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-[#30363d]">
            {filteredInvoices.length} docs
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search recent..."
              className="pl-8 pr-7 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-[#30363d] bg-slate-50/50 dark:bg-[#0d1117] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 w-36 sm:w-44 placeholder:text-slate-400 dark:placeholder:text-slate-500"
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
          <div className="flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-[#21262d] border border-slate-200/80 dark:border-[#30363d]">
            <button
              type="button"
              onClick={() => setDocTypeFilter('ALL')}
              className={`px-2 py-1 text-[11px] font-semibold rounded-md transition-all cursor-pointer ${
                docTypeFilter === 'ALL'
                  ? 'bg-white dark:bg-[#30363d] text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setDocTypeFilter('TAX')}
              className={`px-2 py-1 text-[11px] font-semibold rounded-md transition-all cursor-pointer ${
                docTypeFilter === 'TAX'
                  ? 'bg-white dark:bg-[#30363d] text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              Tax Invoices
            </button>
            <button
              type="button"
              onClick={() => setDocTypeFilter('PROFORMA')}
              className={`px-2 py-1 text-[11px] font-semibold rounded-md transition-all cursor-pointer ${
                docTypeFilter === 'PROFORMA'
                  ? 'bg-white dark:bg-[#30363d] text-slate-900 dark:text-slate-100 shadow-xs'
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
                className="hover:bg-slate-50/80 dark:hover:bg-[#21262d]/60 cursor-pointer transition-colors group"
              >
                <td className="px-3 py-2.5 text-center font-bold text-slate-400 dark:text-slate-500 text-[11px] border-r border-slate-200 dark:border-[#30363d]">{idx + 1}</td>
                <td className="px-3.5 py-2.5 font-semibold text-slate-900 dark:text-slate-100 font-mono text-xs border-r border-slate-200 dark:border-[#30363d]">
                  <div className="flex items-center gap-1.5">
                    <span>{docNum}</span>
                    <ArrowUpRight className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </td>
                <td className="px-3.5 py-2.5 text-slate-600 dark:text-slate-400 font-mono text-[11px] border-r border-slate-200 dark:border-[#30363d]">{docDate}</td>
                <td className="px-3.5 py-2.5 font-medium text-slate-800 dark:text-slate-200 border-r border-slate-200 dark:border-[#30363d]">{inv.buyer_name}</td>
                <td className="px-3.5 py-2.5 border-r border-slate-200 dark:border-[#30363d]">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-[#21262d] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#30363d]">
                    <span>{isProforma ? 'PROFORMA' : 'TAX INVOICE'}</span>
                  </span>
                </td>
                <td className="px-3.5 py-2.5 text-right font-bold text-slate-900 dark:text-slate-100 font-mono">
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
