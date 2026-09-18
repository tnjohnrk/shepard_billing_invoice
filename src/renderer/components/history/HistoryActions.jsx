import React from 'react';
import { Eye, Printer, FileDown, FileSpreadsheet, Copy, ArrowRightLeft } from 'lucide-react';

export function HistoryActions({ invoice, onView, onPrint, onPdf, onExcel, onDuplicate, onConvert }) {
  const isProforma = String(invoice.invoice_type).toUpperCase() === 'PROFORMA';

  return (
    <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => onView(invoice)}
        className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
        title="View / Preview"
      >
        <Eye className="w-4 h-4" />
      </button>

      <button
        onClick={() => onPrint(invoice)}
        className="p-1.5 rounded-lg text-indigo-400 hover:text-indigo-300 hover:bg-indigo-950/60 transition-colors"
        title="Print Document"
      >
        <Printer className="w-4 h-4" />
      </button>

      <button
        onClick={() => onPdf(invoice)}
        className="p-1.5 rounded-lg text-cyan-400 hover:text-cyan-300 hover:bg-cyan-950/60 transition-colors"
        title="Export PDF"
      >
        <FileDown className="w-4 h-4" />
      </button>

      <button
        onClick={() => onExcel(invoice)}
        className="p-1.5 rounded-lg text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/60 transition-colors"
        title="Export Excel"
      >
        <FileSpreadsheet className="w-4 h-4" />
      </button>

      {!isProforma ? (
        <button
          onClick={() => onDuplicate(invoice)}
          className="p-1.5 rounded-lg text-amber-400 hover:text-amber-300 hover:bg-amber-950/60 transition-colors"
          title="Duplicate Invoice"
        >
          <Copy className="w-4 h-4" />
        </button>
      ) : (
        <button
          onClick={() => onConvert(invoice)}
          className="p-1.5 rounded-lg text-indigo-400 hover:text-indigo-300 hover:bg-indigo-950/60 transition-colors flex items-center gap-1 text-[11px] font-bold px-2 py-1 bg-indigo-950 border border-indigo-800/40"
          title="Convert Proforma to Tax Invoice"
        >
          <ArrowRightLeft className="w-3.5 h-3.5" />
          <span>Convert</span>
        </button>
      )}
    </div>
  );
}
