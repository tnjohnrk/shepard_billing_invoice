import React, { useState, useEffect } from 'react';
import { Building2, Search, Plus, Edit2, Trash2, MapPin, Hash, Sparkles } from 'lucide-react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Dialog } from '../common/Dialog';
import { Table } from '../common/Table';
import { EmptyState } from '../common/EmptyState';
import { Loading } from '../common/Loading';
import { INDIAN_STATES } from '../../../shared/constants/application';
import { ipcClient } from '../../services/ipcClient';

export function CompanyDetailsTab({ toast }) {
  const [companies, setCompanies] = useState([]);
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
    address: '',
    gstin: '',
    state: 'Tamil Nadu',
    state_code: '33'
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadCompanies();
  }, [search]);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const list = await ipcClient.listCustomers(search);
      setCompanies(list || []);
    } catch (err) {
      toast('error', err.message || 'Failed to load company records.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setModalMode('add');
    setEditingId(null);
    setForm({
      name: '',
      address: '',
      gstin: '',
      state: 'Tamil Nadu',
      state_code: '33'
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (comp) => {
    setModalMode('edit');
    setEditingId(comp.id);
    setForm({
      name: comp.name || '',
      address: comp.address || '',
      gstin: comp.gstin || '',
      state: comp.state || 'Tamil Nadu',
      state_code: comp.state_code || '33'
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleGstinChange = (val) => {
    const uppercaseGst = val.toUpperCase().trim();
    setForm(prev => ({ ...prev, gstin: uppercaseGst }));

    if (errors.gstin) setErrors(prev => ({ ...prev, gstin: null }));

    // Auto-detect state if first 2 digits match state code
    if (uppercaseGst.length >= 2) {
      const code = uppercaseGst.substring(0, 2);
      const matched = INDIAN_STATES.find(s => s.code === code);
      if (matched) {
        setForm(prev => ({ ...prev, state: matched.name, state_code: matched.code }));
      }
    }
  };

  const handleStateChange = (code) => {
    const matched = INDIAN_STATES.find(s => s.code === code);
    if (matched) {
      setForm(prev => ({ ...prev, state: matched.name, state_code: matched.code }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Company name is required';
    if (!form.address.trim()) errs.address = 'Company address is required';
    if (form.gstin.trim()) {
      if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(form.gstin.trim())) {
        errs.gstin = 'Invalid GSTIN format (15 characters required, e.g. 33AAAAA0000A1Z5)';
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setIsSaving(true);
    try {
      await ipcClient.saveCustomer({
        id: editingId,
        name: form.name.trim(),
        address: form.address.trim(),
        gstin: form.gstin.trim().toUpperCase() || null,
        state: form.state,
        state_code: form.state_code
      });
      toast('success', modalMode === 'add' ? 'Company saved to Directory!' : 'Company details updated!');
      setIsModalOpen(false);
      loadCompanies();
    } catch (err) {
      toast('error', err.message || 'Failed to save company.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await ipcClient.deleteCustomer(deleteTarget.id);
      toast('info', `Removed "${deleteTarget.name}" from directory.`);
      setDeleteTarget(null);
      loadCompanies();
    } catch (err) {
      toast('error', err.message || 'Failed to delete company.');
    } finally {
      setIsDeleting(false);
    }
  };

  const tableHeaders = [
    { label: 'S.No', align: 'center' },
    { label: 'Company / Client Name' },
    { label: 'GSTIN', align: 'center' },
    { label: 'Address' },
    { label: 'State & Code' },
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
            placeholder="Search company name, GSTIN, or address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-sky-500 shadow-none"
          />
        </div>

        <Button variant="primary" icon={Plus} onClick={handleOpenAdd}>
          Add New Company
        </Button>
      </div>

      {/* Companies Data Table */}
      {loading ? (
        <Loading text="Loading company directory..." />
      ) : companies.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No Companies Found"
          description={search ? `No company matching "${search}"` : "Add client companies here to automatically suggest and auto-fill them during invoice creation."}
          actionLabel="Add First Company"
          onAction={handleOpenAdd}
        />
      ) : (
        <Table headers={tableHeaders}>
          {companies.map((comp, idx) => (
            <tr key={comp.id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <td className="px-3 py-3 text-center font-bold text-slate-500 dark:text-slate-400 border-r border-slate-200 dark:border-slate-800 text-xs">
                {idx + 1}
              </td>
              <td className="px-4 py-3 border-r border-slate-200 dark:border-slate-800 text-xs">
                <div className="font-bold text-slate-900 dark:text-slate-100">{comp.name}</div>
              </td>
              <td className="px-3 py-3 text-center border-r border-slate-200 dark:border-slate-800 text-xs font-mono">
                {comp.gstin ? (
                  <span className="px-2 py-0.5 rounded bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 font-bold border border-sky-200 dark:border-sky-800 text-[11px]">
                    {comp.gstin}
                  </span>
                ) : (
                  <span className="text-slate-400">-</span>
                )}
              </td>
              <td className="px-4 py-3 border-r border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 max-w-xs truncate">
                {comp.address || '-'}
              </td>
              <td className="px-4 py-3 border-r border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200">
                <div>{comp.state || 'Tamil Nadu'}</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Code: {comp.state_code || '33'}</div>
              </td>
              <td className="px-4 py-3 text-right text-xs">
                <div className="flex items-center justify-end gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(comp)}
                    className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-950 transition-colors cursor-pointer"
                    title="Edit Company"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(comp)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors cursor-pointer"
                    title="Delete Company"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </Table>
      )}

      {/* Add / Edit Company Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-300 dark:border-slate-700 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                    {modalMode === 'add' ? 'Add Client Company' : 'Edit Company Details'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Save client details for instant auto-complete in invoices
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3.5">
              <Input
                label="Company / Buyer Name *"
                placeholder="e.g. Acme Corporation Pvt Ltd"
                value={form.name}
                onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                error={errors.name}
                autoFocus
              />

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Company Address *
                </label>
                <textarea
                  rows={2}
                  placeholder="Street, City, Pincode"
                  value={form.address}
                  onChange={(e) => setForm(prev => ({ ...prev, address: e.target.value }))}
                  className={`w-full text-xs rounded-xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3 py-2 placeholder-slate-400 focus:outline-none focus:border-sky-500 shadow-none ${
                    errors.address ? 'border-rose-500' : 'border-slate-300 dark:border-slate-700'
                  }`}
                />
                {errors.address && <p className="text-[11px] text-rose-500 mt-0.5">{errors.address}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="GSTIN Number"
                  placeholder="e.g. 33AAAAA0000A1Z5"
                  value={form.gstin}
                  onChange={(e) => handleGstinChange(e.target.value)}
                  error={errors.gstin}
                  className="font-mono uppercase"
                />

                <Select
                  label="State"
                  value={form.state_code}
                  onChange={(e) => handleStateChange(e.target.value)}
                  options={INDIAN_STATES.map(s => ({
                    value: s.code,
                    label: `${s.name} (${s.code})`
                  }))}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSave} isLoading={isSaving}>
                {modalMode === 'add' ? 'Save to Directory' : 'Update Company'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete Company Record"
        confirmLabel="Yes, Delete Record"
        cancelLabel="Cancel"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
      >
        <p className="text-xs text-slate-600 dark:text-slate-300">
          Are you sure you want to remove <strong>{deleteTarget?.name}</strong> from your company directory?
        </p>
      </Dialog>
    </div>
  );
}
