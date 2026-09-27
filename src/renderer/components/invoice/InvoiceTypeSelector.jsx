import React from 'react';
import { FileText, FileSpreadsheet, CheckCircle2, Circle } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export function InvoiceTypeSelector({ selectedType, onSelect }) {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const isNormal = selectedType === 'NORMAL';
  const isProforma = selectedType === 'PROFORMA';

  return (
    <div className="space-y-6 py-2">
      {/* Section Context Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <span>Select Document Type</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Choose whether you are generating a legal GST Tax Invoice or preparing a preliminary Proforma Estimate for your customer.
        </p>
      </div>

      {/* 2-Column Selection Cards Grid */}
      <div role="radiogroup" aria-label="Invoice Type Selection" className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Tax Invoice */}
        <div
          role="radio"
          aria-checked={isNormal}
          tabIndex={0}
          onClick={() => onSelect('NORMAL')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onSelect('NORMAL');
            }
          }}
          className={`group p-5 rounded-xl border cursor-pointer transition-all duration-150 flex flex-col justify-between shadow-xs min-h-[200px] ${
            isNormal
              ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/30 dark:border-indigo-500 ring-1 ring-indigo-500/20'
              : 'border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div>
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-lg border shrink-0 transition-colors ${
                  isNormal
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}>
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Tax Invoice (Standard)
                  </h3>
                  <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    Normal GST Document
                  </div>
                </div>
              </div>

              <div className="shrink-0 pt-0.5">
                {isNormal ? (
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 fill-indigo-100 dark:fill-indigo-950" />
                ) : (
                  <Circle className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                )}
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
              Official GST Tax Invoice for supply of goods/services. Computes CGST + SGST (Intra-State) or IGST (Inter-State) with legal compliance.
            </p>
          </div>

          <div className="flex items-center justify-between mt-5 pt-3 border-t border-slate-200/60 dark:border-slate-800/80">
            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
              isNormal
                ? 'bg-indigo-100/80 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
            }`}>
              Official Invoice
            </span>

            <span className={`text-xs font-semibold transition-colors ${
              isNormal
                ? 'text-indigo-600 dark:text-indigo-400'
                : 'text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300'
            }`}>
              {isNormal ? '✓ Selected' : 'Click to Select'}
            </span>
          </div>
        </div>

        {/* Card 2: Proforma Invoice */}
        <div
          role="radio"
          aria-checked={isProforma}
          tabIndex={0}
          onClick={() => onSelect('PROFORMA')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onSelect('PROFORMA');
            }
          }}
          className={`group p-5 rounded-xl border cursor-pointer transition-all duration-150 flex flex-col justify-between shadow-xs min-h-[200px] ${
            isProforma
              ? 'border-cyan-600 bg-cyan-50/40 dark:bg-cyan-950/30 dark:border-cyan-500 ring-1 ring-cyan-500/20'
              : 'border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div>
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-lg border shrink-0 transition-colors ${
                  isProforma
                    ? 'bg-cyan-600 text-white border-cyan-600'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}>
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Proforma Invoice
                  </h3>
                  <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    Estimate / Quotation
                  </div>
                </div>
              </div>

              <div className="shrink-0 pt-0.5">
                {isProforma ? (
                  <CheckCircle2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400 fill-cyan-100 dark:fill-cyan-950" />
                ) : (
                  <Circle className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                )}
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
              Preliminary quotation or estimate document prior to dispatch. Does not incur tax liability and can be easily converted to a Tax Invoice later.
            </p>
          </div>

          <div className="flex items-center justify-between mt-5 pt-3 border-t border-slate-200/60 dark:border-slate-800/80">
            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
              isProforma
                ? 'bg-cyan-100/80 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
            }`}>
              Estimate / Quotation
            </span>

            <span className={`text-xs font-semibold transition-colors ${
              isProforma
                ? 'text-cyan-600 dark:text-cyan-400'
                : 'text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300'
            }`}>
              {isProforma ? '✓ Selected' : 'Click to Select'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
