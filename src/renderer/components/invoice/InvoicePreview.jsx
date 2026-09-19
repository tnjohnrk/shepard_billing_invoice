import React, { useState } from 'react';
import { Printer, FileDown, FileSpreadsheet, Save, ArrowLeft, Home } from 'lucide-react';
import { Button } from '../common/Button';
import { ipcClient } from '../../services/ipcClient';
import { computeCompleteInvoiceTotals } from '../../../shared/utils/sharedCalculations';
import { SHEPHERD_DEFAULT_STATE_CODE } from '../../../shared/constants/application';
import { getCopyTypeLabel } from '../../../shared/constants/copyTypes';

export function InvoicePreview({ formData, onBack, onSaveSuccess, onGoHome, toast }) {
  const [isSaving, setIsSaving] = useState(false);
  const [savedInvoice, setSavedInvoice] = useState(formData.id ? formData : null);

  const isProforma = String(formData.invoice_type).toUpperCase() === 'PROFORMA';

  const totals = computeCompleteInvoiceTotals(
    formData.items || [],
    SHEPHERD_DEFAULT_STATE_CODE,
    formData.customer_state_code || SHEPHERD_DEFAULT_STATE_CODE,
    18,
    formData.cgst_rate,
    formData.sgst_rate,
    formData.igst_rate
  );

  const fullData = {
    ...formData,
    subtotal: totals.subtotal,
    cgst_rate: totals.cgstRate,
    cgst_amount: totals.cgstAmount,
    sgst_rate: totals.sgstRate,
    sgst_amount: totals.sgstAmount,
    igst_rate: totals.igstRate,
    igst_amount: totals.igstAmount,
    grand_total: totals.grandTotal,
    amount_in_words: totals.amountInWords,
    round_off: totals.roundOff
  };

  const copyTypeBadge = getCopyTypeLabel(formData.copy_type || fullData.copy_type, isProforma);

  const ensureSaved = async () => {
    if (savedInvoice) return savedInvoice;
    if (formData.id) {
      setSavedInvoice(formData);
      return formData;
    }

    setIsSaving(true);
    try {
      let result;
      if (isProforma) {
        result = await ipcClient.createProforma(fullData);
      } else {
        result = await ipcClient.createInvoice(fullData);
      }

      setSavedInvoice(result);
      toast('success', `${isProforma ? 'Proforma' : 'Tax Invoice'} saved! Automatic backup created.`);
      if (onSaveSuccess) onSaveSuccess(result);
      return result;
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    try {
      await ensureSaved();
    } catch (err) {
      toast('error', err.message || 'Failed to save invoice.');
    }
  };

  const handlePrint = async () => {
    try {
      const doc = await ensureSaved();
      await ipcClient.printInvoice(doc || fullData, {});
      toast('info', 'Print command sent.');
    } catch (e) {
      toast('error', e.message || 'Printing failed.');
    }
  };

  const handleExportPdf = async () => {
    try {
      const doc = await ensureSaved();
      const res = await ipcClient.exportInvoicePdf(doc || fullData);
      if (res && !res.canceled && res.path) {
        toast('success', `PDF saved successfully to: ${res.path}`);
      }
    } catch (e) {
      toast('error', e.message || 'PDF export failed.');
    }
  };

  const handleExportExcel = async () => {
    try {
      const doc = await ensureSaved();
      const res = await ipcClient.exportInvoiceExcel(doc || fullData);
      if (res && !res.canceled && res.path) {
        toast('success', `Excel saved successfully to: ${res.path}`);
      }
    } catch (e) {
      toast('error', e.message || 'Excel export failed.');
    }
  };

  const handleGoHome = () => {
    if (onGoHome) {
      onGoHome();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 glass-panel rounded-xl border border-slate-800">
        <div className="flex items-center gap-3">
          <Button variant="secondary" icon={ArrowLeft} onClick={onBack}>
            Back to Edit
          </Button>

          <Button variant="primary" icon={Home} onClick={handleGoHome}>
            Home Dashboard
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {!savedInvoice ? (
            <Button variant="success" icon={Save} onClick={handleSave} isLoading={isSaving}>
              Save Invoice
            </Button>
          ) : (
            <span className="px-3 py-1.5 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800/50 text-xs font-bold flex items-center gap-1.5">
              <span>✓</span> Saved to SQLite
            </span>
          )}

          <Button variant="secondary" icon={Printer} onClick={handlePrint}>
            Print
          </Button>

          <Button variant="secondary" icon={FileDown} onClick={handleExportPdf}>
            Export PDF
          </Button>

          <Button variant="accent" icon={FileSpreadsheet} onClick={handleExportExcel}>
            Export Excel
          </Button>
        </div>
      </div>

      {/* Developer-Locked Fixed Template Visual Frame */}
      <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 shadow-2xl flex justify-center overflow-x-auto">
        <div id="invoice-preview-sheet" className="w-[190mm] min-h-[270mm] bg-white text-black p-6 rounded shadow-lg border border-slate-300 text-left font-sans text-xs">
          {/* Header */}
          <div className="border-b-2 border-black pb-3 flex justify-between items-start">
            <div>
              <h1 className="text-lg font-bold uppercase tracking-wide text-slate-950">SHEPHERD ENTERPRISES PRIVATE LIMITED</h1>
              <p className="text-[10px] text-slate-700 mt-0.5">
                No.4 & 5 Jenila nagar, Thirumullaivayol salai, Kovilpadagai, Poonamallee, Tiruvallur- 600062<br />
                Phone: +91 98765 43210 | Email: billing@shepherdenterprises.com<br />
                <strong>GSTIN: 27AAACS1234F1Z5</strong> | State Code: 27 (Maharashtra)
              </p>
            </div>
            <div className="text-right">
              <h2 className="text-lg font-black uppercase text-slate-900 tracking-wider">
                {formData.invoice_type === 'PROFORMA' ? 'PROFORMA INVOICE' : 'TAX INVOICE'}
              </h2>
              <span className="inline-block px-2 py-0.5 border border-black text-[9px] font-bold uppercase mt-1 bg-slate-100">
                {copyTypeBadge}
              </span>
            </div>
          </div>

          {/* Meta Grid */}
          <div className="grid grid-cols-2 border-b-2 border-black divide-x divide-black text-[11px]">
            <div className="p-3 space-y-1">
              <div className="text-[9px] font-bold uppercase text-slate-500">Billed To (Buyer):</div>
              <div className="font-bold text-slate-900 text-sm">{fullData.buyer_name}</div>
              <div className="text-slate-700">{fullData.buyer_address}</div>
              <div className="mt-2 text-[10px]">
                <strong>GSTIN:</strong> {fullData.customer_gstin || 'N/A'}<br />
                <strong>State:</strong> {fullData.customer_state} (Code: {fullData.customer_state_code})
              </div>
            </div>

            <div className="p-3 space-y-1">
              <div className="flex justify-between">
                <span className="font-bold text-slate-600">{isProforma ? 'Proforma No:' : 'Invoice No:'}</span>
                <span className="font-bold text-slate-900">{isProforma ? (fullData.proforma_number || fullData.invoice_number) : (fullData.invoice_number || fullData.proforma_number)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-slate-600">Date:</span>
                <span>{(isProforma ? fullData.proforma_date : fullData.invoice_date) || fullData.invoice_date || fullData.proforma_date}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-slate-600">Transport Mode:</span>
                <span>{fullData.transportation_mode || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-slate-600">Vehicle No:</span>
                <span>{fullData.vehicle_number || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-slate-600">PO/SO No:</span>
                <span>{fullData.so_po_number || '-'}</span>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full border-b-2 border-black text-left text-[11px] border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-black font-bold uppercase text-[10px]">
                <th className="p-2 text-center border-r border-black w-8">#</th>
                <th className="p-2 border-r border-black">Description of Goods / Services</th>
                <th className="p-2 text-center border-r border-black w-20">HSN/SAC</th>
                <th className="p-2 text-right border-r border-black w-14">Qty</th>
                <th className="p-2 text-right border-r border-black w-20">Rate (₹)</th>
                <th className="p-2 text-right w-24">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {(fullData.items || []).map((item, idx) => (
                <tr key={idx}>
                  <td className="p-2 text-center border-r border-black">{idx + 1}</td>
                  <td className="p-2 border-r border-black font-medium">{item.description}</td>
                  <td className="p-2 text-center border-r border-black">{item.hsn_sac || '-'}</td>
                  <td className="p-2 text-right border-r border-black">{item.quantity}</td>
                  <td className="p-2 text-right border-r border-black">
                    {Number(item.rate).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-2 text-right font-semibold">
                    {Number(item.amount || (item.quantity * item.rate)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals Grid */}
          <div className="grid grid-cols-12 border-b-2 border-black text-[11px]">
            <div className="col-span-7 p-3 border-r border-black">
              <div className="text-[9px] font-bold uppercase text-slate-500">Amount Chargeable (in words):</div>
              <div className="font-bold text-slate-900 mt-1">{fullData.amount_in_words}</div>
            </div>
            <div className="col-span-5 p-0 divide-y divide-slate-200 text-[11px]">
              <div className="flex justify-between p-1.5 px-3">
                <span>Subtotal</span>
                <span>₹{fullData.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              {totals.isIntraState ? (
                <>
                  <div className="flex justify-between p-1.5 px-3 text-slate-700">
                    <span>CGST @ {totals.cgstRate}%</span>
                    <span>₹{totals.cgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between p-1.5 px-3 text-slate-700">
                    <span>SGST @ {totals.sgstRate}%</span>
                    <span>₹{totals.sgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between p-1.5 px-3 text-slate-700">
                  <span>IGST @ {totals.igstRate}%</span>
                  <span>₹{totals.igstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              <div className="flex justify-between p-2 px-3 font-bold bg-slate-100 text-sm">
                <span>Grand Total</span>
                <span>₹{totals.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* Footer Bank & Declaration */}
          <div className="grid grid-cols-2 divide-x divide-black pt-3 text-[10px]">
            <div className="pr-3 space-y-1">
              <div className="font-bold uppercase text-slate-700 text-[9px]">Bank Details:</div>
              <div>HDFC Bank Ltd | A/C: 50200012345678</div>
              <div>IFSC: HDFC0001234 | Branch: Thane</div>
            </div>
            <div className="pl-3 flex flex-col justify-between h-20 text-right">
              <div className="font-bold uppercase text-[9px] text-slate-700">For SHEPHERD ENTERPRISES PRIVATE LIMITED</div>
              <div className="text-[9px] text-slate-500">(Authorized Signatory)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 glass-panel rounded-xl border border-slate-800">
        <div className="flex items-center gap-3">
          <Button variant="secondary" icon={ArrowLeft} onClick={onBack}>
            Back to Edit
          </Button>

          <Button variant="primary" icon={Home} onClick={handleGoHome}>
            Home Dashboard
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {!savedInvoice && (
            <Button variant="success" icon={Save} onClick={handleSave} isLoading={isSaving}>
              Save Invoice
            </Button>
          )}

          <Button variant="secondary" icon={Printer} onClick={handlePrint}>
            Print
          </Button>

          <Button variant="secondary" icon={FileDown} onClick={handleExportPdf}>
            Export PDF
          </Button>

          <Button variant="accent" icon={FileSpreadsheet} onClick={handleExportExcel}>
            Export Excel
          </Button>
        </div>
      </div>
    </div>
  );
}
