import React, { useState, useEffect } from 'react';
import { Shield, KeyRound, Lock, Unlock, Eye, EyeOff, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Button } from '../common/Button';
import { ipcClient } from '../../services/ipcClient';

export function PinSettings({ toast }) {
  const [isProtected, setIsProtected] = useState(false);
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
      setIsProtected(false);
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
      toast('success', isProtected ? 'Security password updated successfully!' : 'Security password enabled! You will now be prompted before entering the app.');
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

  const handleDisablePin = async () => {
    if (!oldPin) {
      toast('error', 'Please enter your current security password to disable.');
      return;
    }
    setIsLoading(true);
    try {
      await ipcClient.disableSecurityPin(oldPin);
      toast('info', 'Security password lock has been disabled.');
      setOldPin('');
      setNewPin('');
      setConfirmPin('');
      await checkPinStatus();
    } catch (err) {
      toast('error', err.message || 'Failed to disable password lock.');
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
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Application Password Lock</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Secure the billing application. Once enabled, the password must be verified before opening the app.
            </p>
          </div>
        </div>

        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
          isProtected 
            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800' 
            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
        }`}>
          {isProtected ? (
            <>
              <Lock className="w-3 h-3" />
              <span>Password Active</span>
            </>
          ) : (
            <>
              <Unlock className="w-3 h-3" />
              <span>Protection Disabled</span>
            </>
          )}
        </span>
      </div>

      <form onSubmit={handleSavePin} className="space-y-4 max-w-lg pt-2">
        {isProtected && (
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Current Security Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showOld ? 'text' : 'password'}
                placeholder="Enter current password"
                value={oldPin}
                onChange={(e) => setOldPin(e.target.value)}
                required
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 pr-10 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono shadow-none"
              />
              <button
                type="button"
                onClick={() => setShowOld(!showOld)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                {showOld ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {isProtected ? 'New Security Password' : 'Create Security Password'} <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showNew ? 'text' : 'password'}
              placeholder="Enter new password (min. 4 characters)"
              value={newPin}
              onChange={(e) => setNewPin(e.target.value)}
              required
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 pr-10 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono shadow-none"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
            >
              {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Confirm Security Password <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showConfirm ? 'text' : 'password'}
              placeholder="Re-enter new password"
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value)}
              required
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 pr-10 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono shadow-none"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
            >
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="p-3.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 leading-relaxed shadow-none">
          💡 <strong className="text-slate-800 dark:text-slate-200">Security Note:</strong> When enabled, every time the application is opened or refreshed, you must enter this password to view invoices and billing records.
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <Button type="submit" variant="primary" icon={KeyRound} isLoading={isLoading}>
            {isProtected ? 'Update Password' : 'Enable Password Protection'}
          </Button>

          {isProtected && (
            <Button type="button" variant="danger" icon={Unlock} onClick={handleDisablePin} isLoading={isLoading}>
              Disable Password Lock
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}

