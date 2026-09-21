import React, { useState, useEffect } from 'react';
import { computeCompleteInvoiceTotals, formatRateValue } from '../../../shared/utils/sharedCalculations';
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

  const [cgstInput, setCgstInput] = useState(() => formatRateValue(cgstRate));
  const [sgstInput, setSgstInput] = useState(() => formatRateValue(sgstRate));
  const [igstInput, setIgstInput] = useState(() => formatRateValue(igstRate));

  useEffect(() => {
    setCgstInput(formatRateValue(cgstRate));
  }, [cgstRate]);

  useEffect(() => {
    setSgstInput(formatRateValue(sgstRate));
  }, [sgstRate]);

  useEffect(() => {
    setIgstInput(formatRateValue(igstRate));
  }, [igstRate]);

  const totals = computeCompleteInvoiceTotals(
    items,
    SHEPHERD_DEFAULT_STATE_CODE,
    customerStateCode || '27',
    18,
    cgstRate,
    sgstRate,
    igstRate
  );

  const handleCgstInputChange = (rawVal) => {
    setCgstInput(rawVal);
    const parsed = parseFloat(rawVal);
    const num = isNaN(parsed) ? 0 : parsed;
    if (onChangeTaxRate) {
      onChangeTaxRate('cgst_rate', num);
      onChangeTaxRate('sgst_rate', num);
    }
  };

  const handleCgstBlur = () => {
    const formatted = formatRateValue(cgstInput);
    setCgstInput(formatted);
    const num = parseFloat(formatted) || 0;
    if (onChangeTaxRate) {
      onChangeTaxRate('cgst_rate', num);
      onChangeTaxRate('sgst_rate', num);
    }
  };

  const handleSgstInputChange = (rawVal) => {
    setSgstInput(rawVal);
    const parsed = parseFloat(rawVal);
    const num = isNaN(parsed) ? 0 : parsed;
    if (onChangeTaxRate) {
      onChangeTaxRate('sgst_rate', num);
    }
  };

  const handleSgstBlur = () => {
    const formatted = formatRateValue(sgstInput);
    setSgstInput(formatted);
    const num = parseFloat(formatted) || 0;
    if (onChangeTaxRate) {
      onChangeTaxRate('sgst_rate', num);
    }
  };

  const handleIgstInputChange = (rawVal) => {
    setIgstInput(rawVal);
    const parsed = parseFloat(rawVal);
    const num = isNaN(parsed) ? 0 : parsed;
    if (onChangeTaxRate) {
      onChangeTaxRate('igst_rate', num);
    }
  };

  const handleIgstBlur = () => {
    const formatted = formatRateValue(igstInput);
    setIgstInput(formatted);
    const num = parseFloat(formatted) || 0;
    if (onChangeTaxRate) {
      onChangeTaxRate('igst_rate', num);
    }
  };

  const gstPresetsIntra = [
    { label: 'GST 0% (CGST 00% + SGST 00%)', cgst: 0, sgst: 0 },
    { label: 'GST 5% (CGST 2.5% + SGST 2.5%)', cgst: 2.5, sgst: 2.5 },
    { label: 'GST 12% (CGST 06% + SGST 06%)', cgst: 6, sgst: 6 },
    { label: 'GST 18% (CGST 09% + SGST 09%) - Default', cgst: 9, sgst: 9 },
    { label: 'GST 28% (CGST 14% + SGST 14%)', cgst: 14, sgst: 14 }
  ];

  const gstPresetsInter = [
    { label: 'IGST 00%', igst: 0 },
    { label: 'IGST 05%', igst: 5 },
    { label: 'IGST 12%', igst: 12 },
    { label: 'IGST 18% - Default', igst: 18 },
    { label: 'IGST 28%', igst: 28 }
  ];

  return (
    <div className="space-y-6">
      {/* GST Calculation Configuration Box */}
      <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-300 dark:border-slate-700 space-y-4 shadow-none">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            GST Tax Rates & Calculation
          </h3>
          <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
            totals.isIntraState 
              ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
              : 'bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800'
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
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-none ${
                      isActive
                        ? 'bg-indigo-600 text-white border border-indigo-500'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  CGST Rate (%)
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    inputMode="decimal"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:border-sky-500 font-mono shadow-none"
                    value={cgstInput}
                    onChange={(e) => handleCgstInputChange(e.target.value)}
                    onBlur={handleCgstBlur}
                  />
                  <span className="absolute right-3 text-xs text-slate-500 dark:text-slate-400 font-bold">%</span>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  SGST Rate (%)
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    inputMode="decimal"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:border-sky-500 font-mono shadow-none"
                    value={sgstInput}
                    onChange={(e) => handleSgstInputChange(e.target.value)}
                    onBlur={handleSgstBlur}
                  />
                  <span className="absolute right-3 text-xs text-slate-500 dark:text-slate-400 font-bold">%</span>
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
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-none ${
                      isActive
                        ? 'bg-cyan-600 text-white border border-cyan-500'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col gap-1 max-w-xs pt-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                IGST Rate (%)
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  inputMode="decimal"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:border-sky-500 font-mono shadow-none"
                  value={igstInput}
                  onChange={(e) => handleIgstInputChange(e.target.value)}
                  onBlur={handleIgstBlur}
                />
                <span className="absolute right-3 text-xs text-slate-500 dark:text-slate-400 font-bold">%</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Financial Summary & Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Left Column: Tax Category Status & Amount in Words */}
        <div className="space-y-3">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 text-xs shadow-none">
            <span className="font-bold text-slate-700 dark:text-slate-300">GST Category Status: </span>
            <span className="font-bold text-slate-900 dark:text-slate-100">
              {totals.isIntraState
                ? `Intra-State Supply (CGST ${totals.cgstRate}% + SGST ${totals.sgstRate}%)`
                : `Inter-State Supply (IGST ${totals.igstRate}%)`}
            </span>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Supplier State: 27 (Maharashtra) | Buyer State: {customerStateCode || '27'}
            </div>
          </div>

          <div className="p-4 rounded-2xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs shadow-none">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Amount Chargeable (in words)
            </div>
            <div className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-1">{totals.amountInWords}</div>
          </div>
        </div>

        {/* Right Column: Numeric Summary */}
        <div className="bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-2xl p-5 space-y-2 text-xs shadow-none">
          <div className="flex justify-between text-slate-700 dark:text-slate-300 font-medium">
            <span>Subtotal (Taxable Amount):</span>
            <span className="font-bold text-slate-900 dark:text-slate-100">₹{totals.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>

          {totals.isIntraState ? (
            <>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>CGST @ {totals.cgstRate}%:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">₹{totals.cgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>SGST @ {totals.sgstRate}%:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">₹{totals.sgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </>
          ) : (
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>IGST @ {totals.igstRate}%:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">₹{totals.igstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
          )}

          {totals.roundOff !== 0 && (
            <div className="flex justify-between text-slate-600 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 pt-1.5">
              <span>Round Off:</span>
              <span>{totals.roundOff > 0 ? '+' : ''}₹{totals.roundOff.toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between border-t border-slate-200 dark:border-slate-700 pt-2 text-sm font-bold text-slate-900 dark:text-slate-100">
            <span>Grand Total:</span>
            <span className="text-slate-900 dark:text-slate-100 font-extrabold text-base">₹{totals.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
