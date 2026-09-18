import React, { useState, useEffect } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { HistorySearch } from '../components/history/HistorySearch';
import { HistoryFilters } from '../components/history/HistoryFilters';
import { HistoryTable } from '../components/history/HistoryTable';
import { InvoicePreview } from '../components/invoice/InvoicePreview';
import { Loading } from '../components/common/Loading';
import { EmptyState } from '../components/common/EmptyState';
import { Button } from '../components/common/Button';
import { ChevronLeft, ChevronRight, History as HistoryIcon } from 'lucide-react';
import { ipcClient } from '../services/ipcClient';

export function History({ toast, onNavigateCreate, onDuplicateInvoice, onConvertProforma }) {
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ invoiceType: '', startDate: '', endDate: '' });
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => {
    loadInvoices();
  }, [page, search, filters]);

  const loadInvoices = async () => {
    setLoading(true);
    try {
      const isProformaSearch = filters.invoiceType === 'PROFORMA';
      let result;

      if (isProformaSearch) {
        result = await ipcClient.listProformas({ page, limit: 15, search, status: '' });
      } else {
        result = await ipcClient.listInvoices({
          page,
          limit: 15,
          search,
          invoiceType: filters.invoiceType,
          startDate: filters.startDate,
          endDate: filters.endDate
        });
      }

      setInvoices(result?.data || []);
      setTotalPages(result?.totalPages || 1);
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

  const handleConvert = (inv) => {
    if (onConvertProforma) onConvertProforma(inv);
  };

  if (selectedInvoice) {
    return (
      <PageContainer>
        <InvoicePreview
          formData={selectedInvoice}
          onBack={() => setSelectedInvoice(null)}
          toast={toast}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <HistorySearch search={search} setSearch={setSearch} />
        <HistoryFilters filters={filters} setFilters={setFilters} />
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
            onView={(inv) => setSelectedInvoice(inv)}
            onPrint={handlePrint}
            onPdf={handlePdf}
            onExcel={handleExcel}
            onDuplicate={handleDuplicate}
            onConvert={handleConvert}
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
    </PageContainer>
  );
}
