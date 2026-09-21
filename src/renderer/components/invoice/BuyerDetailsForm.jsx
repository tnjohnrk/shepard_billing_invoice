import React, { useState, useEffect, useRef } from 'react';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { INDIAN_STATES } from '../../../shared/constants/application';
import { ipcClient } from '../../services/ipcClient';
import { useTheme } from '../../context/ThemeContext';
import { Search, Building2, User, Sparkles, CheckCircle2 } from 'lucide-react';

export function BuyerDetailsForm({ formData, onChange, errors = {} }) {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [nameSuggestions, setNameSuggestions] = useState([]);
  const [showNameSuggestions, setShowNameSuggestions] = useState(false);
  const [gstinSuggestions, setGstinSuggestions] = useState([]);
  const [showGstinSuggestions, setShowGstinSuggestions] = useState(false);
  
  const nameDropdownRef = useRef(null);
  const gstinDropdownRef = useRef(null);

  const buyerType = formData.buyer_type || 'COMPANY';

  // Handle clicking outside to dismiss dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (nameDropdownRef.current && !nameDropdownRef.current.contains(e.target)) {
        setShowNameSuggestions(false);
      }
      if (gstinDropdownRef.current && !gstinDropdownRef.current.contains(e.target)) {
        setShowGstinSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleBuyerTypeChange = (type) => {
    onChange('buyer_type', type);
  };

  const autoFillFromCustomer = (cust) => {
    if (!cust) return;
    if (cust.name) onChange('buyer_name', cust.name);
    if (cust.address) onChange('buyer_address', cust.address);
    if (cust.gstin) onChange('customer_gstin', cust.gstin.toUpperCase());
    
    if (cust.state && cust.state_code) {
      onChange('customer_state', cust.state);
      onChange('customer_state_code', cust.state_code);
    } else if (cust.gstin && cust.gstin.length >= 2) {
      const codeFromGst = cust.gstin.substring(0, 2);
      const foundState = INDIAN_STATES.find(s => s.code === codeFromGst);
      if (foundState) {
        onChange('customer_state', foundState.name);
        onChange('customer_state_code', foundState.code);
      }
    }
    setShowNameSuggestions(false);
    setShowGstinSuggestions(false);
  };

  const handleNameChange = async (val) => {
    onChange('buyer_name', val);
    const trimmed = val.trim();
    if (trimmed.length >= 2) {
      try {
        const results = await ipcClient.searchCustomers(trimmed);
        setNameSuggestions(results || []);
        setShowNameSuggestions(true);

        // Instant auto-fill if exact match typed
        const exactMatch = results?.find(c => c.name && c.name.trim().toLowerCase() === trimmed.toLowerCase());
        if (exactMatch && (!formData.customer_gstin || !formData.buyer_address)) {
          if (exactMatch.gstin && !formData.customer_gstin) {
            onChange('customer_gstin', exactMatch.gstin.toUpperCase());
          }
          if (exactMatch.address && !formData.buyer_address) {
            onChange('buyer_address', exactMatch.address);
          }
          if (exactMatch.state_code && !formData.customer_state_code) {
            onChange('customer_state_code', exactMatch.state_code);
            onChange('customer_state', exactMatch.state);
          }
        }
      } catch (e) {
        setNameSuggestions([]);
      }
    } else {
      setNameSuggestions([]);
      setShowNameSuggestions(false);
    }
  };

  const handleNameBlur = async () => {
    const trimmed = (formData.buyer_name || '').trim();
    if (trimmed.length >= 2) {
      try {
        const results = await ipcClient.searchCustomers(trimmed);
        const match = results?.find(c => c.name && c.name.trim().toLowerCase() === trimmed.toLowerCase());
        if (match) {
          autoFillFromCustomer(match);
        } else if (formData.buyer_address || formData.customer_gstin) {
          // Auto-save new customer info on blur
          ipcClient.saveCustomer({
            name: trimmed,
            address: formData.buyer_address || '',
            gstin: formData.customer_gstin || '',
            state: formData.customer_state || 'Maharashtra',
            state_code: formData.customer_state_code || '27'
          }).catch(() => {});
        }
      } catch {}
    }
  };

  const handleGstinChange = async (rawVal) => {
    const upper = rawVal.toUpperCase().trim();
    onChange('customer_gstin', upper);

    // Auto-detect state code from first 2 digits of GSTIN
    if (upper.length >= 2) {
      const statePrefix = upper.substring(0, 2);
      const matchedState = INDIAN_STATES.find(s => s.code === statePrefix);
      if (matchedState) {
        onChange('customer_state_code', matchedState.code);
        onChange('customer_state', matchedState.name);
      }
    }

    // Interconnected search by GSTIN to find matching saved company
    if (upper.length >= 2) {
      try {
        const results = await ipcClient.searchCustomers(upper);
        setGstinSuggestions(results || []);
        setShowGstinSuggestions(true);

        // If exact GSTIN match is typed
        const exactMatch = results?.find(c => c.gstin && c.gstin.toUpperCase() === upper);
        if (exactMatch) {
          if (!formData.buyer_name) onChange('buyer_name', exactMatch.name);
          if (!formData.buyer_address) onChange('buyer_address', exactMatch.address);
          if (exactMatch.state_code) {
            onChange('customer_state_code', exactMatch.state_code);
            onChange('customer_state', exactMatch.state);
          }
        }
      } catch (e) {
        setGstinSuggestions([]);
      }
    } else {
      setGstinSuggestions([]);
      setShowGstinSuggestions(false);
    }
  };

  const handleGstinBlur = async () => {
    const upper = (formData.customer_gstin || '').toUpperCase().trim();
    if (upper.length >= 3) {
      try {
        const results = await ipcClient.searchCustomers(upper);
        const match = results?.find(c => c.gstin && c.gstin.toUpperCase() === upper);
        if (match) {
          autoFillFromCustomer(match);
        } else if (formData.buyer_name) {
          ipcClient.saveCustomer({
            name: formData.buyer_name,
            address: formData.buyer_address || '',
            gstin: upper,
            state: formData.customer_state || 'Maharashtra',
            state_code: formData.customer_state_code || '27'
          }).catch(() => {});
        }
      } catch {}
    }
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
      {/* Buyer Type Selector (Company vs Personal) */}
      <div className="space-y-2">
        <label className={`text-xs font-semibold uppercase tracking-wider ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
          Buyer Category / Type
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleBuyerTypeChange('COMPANY')}
            className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all text-left cursor-pointer ${
              buyerType === 'COMPANY'
                ? isLight
                  ? 'bg-indigo-50 border-indigo-500 text-indigo-900 shadow-md ring-1 ring-indigo-500/40'
                  : 'bg-indigo-950/60 border-indigo-500 text-indigo-300 shadow-md shadow-indigo-950/50 ring-1 ring-indigo-500/40'
                : isLight
                ? 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
            }`}
          >
            <div className={`p-2.5 rounded-lg ${
              buyerType === 'COMPANY'
                ? isLight ? 'bg-indigo-100 text-indigo-600' : 'bg-indigo-500/20 text-indigo-400'
                : isLight ? 'bg-slate-100 text-slate-500' : 'bg-slate-800 text-slate-400'
            }`}>
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className={`text-sm font-bold flex items-center gap-1.5 ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                <span>Company / Business</span>
                {buyerType === 'COMPANY' && <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
              </div>
              <div className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Registered GST business entity with GSTIN</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleBuyerTypeChange('INDIVIDUAL')}
            className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all text-left cursor-pointer ${
              buyerType === 'INDIVIDUAL'
                ? isLight
                  ? 'bg-cyan-50 border-cyan-500 text-cyan-900 shadow-md ring-1 ring-cyan-500/40'
                  : 'bg-cyan-950/60 border-cyan-500 text-cyan-300 shadow-md shadow-cyan-950/50 ring-1 ring-cyan-500/40'
                : isLight
                ? 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
            }`}
          >
            <div className={`p-2.5 rounded-lg ${
              buyerType === 'INDIVIDUAL'
                ? isLight ? 'bg-cyan-100 text-cyan-600' : 'bg-cyan-500/20 text-cyan-400'
                : isLight ? 'bg-slate-100 text-slate-500' : 'bg-slate-800 text-slate-400'
            }`}>
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className={`text-sm font-bold flex items-center gap-1.5 ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                <span>Personal / Individual</span>
                {buyerType === 'INDIVIDUAL' && <CheckCircle2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />}
              </div>
              <div className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Individual consumer or unregistered client</div>
            </div>
          </button>
        </div>
      </div>

      {/* Buyer / Company Name Field with Instant Auto-Fill Dropdown */}
      <div className="relative" ref={nameDropdownRef}>
        <Input
          label={buyerType === 'COMPANY' ? 'Company / Business Name' : 'Customer / Individual Name'}
          placeholder={buyerType === 'COMPANY' ? 'Type company name to search saved records or enter new...' : 'Enter customer full name...'}
          icon={Search}
          value={formData.buyer_name || ''}
          onChange={(e) => handleNameChange(e.target.value)}
          onBlur={handleNameBlur}
          onFocus={() => formData.buyer_name && formData.buyer_name.length >= 2 && setShowNameSuggestions(true)}
          error={errors.buyer_name}
          required
        />

        {showNameSuggestions && nameSuggestions.length > 0 && (
          <div className={`absolute z-50 w-full mt-1.5 rounded-xl border shadow-2xl max-h-60 overflow-y-auto ${
            isLight ? 'bg-white border-slate-200 divide-y divide-slate-100' : 'bg-slate-900 border-slate-700 divide-y divide-slate-800'
          }`}>
            <div className={`p-2.5 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
              isLight ? 'bg-slate-50 text-slate-500 border-b border-slate-200' : 'bg-slate-950 text-slate-400 border-b border-slate-800'
            }`}>
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Matching Saved Companies (Click to Auto-Fill):</span>
            </div>
            {nameSuggestions.map((c) => (
              <div
                key={c.id || c.gstin || c.name}
                onMouseDown={(e) => {
                  e.preventDefault();
                  autoFillFromCustomer(c);
                }}
                className={`p-3.5 cursor-pointer transition-colors ${
                  isLight ? 'hover:bg-indigo-50/80' : 'hover:bg-indigo-950/60'
                }`}
              >
                <div className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>{c.name}</div>
                {c.address && <div className={`text-xs mt-0.5 truncate ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>{c.address}</div>}
                {c.gstin && (
                  <div className="text-[11px] font-mono mt-1 flex items-center gap-1.5 font-bold text-indigo-600 dark:text-indigo-400">
                    <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>GSTIN:</span>
                    <span>{c.gstin}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Address */}
      <div className="flex flex-col gap-1.5">
        <label className={`text-xs font-semibold uppercase tracking-wider flex items-center gap-1 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
          <span>{buyerType === 'COMPANY' ? 'Company Registered Address' : 'Customer Address'}</span>
          <span className="text-rose-400">*</span>
        </label>
        <textarea
          rows={3}
          className={`w-full rounded-lg p-3 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
            isLight 
              ? 'bg-white border border-slate-300 text-slate-900' 
              : 'bg-slate-800/90 border border-slate-700/80 text-slate-100'
          }`}
          placeholder={buyerType === 'COMPANY' ? 'Enter company unit / street / city / postal address...' : 'Enter customer residence or billing address...'}
          value={formData.buyer_address || ''}
          onChange={(e) => onChange('buyer_address', e.target.value)}
        />
        {errors.buyer_address && <span className="text-xs text-rose-400 font-medium">{errors.buyer_address}</span>}
      </div>

      {/* GSTIN & State Code Grid (Interconnected & Manually Editable) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative" ref={gstinDropdownRef}>
          <Input
            label={buyerType === 'COMPANY' ? 'Company GSTIN' : 'Customer GSTIN (Optional)'}
            placeholder={buyerType === 'COMPANY' ? 'e.g. 27AAAAA0000A1Z5' : 'Optional (leave blank if unregistered)'}
            value={formData.customer_gstin || ''}
            onChange={(e) => handleGstinChange(e.target.value)}
            onBlur={handleGstinBlur}
            onFocus={() => formData.customer_gstin && formData.customer_gstin.length >= 2 && setShowGstinSuggestions(true)}
            error={errors.customer_gstin}
            required={buyerType === 'COMPANY'}
            helperText={buyerType === 'COMPANY' ? 'Mandatory 15-char GSTIN. Auto-fills company details or enter manually.' : 'Optional for retail / individual buyers'}
          />

          {showGstinSuggestions && gstinSuggestions.length > 0 && (
            <div className={`absolute z-50 w-full mt-1.5 rounded-xl border shadow-2xl max-h-60 overflow-y-auto ${
              isLight ? 'bg-white border-slate-200 divide-y divide-slate-100' : 'bg-slate-900 border-slate-700 divide-y divide-slate-800'
            }`}>
              <div className={`p-2.5 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                isLight ? 'bg-slate-50 text-slate-500 border-b border-slate-200' : 'bg-slate-950 text-slate-400 border-b border-slate-800'
              }`}>
                <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
                <span>Matching GSTIN Records (Click to Auto-Fill):</span>
              </div>
              {gstinSuggestions.map((c) => (
                <div
                  key={c.id || c.gstin || c.name}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    autoFillFromCustomer(c);
                  }}
                  className={`p-3.5 cursor-pointer transition-colors ${
                    isLight ? 'hover:bg-cyan-50/80' : 'hover:bg-cyan-950/60'
                  }`}
                >
                  <div className="text-cyan-600 dark:text-cyan-400 font-bold font-mono text-xs">{c.gstin || 'No GSTIN'}</div>
                  <div className={`font-semibold text-xs mt-0.5 ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>{c.name}</div>
                  {c.address && <div className={`text-[11px] truncate mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{c.address}</div>}
                </div>
              ))}
            </div>
          )}
        </div>

        <Select
          label="Place of Supply / State Code"
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



