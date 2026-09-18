import React from 'react';
import { Input } from '../common/Input';

export function ReferenceDetailsForm({ formData, onChange }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="S.O. / PO Number"
          placeholder="e.g. PO-987654"
          value={formData.so_po_number || ''}
          onChange={(e) => onChange('so_po_number', e.target.value)}
        />

        <Input
          label="S.O. / PO Date"
          type="date"
          value={formData.so_po_date || ''}
          onChange={(e) => onChange('so_po_date', e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="GEMC Number (Government e-Marketplace)"
          placeholder="e.g. GEMC-12345678"
          value={formData.gemc_number || ''}
          onChange={(e) => onChange('gemc_number', e.target.value)}
        />

        <Input
          label="Additional Reference / Project Code"
          placeholder="e.g. Project Alpha-1"
          value={formData.additional_reference || ''}
          onChange={(e) => onChange('additional_reference', e.target.value)}
        />
      </div>
    </div>
  );
}
