import React from 'react';
import { Table } from '../common/Table';

export function ReportTable({ invoices = [] }) {
  const headers = [
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
      {invoices.map((inv) => (
        <tr key={inv.id} className="hover:bg-slate-800/40 text-xs">
          <td className="px-4 py-3 font-bold text-indigo-400">{inv.invoice_number || inv.proforma_number}</td>
          <td className="px-4 py-3 text-slate-300">{inv.invoice_date || inv.proforma_date}</td>
          <td className="px-4 py-3 font-medium text-slate-100">{inv.buyer_name}</td>
          <td className="px-4 py-3 font-mono text-slate-400">{inv.customer_gstin || 'N/A'}</td>
          <td className="px-4 py-3 text-right">₹{Number(inv.subtotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
          <td className="px-4 py-3 text-right text-slate-400">₹{Number(inv.cgst_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
          <td className="px-4 py-3 text-right text-slate-400">₹{Number(inv.sgst_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
          <td className="px-4 py-3 text-right text-slate-400">₹{Number(inv.igst_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
          <td className="px-4 py-3 text-right font-bold text-emerald-400">
            ₹{Number(inv.grand_total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </td>
        </tr>
      ))}
    </Table>
  );
}
