import React, { useState, useEffect } from 'react';
import { Trash2, RotateCcw, AlertTriangle, Search, RefreshCw, Trash } from 'lucide-react';
import { Table } from '../common/Table';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Dialog } from '../common/Dialog';
import { Loading } from '../common/Loading';
import { EmptyState } from '../common/EmptyState';
import { Pagination } from '../common/Pagination';
import { ipcClient } from '../../services/ipcClient';

export function RecycleBin({ toast }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 15;
  
  // Action modals state
  const [restoreTarget, setRestoreTarget] = useState(null);
  const [permDeleteTarget, setPermDeleteTarget] = useState(null);
  const [showEmptyConfirm, setShowEmptyConfirm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadBinItems();
  }, []);

  const loadBinItems = async () => {
    setLoading(true);
    try {
      const data = await ipcClient.listRecycleBin();
      setItems(data || []);
      setPage(1);
    } catch (err) {
      toast('error', err.message || 'Failed to load recycle bin.');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    if (!restoreTarget) return;
    setIsProcessing(true);
    try {
      const isPro = String(restoreTarget.invoice_type || restoreTarget.item_type).toUpperCase() === 'PROFORMA';
      const docNum = restoreTarget.doc_number || restoreTarget.invoice_number || restoreTarget.proforma_number;
      
      await ipcClient.restoreFromBin(restoreTarget.id, isPro ? 'PROFORMA' : 'NORMAL');
      toast('success', `${isPro ? 'Proforma' : 'Invoice'} ${docNum} has been restored successfully.`);
      setRestoreTarget(null);
      await loadBinItems();
    } catch (err) {
      toast('error', err.message || 'Failed to restore document.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePermanentDelete = async () => {
    if (!permDeleteTarget) return;
    setIsProcessing(true);
    try {
      const isPro = String(permDeleteTarget.invoice_type || permDeleteTarget.item_type).toUpperCase() === 'PROFORMA';
      const docNum = permDeleteTarget.doc_number || permDeleteTarget.invoice_number || permDeleteTarget.proforma_number;
      
      await ipcClient.deletePermanentlyFromBin(permDeleteTarget.id, isPro ? 'PROFORMA' : 'NORMAL');
      toast('info', `${isPro ? 'Proforma' : 'Invoice'} ${docNum} was permanently deleted.`);
      setPermDeleteTarget(null);
      await loadBinItems();
    } catch (err) {
      toast('error', err.message || 'Failed to delete document permanently.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEmptyBin = async () => {
    setIsProcessing(true);
    try {
      const res = await ipcClient.emptyRecycleBin();
      toast('info', `Recycle Bin emptied (${res?.count || items.length} records purged permanently).`);
      setShowEmptyConfirm(false);
      await loadBinItems();
    } catch (err) {
      toast('error', err.message || 'Failed to empty recycle bin.');
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredItems = items.filter((item) => {
    if (!search) return true;
    const q = search.toLowerCase();
    const docNum = (item.doc_number || item.invoice_number || item.proforma_number || '').toLowerCase();
    const buyer = (item.buyer_name || '').toLowerCase();
    const gstin = (item.customer_gstin || '').toLowerCase();
    return docNum.includes(q) || buyer.includes(q) || gstin.includes(q);
  });

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const paginatedItems = filteredItems.slice((page - 1) * pageSize, page * pageSize);

  const headers = [
    { label: 'S.No', align: 'center' },
    { label: 'Doc Number' },
    { label: 'Type' },
    { label: 'Buyer Name' },
    { label: 'Doc Date' },
    { label: 'Grand Total (₹)', align: 'right' },
    { label: 'Deleted On' },
    { label: 'Actions', align: 'right' }
  ];

  return (
    <div className="space-y-6">
      {/* Header & Controls Card */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border-2 border-slate-300 dark:border-slate-700 space-y-4 shadow-none">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Recycle Bin</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Manage deleted invoices and proforma documents. Restore them back to active state or delete permanently.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={RefreshCw}
              onClick={loadBinItems}
              disabled={loading || isProcessing}
            >
              Refresh
            </Button>

            {items.length > 0 && (
              <Button
                variant="danger"
                size="sm"
                icon={Trash}
                onClick={() => setShowEmptyConfirm(true)}
                disabled={loading || isProcessing}
              >
                Empty Recycle Bin ({items.length})
              </Button>
            )}
          </div>
        </div>

        {/* Search Input Filter */}
        <div className="pt-2">
          <Input
            placeholder="Search deleted records by invoice #, buyer name, or GSTIN..."
            icon={Search}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      {/* Content / Table View */}
      {loading ? (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border-2 border-slate-300 dark:border-slate-700 shadow-none">
          <Loading text="Loading Recycle Bin items..." />
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border-2 border-slate-300 dark:border-slate-700 shadow-none">
          <EmptyState
            title="Recycle Bin is Empty"
            description="There are no deleted invoices or proformas. Deleted documents will appear here for recovery."
            icon={Trash2}
          />
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border-2 border-slate-300 dark:border-slate-700 text-center py-10 shadow-none">
          <p className="text-sm text-slate-500 dark:text-slate-400">No deleted records match your search query "{search}".</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-300 dark:border-slate-700 overflow-hidden shadow-none">
            <Table headers={headers}>
              {paginatedItems.map((item, idx) => {
                const isProforma = String(item.invoice_type || item.item_type).toUpperCase() === 'PROFORMA';
                const docNum = item.doc_number || item.invoice_number || item.proforma_number;
                const docDate = item.doc_date || item.invoice_date || item.proforma_date;
                const serialNo = (page - 1) * pageSize + idx + 1;
                const deletedDate = item.deleted_at 
                  ? new Date(item.deleted_at).toLocaleString('en-IN', {
                      dateStyle: 'medium',
                      timeStyle: 'short'
                    })
                  : 'Recently';

                return (
                  <tr key={`${item.item_type}-${item.id}`} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <td className="px-3 py-3.5 text-center font-bold text-slate-500 dark:text-slate-400 border-r border-slate-200 dark:border-slate-800">{serialNo}</td>
                    <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-slate-100 border-r border-slate-200 dark:border-slate-800">
                      {docNum}
                    </td>
                    <td className="px-4 py-3.5 border-r border-slate-200 dark:border-slate-800">
                      <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                        isProforma 
                          ? 'bg-cyan-50 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800' 
                          : 'bg-indigo-50 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                      }`}>
                        {isProforma ? 'PROFORMA' : (item.invoice_type || 'NORMAL')}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-900 dark:text-slate-100 font-medium border-r border-slate-200 dark:border-slate-800">
                      <div>{item.buyer_name}</div>
                      {item.customer_gstin && (
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono font-bold">GSTIN: {item.customer_gstin}</div>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-slate-700 dark:text-slate-300 text-xs border-r border-slate-200 dark:border-slate-800">{docDate}</td>
                    <td className="px-4 py-3.5 text-right font-bold text-slate-900 dark:text-slate-100 text-xs border-r border-slate-200 dark:border-slate-800">
                      ₹{Number(item.grand_total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400 text-xs border-r border-slate-200 dark:border-slate-800">
                      {deletedDate}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setRestoreTarget(item)}
                          className="p-1.5 rounded-lg text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors flex items-center gap-1 text-xs font-semibold px-2.5 py-1 border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950 cursor-pointer shadow-none"
                          title="Restore to Active Invoices"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Restore</span>
                        </button>

                        <button
                          onClick={() => setPermDeleteTarget(item)}
                          className="p-1.5 rounded-lg text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900 transition-colors flex items-center gap-1 text-xs font-semibold px-2.5 py-1 border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950 cursor-pointer shadow-none"
                          title="Delete Permanently"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete Forever</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </Table>
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={filteredItems.length}
            pageSize={pageSize}
            onPageChange={setPage}
            itemName="deleted items"
          />
        </div>
      )}

      {/* Restore Confirmation Dialog */}
      <Dialog
        isOpen={Boolean(restoreTarget)}
        onClose={() => !isProcessing && setRestoreTarget(null)}
        onConfirm={handleRestore}
        title="Restore Document?"
        message={`Are you sure you want to restore document "${restoreTarget?.doc_number || restoreTarget?.invoice_number || restoreTarget?.proforma_number}" (Buyer: ${restoreTarget?.buyer_name || 'N/A'}) back to active invoice records?`}
        confirmText="Restore Invoice"
        cancelText="Cancel"
        variant="primary"
        isLoading={isProcessing}
      />

      {/* Permanent Delete Single Item Dialog */}
      <Dialog
        isOpen={Boolean(permDeleteTarget)}
        onClose={() => !isProcessing && setPermDeleteTarget(null)}
        onConfirm={handlePermanentDelete}
        title="Permanently Delete Document?"
        message={`Are you sure you want to permanently delete document "${permDeleteTarget?.doc_number || permDeleteTarget?.invoice_number || permDeleteTarget?.proforma_number}"? This will erase all line items, tax details, and associated records forever. This action CANNOT be undone.`}
        confirmText="Delete Forever"
        cancelText="Cancel"
        variant="danger"
        isLoading={isProcessing}
      />

      {/* Empty Entire Bin Confirmation Dialog */}
      <Dialog
        isOpen={showEmptyConfirm}
        onClose={() => !isProcessing && setShowEmptyConfirm(false)}
        onConfirm={handleEmptyBin}
        title="Empty Entire Recycle Bin?"
        message={`Warning: You are about to permanently delete all ${items.length} items currently in the Recycle Bin. All line items and data will be completely purged. This action CANNOT be undone.`}
        confirmText="Empty Bin Completely"
        cancelText="Cancel"
        variant="danger"
        isLoading={isProcessing}
      />
    </div>
  );
}
