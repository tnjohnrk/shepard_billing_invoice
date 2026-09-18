import React from 'react';
import { computeCompleteInvoiceTotals } from '../../../shared/utils/sharedCalculations';
import { SHEPHERD_DEFAULT_STATE_CODE } from '../../../shared/constants/application';

export function TaxSection({
  items = [],
  customerStateCode,
  cgstRate = 9,
  sgstRate = 9,
  igstRate = 18,
  onChangeTaxRate
}) {
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
      // Under GST rules, SGST rate typically matches CGST rate
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
    { label: '0% (0% CGST + 0% SGST)', cgst: 0, sgst: 0 },
    { label: '5% (2.5% CGST + 2.5% SGST)', cgst: 2.5, sgst: 2.5 },
    { label: '12% (6% CGST + 6% SGST)', cgst: 6, sgst: 6 },
    { label: '18% (9% CGST + 9% SGST)', cgst: 9, sgst: 9 },
    { label: '28% (14% CGST + 14% SGST)', cgst: 14, sgst: 14 }
  ];

  const gstPresetsInter = [
    { label: '0% IGST', igst: 0 },
    { label: '5% IGST', igst: 5 },
    { label: '12% IGST', igst: 12 },
    { label: '18% IGST', igst: 18 },
    { label: '28% IGST', igst: 28 }
  ];

  return (
    <div className="p-5 glass-panel rounded-xl border border-slate-800 space-y-5">
      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Tax & Calculation Breakdown</h4>

      {/* Tax Rate Selection Controls */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-200">Select / Customize GST Tax Rates</span>
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${totals.isIntraState ? 'bg-indigo-950 text-indigo-400 border border-indigo-800/40' : 'bg-cyan-950 text-cyan-400 border border-cyan-800/40'}`}>
            {totals.isIntraState ? 'Intra-State Supply' : 'Inter-State Supply'}
          </span>
        </div>

        {totals.isIntraState ? (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {gstPresetsIntra.map((preset, idx) => (
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
                    totals.cgstRate === preset.cgst && totals.sgstRate === preset.sgst
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
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
              {gstPresetsInter.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    if (onChangeTaxRate) {
                      onChangeTaxRate('igst_rate', preset.igst);
                    }
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    totals.igstRate === preset.igst
                      ? 'bg-cyan-600 text-white shadow-md'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
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
          <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs">
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

          <div className="p-3.5 rounded-lg bg-indigo-950/40 border border-indigo-800/40 text-xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">Amount Chargeable (in words)</div>
            <div className="text-sm font-bold text-slate-100 mt-1">{totals.amountInWords}</div>
          </div>
        </div>

        {/* Right Column: Numeric Summary */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-lg p-4 space-y-2 text-xs">
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
            <span className="text-emerald-400 text-base">₹{totals.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
