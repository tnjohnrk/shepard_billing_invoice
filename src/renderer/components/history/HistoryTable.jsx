import React from 'react';
import { Table } from '../common/Table';
import { HistoryActions } from './HistoryActions';

export function HistoryTable({ invoices = [], onView, onPrint, onPdf, onExcel, onDuplicate, onConvert }) {
  const headers = [
    { label: 'Doc Number' },
    { label: 'Date' },
    { label: 'Buyer Name' },
    { label: 'Type' },
    { label: 'Grand Total (₹)', align: 'right' },
    { label: 'Actions', align: 'right' }
  ];

  return (
    <Table headers={headers}>
      {invoices.map((inv) => {
        const isProforma = String(inv.invoice_type).toUpperCase() === 'PROFORMA';
        const docNum = isProforma ? (inv.proforma_number || inv.invoice_number) : (inv.invoice_number || inv.proforma_number);
        const docDate = (isProforma ? inv.proforma_date : inv.invoice_date) || inv.invoice_date || inv.proforma_date;

        return (
          <tr
            key={inv.id}
            onClick={() => onView(inv)}
            className="hover:bg-slate-800/50 cursor-pointer transition-colors"
          >
            <td className="px-4 py-3.5 font-bold text-indigo-400">{docNum}</td>
            <td className="px-4 py-3.5 text-slate-300">{docDate}</td>
            <td className="px-4 py-3.5 font-medium text-slate-100">
              <div>{inv.buyer_name}</div>
              {inv.customer_gstin && <div className="text-[10px] text-slate-400 font-mono">GSTIN: {inv.customer_gstin}</div>}
            </td>
            <td className="px-4 py-3.5">
              <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                isProforma 
                  ? 'bg-cyan-950 text-cyan-400 border border-cyan-800/40' 
                  : 'bg-indigo-950 text-indigo-400 border border-indigo-800/40'
              }`}>
                {isProforma ? 'PROFORMA' : (inv.invoice_type || 'NORMAL')}
              </span>
            </td>
            <td className="px-4 py-3.5 text-right font-bold text-emerald-400">
              ₹{Number(inv.grand_total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </td>
            <td className="px-4 py-3.5 text-right">
              <HistoryActions
                invoice={inv}
                onView={onView}
                onPrint={onPrint}
                onPdf={onPdf}
                onExcel={onExcel}
                onDuplicate={onDuplicate}
                onConvert={onConvert}
              />
            </td>
          </tr>
        );
      })}
    </Table>
  );
}
