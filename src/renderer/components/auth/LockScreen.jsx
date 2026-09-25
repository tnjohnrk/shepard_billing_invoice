import React, { useState, useEffect, useRef } from 'react';
import { Eye, EyeOff, ShieldCheck, KeyRound, ArrowRight, Wrench, Clock, ShieldAlert, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react';
import companyLogo from '../../assets/logo.png';
import { Button } from '../common/Button';
import { Toast } from '../common/Toast';
import { ipcClient } from '../../services/ipcClient';

export function LockScreen({ onUnlock, initialLicenseStatus }) {
  const [licenseStatus, setLicenseStatus] = useState(initialLicenseStatus || null);
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState(['', '', '', '']);
  const pinRefs = useRef([]);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isDeveloperMode, setIsDeveloperMode] = useState(false);

  // Developer Control Panel Mode State (after entering master password)
  const [isDevControlOpen, setIsDevControlOpen] = useState(false);
  const [selectedLicenseMode, setSelectedLicenseMode] = useState('LIVE');
  const [trialStart, setTrialStart] = useState('');
  const [trialEnd, setTrialEnd] = useState('');

  // Developer Optional PIN Reset State
  const [changeUserPin, setChangeUserPin] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    fetchLicense();
  }, []);

  const fetchLicense = async () => {
    try {
      const status = await ipcClient.getLicenseStatus();
      setLicenseStatus(status);
      if (status) {
        setSelectedLicenseMode(status.mode || 'LIVE');
        if (status.startDateTime) {
          setTrialStart(status.startDateTime.slice(0, 16));
        } else {
          setTrialStart(new Date().toISOString().slice(0, 16));
        }
        if (status.endDateTime) {
          setTrialEnd(status.endDateTime.slice(0, 16));
        } else {
          const d = new Date();
          d.setDate(d.getDate() + 30);
          setTrialEnd(d.toISOString().slice(0, 16));
        }
      }
    } catch (e) {
      console.error('Failed to get license status:', e);
    }
  };

  const handlePinChange = (index, value) => {
    if (value && !/^\d+$/.test(value)) return;
    
    const newPin = [...pin];
    newPin[index] = value.slice(-1);
    setPin(newPin);
    if (error) setError('');

    if (value && index < 3) {
      pinRefs.current[index + 1]?.focus();
    } else if (value && index === 3) {
      const enteredPin = newPin.join('');
      if (enteredPin.length === 4) {
        handleSubmitUnlock(null, enteredPin);
      }
    }
  };

  const handlePinKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      pinRefs.current[index - 1]?.focus();
    } else if (e.key === 'Enter') {
      handleSubmitUnlock(e);
    }
  };

  const handlePinPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 4).replace(/\D/g, '');
    if (pastedData) {
      const newPin = [...pin];
      for (let i = 0; i < pastedData.length; i++) {
        newPin[i] = pastedData[i];
      }
      setPin(newPin);
      if (error) setError('');
      const focusIndex = Math.min(pastedData.length, 3);
      pinRefs.current[focusIndex]?.focus();
    }
  };

  const handleSubmitUnlock = async (e, overridePin = null) => {
    if (e) e.preventDefault();
    const entered = isDeveloperMode ? password.trim() : (overridePin || pin.join(''));
    
    if (!entered || (!isDeveloperMode && entered.length < 4)) {
      setError(isDeveloperMode ? 'Please enter the developer master code.' : 'Please enter your 4-digit PIN.');
      return;
    }

    // Check if entered is the developer recovery password
    if (entered === 'developer@v2c') {
      setIsDevControlOpen(true);
      setError('');
      setPassword('');
      setPin(['', '', '', '']);
      return;
    }

    // If trial is expired, normal PIN cannot unlock!
    if (licenseStatus?.isExpired) {
      setError('Trial / Evaluation period has ended. Access restricted to Developer Mode.');
      setPin(['', '', '', '']);
      return;
    }

    setIsVerifying(true);
    setError('');
    setIsSuccess(false);

    try {
      const isValid = await ipcClient.verifyPin(entered);
      if (isValid) {
        setIsSuccess(true);
        setTimeout(() => {
          onUnlock(entered);
        }, 500);
      } else {
        setError(isDeveloperMode ? 'Incorrect developer master code.' : 'Incorrect PIN. Please try again.');
        setPassword('');
        setTimeout(() => {
          setPin(['', '', '', '']);
          if (!isDeveloperMode) {
            pinRefs.current[0]?.focus();
          }
        }, 600);
        setIsVerifying(false);
      }
    } catch (err) {
      setError(err.message || 'Verification failed.');
      setIsVerifying(false);
    }
  };

  // Preset Days helper
  const handleApplyPreset = (days) => {
    const now = new Date();
    const startStr = now.toISOString().slice(0, 16);
    const end = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    const endStr = end.toISOString().slice(0, 16);
    setTrialStart(startStr);
    setTrialEnd(endStr);
  };

  // Developer saves new license and optionally PIN
  const handleSaveDeveloperSettings = async (e) => {
    if (e) e.preventDefault();
    setIsVerifying(true);
    setError('');

    try {
      if (selectedLicenseMode === 'TEST') {
        if (!trialStart || !trialEnd) {
          setError('Please provide both Start and End date/time for Test Mode.');
          setIsVerifying(false);
          return;
        }
        if (new Date(trialStart) >= new Date(trialEnd)) {
          setError('Trial End Date & Time must be after Trial Start Date & Time.');
          setIsVerifying(false);
          return;
        }
      }

      // If user chose to change PIN
      if (changeUserPin) {
        if (newPassword !== confirmPassword) {
          setError('New PIN and Confirm PIN do not match.');
          setIsVerifying(false);
          return;
        }
        if (newPassword.trim().length < 4) {
          setError('PIN must be at least 4 digits/characters long.');
          setIsVerifying(false);
          return;
        }
        await ipcClient.setSecurityPin('developer@v2c', newPassword.trim());
      }

      // Save License Mode
      const updatedLicense = await ipcClient.setLicenseMode('developer@v2c', {
        mode: selectedLicenseMode,
        startDateTime: selectedLicenseMode === 'TEST' ? new Date(trialStart).toISOString() : null,
        endDateTime: selectedLicenseMode === 'TEST' ? new Date(trialEnd).toISOString() : null
      });

      setLicenseStatus(updatedLicense);
      setSuccessMsg('License settings updated successfully!');
      
      // Unlock application and proceed
      setTimeout(async () => {
        await onUnlock(newPassword.trim() || 'DEV_UNLOCKED');
      }, 700);
    } catch (err) {
      setError(err.message || 'Failed to save developer settings.');
      setIsVerifying(false);
    }
  };

  const isExpired = licenseStatus?.isExpired;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm text-slate-900 dark:text-slate-100 select-none p-4 overflow-y-auto">
      <div className={`relative w-full ${isDevControlOpen ? 'max-w-xl' : 'max-w-md'} bg-white dark:bg-slate-900 p-7 rounded-2xl border-2 border-slate-300 dark:border-slate-700 shadow-2xl transition-all duration-300 my-auto`}>
        {/* Brand & Header */}
        <div className="flex flex-col items-center text-center">
          <img
            src={companyLogo}
            alt="Shepherd Enterprises"
            className="w-20 h-20 object-contain rounded-full shadow-none -mb-1"
          />

          <div className="mt-1">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-wide uppercase">
              Shepherd Enterprises
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Private Limited • Billing &amp; Invoice System
            </p>
          </div>
        </div>

        {/* State Banner */}
        {!isDevControlOpen ? (
          isExpired ? (
            <div className="mt-5 flex items-start gap-3 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-xs text-rose-900 dark:text-rose-200">
              <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold text-rose-700 dark:text-rose-300 block">Trial / Evaluation Period Ended:</strong>
                <span className="text-rose-800 dark:text-rose-200 text-xs">
                  User access is currently locked. Please open Developer Recovery Mode to activate Live Mode or extend the trial period. All data and backups are safe and preserved.
                </span>
              </div>
            </div>
          ) : (
            <div className="mt-5 flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-xs text-sky-900 dark:text-sky-200 font-medium">
              <ShieldCheck className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
              <span>Application is locked. Enter your security PIN to access billing records.</span>
            </div>
          )
        ) : (
          <div className="mt-5 flex items-start gap-2.5 px-3.5 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200">
            <Wrench className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-800 dark:text-amber-300">Developer Control Panel Verified:</strong>
              <div className="mt-0.5 text-amber-700 dark:text-amber-200/90">
                Configure Live Mode (Permanently Activated) or Test Mode (with start/end dates and times).
              </div>
            </div>
          </div>
        )}

        {/* Normal Login Form vs Developer Master Code vs Developer Control Panel */}
        {!isDevControlOpen ? (
          <form onSubmit={handleSubmitUnlock} className="mt-5 space-y-5">
            {!isDeveloperMode && !isExpired ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 text-center block">
                    Enter 4-Digit User PIN
                  </label>
                  <div className="flex justify-center gap-3">
                    {[0, 1, 2, 3].map((index) => (
                      <input
                        key={index}
                        ref={(el) => (pinRefs.current[index] = el)}
                        type="password"
                        maxLength={1}
                        value={pin[index]}
                        onChange={(e) => handlePinChange(index, e.target.value)}
                        onKeyDown={(e) => handlePinKeyDown(index, e)}
                        onPaste={handlePinPaste}
                        className={`w-12 h-14 p-0 leading-[3.5rem] font-mono text-center text-2xl font-bold rounded-xl focus:outline-none transition-all shadow-sm ${
                          error
                            ? 'bg-rose-100 border-2 border-rose-500 text-rose-900 dark:bg-rose-950/80 dark:border-rose-600'
                            : isSuccess
                            ? 'bg-emerald-100 border-2 border-emerald-500 text-emerald-900 dark:bg-emerald-950/80 dark:border-emerald-600'
                            : 'bg-sky-50 dark:bg-slate-900 border-2 border-sky-200 dark:border-slate-700 text-sky-900 dark:text-slate-100'
                        }`}
                        autoFocus={index === 0}
                      />
                    ))}
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full justify-center py-2.5 text-sm font-semibold"
                  isLoading={isVerifying}
                >
                  <div className="flex items-center gap-2">
                    Unlock Application <ArrowRight className="w-4 h-4" />
                  </div>
                </Button>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsDeveloperMode(true);
                      setError('');
                    }}
                    className="text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
                  >
                    Developer Recovery Mode
                  </button>
                </div>
              </div>
            ) : (
              /* Developer Master Code Form */
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Developer Master Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter developer password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (error) setError('');
                      }}
                      autoFocus
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3.5 py-2.5 pr-10 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors font-mono shadow-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full justify-center py-2.5 text-sm font-semibold"
                  isLoading={isVerifying}
                >
                  <div className="flex items-center gap-2">
                    Verify Developer Access <ArrowRight className="w-4 h-4" />
                  </div>
                </Button>

                {!isExpired && (
                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsDeveloperMode(false);
                        setError('');
                      }}
                      className="text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
                    >
                      Back to PIN Login
                    </button>
                  </div>
                )}
              </div>
            )}
          </form>
        ) : (
          /* Developer Control Panel Form */
          <form onSubmit={handleSaveDeveloperSettings} className="mt-5 space-y-5">
            {/* Mode Selector Cards */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                System License Activation Mode
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Live Mode Card */}
                <div
                  onClick={() => setSelectedLicenseMode('LIVE')}
                  className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedLicenseMode === 'LIVE'
                      ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-sm">
                      <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Live Mode</span>
                    </div>
                    {selectedLicenseMode === 'LIVE' && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    )}
                  </div>
                  <p className="text-[11px] leading-relaxed opacity-90">
                    <strong>Permanently Activated.</strong> Full commercial license with zero time restriction.
                  </p>
                </div>

                {/* Test Mode Card */}
                <div
                  onClick={() => setSelectedLicenseMode('TEST')}
                  className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedLicenseMode === 'TEST'
                      ? 'border-amber-500 bg-amber-50/70 dark:bg-amber-950/40 text-amber-950 dark:text-amber-100 ring-2 ring-amber-500/20'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-sm">
                      <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span>Test / Trial Mode</span>
                    </div>
                    {selectedLicenseMode === 'TEST' && (
                      <CheckCircle2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    )}
                  </div>
                  <p className="text-[11px] leading-relaxed opacity-90">
                    <strong>Timed Evaluation.</strong> Configurable start and end date/time. Locks when period ends.
                  </p>
                </div>
              </div>
            </div>

            {/* Test Mode Datetime Pickers (Only visible when Test Mode is selected) */}
            {selectedLicenseMode === 'TEST' && (
              <div className="p-4 rounded-xl border border-amber-300 dark:border-amber-800/80 bg-amber-50/50 dark:bg-amber-950/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    Trial Period Settings (Date &amp; Time)
                  </span>

                  {/* Quick Preset Buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleApplyPreset(7)}
                      className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-200/80 hover:bg-amber-300 dark:bg-amber-900 dark:hover:bg-amber-800 text-amber-900 dark:text-amber-100 transition-colors"
                    >
                      +7 Days
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyPreset(15)}
                      className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-200/80 hover:bg-amber-300 dark:bg-amber-900 dark:hover:bg-amber-800 text-amber-900 dark:text-amber-100 transition-colors"
                    >
                      +15 Days
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyPreset(30)}
                      className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-200/80 hover:bg-amber-300 dark:bg-amber-900 dark:hover:bg-amber-800 text-amber-900 dark:text-amber-100 transition-colors"
                    >
                      +30 Days
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyPreset(60)}
                      className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-200/80 hover:bg-amber-300 dark:bg-amber-900 dark:hover:bg-amber-800 text-amber-900 dark:text-amber-100 transition-colors"
                    >
                      +60 Days
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      Start Date &amp; Time:
                    </label>
                    <input
                      type="datetime-local"
                      value={trialStart}
                      onChange={(e) => setTrialStart(e.target.value)}
                      required
                      className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      End Date &amp; Time (Expiry):
                    </label>
                    <input
                      type="datetime-local"
                      value={trialEnd}
                      onChange={(e) => setTrialEnd(e.target.value)}
                      required
                      className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Optional PIN Reset Accordion */}
            <div className="border-t border-slate-200 dark:border-slate-800 pt-3 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={changeUserPin}
                    onChange={(e) => setChangeUserPin(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-700"
                  />
                  <span>Reset / Change User Access PIN</span>
                </label>
              </div>

              {changeUserPin && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
                      New PIN / Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNew ? 'text' : 'password'}
                        placeholder="Min 4 digits"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full text-xs px-3 py-2 pr-8 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNew(!showNew)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 p-1"
                      >
                        {showNew ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
                      Confirm New PIN
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirm ? 'text' : 'password'}
                        placeholder="Re-enter PIN"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full text-xs px-3 py-2 pr-8 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 p-1"
                      >
                        {showConfirm ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Zero Data Loss Guarantee */}
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-[11px] text-slate-600 dark:text-slate-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>
                <strong>Data Protection Guarantee:</strong> All customer records, invoices, proformas, and backups are never deleted when trial ends.
              </span>
            </div>

            {/* Submit Button */}
            <div className="space-y-2 pt-1">
              <Button
                type="submit"
                variant="primary"
                className="w-full justify-center py-2.5 text-sm font-semibold"
                isLoading={isVerifying}
                icon={KeyRound}
              >
                Save &amp; Apply License Mode
              </Button>

              <button
                type="button"
                onClick={() => {
                  setIsDevControlOpen(false);
                  setIsDeveloperMode(false);
                  setError('');
                }}
                className="w-full py-1.5 text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors text-center"
              >
                Cancel &amp; Close Developer Mode
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Notification Toasts */}
      {error && (
        <Toast
          type="error"
          message={error}
          onClose={() => setError('')}
          duration={5000}
        />
      )}
      {successMsg && (
        <Toast
          type="success"
          message={successMsg}
          onClose={() => setSuccessMsg('')}
          duration={4000}
        />
      )}
    </div>
  );
}

