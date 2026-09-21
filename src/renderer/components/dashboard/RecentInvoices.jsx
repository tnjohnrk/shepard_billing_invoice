import React from 'react';
import { Table } from '../common/Table';

export function RecentInvoices({ invoices = [], onViewInvoice }) {
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
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Recent Invoices</h3>
        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">All Document Types</span>
      </div>

      {invoices.length === 0 ? (
        <div className="text-xs text-slate-400 text-center py-8">No recent invoices recorded yet.</div>
      ) : (
        <Table headers={headers}>
          {invoices.map((inv, idx) => {
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
