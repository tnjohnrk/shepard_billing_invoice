import React, { useState, useEffect } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { HistorySearch } from '../components/history/HistorySearch';
import { HistoryFilters } from '../components/history/HistoryFilters';
import { HistoryTable } from '../components/history/HistoryTable';
import { InvoicePreview } from '../components/invoice/InvoicePreview';
import { Loading } from '../components/common/Loading';
import { EmptyState } from '../components/common/EmptyState';
import { Button } from '../components/common/Button';
import { Dialog } from '../components/common/Dialog';
import { ChevronLeft, ChevronRight, History as HistoryIcon } from 'lucide-react';
import { ipcClient } from '../services/ipcClient';

export function History({ initialInvoice = null, toast, onNavigateCreate, onDuplicateInvoice, onConvertProforma }) {
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ invoiceType: '', startDate: '', endDate: '' });
  const [selectedInvoice, setSelectedInvoice] = useState(initialInvoice);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (initialInvoice) {
      handleViewInvoice(initialInvoice);
    }
  }, [initialInvoice]);

  useEffect(() => {
    loadInvoices();
  }, [page, search, filters]);

  const loadInvoices = async () => {
    setLoading(true);
    try {
      if (filters.invoiceType === 'PROFORMA') {
        const result = await ipcClient.listProformas({ page, limit: 15, search, status: '' });
        let data = (result?.data || []).map(p => ({
          ...p,
          invoice_type: 'PROFORMA',
          invoice_number: p.proforma_number || p.invoice_number,
          invoice_date: p.proforma_date || p.invoice_date
        }));

        if (filters.startDate) {
          data = data.filter(p => (p.proforma_date || p.invoice_date || '') >= filters.startDate);
        }
        if (filters.endDate) {
          data = data.filter(p => (p.proforma_date || p.invoice_date || '') <= filters.endDate);
        }

        setInvoices(data);
        setTotalPages(result?.totalPages || 1);
      } else if (filters.invoiceType === 'NORMAL') {
        const result = await ipcClient.listInvoices({
          page,
          limit: 15,
          search,
          invoiceType: 'NORMAL',
          startDate: filters.startDate,
          endDate: filters.endDate
        });
        const data = (result?.data || []).map(i => ({
          ...i,
          invoice_type: i.invoice_type || 'NORMAL'
        }));
        setInvoices(data);
        setTotalPages(result?.totalPages || 1);
      } else {
        // ALL Document Types: Combine both Normal (Tax) Invoices and Proformas
        const [invRes, proRes] = await Promise.all([
          ipcClient.listInvoices({ page: 1, limit: 1000, search, startDate: filters.startDate, endDate: filters.endDate }),
          ipcClient.listProformas({ page: 1, limit: 1000, search, status: '' })
        ]);

        const rawInvoices = (invRes?.data || []).map(i => ({
          ...i,
          invoice_type: i.invoice_type || 'NORMAL'
        }));

        let rawProformas = (proRes?.data || []).map(p => ({
          ...p,
          invoice_type: 'PROFORMA',
          invoice_number: p.proforma_number || p.invoice_number,
          invoice_date: p.proforma_date || p.invoice_date
        }));

        if (filters.startDate) {
          rawProformas = rawProformas.filter(p => (p.proforma_date || p.invoice_date || '') >= filters.startDate);
        }
        if (filters.endDate) {
          rawProformas = rawProformas.filter(p => (p.proforma_date || p.invoice_date || '') <= filters.endDate);
        }

        const combined = [...rawInvoices, ...rawProformas].sort((a, b) => {
          const dateA = a.created_at || a.invoice_date || a.proforma_date || '';
          const dateB = b.created_at || b.invoice_date || b.proforma_date || '';
          return dateB.localeCompare(dateA);
        });

        const limit = 15;
        const total = combined.length;
        const calculatedTotalPages = Math.max(1, Math.ceil(total / limit));
        const paginatedData = combined.slice((page - 1) * limit, page * limit);

        setInvoices(paginatedData);
        setTotalPages(calculatedTotalPages);
      }
    } catch (err) {
      toast('error', err.message || 'Failed to fetch invoice history.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = async (inv) => {
    try {
      await ipcClient.printInvoice(inv, {});
      toast('info', `Print command sent for ${inv.invoice_number || inv.proforma_number}`);
    } catch (e) {
      toast('error', e.message || 'Printing failed.');
    }
  };

  const handlePdf = async (inv) => {
    try {
      const res = await ipcClient.exportInvoicePdf(inv);
      if (res && !res.canceled && res.path) {
        toast('success', `PDF saved to: ${res.path}`);
      }
    } catch (e) {
      toast('error', e.message || 'PDF export failed.');
    }
  };

  const handleExcel = async (inv) => {
    try {
      const res = await ipcClient.exportInvoiceExcel(inv);
      if (res && !res.canceled && res.path) {
        toast('success', `Excel saved to: ${res.path}`);
      }
    } catch (e) {
      toast('error', e.message || 'Excel export failed.');
    }
  };

  const handleDuplicate = async (inv) => {
    try {
      const duplicated = await ipcClient.duplicateInvoice(inv.id);
      if (onDuplicateInvoice) onDuplicateInvoice(duplicated);
    } catch (e) {
      toast('error', e.message || 'Duplication failed.');
    }
  };

  const [convertTarget, setConvertTarget] = useState(null);
  const [isConverting, setIsConverting] = useState(false);

  const handleConvert = (inv) => {
    setConvertTarget(inv);
  };

  const handleConfirmConvert = async () => {
    if (!convertTarget) return;
    setIsConverting(true);
    try {
      const converted = await ipcClient.convertProformaToInvoice({ proformaId: convertTarget.id });
      if (converted) {
        toast('success', `Proforma ${convertTarget.proforma_number || convertTarget.invoice_number} successfully converted to Official Tax Invoice ${converted.invoice_number}!`);
        setConvertTarget(null);
        await loadInvoices();
        setSelectedInvoice(converted);
      }
    } catch (e) {
      toast('error', e.message || 'Proforma conversion failed.');
    } finally {
      setIsConverting(false);
    }
  };

  const handleDeleteClick = (inv) => {
    setDeleteTarget(inv);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const isProforma = String(deleteTarget.invoice_type).toUpperCase() === 'PROFORMA';
      const docNum = isProforma 
        ? (deleteTarget.proforma_number || deleteTarget.invoice_number)
        : (deleteTarget.invoice_number || deleteTarget.proforma_number);

      if (isProforma) {
        await ipcClient.deleteProforma(deleteTarget.id);
      } else {
        await ipcClient.deleteInvoice(deleteTarget.id);
      }

      toast('success', `${isProforma ? 'Proforma' : 'Invoice'} ${docNum} moved to Recycle Bin.`);
      setDeleteTarget(null);
      await loadInvoices();
    } catch (e) {
      toast('error', e.message || 'Failed to move invoice to Recycle Bin.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleViewInvoice = async (inv) => {
    try {
      const isProforma = String(inv.invoice_type).toUpperCase() === 'PROFORMA';
      let full = null;
      if (inv.id) {
        full = isProforma ? await ipcClient.getProforma(inv.id) : await ipcClient.getInvoice(inv.id);
      }
      setSelectedInvoice(full || inv);
    } catch {
      setSelectedInvoice(inv);
    }
  };

  if (selectedInvoice) {
    return (
      <PageContainer>
        <InvoicePreview
          formData={selectedInvoice}
          onBack={() => {
            setSelectedInvoice(null);
            loadInvoices();
          }}
          toast={toast}
        />
      </PageContainer>
    );
  }

  const deleteDocNum = deleteTarget 
    ? (String(deleteTarget.invoice_type).toUpperCase() === 'PROFORMA'
        ? (deleteTarget.proforma_number || deleteTarget.invoice_number)
        : (deleteTarget.invoice_number || deleteTarget.proforma_number))
    : '';

  const convertDocNum = convertTarget
    ? (convertTarget.proforma_number || convertTarget.invoice_number || 'PRO-001')
    : '';

  return (
    <PageContainer>
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <HistorySearch search={search} setSearch={(val) => { setSearch(val); setPage(1); }} />
        <HistoryFilters filters={filters} setFilters={(f) => { setFilters(f); setPage(1); }} />
      </div>

      {loading ? (
        <Loading text="Searching Invoice History..." />
      ) : invoices.length === 0 ? (
        <EmptyState
          icon={HistoryIcon}
          title="No Invoice Records Found"
          description="There are no saved tax invoices or proforma invoices matching your search criteria."
          action={
            <Button variant="primary" onClick={onNavigateCreate}>
              Create New Invoice
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          <HistoryTable
            invoices={invoices}
            onView={handleViewInvoice}
            onPrint={handlePrint}
            onPdf={handlePdf}
            onExcel={handleExcel}
            onDuplicate={handleDuplicate}
            onConvert={handleConvert}
            onDelete={handleDeleteClick}
          />

          {/* Pagination Bar */}
          <div className="flex items-center justify-between px-2 pt-2 text-xs text-slate-400">
            <div>Page {page} of {totalPages}</div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                icon={ChevronLeft}
                onClick={() => setPage(p => Math.max(p - 1, 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                icon={ChevronRight}
                onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                disabled={page >= totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Convert Proforma Confirmation Dialog */}
      <Dialog
        isOpen={Boolean(convertTarget)}
        onClose={() => !isConverting && setConvertTarget(null)}
        onConfirm={handleConfirmConvert}
        title="Convert Proforma to Official Tax Invoice"
        message={`Are you sure you want to convert Proforma "${convertDocNum}" (Buyer: ${convertTarget?.buyer_name || 'N/A'}, Amount: ₹${Number(convertTarget?.grand_total || 0).toLocaleString('en-IN')}) into an official Tax Invoice? This will automatically assign a new Tax Invoice Number and generate the official Tax Invoice PDF.`}
        confirmText="Convert to Tax Invoice"
        cancelText="Cancel"
        variant="primary"
        isLoading={isConverting}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => !isDeleting && setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Move to Recycle Bin?"
        message={`Are you sure you want to move document "${deleteDocNum}" (Buyer: ${deleteTarget?.buyer_name || 'N/A'}) to the Recycle Bin? You can restore it anytime in Settings > Recycle Bin.`}
        confirmText="Move to Bin"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />
    </PageContainer>
  );
}
