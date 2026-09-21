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
      <div role="radiogroup" aria-label="Invoice Type Selection" className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          className={`group p-6 rounded-2xl border-2 cursor-pointer transition-all duration-150 flex flex-col justify-between shadow-none min-h-[220px] ${
            isNormal
              ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/40 dark:border-emerald-500 ring-1 ring-emerald-500/20'
              : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-400 dark:hover:border-slate-600'
          }`}
        >
          <div>
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-3.5">
                <div className={`p-3 rounded-xl border shrink-0 transition-colors ${
                  isNormal
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}>
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Tax Invoice (Standard)
                  </h3>
                  <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    Normal GST Document
                  </div>
                </div>
              </div>

              <div className="shrink-0 pt-1">
                {isNormal ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 fill-emerald-100 dark:fill-emerald-950" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                )}
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
              Official GST Tax Invoice for supply of goods/services. Computes CGST + SGST (Intra-State) or IGST (Inter-State) with legal compliance.
            </p>
          </div>

          <div className="flex items-center justify-between mt-6 pt-3 border-t border-slate-200/80 dark:border-slate-800">
            <span className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
              isNormal
                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}>
              Official Invoice
            </span>

            <span className={`text-xs font-bold transition-colors ${
              isNormal
                ? 'text-emerald-700 dark:text-emerald-300'
                : 'text-slate-500 group-hover:text-slate-800 dark:group-hover:text-slate-200'
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
          className={`group p-6 rounded-2xl border-2 cursor-pointer transition-all duration-150 flex flex-col justify-between shadow-none min-h-[220px] ${
            isProforma
              ? 'border-teal-600 bg-teal-50/50 dark:bg-teal-950/40 dark:border-teal-500 ring-1 ring-teal-500/20'
              : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-400 dark:hover:border-slate-600'
          }`}
        >
          <div>
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-3.5">
                <div className={`p-3 rounded-xl border shrink-0 transition-colors ${
                  isProforma
                    ? 'bg-teal-600 text-white border-teal-600'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}>
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Proforma Invoice
                  </h3>
                  <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    Estimate / Quotation
                  </div>
                </div>
              </div>

              <div className="shrink-0 pt-1">
                {isProforma ? (
                  <CheckCircle2 className="w-5 h-5 text-teal-600 dark:text-teal-400 fill-teal-100 dark:fill-teal-950" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                )}
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
              Preliminary quotation or estimate document prior to dispatch. Does not incur tax liability and can be easily converted to a Tax Invoice later.
            </p>
          </div>

          <div className="flex items-center justify-between mt-6 pt-3 border-t border-slate-200/80 dark:border-slate-800">
            <span className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
              isProforma
                ? 'bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border-teal-300 dark:border-teal-800'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}>
              Estimate / Quotation
            </span>

            <span className={`text-xs font-bold transition-colors ${
              isProforma
                ? 'text-teal-700 dark:text-teal-300'
                : 'text-slate-500 group-hover:text-slate-800 dark:group-hover:text-slate-200'
            }`}>
              {isProforma ? '✓ Selected' : 'Click to Select'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
