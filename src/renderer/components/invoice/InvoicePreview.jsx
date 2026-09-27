import React, { useState, useEffect } from 'react';
import { Printer, FileDown, FileSpreadsheet, Save, ArrowLeft, PlusCircle, ArrowRightLeft } from 'lucide-react';
import { Button } from '../common/Button';
import { ipcClient } from '../../services/ipcClient';
import { computeCompleteInvoiceTotals } from '../../../shared/utils/sharedCalculations';
import { SHEPHERD_DEFAULT_STATE_CODE } from '../../../shared/constants/application';
import { getCopyTypeLabel } from '../../../shared/constants/copyTypes';
import { COMPANY_CONFIG } from '../../../main/config/companyConfig';
import { paginateInvoiceItems } from '../../../shared/utils/invoicePagination';
import shepherdInvoiceLogo from '../../assets/shepherd_invoice_logo.png';

export function InvoicePreview({ formData, onBack, onSaveSuccess, onGoHome, onNewInvoice, toast }) {
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
      sessionStorage.removeItem('shepherd_invoice_create_draft');
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
    <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-300 dark:border-slate-700 overflow-hidden shadow-none print:border-none print:bg-transparent print:m-0 print:p-0">
      {/* 1. Top Controls Header (Attached directly at top of the single box) */}
      <div className="no-print flex flex-wrap items-center justify-between gap-3 p-4 bg-white dark:bg-slate-900 border-b-2 border-slate-300 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <Button variant="secondary" icon={ArrowLeft} onClick={onBack}>
            Back
          </Button>
          {onNewInvoice && (
            <Button variant="secondary" icon={PlusCircle} onClick={onNewInvoice}>
              Create New Invoice
            </Button>
          )}
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

      {/* 2. Exact Reference A4 Layout Frame (Inside the same container box) */}
      <div className="bg-slate-100 dark:bg-slate-950 p-6 sm:p-8 flex flex-col items-center gap-8 overflow-x-auto print:bg-transparent print:p-0 print:border-none print:shadow-none print:gap-0">
        {pages.map((page) => (
          <div key={page.pageNumber} className="w-full flex flex-col items-center">
            <div
              id={`invoice-preview-sheet-page-${page.pageNumber}`}
              style={{
                backgroundColor: '#ffffff',
                color: '#000000',
                width: '210mm',
                height: '297mm',
                minHeight: '297mm',
                maxHeight: '297mm',
                padding: '8mm',
                boxSizing: 'border-box'
              }}
              className="invoice-preview-paper bg-white text-black border border-slate-300 shadow-xl text-left font-sans text-xs flex flex-col justify-between overflow-hidden print:w-full print:h-[281mm] print:min-h-[281mm] print:p-0 print:border-none print:shadow-none print:break-after-avoid print:page-break-after-avoid"
            >
              {/* Overall Box Layout Frame from Header to Footer (Direct natural attachment) */}
              <div className="border-2 border-black w-full h-full bg-white text-black flex flex-col justify-between box-border">
                
                <div className="w-full flex flex-col flex-1">
                    {/* 1. Header Section (Only on Page 1) */}
                    {page.isFirstPage ? (
                    <>
                      <table className="w-full border-collapse border-b-2 border-black" style={{ backgroundColor: '#ffffff', color: '#000000' }}>
                        <tbody>
                          <tr>
                            <td className="w-[24%] align-middle text-center p-2.5 border-r-[1.5px] border-black">
                              <img
                                src={shepherdInvoiceLogo}
                                alt="Shepherd Enterprises"
                                className="w-[125px] h-[125px] object-contain mx-auto block"
                              />
                              <div className="text-[10px] font-black uppercase mt-1.5 text-slate-900 tracking-wider">
                                SHEPHERD ENTERPRISES
                              </div>
                              <div className="text-[8px] font-mono font-bold text-slate-800 break-all leading-tight mt-1 max-w-[155px] mx-auto">
                                {COMPANY_CONFIG.upi_id || 'msshepherdenterprisesprivatelimited.eazypay@icici'}
                              </div>
                            </td>
                            <td className="w-[76%] align-middle text-center p-3">
                              <div className="text-[40px] font-black uppercase tracking-[11px] text-blue-900 leading-none pl-[11px] whitespace-nowrap">
                                SHEPHERD
                              </div>
                              <div className="text-[17.5px] font-black uppercase tracking-[5px] text-blue-900 leading-tight mt-1.5 pl-[5px] whitespace-nowrap">
                                ENTERPRISES PRIVATE LIMITED
                              </div>
                              <p className="text-[8.8px] font-bold text-slate-900 leading-tight uppercase tracking-[0.2px] mt-2.5 mb-1 whitespace-nowrap">
                                NO.4 & 5 JENILA NAGAR, THIRUMULLAIVOYAL SALAI, KOVILPADAGAI, POONAMALLEE, TIRUVALLUR - 600062.
                              </p>
                              <p className="text-[9.5px] font-bold text-slate-950 leading-tight tracking-[0.2px] whitespace-nowrap">
                                Cell: +91 9025812298 / +91 8438435681 &nbsp;&middot;&nbsp; Email: shepherdenterprisespvtltd@gmail.com
                              </p>
                            </td>
                          </tr>
                        </tbody>
                      </table>

                      {/* 2. Sub-Header Row: GSTIN | DOC TYPE | COPY TYPE */}
                      <table className="w-full border-collapse border-b-2 border-black text-[11px]">
                        <tbody>
                          <tr>
                            <td className="w-[38%] p-2 font-bold border-r-[1.5px] border-black align-middle text-[12px]">
                              GSTIN: {COMPANY_CONFIG.gstin || '33ABUCS2217H1Z8'}
                            </td>
                            <td className="w-[24%] p-2 font-black text-center text-blue-900 text-[17px] tracking-wider uppercase border-r-[1.5px] border-black align-middle">
                              {isProforma ? 'PROFORMA INVOICE' : 'INVOICE'}
                            </td>
                            <td className="w-[38%] p-2 font-bold text-right uppercase tracking-wider text-[11px] align-middle">
                              <span>{copyTypeBadge}</span>
                            </td>
                          </tr>
                        </tbody>
                      </table>

                      {/* 3. Meta Grid: Invoice Details & Logistics (2 Columns) */}
                      <table className="w-full border-collapse border-b-2 border-black text-[11px]">
                        <tbody>
                          <tr className="border-b-[1.5px] border-black">
                            {/* Left Meta Column */}
                            <td className="w-[50%] p-2 border-r-[1.5px] border-black align-top space-y-1">
                              <div className="leading-tight">
                                <span className="font-bold">INVOICE NO : </span>
                                <span className="font-bold text-[11.5px]">{isProforma ? (fullData.proforma_number || fullData.invoice_number) : (fullData.invoice_number || fullData.proforma_number)}</span>
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
                                  <span className="font-black text-slate-950 text-[12px]">{fullData.buyer_name}</span>
                                </div>
                                <div className="leading-tight mt-1">
                                  <span className="font-bold">CUSTOMER ADDRESS: </span>
                                  <span className="text-[10.5px] text-slate-900 whitespace-pre-line font-medium">{fullData.buyer_address}</span>
                                </div>
                              </div>
                            </td>

                            {/* Right Meta Column */}
                            <td className="w-[50%] p-2 align-top space-y-1">
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
                                <span className="font-medium">
                                  {(() => {
                                    const from = (fullData.date_of_supply_from || fullData.date_of_supply || '').trim();
                                    const to = (fullData.date_of_supply_to || fullData.date_of_supply_from || fullData.date_of_supply || '').trim();
                                    const formatD = (d) => {
                                      if (!d || d === '-') return '-';
                                      const p = d.split('T')[0].split('-');
                                      return p.length === 3 && p[0].length === 4 ? `${p[2]}/${p[1]}/${p[0]}` : d;
                                    };
                                    const f = from || (isProforma ? fullData.proforma_date : fullData.invoice_date);
                                    const t = to || from || (isProforma ? fullData.proforma_date : fullData.invoice_date);
                                    if (f && t) {
                                      return `From ${formatD(f)} To ${formatD(t)}`;
                                    }
                                    if (f) {
                                      return `From ${formatD(f)} To ${formatD(f)}`;
                                    }
                                    return '-';
                                  })()}
                                </span>
                              </div>
                              <div className="leading-tight">
                                <span className="font-bold">DELIVERY ADDRESS: </span>
                                <span>{fullData.delivery_address || fullData.buyer_address || '-'}</span>
                              </div>
                            </td>
                          </tr>

                          {/* Customer GSTIN & State Code Row */}
                          <tr>
                            <td className="w-[50%] p-2 border-r-[1.5px] border-black align-middle font-bold text-[11.5px]">
                              CUSTOMER' GSTIN: {fullData.customer_gstin || 'N/A'}
                            </td>
                            <td className="w-[50%] p-2 align-middle space-y-0.5 text-[11px]">
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
                    /* Continuation Page Sub-Header Row */
                    <table className="w-full border-collapse border-b-2 border-black text-[11px]">
                      <tbody>
                        <tr className="bg-slate-50">
                          <td className="w-[38%] p-2 font-bold border-r-[1.5px] border-black align-middle text-[12px]">
                            INVOICE NO: {isProforma ? (fullData.proforma_number || fullData.invoice_number) : (fullData.invoice_number || fullData.proforma_number)}
                          </td>
                          <td className="w-[24%] p-2 font-black text-center text-blue-900 text-[17px] tracking-wider uppercase border-r-[1.5px] border-black align-middle">
                            {isProforma ? 'PROFORMA INVOICE' : 'INVOICE'}
                          </td>
                          <td className="w-[38%] p-2 font-bold text-right uppercase tracking-wider text-[11px] align-middle">
                            <span>{copyTypeBadge}</span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  )}

                  {/* 4. Line Items Table */}
                  <table className="w-full flex-1 border-collapse border-b-2 border-black text-left text-[11px] flex flex-col" style={{ tableLayout: 'fixed' }}>
                    <thead className="w-full">
                      <tr className="bg-white border-b-2 border-black font-bold uppercase text-[10.5px] flex w-full">
                        <th className="py-2 px-3 border-r-[1.5px] border-black text-left" style={{ width: '54%' }}>DESCRIPTION</th>
                        <th className="py-2 px-2.5 border-r-[1.5px] border-black text-center" style={{ width: '11%' }}>HSN</th>
                        <th className="py-2 px-2.5 border-r-[1.5px] border-black text-center" style={{ width: '11%' }}>QTY.</th>
                        <th className="py-2 px-2.5 border-r-[1.5px] border-black text-right" style={{ width: '12%' }}>RATE</th>
                        <th className="py-2 px-2.5 text-right" style={{ width: '12%' }}>AMOUNT</th>
                      </tr>
                    </thead>
                    <tbody className="w-full flex-1 flex flex-col divide-y-0">
                      {page.items.map((item, idx) => {
                        const isFirstOverallItem = page.isFirstPage && idx === 0;
                        return (
                          <tr key={idx} className="align-middle border-b-[1.5px] border-black flex w-full min-h-[34px]">
                            <td className="py-1.5 px-3 border-r-[1.5px] border-black flex flex-col justify-center" style={{ width: '54%', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                              <div className="font-bold uppercase text-slate-950 leading-tight text-[11px] whitespace-pre-wrap">
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
                            <td className="py-1.5 px-2.5 border-r-[1.5px] border-black text-center font-mono font-medium text-[11px] flex items-center justify-center" style={{ width: '11%' }}>{item.hsn_sac || '-'}</td>
                            <td className="py-1.5 px-2.5 border-r-[1.5px] border-black text-center font-mono font-medium text-[11px] flex items-center justify-center" style={{ width: '11%' }}>{item.quantity}</td>
                            <td className="py-1.5 px-2.5 border-r-[1.5px] border-black text-right font-mono font-medium text-[11px] flex items-center justify-end" style={{ width: '12%' }}>
                              {Number(item.rate).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="py-1.5 px-2.5 text-right font-mono font-bold text-[11px] flex items-center justify-end" style={{ width: '12%' }}>
                              {Number(item.amount || (item.quantity * item.rate)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        );
                      })}

                      {/* Extending vertical column grid lines through middle space */}
                      {page.hasTotalsAndFooter && (
                        <tr className="flex-1 flex w-full">
                          <td className="border-r-[1.5px] border-black h-full" style={{ width: '54%' }}>&nbsp;</td>
                          <td className="border-r-[1.5px] border-black text-center font-mono text-[11px] h-full" style={{ width: '11%' }}>&nbsp;</td>
                          <td className="border-r-[1.5px] border-black text-center font-mono text-[11px] h-full" style={{ width: '11%' }}>&nbsp;</td>
                          <td className="border-r-[1.5px] border-black text-right font-mono text-[11px] h-full" style={{ width: '12%' }}>&nbsp;</td>
                          <td className="text-right font-mono text-[11px] h-full" style={{ width: '12%' }}>&nbsp;</td>
                        </tr>
                      )}
                      {/* Page-wise Subtotal Row (When invoice has more than 1 page) */}
                      {page.totalPages > 1 && (
                        <tr className="border-t-2 border-black bg-slate-50 font-bold text-[10.5px]">
                          <td colSpan={4} className="py-2 px-3 border-r-[1.5px] border-black text-right uppercase tracking-wider">
                            {!page.isLastPage && (
                              <span className="float-left text-[9px] italic text-slate-500 font-normal">
                                Continued on Next Page...
                              </span>
                            )}
                            SUB TOTAL:
                          </td>
                          <td className="py-2 px-2.5 text-right font-bold text-[11px] font-mono">
                            {(page.items || []).reduce((sum, item) => sum + Number(item.amount || (item.quantity * item.rate) || 0), 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Bottom Section (Totals, Bank Details, and Footer on Last Page) */}
                {page.hasTotalsAndFooter && (
                  <div className="w-full">
                    {/* 5. Total Amount in Words Row (Slim, compact, attached directly on top of Bank Details & Tax) */}
                    <table className="w-full border-collapse border-b-2 border-black bg-white font-normal text-[11px]">
                      <tbody>
                        <tr>
                          <td className="py-1.5 px-3 text-left leading-tight">
                            <span className="font-bold">TOTAL AMOUNT IN WORDS: </span>
                            {fullData.amount_in_words}
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    {/* 6. Bank Details & Tax Summary Row */}
                    <table className="w-full border-collapse border-b-2 border-black text-[11px]">
                      <tbody>
                        <tr>
                          {/* Left: Bank Details */}
                          <td className="w-[50%] p-2.5 border-r-[1.5px] border-black align-top space-y-1">
                            <div className="font-black text-[11.5px] uppercase text-slate-900 mb-1">BANK DETAILS</div>
                            <div><span className="font-bold">BANK NAME: </span>{COMPANY_CONFIG.bank_name}: {COMPANY_CONFIG.account_number}</div>
                            <div><span className="font-bold">BRANCH NAME: </span>{(COMPANY_CONFIG.branch_name || 'Ambattur - Officer Colony').toUpperCase()}</div>
                            <div><span className="font-bold">IFSC CODE: </span>{COMPANY_CONFIG.ifsc_code}</div>
                          </td>

                          {/* Right: Tax Breakdown */}
                          <td className="w-[50%] p-0 align-top">
                            <table className="w-full border-collapse text-[11px]">
                              <tbody>
                                {pages.length > 1 && pages.map((p) => {
                                  const pSub = (p.items || []).reduce((sum, it) => sum + Number(it.amount || (it.quantity * it.rate) || 0), 0);
                                  return (
                                    <tr key={p.pageNumber} className="border-b-[1.5px] border-black text-slate-800 bg-slate-50/80 text-[10px]">
                                      <td className="p-1.5 text-left w-[68%] whitespace-nowrap border-r-[1.5px] border-black">SUB TOTAL</td>
                                      <td className="p-1.5 text-right w-[32%] font-medium font-mono whitespace-nowrap">
                                        {pSub.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                      </td>
                                    </tr>
                                  );
                                })}
                                <tr className="border-b-[1.5px] border-black font-bold">
                                  <td className="p-1.5 text-left w-[68%] whitespace-nowrap border-r-[1.5px] border-black">TOTAL AMOUNT BEFORE TAX</td>
                                  <td className="p-1.5 text-right w-[32%] font-bold font-mono whitespace-nowrap">
                                    {fullData.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                  </td>
                                </tr>
                                {totals.isIntraState ? (
                                  <>
                                    <tr className="border-b-[1.5px] border-black">
                                      <td className="p-1.5 text-left whitespace-nowrap border-r-[1.5px] border-black">ADD CGST: {totals.cgstRate}%</td>
                                      <td className="p-1.5 text-right font-medium font-mono whitespace-nowrap">
                                        {totals.cgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                      </td>
                                    </tr>
                                    <tr className="border-b-[1.5px] border-black">
                                      <td className="p-1.5 text-left whitespace-nowrap border-r-[1.5px] border-black">ADD SGST: {totals.sgstRate}%</td>
                                      <td className="p-1.5 text-right font-medium font-mono whitespace-nowrap">
                                        {totals.sgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                      </td>
                                    </tr>
                                  </>
                                ) : (
                                  <tr className="border-b-[1.5px] border-black">
                                    <td className="p-1.5 text-left whitespace-nowrap border-r-[1.5px] border-black">ADD IGST: {totals.igstRate}%</td>
                                    <td className="p-1.5 text-right font-medium font-mono whitespace-nowrap">
                                      {totals.igstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </td>
                                  </tr>
                                )}
                                {fullData.round_off !== 0 && fullData.round_off != null && (
                                  <tr className="border-b-[1.5px] border-black">
                                    <td className="p-1.5 text-left whitespace-nowrap border-r-[1.5px] border-black">ROUND OFF</td>
                                    <td className="p-1.5 text-right font-medium font-mono whitespace-nowrap">
                                      {fullData.round_off > 0 ? '+' : ''}{Number(fullData.round_off).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </td>
                                  </tr>
                                )}
                                <tr className="bg-slate-50 font-black text-[11.5px]">
                                  <td className="p-1.5 text-left whitespace-nowrap border-r-[1.5px] border-black">TOTAL AMOUNT AFTER TAX:</td>
                                  <td className="p-1.5 text-right font-mono whitespace-nowrap">
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
                    <table className="w-full border-collapse text-[10px]">
                      <tbody>
                        <tr>
                          <td className="w-[50%] align-top p-2.5 border-r-[1.5px] border-black">
                            <div className="font-bold uppercase text-[11px] text-slate-900 mb-1">TERMS AND CONDITIONS</div>
                            <div className="text-[9.5px] text-slate-800 leading-tight">
                              We declare that this invoice shows the actual value of services described and that all particulars are true and correct.
                            </div>
                            {fullData.notes && (
                              <div className="text-[9.5px] text-slate-800 mt-1">
                                <strong>Notes:</strong> {fullData.notes}
                              </div>
                            )}
                          </td>
                          <td className="w-[50%] align-top p-2.5 text-center">
                            <div className="font-bold text-[9.5px] uppercase text-slate-800 mb-1">
                              CERTIFIED THAT ABOVE INFORMATION ARE TRUE AND CORRECT
                            </div>
                            <div className="font-black text-[12px] text-blue-900 mb-1">
                              For SHEPHERD ENTERPRISES PRIVATE LIMITED
                            </div>
                            <div className="h-10"></div>
                            <div className="font-bold text-[11.5px] text-right pr-4 text-slate-950">
                              Director
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
