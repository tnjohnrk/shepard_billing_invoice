import React from 'react';
import { Table } from '../common/Table';

export function RecentInvoices({ invoices = [], onViewInvoice }) {
  const headers = [
    { label: 'Doc Number' },
    { label: 'Date' },
    { label: 'Buyer Name' },
    { label: 'Type' },
    { label: 'Amount (₹)', align: 'right' }
  ];

  return (
    <div className="p-5 glass-panel rounded-xl border border-slate-800 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-200">Recent Invoices</h3>
        <span className="text-[11px] text-slate-400 font-medium">All Document Types</span>
      </div>

      {invoices.length === 0 ? (
        <div className="text-xs text-slate-400 text-center py-8">No recent invoices recorded yet.</div>
      ) : (
        <Table headers={headers}>
          {invoices.map((inv) => {
            const isProforma = String(inv.invoice_type).toUpperCase() === 'PROFORMA';
            const docNum = isProforma ? (inv.proforma_number || inv.invoice_number) : (inv.invoice_number || inv.proforma_number);
            const docDate = (isProforma ? inv.proforma_date : inv.invoice_date) || inv.invoice_date || inv.proforma_date;

            return (
              <tr
                key={`${inv.id}-${inv.invoice_type || 'NORMAL'}`}
                onClick={() => onViewInvoice && onViewInvoice(inv)}
                className="hover:bg-slate-800/50 cursor-pointer transition-colors"
              >
                <td className="px-4 py-3 font-semibold text-indigo-400">{docNum}</td>
                <td className="px-4 py-3 text-slate-300">{docDate}</td>
                <td className="px-4 py-3 font-medium text-slate-100">{inv.buyer_name}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                    isProforma 
                      ? 'bg-cyan-950 text-cyan-400 border border-cyan-800/40' 
                      : 'bg-indigo-950 text-indigo-400 border border-indigo-800/40'
                  }`}>
                    {isProforma ? 'PROFORMA' : (inv.invoice_type || 'NORMAL')}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-bold text-emerald-400">
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
