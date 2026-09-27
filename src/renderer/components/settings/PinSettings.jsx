import React, { useState, useEffect } from 'react';
import { Shield, KeyRound, Lock, Eye, EyeOff, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Button } from '../common/Button';
import { ipcClient } from '../../services/ipcClient';

export function PinSettings({ toast }) {
  const [isProtected, setIsProtected] = useState(true);
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkPinStatus();
  }, []);

  const checkPinStatus = async () => {
    try {
      const protectedState = await ipcClient.isPinProtected();
      setIsProtected(Boolean(protectedState));
    } catch (e) {
      setIsProtected(true);
    }
  };

  const handleSavePin = async (e) => {
    e.preventDefault();
    if (newPin !== confirmPin) {
      toast('error', 'New password and confirm password do not match.');
      return;
    }
    if (newPin.trim().length < 4) {
      toast('error', 'Password must be at least 4 characters long.');
      return;
    }

    setIsLoading(true);
    try {
      await ipcClient.setSecurityPin(oldPin, newPin);
      toast('success', 'Security password updated successfully!');
      setOldPin('');
      setNewPin('');
      setConfirmPin('');
      await checkPinStatus();
    } catch (err) {
      const msg = (err?.message || String(err || ''))
        .replace(/^Error invoking remote method '.*?': Error: /i, '')
        .replace(/^Error invoking remote method '.*?': /i, '')
        .replace(/^Error: /i, '')
        .trim() || 'Failed to update security password.';
      toast('error', msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-5 shadow-xs">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#0078d4]/5 dark:bg-[#0078d4]/20 text-[#0078d4] dark:text-[#4cc2ff] border border-[#0078d4]/30 dark:border-[#005fa3]">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Application Security Password</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Mandatory application security lock. You can update or change your security password below.
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Form on left, Security Guidelines on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-1">
        {/* Left Form: Spans 7 columns on large displays */}
        <form onSubmit={handleSavePin} className="lg:col-span-7 xl:col-span-7 space-y-3.5">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
              Current Security Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative flex items-center">
              <input
                type={showOld ? 'text' : 'password'}
                placeholder="Enter current password"
                value={oldPin}
                onChange={(e) => setOldPin(e.target.value)}
                required
                className="w-full bg-slate-50/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 pr-10 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0078d4]/20 focus:border-[#0078d4] transition-all font-mono shadow-xs"
              />
              <button
                type="button"
                onClick={() => setShowOld(!showOld)}
                className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1"
                title={showOld ? 'Hide password' : 'Show password'}
              >
                {showOld ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
                New Security Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative flex items-center">
                <input
                  type={showNew ? 'text' : 'password'}
                  placeholder="Enter new password (min. 4 chars)"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  required
                  className="w-full bg-slate-50/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 pr-10 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0078d4]/20 focus:border-[#0078d4] transition-all font-mono shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1"
                  title={showNew ? 'Hide password' : 'Show password'}
                >
                  {showNew ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
                Confirm New Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative flex items-center">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Re-enter new password"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  required
                  className="w-full bg-slate-50/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 pr-10 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0078d4]/20 focus:border-[#0078d4] transition-all font-mono shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1"
                  title={showConfirm ? 'Hide password' : 'Show password'}
                >
                  {showConfirm ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <Button type="submit" variant="primary" icon={KeyRound} isLoading={isLoading}>
              Update Security Password
            </Button>
          </div>
        </form>

        {/* Right Info Box: Spans 5 columns on large displays */}
        <div className="lg:col-span-5 xl:col-span-5 flex flex-col justify-between p-4 bg-slate-50/60 dark:bg-slate-800/40 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-3 shadow-xs">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-slate-100">
              <Shield className="w-4 h-4 text-[#0078d4]" />
              <span>Security &amp; Protection Policy</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              To safeguard financial and GST records, security lock protection is permanently enforced and cannot be disabled.
            </p>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-200/60 dark:border-slate-800/80 text-[11px] text-slate-600 dark:text-slate-400">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
              <span>Minimum 4 characters required for new passwords.</span>
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

