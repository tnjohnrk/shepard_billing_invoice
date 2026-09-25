import React, { useState } from 'react';
import { ShieldAlert, Sparkles, KeyRound, CheckCircle2, Clock, Eye, EyeOff, Lock, ArrowRight } from 'lucide-react';
import companyLogo from '../../assets/logo.png';
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
  const [showKey, setShowKey] = useState(false);
  const [isKeyVerified, setIsKeyVerified] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // License Mode options
  const [selectedMode, setSelectedMode] = useState('LIVE');
  const [trialStart, setTrialStart] = useState(() => new Date().toISOString().slice(0, 16));
  const [trialEnd, setTrialEnd] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().slice(0, 16);
  });

  const handleVerifyMasterKey = (e) => {
    e.preventDefault();
    if (developerKey.trim() === 'developer@v2c') {
      setIsKeyVerified(true);
      setError('');
    } else {
      setError('Incorrect developer master password. Please try again.');
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
          setError('Please specify both Start and End date/time.');
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
      setError(err.message || 'Failed to update license.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md text-slate-100 select-none p-4">
      {/* Expired Message Card */}
      <div className="relative w-full max-w-lg bg-slate-900 border-2 border-rose-500/40 rounded-3xl p-8 shadow-2xl text-center space-y-6">
        {/* Brand Logo & Alert Icon */}
        <div className="flex flex-col items-center">
          <div className="relative">
            <img
              src={companyLogo}
              alt="Shepherd Enterprises"
              className="w-20 h-20 object-contain rounded-full shadow-md"
            />
            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-rose-600 border-2 border-slate-900 flex items-center justify-center text-white shadow-lg">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-3">
            <h2 className="text-lg font-extrabold text-white tracking-wide uppercase">
              Shepherd Enterprises
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              Private Limited • Billing &amp; Invoice System
            </p>
          </div>
        </div>

        {/* Lockout Notice */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold uppercase tracking-wider">
            <Lock className="w-3.5 h-3.5" />
            <span>Trial Period Has Ended</span>
          </div>

          <h3 className="text-xl font-bold text-white">
            Application Access Locked
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed max-w-md mx-auto">
            Your evaluation trial period has concluded. Invoices, proformas, creation wizards, and editing tools are temporarily invisible and restricted.
          </p>
        </div>

        {/* Timeline & Data Protection Note */}
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-left space-y-2.5">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-slate-500 block text-[11px] font-semibold">TRIAL STARTED</span>
              <span className="text-slate-300 font-mono">{formatDateTime(licenseStatus?.startDateTime)}</span>
            </div>
            <div>
              <span className="text-rose-400 block text-[11px] font-semibold">TRIAL EXPIRED</span>
              <span className="text-rose-300 font-mono font-bold">{formatDateTime(licenseStatus?.endDateTime)}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center gap-2 text-[11px] text-emerald-400">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>All your data, customer records, and backups are safely preserved.</span>
          </div>
        </div>

        {/* Footer Actions / Subtle Developer Entry */}
        <div className="pt-2 flex flex-col items-center gap-2">
          {onLockApp && (
            <button
              type="button"
              onClick={onLockApp}
              className="text-xs text-slate-400 hover:text-slate-200 transition-colors font-medium cursor-pointer"
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
            className="text-[11px] font-semibold text-slate-500 hover:text-slate-400 dark:text-slate-500 dark:hover:text-slate-400 transition-colors cursor-pointer"
          >
            Developer Mode
          </button>
        </div>
      </div>

      {/* Developer Activation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4">
          <div className="w-full max-w-md bg-slate-900 border-2 border-slate-700 rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Developer License Reactivation
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded bg-slate-800"
              >
                Close
              </button>
            </div>

            {!isKeyVerified ? (
              /* Step 1: Master Password Entry */
              <form onSubmit={handleVerifyMasterKey} className="space-y-4">
                <p className="text-xs text-slate-300">
                  Enter the developer master password to reactivate Live Mode or extend the trial period.
                </p>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Developer Master Password
                  </label>
                  <div className="relative">
                    <input
                      type={showKey ? 'text' : 'password'}
                      placeholder="Enter developer password"
                      value={developerKey}
                      onChange={(e) => {
                        setDeveloperKey(e.target.value);
                        if (error) setError('');
                      }}
                      autoFocus
                      required
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 pr-10 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                    >
                      {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full justify-center py-2.5 text-sm font-semibold"
                >
                  Verify Master Access <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </form>
            ) : (
              /* Step 2: Choose Live Mode or Test Mode */
              <form onSubmit={handleSaveLicense} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                    Select Activation Mode
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* Live Mode Card */}
                    <div
                      onClick={() => setSelectedMode('LIVE')}
                      className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedMode === 'LIVE'
                          ? 'border-emerald-500 bg-emerald-950/40 text-emerald-100 ring-2 ring-emerald-500/20'
                          : 'border-slate-700 bg-slate-800/60 text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5 font-bold text-xs">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Live Mode</span>
                        </div>
                        {selectedMode === 'LIVE' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                      </div>
                      <p className="text-[10.5px] text-slate-400 leading-tight">
                        <strong>Permanent.</strong> No expiration. Full commercial access.
                      </p>
                    </div>

                    {/* Test Mode Card */}
                    <div
                      onClick={() => setSelectedMode('TEST')}
                      className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedMode === 'TEST'
                          ? 'border-amber-500 bg-amber-950/40 text-amber-100 ring-2 ring-amber-500/20'
                          : 'border-slate-700 bg-slate-800/60 text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5 font-bold text-xs">
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          <span>Extend Trial</span>
                        </div>
                        {selectedMode === 'TEST' && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />}
                      </div>
                      <p className="text-[10.5px] text-slate-400 leading-tight">
                        <strong>Timed.</strong> Custom start &amp; end date/time.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Test Mode Dates */}
                {selectedMode === 'TEST' && (
                  <div className="p-3.5 rounded-xl border border-amber-800/80 bg-amber-950/30 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-200">New Trial Period</span>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => handleApplyPreset(10)}
                          className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-amber-900 text-amber-100 cursor-pointer"
                        >
                          +10d
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApplyPreset(15)}
                          className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-amber-900 text-amber-100"
                        >
                          +15d
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApplyPreset(30)}
                          className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-amber-900 text-amber-100"
                        >
                          +30d
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] text-slate-300 block">Start Date &amp; Time:</label>
                      <input
                        type="datetime-local"
                        value={trialStart}
                        onChange={(e) => setTrialStart(e.target.value)}
                        required
                        className="w-full text-xs font-mono px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-950 text-slate-100"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] text-slate-300 block">End Date &amp; Time:</label>
                      <input
                        type="datetime-local"
                        value={trialEnd}
                        onChange={(e) => setTrialEnd(e.target.value)}
                        required
                        className="w-full text-xs font-mono px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-950 text-slate-100"
                      />
                    </div>
                  </div>
                )}

                <div className="pt-2 space-y-2">
                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full justify-center py-2.5 text-sm font-semibold"
                    isLoading={isSaving}
                    icon={Sparkles}
                  >
                    Save &amp; Unlock System
                  </Button>
                </div>
              </form>
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
