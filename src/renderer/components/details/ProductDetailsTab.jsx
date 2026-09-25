import React, { useState, useEffect } from 'react';
import { Package, Search, Plus, Edit2, Trash2, Hash, IndianRupee } from 'lucide-react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Dialog } from '../common/Dialog';
import { Table } from '../common/Table';
import { EmptyState } from '../common/EmptyState';
import { Loading } from '../common/Loading';
import { ipcClient } from '../../services/ipcClient';
import { FEATURE_FLAGS } from '../../../shared/constants/featureFlags';

export function ProductDetailsTab({ toast }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
  const [editingId, setEditingId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Delete dialog state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form fields
  const [form, setForm] = useState({
    name: '',
    hsn_sac: '',
    default_quantity: 1,
    rate: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadProducts();
  }, [search]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const list = await ipcClient.listProducts(search);
      setProducts(list || []);
    } catch (err) {
      toast('error', err.message || 'Failed to load product catalog.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setModalMode('add');
    setEditingId(null);
    setForm({
      name: '',
      hsn_sac: '',
      default_quantity: 1,
      rate: ''
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (prod) => {
    setModalMode('edit');
    setEditingId(prod.id);
    setForm({
      name: prod.name || '',
      hsn_sac: prod.hsn_sac || '',
      default_quantity: prod.default_quantity || 1,
      rate: prod.rate || ''
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Product / Service name is required';
    if (!form.hsn_sac.trim()) errs.hsn_sac = 'HSN/SAC code is required';
    if (form.default_quantity == null || Number(form.default_quantity) <= 0) {
      errs.default_quantity = 'Quantity must be greater than 0';
    }
    if (form.rate === '' || isNaN(Number(form.rate)) || Number(form.rate) < 0) {
      errs.rate = 'Valid price / rate is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setIsSaving(true);
    try {
      await ipcClient.saveProduct({
        id: editingId,
        name: form.name.trim(),
        hsn_sac: form.hsn_sac.trim(),
        default_quantity: Number(form.default_quantity) || 1,
        rate: Number(form.rate) || 0
      });
      toast('success', modalMode === 'add' ? 'Product added to Catalog!' : 'Product details updated!');
      setIsModalOpen(false);
      loadProducts();
    } catch (err) {
      toast('error', err.message || 'Failed to save product.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await ipcClient.deleteProduct(deleteTarget.id);
      toast('info', `Removed "${deleteTarget.name}" from catalog.`);
      setDeleteTarget(null);
      loadProducts();
    } catch (err) {
      toast('error', err.message || 'Failed to delete product.');
    } finally {
      setIsDeleting(false);
    }
  };

  const tableHeaders = [
    { label: 'S.No', align: 'center' },
    { label: 'Product / Service Description' },
    { label: 'HSN / SAC Code', align: 'center' },
    { label: 'Default Qty', align: 'center' },
    { label: 'Unit Rate (₹)', align: 'right' },
    { label: 'Actions', align: 'right' }
  ];

  return (
    <div className="space-y-4">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search product name or HSN code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-sky-500 shadow-none"
          />
        </div>

        <Button variant="primary" icon={Plus} onClick={handleOpenAdd}>
          Add New Product
        </Button>
      </div>

      {/* Products Data Table */}
      {loading ? (
        <Loading text="Loading product catalog..." />
      ) : products.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No Products in Catalog"
          description={search ? `No product matching "${search}"` : "Add products or services with HSN codes here to enable instant HSN-based auto-fill during billing."}
          actionLabel="Add First Product"
          onAction={handleOpenAdd}
        />
      ) : (
        <Table headers={tableHeaders}>
          {products.map((prod, idx) => (
            <tr key={prod.id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <td className="px-3 py-3 text-center font-bold text-slate-500 dark:text-slate-400 border-r border-slate-200 dark:border-slate-800 text-xs">
                {idx + 1}
              </td>
              <td className="px-4 py-3 border-r border-slate-200 dark:border-slate-800 text-xs">
                <div className="font-bold text-slate-900 dark:text-slate-100 uppercase">{prod.name}</div>
              </td>
              <td className="px-3 py-3 text-center border-r border-slate-200 dark:border-slate-800 text-xs font-mono font-bold">
                <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[11px]">
                  {prod.hsn_sac || '-'}
                </span>
              </td>
              <td className="px-3 py-3 text-center border-r border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-700 dark:text-slate-300">
                {prod.default_quantity || 1}
              </td>
              <td className="px-4 py-3 text-right border-r border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-slate-100 font-mono">
                ₹{Number(prod.rate || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </td>
              <td className="px-4 py-3 text-right text-xs">
                <div className="flex items-center justify-end gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(prod)}
                    className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-950 transition-colors cursor-pointer"
                    title="Edit Product"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(prod)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors cursor-pointer"
                    title="Delete Product"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </Table>
      )}

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-300 dark:border-slate-700 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                    {modalMode === 'add' ? 'Add Product / Service Item' : 'Edit Product Details'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Saved items auto-fill description & rate when typing HSN in invoices
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3.5">
              <Input
                label="Product / Service Description *"
                placeholder="e.g. Industrial Supply / Service Item"
                maxLength={FEATURE_FLAGS.MAX_PRODUCT_NAME_LENGTH || 60}
                value={form.name}
                onChange={(e) => setForm(prev => ({ ...prev, name: (e.target.value || '').slice(0, FEATURE_FLAGS.MAX_PRODUCT_NAME_LENGTH || 60) }))}
                error={errors.name}
                autoFocus
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <Input
                    label="HSN / SAC Code *"
                    placeholder="e.g. 9983"
                    value={form.hsn_sac}
                    onChange={(e) => setForm(prev => ({ ...prev, hsn_sac: e.target.value }))}
                    error={errors.hsn_sac}
                    className="font-mono"
                  />
                </div>

                <div>
                  <Input
                    label="Default Qty *"
                    type="number"
                    min="1"
                    step="any"
                    placeholder="1"
                    value={form.default_quantity}
                    onChange={(e) => setForm(prev => ({ ...prev, default_quantity: e.target.value }))}
                    error={errors.default_quantity}
                    className="font-mono text-center"
                  />
                </div>

                <div>
                  <Input
                    label="Unit Rate (₹) *"
                    type="number"
                    min="0"
                    step="any"
                    placeholder="0.00"
                    value={form.rate}
                    onChange={(e) => setForm(prev => ({ ...prev, rate: e.target.value }))}
                    error={errors.rate}
                    className="font-mono text-right"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSave} isLoading={isSaving}>
                {modalMode === 'add' ? 'Save to Catalog' : 'Update Product'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete Product Item"
        confirmLabel="Yes, Delete Product"
        cancelLabel="Cancel"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
      >
        <p className="text-xs text-slate-600 dark:text-slate-300">
          Are you sure you want to delete <strong>{deleteTarget?.name}</strong> (HSN: {deleteTarget?.hsn_sac}) from the catalog?
        </p>
      </Dialog>
    </div>
  );
}
