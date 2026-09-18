import React from 'react';

export function ReportSummary({ stats }) {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="p-4 glass-card rounded-xl border border-slate-800">
        <div className="text-xs font-semibold text-slate-400 uppercase">Invoices Issued</div>
        <div className="text-xl font-bold text-slate-100 mt-1">{stats.invoiceCount || 0}</div>
        <div className="text-[10px] text-slate-400 mt-0.5">{stats.proformaCount || 0} Proformas</div>
      </div>

      <div className="p-4 glass-card rounded-xl border border-slate-800">
        <div className="text-xs font-semibold text-slate-400 uppercase">Taxable Amount</div>
        <div className="text-xl font-bold text-slate-100 mt-1">
          ₹{(stats.totalTaxable || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </div>
      </div>

      <div className="p-4 glass-card rounded-xl border border-slate-800">
        <div className="text-xs font-semibold text-slate-400 uppercase">GST Tax Collected</div>
        <div className="text-xl font-bold text-indigo-400 mt-1">
          ₹{(stats.totalTax || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </div>
        <div className="text-[10px] text-slate-400 mt-0.5">
          CGST: ₹{stats.totalCgst || 0} | SGST: ₹{stats.totalSgst || 0} | IGST: ₹{stats.totalIgst || 0}
        </div>
      </div>

      <div className="p-4 glass-card rounded-xl border border-slate-800">
        <div className="text-xs font-semibold text-slate-400 uppercase">Total Billing Revenue</div>
        <div className="text-xl font-bold text-emerald-400 mt-1">
          ₹{(stats.totalBilling || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </div>
      </div>
    </div>
  );
}
