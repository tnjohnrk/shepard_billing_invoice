import React, { useState, useRef } from 'react';
import { ShieldAlert, Sparkles, CheckCircle2, Clock, KeyRound, Lock, ArrowRight, X } from 'lucide-react';
import companyLogo from '../../assets/app_icon.png';
import { Button } from '../common/Button';
import { Toast } from '../common/Toast';
import { ipcClient } from '../../services/ipcClient';

function formatDateTime(isoString) {
  if (!isoString) return 'N/A';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (e) {
    return isoString;
  }
}

export function TrialExpiredOverlay({ licenseStatus, onLicenseUpdated, onLockApp }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [developerKey, setDeveloperKey] = useState('');
  const [isKeyVerified, setIsKeyVerified] = useState(false);
  const [devActiveTab, setDevActiveTab] = useState('license'); // 'license' | 'password'
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // License Mode options
  const [selectedMode, setSelectedMode] = useState('LIVE');
  const [trialStart, setTrialStart] = useState(() => new Date().toISOString().slice(0, 16));
  const [trialEnd, setTrialEnd] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 10);
    return d.toISOString().slice(0, 16);
  });

  // Tab 2: 4-Digit PIN Reset State
  const [devNewPin, setDevNewPin] = useState(['', '', '', '']);
  const [devConfirmPin, setDevConfirmPin] = useState(['', '', '', '']);
  const devNewPinRefs = useRef([]);
  const devConfirmPinRefs = useRef([]);

  const formatCleanError = (err, fallback = 'Operation failed.') => {
    if (!err) return fallback;
    const raw = typeof err === 'string' ? err : (err.message || String(err));
    return raw
      .replace(/^Error invoking remote method '.*?': Error: /i, '')
      .replace(/^Error invoking remote method '.*?': /i, '')
      .replace(/^Error: /i, '')
      .trim() || fallback;
  };

  const handleVerifyMasterKey = (e) => {
    e.preventDefault();
    if (developerKey.trim() === 'developer@v2c') {
      setIsKeyVerified(true);
      setError('');
      setDeveloperKey('');
    } else {
      setError('Incorrect developer master password. Please try again.');
      setDeveloperKey('');
    }
  };

  const handleApplyPreset = (days) => {
    const now = new Date();
    const startStr = now.toISOString().slice(0, 16);
    const end = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    const endStr = end.toISOString().slice(0, 16);
    setTrialStart(startStr);
    setTrialEnd(endStr);
  };

  const handleSaveLicense = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');

    try {
      if (selectedMode === 'TEST') {
        if (!trialStart || !trialEnd) {
          setError('Please specify both Start and End date/time for Trial Mode.');
          setIsSaving(false);
          return;
        }
        if (new Date(trialStart) >= new Date(trialEnd)) {
          setError('Trial End Date & Time must be after Start Date & Time.');
          setIsSaving(false);
          return;
        }
      }

      const updated = await ipcClient.setLicenseMode('developer@v2c', {
        mode: selectedMode,
        startDateTime: selectedMode === 'TEST' ? new Date(trialStart).toISOString() : null,
        endDateTime: selectedMode === 'TEST' ? new Date(trialEnd).toISOString() : null
      });

      setSuccessMsg('License updated successfully! All features are now unlocked.');
      setTimeout(() => {
        setIsModalOpen(false);
        if (onLicenseUpdated) onLicenseUpdated(updated);
      }, 700);
    } catch (err) {
      setError(formatCleanError(err, 'Failed to update license.'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNewPin = async (e) => {
    e.preventDefault();
    const p1 = devNewPin.join('');
    const p2 = devConfirmPin.join('');

    if (p1.length !== 4) {
      setError('PIN must be exactly 4 digits.');
      return;
    }
    if (p1 !== p2) {
      setError('New PIN and Confirm PIN do not match.');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      await ipcClient.setSecurityPin('developer@v2c', p1);
      setSuccessMsg('New 4-digit security PIN saved successfully!');
      setTimeout(() => {
        setIsModalOpen(false);
        if (onLicenseUpdated) onLicenseUpdated(licenseStatus);
      }, 700);
    } catch (err) {
      setError(formatCleanError(err, 'Failed to save new PIN.'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDisablePin = async () => {
    setIsSaving(true);
    setError('');
    try {
      await ipcClient.disableSecurityPin('developer@v2c');
      setSuccessMsg('Password protection removed.');
      setTimeout(() => {
        setIsModalOpen(false);
        if (onLicenseUpdated) onLicenseUpdated(licenseStatus);
      }, 700);
    } catch (err) {
      setError(formatCleanError(err, 'Failed to disable password.'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md text-slate-100 select-none p-4">
      {/* Expired Message Card */}
      <div className="relative w-full max-w-lg bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#30363d] rounded-2xl p-7 shadow-2xl text-center space-y-5">
        {/* Brand Logo & Alert Icon */}
        <div className="flex flex-col items-center">
          <div className="relative">
            <img
              src={companyLogo}
              alt="Shepherd Enterprises"
              className="w-20 h-20 sm:w-22 sm:h-22 object-contain shadow-none mb-1"
            />
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-rose-600 border-2 border-white dark:border-[#161b22] flex items-center justify-center text-white shadow-md">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-2">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100 tracking-wide uppercase">
              Shepherd Enterprises
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Private Limited • Billing &amp; Invoice System
            </p>
          </div>
        </div>

        {/* Lockout Notice */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-bold uppercase tracking-wider">
            <Lock className="w-3.5 h-3.5" />
            <span>Trial Period Has Ended</span>
          </div>

          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Application Access Locked
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-md mx-auto">
            Your evaluation trial period has concluded. Invoices, proformas, creation wizards, and editing tools are temporarily restricted.
          </p>
        </div>

        {/* Timeline & Data Protection Note */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-[#30363d] text-left space-y-2.5">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-semibold">TRIAL STARTED</span>
              <span className="text-slate-800 dark:text-slate-200 font-mono font-medium">{formatDateTime(licenseStatus?.startDateTime)}</span>
            </div>
            <div>
              <span className="text-rose-600 dark:text-rose-400 block text-[11px] font-semibold">TRIAL EXPIRED</span>
              <span className="text-rose-600 dark:text-rose-400 font-mono font-bold">{formatDateTime(licenseStatus?.endDateTime)}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-[#30363d] flex items-center gap-2 text-[11px] text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>All your data, customer records, and backups are safely preserved.</span>
          </div>
        </div>

        {/* Footer Actions / Subtle Developer Entry */}
        <div className="pt-1 flex flex-col items-center gap-2">
          {onLockApp && (
            <button
              type="button"
              onClick={onLockApp}
              className="text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors font-medium cursor-pointer"
            >
              Lock &amp; Exit to Lock Screen
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              setIsModalOpen(true);
              setIsKeyVerified(false);
              setDeveloperKey('');
              setError('');
            }}
            className="text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
          >
            Developer Mode
          </button>
        </div>
      </div>

      {/* Developer Activation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="w-full max-w-lg bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#30363d] rounded-2xl p-6 sm:p-7 shadow-2xl space-y-4">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#30363d]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  Developer Control Panel
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setIsKeyVerified(false);
                  setError('');
                }}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {!isKeyVerified ? (
              /* Step 1: Master Password Entry (NO eye button) */
              <form onSubmit={handleVerifyMasterKey} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Developer Master Password
                  </label>
                  <input
                    type="password"
                    placeholder="Enter developer password"
                    value={developerKey}
                    onChange={(e) => {
                      setDeveloperKey(e.target.value);
                      if (error) setError('');
                    }}
                    autoFocus
                    required
                    className="w-full bg-slate-50 dark:bg-[#0d1117] border border-slate-300 dark:border-[#30363d] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors font-mono"
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full justify-center py-2.5 text-xs sm:text-sm font-bold bg-[#0969da] hover:bg-[#085ac5] dark:bg-[#1f6feb] dark:hover:bg-[#388bfd]"
                >
                  <div className="flex items-center gap-2">
                    Verify Developer Access <ArrowRight className="w-4 h-4" />
                  </div>
                </Button>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setError('');
                    }}
                    className="text-xs font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              /* Step 2: Developer Control Panel Tabs */
              <div className="space-y-4">
                {/* Tab Switcher */}
                <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-[#0d1117] rounded-xl border border-slate-200 dark:border-[#30363d] gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setDevActiveTab('license');
                      setError('');
                    }}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      devActiveTab === 'license'
                        ? 'bg-white dark:bg-[#161b22] text-blue-600 dark:text-blue-400 shadow-2xs border border-slate-200/80 dark:border-[#30363d]'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>License Mode</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setDevActiveTab('password');
                      setError('');
                    }}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      devActiveTab === 'password'
                        ? 'bg-white dark:bg-[#161b22] text-blue-600 dark:text-blue-400 shadow-2xs border border-slate-200/80 dark:border-[#30363d]'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>Password Reset</span>
                  </button>
                </div>

                {/* TAB 1: License Mode Settings */}
                {devActiveTab === 'license' && (
                  <form onSubmit={handleSaveLicense} className="space-y-4">
                    {/* Mode Selector Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Live Mode Card */}
                      <div
                        onClick={() => setSelectedMode('LIVE')}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                          selectedMode === 'LIVE'
                            ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-950 dark:text-emerald-100 ring-2 ring-emerald-500/20'
                            : 'border-slate-200 dark:border-[#30363d] bg-slate-50/60 dark:bg-[#0d1117]/50 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 font-bold text-xs sm:text-sm">
                            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            <span>Live Mode</span>
                          </div>
                          {selectedMode === 'LIVE' && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          )}
                        </div>
                      </div>

                      {/* Test Mode Card */}
                      <div
                        onClick={() => setSelectedMode('TEST')}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                          selectedMode === 'TEST'
                            ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-950/30 text-blue-950 dark:text-blue-100 ring-2 ring-blue-500/20'
                            : 'border-slate-200 dark:border-[#30363d] bg-slate-50/60 dark:bg-[#0d1117]/50 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 font-bold text-xs sm:text-sm">
                            <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            <span>Test / Trial Mode</span>
                          </div>
                          {selectedMode === 'TEST' && (
                            <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Test Mode Datetime Pickers with 5 Days & 10 Days presets */}
                    {selectedMode === 'TEST' && (
                      <div className="p-3.5 rounded-xl border border-slate-200 dark:border-[#30363d] bg-slate-50/60 dark:bg-[#0d1117]/50 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                            Trial Period
                          </span>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleApplyPreset(5)}
                              className="px-2.5 py-0.5 text-xs font-semibold rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 transition-colors cursor-pointer"
                            >
                              5 Days
                            </button>
                            <button
                              type="button"
                              onClick={() => handleApplyPreset(10)}
                              className="px-2.5 py-0.5 text-xs font-semibold rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 transition-colors cursor-pointer"
                            >
                              10 Days
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                              Start Date &amp; Time:
                            </label>
                            <input
                              type="datetime-local"
                              value={trialStart}
                              onChange={(e) => setTrialStart(e.target.value)}
                              required
                              className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-300 dark:border-[#30363d] bg-white dark:bg-[#161b22] text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                              End Date &amp; Time:
                            </label>
                            <input
                              type="datetime-local"
                              value={trialEnd}
                              onChange={(e) => setTrialEnd(e.target.value)}
                              required
                              className="w-full text-xs font-mono px-3 py-2 rounded-lg border border-slate-300 dark:border-[#30363d] bg-white dark:bg-[#161b22] text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Submit Button */}
                    <div className="space-y-2 pt-1">
                      <Button
                        type="submit"
                        variant="primary"
                        className="w-full justify-center py-2.5 text-xs sm:text-sm font-bold bg-[#0969da] hover:bg-[#085ac5] dark:bg-[#1f6feb] dark:hover:bg-[#388bfd]"
                        isLoading={isSaving}
                        icon={Sparkles}
                      >
                        Save &amp; Apply License
                      </Button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsModalOpen(false);
                          setIsKeyVerified(false);
                          setError('');
                        }}
                        className="w-full py-1 text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors text-center cursor-pointer"
                      >
                        Cancel &amp; Exit
                      </button>
                    </div>
                  </form>
                )}

                {/* TAB 2: PIN Reset */}
                {devActiveTab === 'password' && (
                  <form onSubmit={handleSaveNewPin} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block text-center uppercase tracking-wider">
                        Create New 4-Digit PIN
                      </label>
                      <div className="flex justify-center gap-2.5 sm:gap-3">
                        {[0, 1, 2, 3].map((index) => (
                          <input
                            key={`dev-new-${index}`}
                            ref={(el) => (devNewPinRefs.current[index] = el)}
                            type="password"
                            maxLength={1}
                            value={devNewPin[index]}
                            onChange={(e) => {
                              const digit = e.target.value.slice(-1).replace(/\D/g, '');
                              const updated = [...devNewPin];
                              updated[index] = digit;
                              setDevNewPin(updated);
                              if (error) setError('');
                              if (digit && index < 3) {
                                devNewPinRefs.current[index + 1]?.focus();
                              } else if (digit && index === 3) {
                                devConfirmPinRefs.current[0]?.focus();
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Backspace' && !devNewPin[index] && index > 0) {
                                devNewPinRefs.current[index - 1]?.focus();
                              }
                            }}
                            className="w-11 h-13 sm:w-12 sm:h-14 font-mono text-center text-2xl font-bold rounded-xl bg-slate-50 dark:bg-[#0d1117] border border-slate-300 dark:border-[#30363d] text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none transition-all shadow-2xs"
                            autoFocus={index === 0}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2 pt-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block text-center uppercase tracking-wider">
                        Confirm New 4-Digit PIN
                      </label>
                      <div className="flex justify-center gap-2.5 sm:gap-3">
                        {[0, 1, 2, 3].map((index) => (
                          <input
                            key={`dev-confirm-${index}`}
                            ref={(el) => (devConfirmPinRefs.current[index] = el)}
                            type="password"
                            maxLength={1}
                            value={devConfirmPin[index]}
                            onChange={(e) => {
                              const digit = e.target.value.slice(-1).replace(/\D/g, '');
                              const updated = [...devConfirmPin];
                              updated[index] = digit;
                              setDevConfirmPin(updated);
                              if (error) setError('');
                              if (digit && index < 3) {
                                devConfirmPinRefs.current[index + 1]?.focus();
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Backspace' && !devConfirmPin[index] && index > 0) {
                                devConfirmPinRefs.current[index - 1]?.focus();
                              }
                            }}
                            className="w-11 h-13 sm:w-12 sm:h-14 font-mono text-center text-2xl font-bold rounded-xl bg-slate-50 dark:bg-[#0d1117] border border-slate-300 dark:border-[#30363d] text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none transition-all shadow-2xs"
                          />
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2 pt-1">
                      <Button
                        type="submit"
                        variant="primary"
                        className="w-full justify-center py-2.5 text-xs sm:text-sm font-bold bg-[#0969da] hover:bg-[#085ac5] dark:bg-[#1f6feb] dark:hover:bg-[#388bfd]"
                        isLoading={isSaving}
                        icon={KeyRound}
                      >
                        Save New 4-Digit PIN
                      </Button>

                      <button
                        type="button"
                        onClick={handleDisablePin}
                        disabled={isSaving}
                        className="w-full py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/40 rounded-lg transition-colors cursor-pointer text-center"
                      >
                        Disable Password Protection
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsModalOpen(false);
                          setIsKeyVerified(false);
                          setError('');
                        }}
                        className="w-full py-1 text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors text-center cursor-pointer"
                      >
                        Cancel &amp; Exit
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notifications */}
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
