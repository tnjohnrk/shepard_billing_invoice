import React from 'react';
import { Eye, Printer, FileDown, FileSpreadsheet, Copy, ArrowRightLeft, Trash2 } from 'lucide-react';

export function HistoryActions({ invoice, onView, onPrint, onPdf, onExcel, onDuplicate, onConvert, onDelete }) {
  const isProforma = String(invoice.invoice_type).toUpperCase() === 'PROFORMA';

  return (
    <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => onView(invoice)}
        className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-[#21262d] transition-colors"
        title="View / Preview"
      >
        <Eye className="w-4 h-4" />
      </button>

      <button
        onClick={() => onPrint(invoice)}
        className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-[#21262d] transition-colors"
        title="Print Document"
      >
        <Printer className="w-4 h-4" />
      </button>

      <button
        onClick={() => onPdf(invoice)}
        className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-[#21262d] transition-colors"
        title="Export PDF"
      >
        <FileDown className="w-4 h-4" />
      </button>

      <button
        onClick={() => onExcel(invoice)}
        className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-[#21262d] transition-colors"
        title="Export Excel"
      >
        <FileSpreadsheet className="w-4 h-4" />
      </button>

      {!isProforma ? (
        <button
          onClick={() => onDuplicate(invoice)}
          className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-[#21262d] transition-colors"
          title="Duplicate Invoice"
        >
          <Copy className="w-4 h-4" />
        </button>
      ) : (
        <button
          onClick={() => onConvert(invoice)}
          className="rounded-lg text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-[#30363d] transition-colors flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 bg-slate-100 dark:bg-[#21262d] border border-slate-300 dark:border-[#30363d]"
          title="Convert Proforma to Tax Invoice"
        >
          <ArrowRightLeft className="w-3.5 h-3.5" />
          <span>Convert</span>
        </button>
      )}

      {onDelete && (
        <button
          onClick={() => onDelete(invoice)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
          title="Delete (Move to Recycle Bin)"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
