import React from 'react';
import { computeCompleteInvoiceTotals } from '../../../shared/utils/sharedCalculations';
import { SHEPHERD_DEFAULT_STATE_CODE } from '../../../shared/constants/application';
import { useTheme } from '../../context/ThemeContext';

export function TaxSection({
  items = [],
  customerStateCode,
  cgstRate = 9,
  sgstRate = 9,
  igstRate = 18,
  onChangeTaxRate
}) {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const totals = computeCompleteInvoiceTotals(
    items,
    SHEPHERD_DEFAULT_STATE_CODE,
    customerStateCode || '27',
    18,
    cgstRate,
    sgstRate,
    igstRate
  );

  const handleCgstChange = (val) => {
    const rate = parseFloat(val) || 0;
    if (onChangeTaxRate) {
      onChangeTaxRate('cgst_rate', rate);
      onChangeTaxRate('sgst_rate', rate);
    }
  };

  const handleSgstChange = (val) => {
    const rate = parseFloat(val) || 0;
    if (onChangeTaxRate) {
      onChangeTaxRate('sgst_rate', rate);
    }
  };

  const handleIgstChange = (val) => {
    const rate = parseFloat(val) || 0;
    if (onChangeTaxRate) {
      onChangeTaxRate('igst_rate', rate);
    }
  };

  const gstPresetsIntra = [
    { label: 'GST 0% (CGST 0% + SGST 0%)', cgst: 0, sgst: 0 },
    { label: 'GST 5% (CGST 2.5% + SGST 2.5%)', cgst: 2.5, sgst: 2.5 },
    { label: 'GST 12% (CGST 6% + SGST 6%)', cgst: 6, sgst: 6 },
    { label: 'GST 18% (CGST 9% + SGST 9%) - Default', cgst: 9, sgst: 9 },
    { label: 'GST 28% (CGST 14% + SGST 14%)', cgst: 14, sgst: 14 }
  ];

  const gstPresetsInter = [
    { label: 'IGST 0%', igst: 0 },
    { label: 'IGST 5%', igst: 5 },
    { label: 'IGST 12%', igst: 12 },
    { label: 'IGST 18% - Default', igst: 18 },
    { label: 'IGST 28%', igst: 28 }
  ];

  return (
    <div className="space-y-6">
      {/* GST Calculation Configuration Box */}
      <div className="p-5 glass-panel rounded-xl border border-slate-800 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
            GST Tax Rates & Calculation
          </h3>
          <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
            totals.isIntraState 
              ? isLight ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-indigo-950 text-indigo-400 border border-indigo-800/40'
              : isLight ? 'bg-cyan-50 text-cyan-700 border border-cyan-200' : 'bg-cyan-950 text-cyan-400 border border-cyan-800/40'
          }`}>
            {totals.isIntraState ? 'Intra-State Supply' : 'Inter-State Supply'}
          </span>
        </div>

        {totals.isIntraState ? (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {gstPresetsIntra.map((preset, idx) => {
                const isActive = totals.cgstRate === preset.cgst && totals.sgstRate === preset.sgst;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      if (onChangeTaxRate) {
                        onChangeTaxRate('cgst_rate', preset.cgst);
                        onChangeTaxRate('sgst_rate', preset.sgst);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                        : isLight
                        ? 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 hover:text-slate-900'
                        : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-200 hover:bg-slate-700'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  CGST Rate (%)
                </label>
                <div className="relative flex items-center">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={totals.cgstRate}
                    onChange={(e) => handleCgstChange(e.target.value)}
                  />
                  <span className="absolute right-3 text-xs text-slate-400 font-bold">%</span>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  SGST Rate (%)
                </label>
                <div className="relative flex items-center">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={totals.sgstRate}
                    onChange={(e) => handleSgstChange(e.target.value)}
                  />
                  <span className="absolute right-3 text-xs text-slate-400 font-bold">%</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {gstPresetsInter.map((preset, idx) => {
                const isActive = totals.igstRate === preset.igst;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      if (onChangeTaxRate) {
                        onChangeTaxRate('igst_rate', preset.igst);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
                        : isLight
                        ? 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 hover:text-slate-900'
                        : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-200 hover:bg-slate-700'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col gap-1 max-w-xs pt-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                IGST Rate (%)
              </label>
              <div className="relative flex items-center">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-bold focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  value={totals.igstRate}
                  onChange={(e) => handleIgstChange(e.target.value)}
                />
                <span className="absolute right-3 text-xs text-slate-400 font-bold">%</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Financial Summary & Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Left Column: Tax Category Status & Amount in Words */}
        <div className="space-y-3">
          <div className="p-3.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs shadow-sm">
            <span className="font-semibold text-slate-300">GST Category Status: </span>
            <span className="font-bold text-indigo-400">
              {totals.isIntraState
                ? `Intra-State Supply (CGST ${totals.cgstRate}% + SGST ${totals.sgstRate}%)`
                : `Inter-State Supply (IGST ${totals.igstRate}%)`}
            </span>
            <div className="text-[11px] text-slate-400 mt-1">
              Supplier State: 27 (Maharashtra) | Buyer State: {customerStateCode || '27'}
            </div>
          </div>

          <div className={`p-4 rounded-lg border text-xs shadow-sm ${
            isLight ? 'bg-indigo-50/70 border-indigo-200 text-indigo-950' : 'bg-indigo-950/40 border-indigo-800/40'
          }`}>
            <div className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-indigo-600' : 'text-indigo-300'}`}>
              Amount Chargeable (in words)
            </div>
            <div className="text-sm font-bold text-slate-100 mt-1">{totals.amountInWords}</div>
          </div>
        </div>

        {/* Right Column: Numeric Summary */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-lg p-4 space-y-2 text-xs shadow-sm">
          <div className="flex justify-between text-slate-300">
            <span>Subtotal (Taxable Amount):</span>
            <span className="font-semibold text-slate-100">₹{totals.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>

          {totals.isIntraState ? (
            <>
              <div className="flex justify-between text-slate-400">
                <span>CGST @ {totals.cgstRate}%:</span>
                <span className="font-medium text-slate-200">₹{totals.cgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>SGST @ {totals.sgstRate}%:</span>
                <span className="font-medium text-slate-200">₹{totals.sgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </>
          ) : (
            <div className="flex justify-between text-slate-400">
              <span>IGST @ {totals.igstRate}%:</span>
              <span className="font-medium text-slate-200">₹{totals.igstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
          )}

          {totals.roundOff !== 0 && (
            <div className="flex justify-between text-slate-400 border-t border-slate-700/40 pt-1.5">
              <span>Round Off:</span>
              <span>{totals.roundOff > 0 ? '+' : ''}₹{totals.roundOff.toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between border-t border-slate-700 pt-2 text-sm font-bold text-slate-100">
            <span>Grand Total:</span>
            <span className="text-emerald-500 font-extrabold text-base">₹{totals.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
