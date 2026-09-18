import React from 'react';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { COPY_TYPES } from '../../../shared/constants/copyTypes';

export function InvoiceDetailsForm({ formData, onChange, isProforma }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          label={isProforma ? 'Proforma Number' : 'Invoice Number'}
          value={isProforma ? formData.proforma_number : formData.invoice_number}
          onChange={(e) => onChange(isProforma ? 'proforma_number' : 'invoice_number', e.target.value)}
          required
        />

        <Input
          label={isProforma ? 'Proforma Date' : 'Invoice Date'}
          type="date"
          value={isProforma ? formData.proforma_date : formData.invoice_date}
          onChange={(e) => onChange(isProforma ? 'proforma_date' : 'invoice_date', e.target.value)}
          required
        />

        {!isProforma && (
          <Select
            label="Invoice Copy Type"
            value={formData.copy_type || 'ORIGINAL'}
            onChange={(e) => onChange('copy_type', e.target.value)}
            options={[
              { value: COPY_TYPES.ORIGINAL, label: 'Original for Recipient' },
              { value: COPY_TYPES.DUPLICATE, label: 'Duplicate for Transporter' },
              { value: COPY_TYPES.TRIPLICATE, label: 'Triplicate for Supplier' }
            ]}
          />
        )}
      </div>

      <div className="p-4 glass-panel rounded-xl border border-slate-800 space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Transportation & Supply Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Transportation Mode"
            placeholder="e.g. By Road, Air, Courier"
            value={formData.transportation_mode || ''}
            onChange={(e) => onChange('transportation_mode', e.target.value)}
          />

          <Input
            label="Vehicle Number"
            placeholder="e.g. MH-04-AB-1234"
            value={formData.vehicle_number || ''}
            onChange={(e) => onChange('vehicle_number', e.target.value)}
          />

          <Input
            label="Date of Supply"
            type="date"
            value={formData.date_of_supply || ''}
            onChange={(e) => onChange('date_of_supply', e.target.value)}
          />
        </div>

        <Input
          label="Delivery Address (If different from Buyer Address)"
          placeholder="Enter ship to / delivery address..."
          value={formData.delivery_address || ''}
          onChange={(e) => onChange('delivery_address', e.target.value)}
        />
      </div>
    </div>
  );
}
