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
      toast('error', err.message || 'Failed to update security password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-300 dark:border-slate-700 space-y-5 shadow-none">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Application Security Password</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Mandatory application security lock. You can update or change your security password below.
            </p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
          <Lock className="w-3 h-3" />
          <span>Security Active</span>
        </span>
      </div>

      <form onSubmit={handleSavePin} className="space-y-4 max-w-lg pt-1">
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1">
            Current Security Password <span className="text-rose-500">*</span>
          </label>
          <div className="relative flex items-center">
            <input
              type={showOld ? 'text' : 'password'}
              placeholder="Enter current password"
              value={oldPin}
              onChange={(e) => setOldPin(e.target.value)}
              required
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 pr-10 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors font-mono shadow-none"
            />
            <button
              type="button"
              onClick={() => setShowOld(!showOld)}
              className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1"
              title={showOld ? 'Hide password' : 'Show password'}
            >
              {showOld ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1">
            New Security Password <span className="text-rose-500">*</span>
          </label>
          <div className="relative flex items-center">
            <input
              type={showNew ? 'text' : 'password'}
              placeholder="Enter new password (min. 4 characters)"
              value={newPin}
              onChange={(e) => setNewPin(e.target.value)}
              required
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 pr-10 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors font-mono shadow-none"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1"
              title={showNew ? 'Hide password' : 'Show password'}
            >
              {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1">
            Confirm New Password <span className="text-rose-500">*</span>
          </label>
          <div className="relative flex items-center">
            <input
              type={showConfirm ? 'text' : 'password'}
              placeholder="Re-enter new password"
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value)}
              required
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 pr-10 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors font-mono shadow-none"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1"
              title={showConfirm ? 'Hide password' : 'Show password'}
            >
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 leading-relaxed shadow-none space-y-1">
          <span className="font-bold text-slate-900 dark:text-slate-100 block">Security Policy:</span>
          <span>For the protection of financial and GST records, password security is permanently required and cannot be disabled.</span>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Button type="submit" variant="primary" icon={KeyRound} isLoading={isLoading}>
            Update Security Password
          </Button>
        </div>
      </form>
    </div>
  );
}

