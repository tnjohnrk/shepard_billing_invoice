import React from 'react';

export function ReportSummary({ stats }) {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Invoices Issued</div>
        <div className="text-xl font-extrabold text-slate-900 dark:text-slate-100 font-mono mt-1">{stats.invoiceCount || 0}</div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">{stats.proformaCount || 0} Proformas</div>
      </div>

      <div className="p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Taxable Amount</div>
        <div className="text-xl font-extrabold text-slate-900 dark:text-slate-100 font-mono mt-1">
          ₹{(stats.totalTaxable || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </div>
      </div>

      <div className="p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">GST Tax Collected</div>
        <div className="text-xl font-extrabold text-slate-900 dark:text-slate-100 font-mono mt-1">
          ₹{(stats.totalTax || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </div>
        <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 font-mono">
          CGST: ₹{stats.totalCgst || 0} | SGST: ₹{stats.totalSgst || 0} | IGST: ₹{stats.totalIgst || 0}
        </div>
      </div>

      <div className="p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Billing Revenue</div>
        <div className="text-xl font-extrabold text-slate-900 dark:text-slate-100 font-mono mt-1">
          ₹{(stats.totalBilling || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </div>
      </div>
    </div>
  );
}
