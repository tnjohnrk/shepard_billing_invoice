import React from 'react';
import { Table } from '../common/Table';
import { HistoryActions } from './HistoryActions';

export function HistoryTable({ invoices = [], page = 1, pageSize = 15, onView, onPrint, onPdf, onExcel, onDuplicate, onConvert, onDelete }) {
  const headers = [
    { label: 'S.No', align: 'center' },
    { label: 'Doc Number' },
    { label: 'Date' },
    { label: 'Buyer Name' },
    { label: 'Type' },
    { label: 'Grand Total (₹)', align: 'right' },
    { label: 'Actions', align: 'right' }
  ];

  return (
    <Table headers={headers}>
      {invoices.map((inv, idx) => {
        const isProforma = String(inv.invoice_type).toUpperCase() === 'PROFORMA';
        const docNum = isProforma ? (inv.proforma_number || inv.invoice_number) : (inv.invoice_number || inv.proforma_number);
        const docDate = (isProforma ? inv.proforma_date : inv.invoice_date) || inv.invoice_date || inv.proforma_date;
        const serialNo = (page - 1) * pageSize + idx + 1;

        return (
          <tr
            key={inv.id}
            onClick={() => onView(inv)}
            className="hover:bg-slate-50/80 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
          >
            <td className="px-3 py-3 text-center font-semibold text-slate-400 font-mono text-xs border-r border-slate-200 dark:border-slate-800">{serialNo}</td>
            <td className="px-4 py-3 font-bold text-slate-900 dark:text-slate-100 font-mono border-r border-slate-200 dark:border-slate-800">{docNum}</td>
            <td className="px-4 py-3 text-slate-600 dark:text-slate-400 font-mono text-xs border-r border-slate-200 dark:border-slate-800">{docDate}</td>
            <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100 border-r border-slate-200 dark:border-slate-800">
              <div className="font-semibold text-xs">{inv.buyer_name}</div>
              {inv.customer_gstin && <div className="text-[10px] text-slate-400 font-mono mt-0.5">GSTIN: {inv.customer_gstin}</div>}
            </td>
            <td className="px-4 py-3 border-r border-slate-200 dark:border-slate-800">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                isProforma 
                  ? 'bg-slate-100 dark:bg-[#21262d] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#30363d]' 
                  : 'bg-slate-100 dark:bg-[#21262d] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#30363d]'
              }`}>
                {isProforma ? 'PROFORMA' : (inv.invoice_type || 'NORMAL')}
              </span>
            </td>
            <td className="px-4 py-3 text-right font-bold text-slate-900 dark:text-slate-100 font-mono border-r border-slate-200 dark:border-slate-800">
              ₹{Number(inv.grand_total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </td>
            <td className="px-4 py-3 text-right">
              <HistoryActions
                invoice={inv}
                onView={onView}
                onPrint={onPrint}
                onPdf={onPdf}
                onExcel={onExcel}
                onDuplicate={onDuplicate}
                onConvert={onConvert}
                onDelete={onDelete}
              />
            </td>
          </tr>
        );
      })}
    </Table>
  );
}
