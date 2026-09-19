import React from 'react';
import { FileText, FileSpreadsheet, ArrowRight } from 'lucide-react';

export function InvoiceTypeSelector({ selectedType, onSelect }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-4">
      <div
        role="button"
        tabIndex={0}
        onClick={() => onSelect('NORMAL')}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect('NORMAL');
          }
        }}
        className={`group p-6 rounded-xl border cursor-pointer transition-all duration-200 glass-card flex items-start gap-4 hover:scale-[1.01] hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10 ${
          selectedType === 'NORMAL'
            ? 'border-indigo-500 ring-2 ring-indigo-500/30 bg-indigo-950/20'
            : 'border-slate-800 hover:border-slate-700'
        }`}
      >
        <div className="p-3 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 group-hover:bg-indigo-600/30 transition-colors">
          <FileText className="w-8 h-8" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-100">Tax Invoice (Normal Invoice)</h3>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
          </div>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Official GST Tax Invoice for supply of goods/services. Computes CGST + SGST or IGST tax breakdown.
          </p>
          <div className="flex items-center justify-between mt-3">
            <span className="inline-block px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-950 text-indigo-400 border border-indigo-800/40">
              Standard Invoice
            </span>
            <span className="text-xs text-indigo-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
              Select & Continue &rarr;
            </span>
          </div>
        </div>
      </div>

      <div
        role="button"
        tabIndex={0}
        onClick={() => onSelect('PROFORMA')}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect('PROFORMA');
          }
        }}
        className={`group p-6 rounded-xl border cursor-pointer transition-all duration-200 glass-card flex items-start gap-4 hover:scale-[1.01] hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/10 ${
          selectedType === 'PROFORMA'
            ? 'border-cyan-500 ring-2 ring-cyan-500/30 bg-cyan-950/20'
            : 'border-slate-800 hover:border-slate-700'
        }`}
      >
        <div className="p-3 rounded-xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 group-hover:bg-cyan-600/30 transition-colors">
          <FileSpreadsheet className="w-8 h-8" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-100">Proforma Invoice</h3>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
          </div>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Preliminary quotation or estimate document prior to supply. Can be converted to Tax Invoice later.
          </p>
          <div className="flex items-center justify-between mt-3">
            <span className="inline-block px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-cyan-950 text-cyan-400 border border-cyan-800/40">
              Estimate / Quotation
            </span>
            <span className="text-xs text-cyan-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
              Select & Continue &rarr;
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

