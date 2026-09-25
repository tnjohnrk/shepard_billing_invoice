import React, { useState, useEffect } from 'react';
import { Plus, Info } from 'lucide-react';
import { ItemRow } from './ItemRow';
import { Button } from '../common/Button';
import { ipcClient } from '../../services/ipcClient';
import { FEATURE_FLAGS } from '../../../shared/constants/featureFlags';

export function ItemTable({ items = [], setItems }) {
  const [catalogProducts, setCatalogProducts] = useState([]);

  useEffect(() => {
    let mounted = true;
    ipcClient.listProducts().then(list => {
      if (mounted && Array.isArray(list)) {
        setCatalogProducts(list);
      }
    }).catch(() => {});
    return () => { mounted = false; };
  }, []);

  const refreshCatalog = async () => {
    try {
      const list = await ipcClient.listProducts();
      if (Array.isArray(list)) setCatalogProducts(list);
    } catch {}
  };

  const handleItemChange = (index, field, value) => {
    setItems(prevItems => {
      const list = Array.isArray(prevItems) ? [...prevItems] : [];
      if (!list[index]) list[index] = { description: '', hsn_sac: '', quantity: 1, rate: 0 };
      list[index] = { ...list[index], [field]: value };
      return list;
    });
  };

  const handleBatchItemChange = (index, newFields) => {
    setItems(prevItems => {
      const list = Array.isArray(prevItems) ? [...prevItems] : [];
      if (!list[index]) list[index] = { description: '', hsn_sac: '', quantity: 1, rate: 0 };
      list[index] = { ...list[index], ...newFields };
      return list;
    });
  };

  const maxReached = FEATURE_FLAGS.SINGLE_PAGE_INVOICE_LOCKED && (items || []).length >= FEATURE_FLAGS.MAX_ITEMS_PER_INVOICE;

  const handleAddItem = () => {
    if (maxReached) return;
    setItems(prevItems => [
      ...(Array.isArray(prevItems) ? prevItems : []),
      { description: '', hsn_sac: '', quantity: 1, rate: 0 }
    ]);
  };

  const handleDeleteItem = (index) => {
    setItems(prevItems => {
      const list = Array.isArray(prevItems) ? [...prevItems] : [];
      if (list.length > 1) {
        return list.filter((_, idx) => idx !== index);
      }
      return list;
    });
  };

  return (
    <div className="space-y-4">
      <div className="w-full overflow-visible rounded-2xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-none">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-300 dark:border-slate-700 uppercase font-bold text-slate-700 dark:text-slate-300">
              <th className="px-3 py-3 text-center border-r border-slate-300 dark:border-slate-700" style={{ width: '5%' }}>#</th>
              <th className="px-3 py-3 border-r border-slate-300 dark:border-slate-700" style={{ width: '40%' }}>Description</th>
              <th className="px-3 py-3 text-left border-r border-slate-300 dark:border-slate-700" style={{ width: '15%' }}>HSN / SAC</th>
              <th className="px-3 py-3 text-right border-r border-slate-300 dark:border-slate-700" style={{ width: '12%' }}>Qty</th>
              <th className="px-3 py-3 text-right border-r border-slate-300 dark:border-slate-700" style={{ width: '13%' }}>Rate (₹)</th>
              <th className="px-3 py-3 text-right border-r border-slate-300 dark:border-slate-700" style={{ width: '15%' }}>Amount (₹)</th>
              <th className="px-3 py-3 text-center" style={{ width: '5%' }}>Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {(items || []).map((item, idx) => (
              <ItemRow
                key={idx}
                index={idx}
                item={item}
                catalogProducts={catalogProducts}
                onCatalogUpdated={refreshCatalog}
                onChange={handleItemChange}
                onBatchChange={handleBatchItemChange}
                onDelete={handleDeleteItem}
                canDelete={(items || []).length > 1}
              />
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        {FEATURE_FLAGS.SINGLE_PAGE_INVOICE_LOCKED && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <Info className="w-4 h-4 text-sky-500 shrink-0" />
            <span>
              Single-page format: {(items || []).length} / {FEATURE_FLAGS.MAX_ITEMS_PER_INVOICE} items added
              {maxReached && ' (Maximum limit reached)'}
            </span>
          </div>
        )}
        <div className="ml-auto">
          {!maxReached && (
            <Button variant="secondary" size="sm" icon={Plus} onClick={handleAddItem}>
              Add Line Item
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
