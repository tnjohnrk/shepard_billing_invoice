import React from 'react';
import { Table } from '../common/Table';

export function ReportTable({ invoices = [] }) {
  const headers = [
    { label: 'S.No', align: 'center' },
    { label: 'Doc Number' },
    { label: 'Date' },
    { label: 'Buyer Name' },
    { label: 'GSTIN' },
    { label: 'Taxable Amt (₹)', align: 'right' },
    { label: 'CGST (₹)', align: 'right' },
    { label: 'SGST (₹)', align: 'right' },
    { label: 'IGST (₹)', align: 'right' },
    { label: 'Grand Total (₹)', align: 'right' }
  ];

  return (
    <Table headers={headers}>
      {invoices.map((inv, idx) => (
        <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 text-xs transition-colors">
          <td className="px-3 py-3 text-center font-bold text-slate-500 dark:text-slate-400 border-r border-slate-200 dark:border-slate-800">{idx + 1}</td>
          <td className="px-4 py-3 font-bold text-slate-900 dark:text-slate-100 border-r border-slate-200 dark:border-slate-800">{inv.invoice_number || inv.proforma_number}</td>
          <td className="px-4 py-3 text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800">{inv.invoice_date || inv.proforma_date}</td>
          <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100 border-r border-slate-200 dark:border-slate-800">{inv.buyer_name}</td>
          <td className="px-4 py-3 font-mono text-slate-500 dark:text-slate-400 border-r border-slate-200 dark:border-slate-800">{inv.customer_gstin || 'N/A'}</td>
          <td className="px-4 py-3 text-right text-slate-900 dark:text-slate-100 font-medium border-r border-slate-200 dark:border-slate-800">₹{Number(inv.subtotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
          <td className="px-4 py-3 text-right text-slate-500 dark:text-slate-400 border-r border-slate-200 dark:border-slate-800">₹{Number(inv.cgst_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
          <td className="px-4 py-3 text-right text-slate-500 dark:text-slate-400 border-r border-slate-200 dark:border-slate-800">₹{Number(inv.sgst_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
          <td className="px-4 py-3 text-right text-slate-500 dark:text-slate-400 border-r border-slate-200 dark:border-slate-800">₹{Number(inv.igst_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
          <td className="px-4 py-3 text-right font-bold text-slate-900 dark:text-slate-100">
            ₹{Number(inv.grand_total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </td>
        </tr>
      ))}
    </Table>
  );
}
