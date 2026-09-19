import React, { useState, useEffect } from 'react';
import { Trash2, RotateCcw, Search, AlertTriangle, CheckCircle2, FileText, Info } from 'lucide-react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Dialog } from '../common/Dialog';
import { Table } from '../common/Table';
import { EmptyState } from '../common/EmptyState';
import { Loading } from '../common/Loading';
import { ipcClient } from '../../services/ipcClient';

export function RecycleBin({ toast }) {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  
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
      const data = await ipcClient.getRecycleBin();
      setItems(data || []);
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

  const headers = [
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
      <div className="glass-panel p-6 rounded-xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-slate-100">Invoice Recycle Bin</h3>
                {items.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-950 text-rose-400 border border-rose-800/40">
                    {items.length} {items.length === 1 ? 'item' : 'items'}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage deleted tax invoices and proformas. Restored items will instantly return to your active history and dashboard.
              </p>
            </div>
          </div>

          {items.length > 0 && (
            <Button
              variant="danger"
              size="sm"
              icon={Trash2}
              onClick={() => setShowEmptyConfirm(true)}
            >
              Empty Recycle Bin
            </Button>
          )}
        </div>

        {/* Search Filter */}
        {items.length > 0 && (
          <div className="pt-2">
            <Input
              placeholder="Search deleted items by number, buyer name, or GSTIN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={Search}
            />
          </div>
        )}
      </div>

      {/* Table Content Area */}
      {loading ? (
        <Loading text="Loading Recycle Bin..." />
      ) : items.length === 0 ? (
        <div className="glass-panel p-8 rounded-xl border border-slate-800">
          <EmptyState
            icon={Trash2}
            title="Recycle Bin is Empty"
            description="No deleted invoices or proformas. When you delete an invoice from the History page, it will be safely moved here for you to restore anytime."
          />
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="glass-panel p-8 rounded-xl border border-slate-800 text-center py-10">
          <p className="text-sm text-slate-400">No deleted records match your search query "{search}".</p>
        </div>
      ) : (
        <div className="glass-panel rounded-xl border border-slate-800 overflow-hidden shadow-sm">
          <Table headers={headers}>
            {filteredItems.map((item) => {
              const isProforma = String(item.invoice_type || item.item_type).toUpperCase() === 'PROFORMA';
              const docNum = item.doc_number || item.invoice_number || item.proforma_number;
              const docDate = item.doc_date || item.invoice_date || item.proforma_date;
              const deletedDate = item.deleted_at 
                ? new Date(item.deleted_at).toLocaleString('en-IN', {
                    dateStyle: 'medium',
                    timeStyle: 'short'
                  })
                : 'Recently';

              return (
                <tr key={`${item.item_type}-${item.id}`} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3.5 font-bold text-slate-200">
                    {docNum}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                      isProforma 
                        ? 'bg-cyan-950 text-cyan-400 border border-cyan-800/40' 
                        : 'bg-indigo-950 text-indigo-400 border border-indigo-800/40'
                    }`}>
                      {isProforma ? 'PROFORMA' : (item.invoice_type || 'NORMAL')}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-300 font-medium">
                    <div>{item.buyer_name}</div>
                    {item.customer_gstin && (
                      <div className="text-[10px] text-slate-400 font-mono">GSTIN: {item.customer_gstin}</div>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-slate-300 text-xs">{docDate}</td>
                  <td className="px-4 py-3.5 text-right font-bold text-emerald-400 text-xs">
                    ₹{Number(item.grand_total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3.5 text-slate-400 text-xs">
                    {deletedDate}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setRestoreTarget(item)}
                        className="p-1.5 rounded-lg text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/60 transition-colors flex items-center gap-1 text-xs font-semibold px-2.5 py-1 border border-emerald-800/40 bg-emerald-950/30"
                        title="Restore to Active Invoices"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Restore</span>
                      </button>

                      <button
                        onClick={() => setPermDeleteTarget(item)}
                        className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/60 transition-colors flex items-center gap-1 text-xs font-semibold px-2.5 py-1 border border-rose-800/40 bg-rose-950/30"
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
