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
      <div className="p-4 rounded-2xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs flex flex-wrap gap-4 justify-between items-center shadow-none">
        <div>
          <span className="text-slate-500 dark:text-slate-400 font-medium">Document Type: </span>
          <span className="font-bold text-slate-900 dark:text-slate-100">
            {isProforma ? 'Proforma Invoice' : 'Tax Invoice'}
          </span>
        </div>
        {!isProforma && (
          <div>
            <span className="text-slate-500 dark:text-slate-400 font-medium">Copy Type: </span>
            <span className="font-bold text-slate-900 dark:text-slate-100">
              {getCopyTypeLabel(formData.copy_type)}
            </span>
          </div>
        )}
        <div>
          <span className="text-slate-500 dark:text-slate-400 font-medium">Document No: </span>
          <span className="font-bold text-slate-900 dark:text-slate-100">
            {isProforma ? formData.proforma_number : formData.invoice_number}
          </span>
        </div>
      </div>

      {/* 2-Column Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-300 dark:border-slate-700 space-y-2 text-xs shadow-none">
          <h4 className="font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 pb-2">
            Buyer Information
          </h4>
          <div><span className="text-slate-500 dark:text-slate-400">Name:</span> <strong className="text-slate-900 dark:text-slate-100 font-bold ml-1">{formData.buyer_name}</strong></div>
          <div><span className="text-slate-500 dark:text-slate-400">Address:</span> <span className="text-slate-800 dark:text-slate-200 ml-1">{formData.buyer_address}</span></div>
          <div><span className="text-slate-500 dark:text-slate-400">GSTIN:</span> <span className="text-slate-800 dark:text-slate-200 font-mono font-bold ml-1">{formData.customer_gstin || 'N/A'}</span></div>
          <div><span className="text-slate-500 dark:text-slate-400">State:</span> <span className="text-slate-800 dark:text-slate-200 ml-1">{formData.customer_state} (Code: {formData.customer_state_code})</span></div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-300 dark:border-slate-700 space-y-2 text-xs shadow-none">
          <h4 className="font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 pb-2">
            References & Transport
          </h4>
          <div><span className="text-slate-500 dark:text-slate-400">Transport Mode:</span> <span className="text-slate-800 dark:text-slate-200 ml-1">{formData.transportation_mode || '-'}</span></div>
          <div><span className="text-slate-500 dark:text-slate-400">Vehicle No:</span> <span className="text-slate-800 dark:text-slate-200 ml-1">{formData.vehicle_number || '-'}</span></div>
          <div><span className="text-slate-500 dark:text-slate-400">PO / SO No:</span> <span className="text-slate-800 dark:text-slate-200 ml-1">{formData.so_po_number || '-'}</span></div>
          <div><span className="text-slate-500 dark:text-slate-400">GEMC No:</span> <span className="text-slate-800 dark:text-slate-200 ml-1">{formData.gemc_number || '-'}</span></div>
        </div>
      </div>

      {/* Items Section */}
      <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-300 dark:border-slate-700 space-y-3 shadow-none">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          Items ({formData.items?.length || 0})
        </h4>
        <div className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
          {(formData.items || []).map((item, idx) => (
            <div key={idx} className="py-2.5 flex justify-between items-center">
              <div>
                <div className="font-bold text-slate-900 dark:text-slate-100">{item.description}</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  HSN/SAC: {item.hsn_sac || '-'} | Qty: {item.quantity} × ₹{Number(item.rate).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
              </div>
              <div className="font-bold text-slate-900 dark:text-slate-100">
                ₹{((item.quantity || 0) * (item.rate || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grand Total Summary Card */}
      <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-300 dark:border-slate-700 flex flex-wrap gap-3 justify-between items-center shadow-none">
        <div>
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Grand Total Billed</div>
          <div className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-0.5">
            {totals.amountInWords}
          </div>
        </div>
        <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
          ₹{totals.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </div>
      </div>
    </div>
  );
}
