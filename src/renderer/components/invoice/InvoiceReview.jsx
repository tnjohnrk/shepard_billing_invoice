import React from 'react';
import { computeCompleteInvoiceTotals } from '../../../shared/utils/sharedCalculations';
import { SHEPHERD_DEFAULT_STATE_CODE } from '../../../shared/constants/application';

export function InvoiceReview({ formData, isProforma }) {
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
      <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-800/40 text-xs flex justify-between items-center">
        <div>
          <span className="text-slate-400">Document Type: </span>
          <span className="font-bold text-indigo-300">{isProforma ? 'Proforma Invoice' : 'Tax Invoice'}</span>
        </div>
        <div>
          <span className="text-slate-400">Document No: </span>
          <span className="font-bold text-slate-100">{isProforma ? formData.proforma_number : formData.invoice_number}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 glass-panel rounded-xl border border-slate-800 space-y-2 text-xs">
          <h4 className="font-bold uppercase tracking-wider text-slate-300 border-b border-slate-700/60 pb-2">Buyer Information</h4>
          <div><span className="text-slate-400">Name:</span> <strong className="text-slate-100">{formData.buyer_name}</strong></div>
          <div><span className="text-slate-400">Address:</span> <span className="text-slate-200">{formData.buyer_address}</span></div>
          <div><span className="text-slate-400">GSTIN:</span> <span className="text-slate-200">{formData.customer_gstin || 'N/A'}</span></div>
          <div><span className="text-slate-400">State:</span> <span className="text-slate-200">{formData.customer_state} (Code: {formData.customer_state_code})</span></div>
        </div>

        <div className="p-4 glass-panel rounded-xl border border-slate-800 space-y-2 text-xs">
          <h4 className="font-bold uppercase tracking-wider text-slate-300 border-b border-slate-700/60 pb-2">References & Transport</h4>
          <div><span className="text-slate-400">Transport Mode:</span> <span className="text-slate-200">{formData.transportation_mode || '-'}</span></div>
          <div><span className="text-slate-400">Vehicle No:</span> <span className="text-slate-200">{formData.vehicle_number || '-'}</span></div>
          <div><span className="text-slate-400">PO / SO No:</span> <span className="text-slate-200">{formData.so_po_number || '-'}</span></div>
          <div><span className="text-slate-400">GEMC No:</span> <span className="text-slate-200">{formData.gemc_number || '-'}</span></div>
        </div>
      </div>

      <div className="p-4 glass-panel rounded-xl border border-slate-800 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Items ({formData.items?.length || 0})</h4>
        <div className="divide-y divide-slate-800 text-xs">
          {(formData.items || []).map((item, idx) => (
            <div key={idx} className="py-2 flex justify-between items-center">
              <div>
                <div className="font-semibold text-slate-200">{item.description}</div>
                <div className="text-[11px] text-slate-400">HSN/SAC: {item.hsn_sac || '-'} | Qty: {item.quantity} × ₹{item.rate}</div>
              </div>
              <div className="font-bold text-slate-100">
                ₹{((item.quantity || 0) * (item.rate || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 glass-panel rounded-xl border border-slate-800 flex justify-between items-center">
        <div>
          <div className="text-xs text-slate-400">Grand Total Billed</div>
          <div className="text-xs font-medium text-indigo-400 mt-0.5">{totals.amountInWords}</div>
        </div>
        <div className="text-2xl font-bold text-emerald-400">
          ₹{totals.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </div>
      </div>
    </div>
  );
}
