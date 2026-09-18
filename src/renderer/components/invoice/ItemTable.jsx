import React from 'react';
import { Plus } from 'lucide-react';
import { ItemRow } from './ItemRow';
import { Button } from '../common/Button';

export function ItemTable({ items = [], setItems }) {
  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      { description: '', hsn_sac: '', quantity: 1, rate: 0 }
    ]);
  };

  const handleDeleteItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, idx) => idx !== index));
    }
  };

  return (
    <div className="space-y-4">
      <div className="w-full overflow-x-auto rounded-xl border border-slate-700/60 bg-slate-900/60 shadow-lg">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-800/80 border-b border-slate-700/80 uppercase font-semibold text-slate-400">
              <th className="px-3 py-3 text-center" style={{ width: '5%' }}>#</th>
              <th className="px-3 py-3" style={{ width: '40%' }}>Description</th>
              <th className="px-3 py-3 text-center" style={{ width: '15%' }}>HSN/SAC</th>
              <th className="px-3 py-3 text-right" style={{ width: '12%' }}>Qty</th>
              <th className="px-3 py-3 text-right" style={{ width: '13%' }}>Rate (₹)</th>
              <th className="px-3 py-3 text-right" style={{ width: '15%' }}>Amount (₹)</th>
              <th className="px-3 py-3 text-center" style={{ width: '5%' }}>Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {items.map((item, idx) => (
              <ItemRow
                key={idx}
                index={idx}
                item={item}
                onChange={handleItemChange}
                onDelete={handleDeleteItem}
                canDelete={items.length > 1}
              />
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end">
        <Button variant="secondary" size="sm" icon={Plus} onClick={handleAddItem}>
          Add Line Item
        </Button>
      </div>
    </div>
  );
}
