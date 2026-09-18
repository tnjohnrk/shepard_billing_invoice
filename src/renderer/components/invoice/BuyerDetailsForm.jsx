import React, { useState, useEffect } from 'react';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { INDIAN_STATES } from '../../../shared/constants/application';
import { ipcClient } from '../../services/ipcClient';
import { Search } from 'lucide-react';

export function BuyerDetailsForm({ formData, onChange, errors = {} }) {
  const [customerSuggestions, setCustomerSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleNameChange = async (val) => {
    onChange('buyer_name', val);
    if (val.trim().length >= 2) {
      try {
        const results = await ipcClient.searchCustomers(val);
        setCustomerSuggestions(results || []);
        setShowSuggestions(true);
      } catch (e) {
        setCustomerSuggestions([]);
      }
    } else {
      setShowSuggestions(false);
    }
  };

  const selectCustomer = (cust) => {
    onChange('buyer_name', cust.name);
    onChange('buyer_address', cust.address);
    onChange('customer_gstin', cust.gstin || '');
    onChange('customer_state', cust.state);
    onChange('customer_state_code', cust.state_code);
    setShowSuggestions(false);
  };

  const handleStateSelect = (e) => {
    const selectedCode = e.target.value;
    const foundState = INDIAN_STATES.find(s => s.code === selectedCode);
    if (foundState) {
      onChange('customer_state_code', foundState.code);
      onChange('customer_state', foundState.name);
    }
  };

  return (
    <div className="space-y-6">
      <div className="relative">
        <Input
          label="Buyer / Recipient Name"
          placeholder="Start typing customer name..."
          icon={Search}
          value={formData.buyer_name || ''}
          onChange={(e) => handleNameChange(e.target.value)}
          onFocus={() => formData.buyer_name && setShowSuggestions(true)}
          error={errors.buyer_name}
          required
        />

        {showSuggestions && customerSuggestions.length > 0 && (
          <div className="absolute z-20 w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-2xl max-h-48 overflow-y-auto">
            {customerSuggestions.map((c) => (
              <div
                key={c.id}
                onClick={() => selectCustomer(c)}
                className="p-2.5 hover:bg-slate-700/80 cursor-pointer border-b border-slate-700/50 last:border-none text-xs"
              >
                <div className="font-bold text-slate-100">{c.name}</div>
                <div className="text-slate-400 text-[11px] truncate">{c.address}</div>
                {c.gstin && <div className="text-indigo-400 text-[10px] font-mono">GSTIN: {c.gstin}</div>}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
          Buyer Address <span className="text-rose-400">*</span>
        </label>
        <textarea
          rows={3}
          className="w-full bg-slate-800/90 border border-slate-700/80 rounded-lg p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/80"
          placeholder="Enter full address..."
          value={formData.buyer_address || ''}
          onChange={(e) => onChange('buyer_address', e.target.value)}
        />
        {errors.buyer_address && <span className="text-xs text-rose-400 font-medium">{errors.buyer_address}</span>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Customer GSTIN (Optional)"
          placeholder="e.g. 27AAAAA0000A1Z5"
          value={formData.customer_gstin || ''}
          onChange={(e) => onChange('customer_gstin', e.target.value.toUpperCase())}
          error={errors.customer_gstin}
        />

        <Select
          label="Customer State & State Code"
          value={formData.customer_state_code || '27'}
          onChange={handleStateSelect}
          options={INDIAN_STATES.map(s => ({
            value: s.code,
            label: `${s.code} - ${s.name}`
          }))}
          required
        />
      </div>
    </div>
  );
}
