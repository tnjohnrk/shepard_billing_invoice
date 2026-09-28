import React, { useState, useEffect, useRef } from 'react';
import { Shield, KeyRound, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Button } from '../common/Button';
import { ipcClient } from '../../services/ipcClient';

export function PinSettings({ toast }) {
  const [oldPin, setOldPin] = useState(['', '', '', '']);
  const [newPin, setNewPin] = useState(['', '', '', '']);
  const [confirmPin, setConfirmPin] = useState(['', '', '', '']);

  const oldPinRefs = useRef([]);
  const newPinRefs = useRef([]);
  const confirmPinRefs = useRef([]);

  const [isLoading, setIsLoading] = useState(false);

  const handlePinChange = (type, index, value) => {
    if (value && !/^\d+$/.test(value)) return;
    const digit = value.slice(-1);

    if (type === 'old') {
      const updated = [...oldPin];
      updated[index] = digit;
      setOldPin(updated);
      if (digit && index < 3) {
        oldPinRefs.current[index + 1]?.focus();
      } else if (digit && index === 3) {
        newPinRefs.current[0]?.focus();
      }
    } else if (type === 'new') {
      const updated = [...newPin];
      updated[index] = digit;
      setNewPin(updated);
      if (digit && index < 3) {
        newPinRefs.current[index + 1]?.focus();
      } else if (digit && index === 3) {
        confirmPinRefs.current[0]?.focus();
      }
    } else if (type === 'confirm') {
      const updated = [...confirmPin];
      updated[index] = digit;
      setConfirmPin(updated);
      if (digit && index < 3) {
        confirmPinRefs.current[index + 1]?.focus();
      }
    }
  };

  const handlePinKeyDown = (type, index, e) => {
    const refs = type === 'old' ? oldPinRefs : type === 'new' ? newPinRefs : confirmPinRefs;
    const currentList = type === 'old' ? oldPin : type === 'new' ? newPin : confirmPin;

    if (e.key === 'Backspace' && !currentList[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  };

  const handlePinPaste = (type, e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').slice(0, 4).replace(/\D/g, '');
    if (!pasted) return;

    const list = ['', '', '', ''];
    for (let i = 0; i < pasted.length; i++) {
      list[i] = pasted[i];
    }

    const refs = type === 'old' ? oldPinRefs : type === 'new' ? newPinRefs : confirmPinRefs;
    if (type === 'old') setOldPin(list);
    else if (type === 'new') setNewPin(list);
    else if (type === 'confirm') setConfirmPin(list);

    const focusIdx = Math.min(pasted.length, 3);
    refs.current[focusIdx]?.focus();
  };

  const handleSavePin = async (e) => {
    e.preventDefault();
    const oldStr = oldPin.join('');
    const newStr = newPin.join('');
    const confirmStr = confirmPin.join('');

    if (oldStr.length !== 4) {
      toast('error', 'Please enter your 4-digit current security PIN.');
      return;
    }
    if (newStr.length !== 4) {
      toast('error', 'New security PIN must be exactly 4 digits.');
      return;
    }
    if (newStr !== confirmStr) {
      toast('error', 'New PIN and confirm PIN do not match.');
      return;
    }

    setIsLoading(true);
    try {
      await ipcClient.setSecurityPin(oldStr, newStr);
      toast('success', 'Security 4-digit PIN updated successfully!');
      setOldPin(['', '', '', '']);
      setNewPin(['', '', '', '']);
      setConfirmPin(['', '', '', '']);
      oldPinRefs.current[0]?.focus();
    } catch (err) {
      const msg = (err?.message || String(err || ''))
        .replace(/^Error invoking remote method '.*?': Error: /i, '')
        .replace(/^Error invoking remote method '.*?': /i, '')
        .replace(/^Error: /i, '')
        .trim() || 'Failed to update security PIN.';
      toast('error', msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-5 shadow-xs">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Application Security 4-Digit PIN</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Mandatory application security lock. You can update or change your 4-digit security PIN below.
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Form on left, Security Guidelines on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-1">
        {/* Left Form: Spans 7 columns on large displays */}
        <form onSubmit={handleSavePin} className="lg:col-span-7 xl:col-span-7 space-y-4">
          
          {/* 1. Current PIN */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              Current Security PIN <span className="text-rose-500">*</span>
            </label>
            <div className="flex gap-2.5 sm:gap-3">
              {[0, 1, 2, 3].map((index) => (
                <input
                  key={`old-${index}`}
                  ref={(el) => (oldPinRefs.current[index] = el)}
                  type="password"
                  maxLength={1}
                  value={oldPin[index]}
                  onChange={(e) => handlePinChange('old', index, e.target.value)}
                  onKeyDown={(e) => handlePinKeyDown('old', index, e)}
                  onPaste={(e) => handlePinPaste('old', e)}
                  className="w-11 h-12 sm:w-12 sm:h-13 font-mono text-center text-xl font-bold rounded-xl bg-slate-50 dark:bg-[#0d1117] border border-slate-300 dark:border-[#30363d] text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none transition-all shadow-2xs"
                  autoFocus={index === 0}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* 2. New PIN */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                New 4-Digit PIN <span className="text-rose-500">*</span>
              </label>
              <div className="flex gap-2 sm:gap-2.5">
                {[0, 1, 2, 3].map((index) => (
                  <input
                    key={`new-${index}`}
                    ref={(el) => (newPinRefs.current[index] = el)}
                    type="password"
                    maxLength={1}
                    value={newPin[index]}
                    onChange={(e) => handlePinChange('new', index, e.target.value)}
                    onKeyDown={(e) => handlePinKeyDown('new', index, e)}
                    onPaste={(e) => handlePinPaste('new', e)}
                    className="w-10 h-11 sm:w-11 sm:h-12 font-mono text-center text-xl font-bold rounded-xl bg-slate-50 dark:bg-[#0d1117] border border-slate-300 dark:border-[#30363d] text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none transition-all shadow-2xs"
                  />
                ))}
              </div>
            </div>

            {/* 3. Confirm New PIN */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                Confirm New PIN <span className="text-rose-500">*</span>
              </label>
              <div className="flex gap-2 sm:gap-2.5">
                {[0, 1, 2, 3].map((index) => (
                  <input
                    key={`confirm-${index}`}
                    ref={(el) => (confirmPinRefs.current[index] = el)}
                    type="password"
                    maxLength={1}
                    value={confirmPin[index]}
                    onChange={(e) => handlePinChange('confirm', index, e.target.value)}
                    onKeyDown={(e) => handlePinKeyDown('confirm', index, e)}
                    onPaste={(e) => handlePinPaste('confirm', e)}
                    className="w-10 h-11 sm:w-11 sm:h-12 font-mono text-center text-xl font-bold rounded-xl bg-slate-50 dark:bg-[#0d1117] border border-slate-300 dark:border-[#30363d] text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none transition-all shadow-2xs"
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="pt-2">
            <Button type="submit" variant="primary" icon={KeyRound} isLoading={isLoading}>
              Update Security PIN
            </Button>
          </div>
        </form>

        {/* Right Info Box: Spans 5 columns on large displays */}
        <div className="lg:col-span-5 xl:col-span-5 flex flex-col justify-between p-4 bg-slate-50/60 dark:bg-slate-800/40 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-3 shadow-xs">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-slate-100">
              <Shield className="w-4 h-4 text-indigo-500" />
              <span>Security &amp; Protection Policy</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              To safeguard financial and GST records, security PIN protection is permanently enforced across the billing system.
            </p>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-200/60 dark:border-slate-800/80 text-[11px] text-slate-600 dark:text-slate-400">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
              <span>Exactly 4 numeric digits required for security PIN.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
              <span>Required when launching application or unlocking screen.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
              <span>Safely encrypted locally on this machine.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
