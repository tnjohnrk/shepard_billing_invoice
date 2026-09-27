import React from 'react';
import { Eye, Printer, FileDown, FileSpreadsheet, Copy, ArrowRightLeft, Trash2 } from 'lucide-react';

export function HistoryActions({ invoice, onView, onPrint, onPdf, onExcel, onDuplicate, onConvert, onDelete }) {
  const isProforma = String(invoice.invoice_type).toUpperCase() === 'PROFORMA';

  return (
    <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => onView(invoice)}
        className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        title="View / Preview"
      >
        <Eye className="w-4 h-4" />
      </button>

      <button
        onClick={() => onPrint(invoice)}
        className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 transition-colors"
        title="Print Document"
      >
        <Printer className="w-4 h-4" />
      </button>

      <button
        onClick={() => onPdf(invoice)}
        className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-300 hover:bg-cyan-50 dark:hover:bg-cyan-950/60 transition-colors"
        title="Export PDF"
      >
        <FileDown className="w-4 h-4" />
      </button>

      <button
        onClick={() => onExcel(invoice)}
        className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 transition-colors"
        title="Export Excel"
      >
        <FileSpreadsheet className="w-4 h-4" />
      </button>

      {!isProforma ? (
        <button
          onClick={() => onDuplicate(invoice)}
          className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/60 transition-colors"
          title="Duplicate Invoice"
        >
          <Copy className="w-4 h-4" />
        </button>
      ) : (
        <button
          onClick={() => onConvert(invoice)}
          className="p-1.5 rounded-lg text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors flex items-center gap-1 text-[11px] font-bold px-2 py-1 bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800/40"
          title="Convert Proforma to Tax Invoice"
        >
          <ArrowRightLeft className="w-3.5 h-3.5" />
          <span>Convert</span>
        </button>
      )}

      {onDelete && (
        <button
          onClick={() => onDelete(invoice)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors"
          title="Delete (Move to Recycle Bin)"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
