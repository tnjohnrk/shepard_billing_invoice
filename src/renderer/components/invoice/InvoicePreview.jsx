import React, { useState, useEffect } from 'react';
import { Printer, FileDown, FileSpreadsheet, Save, ArrowLeft, Home, ArrowRightLeft } from 'lucide-react';
import { Button } from '../common/Button';
import { ipcClient } from '../../services/ipcClient';
import { computeCompleteInvoiceTotals } from '../../../shared/utils/sharedCalculations';
import { SHEPHERD_DEFAULT_STATE_CODE } from '../../../shared/constants/application';
import { getCopyTypeLabel } from '../../../shared/constants/copyTypes';
import { COMPANY_CONFIG } from '../../../main/config/companyConfig';
import { paginateInvoiceItems } from '../../../shared/utils/invoicePagination';
import shepherdInvoiceLogo from '../../assets/shepherd_invoice_logo.png';

export function InvoicePreview({ formData, onBack, onSaveSuccess, onGoHome, toast }) {
  const [isSaving, setIsSaving] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [docData, setDocData] = useState(formData);
  const [savedInvoice, setSavedInvoice] = useState(formData.id ? formData : null);

  const isProforma = String(docData.invoice_type || formData.invoice_type).toUpperCase() === 'PROFORMA';

  useEffect(() => {
    if (formData.id && (!formData.items || formData.items.length === 0)) {
      const fetchFull = async () => {
        try {
          const res = isProforma 
            ? await ipcClient.getProforma(formData.id)
            : await ipcClient.getInvoice(formData.id);
          if (res) {
            setDocData(res);
            setSavedInvoice(res);
          }
        } catch (e) {
          console.error('Failed to load full invoice items:', e);
        }
      };
      fetchFull();
    } else {
      setDocData(formData);
      if (formData.id) setSavedInvoice(formData);
    }
  }, [formData, isProforma]);

  const items = docData.items || [];
  const hasItems = items.length > 0;

  const computedTotals = hasItems ? computeCompleteInvoiceTotals(
    items,
    SHEPHERD_DEFAULT_STATE_CODE,
    docData.customer_state_code || SHEPHERD_DEFAULT_STATE_CODE,
    18,
    docData.cgst_rate,
    docData.sgst_rate,
    docData.igst_rate
  ) : null;

  const totals = computedTotals || {
    subtotal: Number(docData.subtotal) || 0,
    cgstRate: Number(docData.cgst_rate) || 9,
    cgstAmount: Number(docData.cgst_amount) || 0,
    sgstRate: Number(docData.sgst_rate) || 9,
    sgstAmount: Number(docData.sgst_amount) || 0,
    igstRate: Number(docData.igst_rate) || 18,
    igstAmount: Number(docData.igst_amount) || 0,
    grandTotal: Number(docData.grand_total) || Number(docData.subtotal) || 0,
    amountInWords: docData.amount_in_words || (docData.grand_total ? `Rupees ${Number(docData.grand_total).toLocaleString('en-IN')}` : 'Zero Rupees Only'),
    roundOff: Number(docData.round_off) || 0,
    isIntraState: (docData.cgst_amount > 0 || docData.sgst_amount > 0) || !docData.igst_amount
  };

  const fullData = {
    ...docData,
    items: hasItems ? (computedTotals?.items || items) : items,
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

  const copyTypeBadge = getCopyTypeLabel(docData.copy_type || fullData.copy_type, isProforma);
  const pages = paginateInvoiceItems(fullData.items || [], fullData);

  const ensureSaved = async () => {
    if (savedInvoice) return savedInvoice;
    if (docData.id) {
      setSavedInvoice(docData);
      return docData;
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
      setDocData(result);
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
      const res = await ipcClient.printInvoice(doc || fullData, {});
      if (res && res.canceled) {
        toast('info', 'Print canceled.');
        return;
      }
      toast('info', 'Print command sent.');
    } catch (e) {
      if (e.message?.toLowerCase().includes('cancel')) {
        toast('info', 'Print canceled.');
        return;
      }
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

  const handleConvertToTaxInvoice = async () => {
    if (!docData?.id) return;
    setIsConverting(true);
    try {
      const converted = await ipcClient.convertProformaToInvoice({ proformaId: docData.id });
      if (converted) {
        setDocData(converted);
        setSavedInvoice(converted);
        toast('success', `Proforma converted to Official Tax Invoice ${converted.invoice_number}!`);
        if (onSaveSuccess) onSaveSuccess(converted);
      }
    } catch (err) {
      toast('error', err.message || 'Failed to convert proforma to tax invoice.');
    } finally {
      setIsConverting(false);
    }
  };

  const handleGoHome = () => {
    if (onGoHome) {
      onGoHome();
    } else if (onBack) {
      onBack();
    }
  };

  return (
    <div className="space-y-6 print:m-0 print:p-0">
      {/* Top Controls Header */}
      <div className="no-print flex flex-wrap items-center justify-between gap-4 p-4 bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-300 dark:border-slate-700 shadow-none">
        <div className="flex items-center gap-3">
          <Button variant="secondary" icon={ArrowLeft} onClick={onBack}>
            Back
          </Button>

          <Button variant="primary" icon={Home} onClick={handleGoHome}>
            Dashboard
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isProforma && (savedInvoice?.id || docData?.id) && (
            <Button
              variant="accent"
              icon={ArrowRightLeft}
              onClick={handleConvertToTaxInvoice}
              isLoading={isConverting}
            >
              Convert to Tax Invoice
            </Button>
          )}

          {!savedInvoice && (
            <Button
              variant="secondary"
              icon={Save}
              onClick={handleSave}
              loading={isSaving}
            >
              Save Document
            </Button>
          )}

          <Button
            variant="secondary"
            icon={FileSpreadsheet}
            onClick={handleExportExcel}
          >
            Export Excel
          </Button>

          <Button
            variant="secondary"
            icon={FileDown}
            onClick={handleExportPdf}
          >
            Download PDF
          </Button>

          <Button
            variant="primary"
            icon={Printer}
            onClick={handlePrint}
          >
            Print Invoice
          </Button>
        </div>
      </div>

      {/* Exact Reference A4 Layout Frame */}
      <div className="bg-slate-200 dark:bg-slate-900 p-6 rounded-2xl border border-slate-300 dark:border-slate-800 shadow-none flex flex-col items-center gap-8 overflow-x-auto print:bg-transparent print:p-0 print:border-none print:shadow-none print:gap-0">
        {pages.map((page) => (
          <div key={page.pageNumber} className="w-full flex flex-col items-center">
            {pages.length > 1 && (
              <div className="no-print self-center text-xs font-bold text-slate-600 dark:text-slate-400 mb-2 px-3 py-1 bg-slate-300/80 dark:bg-slate-800 rounded-full">
                Page {page.pageNumber} of {page.totalPages} ({page.pageNumber}/{page.totalPages})
              </div>
            )}

            <div
              id={`invoice-preview-sheet-page-${page.pageNumber}`}
              style={{ backgroundColor: '#ffffff', color: '#000000', width: '194mm' }}
              className="bg-white text-black p-6 border border-slate-400 shadow-lg text-left font-sans text-xs print:w-full print:p-0 print:border-none print:shadow-none print:break-after-page print:page-break-after-always"
            >
              {/* Overall Box Layout Frame from Header to Footer */}
              <div className="border-[1.5px] border-black w-full bg-white">
                
                {/* 1. Header Section (Only on Page 1) */}
                {page.isFirstPage ? (
                  <>
                    <table className="w-full border-collapse border-b-[1.5px] border-black" style={{ backgroundColor: '#ffffff', color: '#000000' }}>
                      <tbody>
                        <tr>
                          <td className="w-[22%] align-middle text-center p-2 border-r border-black">
                            <img
                              src={shepherdInvoiceLogo}
                              alt="Shepherd Enterprises"
                              className="w-[78px] h-[78px] object-contain mx-auto block"
                            />
                            <div className="text-[8.5px] font-bold uppercase mt-1 text-slate-800 tracking-wider">
                              SHEPHERD ENTERPRISES
                            </div>
                            <div className="text-[8px] text-slate-600">
                              {COMPANY_CONFIG.upi_id ? `@${COMPANY_CONFIG.upi_id.split('@')[1] || 'icici'}` : '@icici'}
                            </div>
                          </td>
                          <td className="w-[78%] align-middle text-center p-2.5">
                            <h1 className="text-[21px] font-black uppercase tracking-wide text-blue-900 mb-0.5">
                              SHEPHERD ENTERPRISES PRIVATE LIMITED
                            </h1>
                            <p className="text-[10px] text-slate-800 leading-tight uppercase mb-1">
                              No.4 & 5 Jenila nagar, Thirumullaivayol salai, Kovilpadagai, Poonamallee, Tiruvallur- 600062
                            </p>
                            <p className="text-[10.5px] font-bold text-slate-900 mb-0.5">
                              Cell: +91 9025812298 / +91 8438435681
                            </p>
                            <p className="text-[10.5px] font-bold text-slate-900">
                              Email: shepheredenterprisespvtltd@gmail.com
                            </p>
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    {/* 2. Sub-Header Row: GSTIN | DOC TYPE | COPY TYPE & PAGE NO */}
                    <table className="w-full border-collapse border-b-[1.5px] border-black text-[10px]">
                      <tbody>
                        <tr>
                          <td className="w-[38%] p-1.5 font-bold border-r border-black align-middle text-[11px]">
                            GSTIN: {COMPANY_CONFIG.gstin || '33ABUCS2217H1Z8'}
                          </td>
                          <td className="w-[24%] p-1.5 font-black text-center text-blue-900 text-sm tracking-wider uppercase border-r border-black align-middle">
                            {isProforma ? 'PROFORMA INVOICE' : 'INVOICE'}
                          </td>
                          <td className="w-[38%] p-1.5 font-bold text-right uppercase tracking-wider text-[10px] align-middle">
                            <span>{copyTypeBadge}</span>
                            <span className="ml-2 font-bold text-[9.5px]">
                              Page {page.pageNumber}/{page.totalPages}
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    {/* 3. Meta Grid: Invoice Details & Logistics (2 Columns) */}
                    <table className="w-full border-collapse border-b-[1.5px] border-black text-[10px]">
                      <tbody>
                        <tr className="border-b border-black">
                          {/* Left Meta Column */}
                          <td className="w-[50%] p-1.5 border-r border-black align-top space-y-0.5">
                            <div className="leading-tight">
                              <span className="font-bold">INVOICE NO : </span>
                              <span className="font-bold">{isProforma ? (fullData.proforma_number || fullData.invoice_number) : (fullData.invoice_number || fullData.proforma_number)}</span>
                            </div>
                            <div className="leading-tight">
                              <span className="font-bold">INVOICE DATE: </span>
                              <span>{(isProforma ? fullData.proforma_date : fullData.invoice_date) || fullData.invoice_date || fullData.proforma_date}</span>
                            </div>
                            <div className="leading-tight">
                              <span className="font-bold">STATE: </span>
                              <span className="uppercase">{COMPANY_CONFIG.state || 'TAMIL NADU'} </span>
                              <span className="font-bold ml-2">STATE CODE: </span>
                              <span>{COMPANY_CONFIG.state_code || '33'}</span>
                            </div>
                            <div className="pt-1">
                              <div className="leading-tight">
                                <span className="font-bold">BUYER: </span>
                                <span className="font-bold text-slate-950">{fullData.buyer_name}</span>
                              </div>
                              <div className="leading-tight mt-0.5">
                                <span className="font-bold">CUSTOMER ADDRESS: </span>
                                <span className="text-[9.5px] text-slate-800 whitespace-pre-line">{fullData.buyer_address}</span>
                              </div>
                            </div>
                          </td>

                          {/* Right Meta Column */}
                          <td className="w-[50%] p-1.5 align-top space-y-0.5">
                            <div className="leading-tight">
                              <span className="font-bold">TRANSPORTATION MODE: </span>
                              <span>{fullData.transportation_mode || '-'}</span>
                            </div>
                            <div className="leading-tight">
                              <span className="font-bold">VEHICLE NO: </span>
                              <span>{fullData.vehicle_number || '-'}</span>
                            </div>
                            <div className="leading-tight">
                              <span className="font-bold">DATE OF SUPPLY: </span>
                              <span>{fullData.date_of_supply || (isProforma ? fullData.proforma_date : fullData.invoice_date) || '-'}</span>
                            </div>
                            <div className="leading-tight">
                              <span className="font-bold">DELIVERY ADDRESS: </span>
                              <span>{fullData.delivery_address || fullData.buyer_address || '-'}</span>
                            </div>
                          </td>
                        </tr>

                        {/* Customer GSTIN & State Code Row */}
                        <tr>
                          <td className="w-[50%] p-1.5 border-r border-black align-middle font-bold">
                            CUSTOMER' GSTIN: {fullData.customer_gstin || 'N/A'}
                          </td>
                          <td className="w-[50%] p-1.5 align-middle space-y-0.5">
                            <div>
                              <span className="font-bold">STATE: </span>
                              <span className="uppercase">{fullData.customer_state || 'Tamil Nadu'}</span>
                            </div>
                            <div>
                              <span className="font-bold">STATE CODE: </span>
                              <span>{fullData.customer_state_code || '33'}</span>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </>
                ) : (
                  /* Continuation Page Sub-Header Row with Page Number */
                  <table className="w-full border-collapse border-b-[1.5px] border-black text-[10px]">
                    <tbody>
                      <tr className="bg-slate-50">
                        <td className="w-[38%] p-1.5 font-bold border-r border-black align-middle text-[11px]">
                          INVOICE NO: {isProforma ? (fullData.proforma_number || fullData.invoice_number) : (fullData.invoice_number || fullData.proforma_number)}
                        </td>
                        <td className="w-[24%] p-1.5 font-black text-center text-blue-900 text-sm tracking-wider uppercase border-r border-black align-middle">
                          {isProforma ? 'PROFORMA INVOICE' : 'INVOICE'}
                        </td>
                        <td className="w-[38%] p-1.5 font-bold text-right uppercase tracking-wider text-[10px] align-middle">
                          <span>{copyTypeBadge}</span>
                          <span className="ml-2 font-bold text-[9.5px]">
                            Page {page.pageNumber}/{page.totalPages}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                )}

                {/* 4. Line Items Table */}
                <table className="w-full border-collapse border-b-[1.5px] border-black text-left text-[10px]" style={{ tableLayout: 'fixed' }}>
                  <thead>
                    <tr className="bg-white border-b-[1.5px] border-black font-bold uppercase text-[9.5px]">
                      <th className="p-1.5 border-r border-black text-left" style={{ width: '54%' }}>DESCRIPTION</th>
                      <th className="p-1.5 border-r border-black text-center" style={{ width: '11%' }}>HSN</th>
                      <th className="p-1.5 border-r border-black text-center" style={{ width: '11%' }}>QTY.</th>
                      <th className="p-1.5 border-r border-black text-right" style={{ width: '12%' }}>RATE</th>
                      <th className="p-1.5 text-right" style={{ width: '12%' }}>AMOUNT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-0">
                    {page.items.map((item, idx) => {
                      const isFirstOverallItem = page.isFirstPage && idx === 0;
                      return (
                        <tr key={idx} className="align-top">
                          <td className="p-1.5 border-r border-black" style={{ wordBreak: 'break-all', overflowWrap: 'anywhere' }}>
                            <div className="font-bold uppercase text-slate-950 leading-tight text-[9.5px] whitespace-pre-wrap">
                              {item.description}
                            </div>
                            {isFirstOverallItem && (
                              <div className="mt-1 font-bold text-[9px] text-slate-900 leading-tight space-y-0.5">
                                {fullData.so_po_number && (
                                  <div>
                                    S.O. No: {fullData.so_po_number}
                                    {fullData.so_po_date ? ` Dt: ${fullData.so_po_date}` : ''}
                                  </div>
                                )}
                                {fullData.gemc_number && (
                                  <div>GEMC - {fullData.gemc_number}</div>
                                )}
                                {fullData.reference_number && (
                                  <div>Ref: {fullData.reference_number}</div>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="p-1.5 border-r border-black text-center">{item.hsn_sac || '-'}</td>
                          <td className="p-1.5 border-r border-black text-center">{item.quantity}</td>
                          <td className="p-1.5 border-r border-black text-right">
                            {Number(item.rate).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-1.5 text-right font-medium">
                            {Number(item.amount || (item.quantity * item.rate)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Bottom Section (Totals, Bank Details, and Footer on Last Page) */}
                {page.hasTotalsAndFooter && (
                  <div>
                    {/* 5. Amount Words Strip */}
                    <div className="p-1.5 border-b-[1.5px] border-black font-normal text-[10px]">
                      <span className="font-bold">TOTAL AMOUNT IN WORDS: </span>
                      {fullData.amount_in_words}
                    </div>

                    {/* 6. Bank Details & Tax Summary Row */}
                    <table className="w-full border-collapse border-b-[1.5px] border-black text-[9.5px]">
                      <tbody>
                        <tr>
                          {/* Left: Bank Details */}
                          <td className="w-[60%] p-1.5 border-r border-black align-top space-y-0.5">
                            <div className="font-bold text-[10px] uppercase text-slate-900 mb-1">BANK DETAILS</div>
                            <div><span className="font-bold">BANK NAME: </span>{COMPANY_CONFIG.bank_name}: {COMPANY_CONFIG.account_number}</div>
                            <div><span className="font-bold">BRANCH NAME: </span>{(COMPANY_CONFIG.branch_name || 'Ambattur - Officer Colony').toUpperCase()}</div>
                            <div><span className="font-bold">IFSC CODE: </span>{COMPANY_CONFIG.ifsc_code}</div>
                          </td>

                          {/* Right: Tax Breakdown */}
                          <td className="w-[40%] p-0 align-top">
                            <table className="w-full border-collapse text-[9.5px]">
                              <tbody>
                                <tr className="border-b border-black">
                                  <td className="p-1 text-left w-[65%]">TOTAL AMOUNT BEFORE TAX</td>
                                  <td className="p-1 text-right w-[35%] font-medium">
                                    {fullData.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                  </td>
                                </tr>
                                {totals.isIntraState ? (
                                  <>
                                    <tr className="border-b border-black">
                                      <td className="p-1 text-left">ADD CGST: {totals.cgstRate}%</td>
                                      <td className="p-1 text-right font-medium">
                                        {totals.cgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                      </td>
                                    </tr>
                                    <tr className="border-b border-black">
                                      <td className="p-1 text-left">ADD SGST: {totals.sgstRate}%</td>
                                      <td className="p-1 text-right font-medium">
                                        {totals.sgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                      </td>
                                    </tr>
                                  </>
                                ) : (
                                  <tr className="border-b border-black">
                                    <td className="p-1 text-left">ADD IGST: {totals.igstRate}%</td>
                                    <td className="p-1 text-right font-medium">
                                      {totals.igstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </td>
                                  </tr>
                                )}
                                {fullData.round_off !== 0 && fullData.round_off != null && (
                                  <tr className="border-b border-black">
                                    <td className="p-1 text-left">ROUND OFF</td>
                                    <td className="p-1 text-right font-medium">
                                      {fullData.round_off > 0 ? '+' : ''}{Number(fullData.round_off).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </td>
                                  </tr>
                                )}
                                <tr className="bg-slate-50 font-bold text-[10px]">
                                  <td className="p-1 text-left">TOTAL AMOUNT AFTER TAX:</td>
                                  <td className="p-1 text-right">
                                    {totals.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    {/* 7. Footer: Terms & Signature inside the overall box */}
                    <table className="w-full border-collapse text-[9px]">
                      <tbody>
                        <tr>
                          <td className="w-[50%] align-top p-2 border-r border-black">
                            <div className="font-bold uppercase text-[9.5px] text-slate-900 mb-1">TERMS AND CONDITIONS</div>
                            <div className="text-[8.5px] text-slate-700 leading-tight">
                              We declare that this invoice shows the actual value of services described and that all particulars are true and correct.
                            </div>
                            {fullData.notes && (
                              <div className="text-[8.5px] text-slate-700 mt-1">
                                <strong>Notes:</strong> {fullData.notes}
                              </div>
                            )}
                            <div className="mt-2 text-[8.5px] font-bold text-slate-700">
                              Page {page.pageNumber}/{page.totalPages}
                            </div>
                          </td>
                          <td className="w-[50%] align-top p-2 text-center">
                            <div className="font-bold text-[8.5px] uppercase text-slate-800 mb-1">
                              CERTIFIED THAT ABOVE INFORMATION ARE TRUE AND CORRECT
                            </div>
                            <div className="font-bold text-[10.5px] text-blue-900 mb-1">
                              For SHEPHERD ENTERPRISES PRIVATE LIMITED
                            </div>
                            <div className="h-12"></div>
                            <div className="font-bold text-[10px] text-right pr-4 text-slate-900">
                              Proprietor
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}

              </div>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
