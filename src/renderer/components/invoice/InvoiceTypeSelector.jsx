import React from 'react';
import { FileText, FileSpreadsheet } from 'lucide-react';

export function InvoiceTypeSelector({ selectedType, onSelect }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-4">
      <div
        onClick={() => onSelect('NORMAL')}
        className={`p-6 rounded-xl border cursor-pointer transition-all duration-200 glass-card flex items-start gap-4 ${
          selectedType === 'NORMAL'
            ? 'border-indigo-500 ring-2 ring-indigo-500/30 bg-indigo-950/20'
            : 'border-slate-800 hover:border-slate-700'
        }`}
      >
        <div className="p-3 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
          <FileText className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-100">Tax Invoice (Normal Invoice)</h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Official GST Tax Invoice for supply of goods/services. Computes CGST + SGST or IGST tax breakdown.
          </p>
          <span className="inline-block mt-3 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-950 text-indigo-400 border border-indigo-800/40">
            Standard Invoice
          </span>
        </div>
      </div>

      <div
        onClick={() => onSelect('PROFORMA')}
        className={`p-6 rounded-xl border cursor-pointer transition-all duration-200 glass-card flex items-start gap-4 ${
          selectedType === 'PROFORMA'
            ? 'border-cyan-500 ring-2 ring-cyan-500/30 bg-cyan-950/20'
            : 'border-slate-800 hover:border-slate-700'
        }`}
      >
        <div className="p-3 rounded-xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/30">
          <FileSpreadsheet className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-100">Proforma Invoice</h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Preliminary quotation or estimate document prior to supply. Can be converted to Tax Invoice later.
          </p>
          <span className="inline-block mt-3 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-cyan-950 text-cyan-400 border border-cyan-800/40">
            Estimate / Quotation
          </span>
        </div>
      </div>
    </div>
  );
}
