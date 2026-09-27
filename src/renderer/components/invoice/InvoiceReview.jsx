import React from 'react';
import { computeCompleteInvoiceTotals } from '../../../shared/utils/sharedCalculations';
import { SHEPHERD_DEFAULT_STATE_CODE } from '../../../shared/constants/application';
import { getCopyTypeLabel } from '../../../shared/constants/copyTypes';
import { useTheme } from '../../context/ThemeContext';

export function InvoiceReview({ formData, isProforma }) {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const totals = computeCompleteInvoiceTotals(
    formData.items || [],
    SHEPHERD_DEFAULT_STATE_CODE,
    formData.customer_state_code,
    18,
    formData.cgst_rate,
    formData.sgst_rate,
    formData.igst_rate
  );

  return (
    <div className="space-y-6">
      {/* Top Document Summary Banner */}
      <div className="p-3.5 px-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 text-xs flex flex-wrap gap-4 justify-between items-center shadow-xs">
        <div>
          <span className="text-slate-400 dark:text-slate-500 font-medium">Document Type: </span>
          <span className="font-bold text-slate-900 dark:text-slate-100">
            {isProforma ? 'Proforma Invoice' : 'Tax Invoice'}
          </span>
        </div>
        {!isProforma && (
          <div>
            <span className="text-slate-400 dark:text-slate-500 font-medium">Copy Type: </span>
            <span className="font-bold text-slate-900 dark:text-slate-100">
              {getCopyTypeLabel(formData.copy_type)}
            </span>
          </div>
        )}
        <div>
          <span className="text-slate-400 dark:text-slate-500 font-medium">Document No: </span>
          <span className="font-bold text-slate-900 dark:text-slate-100 font-mono">
            {isProforma ? formData.proforma_number : formData.invoice_number}
          </span>
        </div>
      </div>

      {/* 2-Column Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-2 text-xs shadow-xs overflow-hidden">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800/80 pb-2">
            Buyer Information
          </h4>
          <div className="break-words"><span className="text-slate-400 dark:text-slate-500">Name:</span> <strong className="text-slate-900 dark:text-slate-100 font-bold ml-1">{formData.buyer_name}</strong></div>
          <div className="break-words"><span className="text-slate-400 dark:text-slate-500">Address:</span> <span className="text-slate-700 dark:text-slate-300 ml-1 whitespace-pre-wrap">{formData.buyer_address}</span></div>
          <div className="break-words"><span className="text-slate-400 dark:text-slate-500">GSTIN:</span> <span className="text-slate-800 dark:text-slate-200 font-mono font-bold ml-1">{formData.customer_gstin || 'N/A'}</span></div>
          <div className="break-words"><span className="text-slate-400 dark:text-slate-500">State:</span> <span className="text-slate-700 dark:text-slate-300 ml-1">{formData.customer_state} (Code: {formData.customer_state_code})</span></div>
        </div>

        <div className="p-4 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-2 text-xs shadow-xs overflow-hidden">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800/80 pb-2">
            References & Transport
          </h4>
          <div className="break-words"><span className="text-slate-400 dark:text-slate-500">Transport Mode:</span> <span className="text-slate-700 dark:text-slate-300 ml-1">{formData.transportation_mode || '-'}</span></div>
          <div className="break-words"><span className="text-slate-400 dark:text-slate-500">Vehicle No:</span> <span className="text-slate-700 dark:text-slate-300 ml-1">{formData.vehicle_number || '-'}</span></div>
          <div className="break-words"><span className="text-slate-400 dark:text-slate-500">PO / SO No:</span> <span className="text-slate-700 dark:text-slate-300 ml-1">{formData.so_po_number || '-'}</span></div>
          <div className="break-words"><span className="text-slate-400 dark:text-slate-500">GEMC No:</span> <span className="text-slate-700 dark:text-slate-300 ml-1">{formData.gemc_number || '-'}</span></div>
        </div>
      </div>

      {/* Items Section */}
      <div className="p-4 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-3 shadow-xs overflow-hidden">
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Items ({formData.items?.length || 0})
        </h4>
        <div className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
          {(formData.items || []).map((item, idx) => (
            <div key={idx} className="py-2 flex justify-between items-start gap-4">
              <div className="min-w-0 flex-1 overflow-hidden">
                <div className="font-semibold text-slate-900 dark:text-slate-100 break-words whitespace-pre-wrap leading-relaxed" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                  {item.description}
                </div>
                <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                  HSN/SAC: <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">{item.hsn_sac || '-'}</span> | Qty: {item.quantity} × ₹{Number(item.rate).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
              </div>
              <div className="font-bold text-slate-900 dark:text-slate-100 shrink-0 font-mono text-right text-xs">
                ₹{((item.quantity || 0) * (item.rate || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grand Total Summary Card */}
      <div className="p-4 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-slate-200/80 dark:border-slate-800 flex flex-wrap gap-3 justify-between items-center shadow-xs overflow-hidden">
        <div className="min-w-0 flex-1">
          <div className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">Grand Total Billed</div>
          <div className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-0.5 break-words">
            {totals.amountInWords}
          </div>
        </div>
        <div className="text-xl font-extrabold text-slate-900 dark:text-slate-100 shrink-0 font-mono">
          ₹{totals.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </div>
      </div>
    </div>
  );
}
