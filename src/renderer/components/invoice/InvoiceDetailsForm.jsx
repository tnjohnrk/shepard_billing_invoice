import React from 'react';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { COPY_TYPES } from '../../../shared/constants/copyTypes';

export function InvoiceDetailsForm({ formData, onChange, errors = {}, isProforma }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          label={isProforma ? 'Proforma Number' : 'Invoice Number'}
          value={isProforma ? formData.proforma_number : formData.invoice_number}
          onChange={(e) => onChange(isProforma ? 'proforma_number' : 'invoice_number', e.target.value)}
          error={errors?.invoice_number || errors?.proforma_number}
          required
        />

        <Input
          label={isProforma ? 'Proforma Date' : 'Invoice Date'}
          type="date"
          value={isProforma ? formData.proforma_date : formData.invoice_date}
          onChange={(e) => onChange(isProforma ? 'proforma_date' : 'invoice_date', e.target.value)}
          error={errors?.invoice_date || errors?.proforma_date}
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

      <div className="p-4 bg-slate-50/50 dark:bg-slate-800/30 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-3.5 shadow-xs">
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Transportation & Supply Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
            onChange={(e) => onChange('vehicle_number', e.target.value.toUpperCase())}
          />

          <Input
            label="Date of Supply (From)"
            type="date"
            value={formData.date_of_supply_from || formData.date_of_supply || ''}
            onChange={(e) => {
              const val = e.target.value;
              onChange('date_of_supply_from', val);
              onChange('date_of_supply', val);
              if (!formData.date_of_supply_to) {
                onChange('date_of_supply_to', val);
              }
            }}
            error={errors?.date_of_supply_from || errors?.date_of_supply}
            required
          />

          <Input
            label="Date of Supply (To)"
            type="date"
            value={formData.date_of_supply_to || formData.date_of_supply_from || formData.date_of_supply || ''}
            onChange={(e) => onChange('date_of_supply_to', e.target.value)}
            error={errors?.date_of_supply_to}
            required
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
