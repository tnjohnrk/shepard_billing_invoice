import React, { useState } from 'react';
import { Lock, Eye, EyeOff, ShieldCheck, KeyRound, ArrowRight, AlertCircle, Wrench, CheckCircle2, Unlock } from 'lucide-react';
import companyLogo from '../../assets/logo.png';
import { Button } from '../common/Button';
import { ipcClient } from '../../services/ipcClient';

export function LockScreen({ onUnlock }) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Developer Reset Mode State
  const [isResetMode, setIsResetMode] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmitUnlock = async (e) => {
    if (e) e.preventDefault();
    const entered = password.trim();
    if (!entered) {
      setError('Please enter your security password.');
      return;
    }

    // Check if entered is the developer recovery password
    if (entered === 'developer@v2c') {
      setIsResetMode(true);
      setError('');
      setPassword('');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      const success = await onUnlock(entered);
      if (!success) {
        setError('Incorrect security password. Please try again.');
        setPassword('');
      }
    } catch (err) {
      setError(err.message || 'Verification failed.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSaveNewPassword = async (e) => {
    if (e) e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match.');
      return;
    }
    if (newPassword.trim().length < 4) {
      setError('Password must be at least 4 characters long.');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      await ipcClient.setSecurityPin('developer@v2c', newPassword.trim());
      await onUnlock(newPassword.trim());
    } catch (err) {
      setError(err.message || 'Failed to save new password.');
      setIsVerifying(false);
    }
  };

  const handleDisablePassword = async () => {
    setIsVerifying(true);
    setError('');
    try {
      await ipcClient.disableSecurityPin('developer@v2c');
      await onUnlock('');
    } catch (err) {
      setError(err.message || 'Failed to disable password.');
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950 text-slate-100 select-none p-4">
      {/* Background Ambient Glow */}
      <div className="absolute w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none -top-20 -left-20" />
      <div className="absolute w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none -bottom-20 -right-20" />

      <div className="relative w-full max-w-md glass-panel p-8 rounded-2xl border border-slate-800/80 shadow-2xl backdrop-blur-xl space-y-6">
        {/* Brand & Header */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="relative">
            <img
              src={companyLogo}
              alt="Shepherd Enterprises"
              className="w-20 h-20 object-contain rounded-full border-2 border-indigo-500/40 shadow-xl shadow-indigo-950/50"
            />
            <div className={`absolute -bottom-1 -right-1 p-1.5 rounded-full text-white shadow-md ${isResetMode ? 'bg-amber-600' : 'bg-indigo-600'}`}>
              {isResetMode ? <Wrench className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-100 tracking-wide uppercase">
              Shepherd Enterprises
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Private Limited • Billing &amp; Invoice System
            </p>
          </div>
        </div>

        {/* Status / Instruction Banner */}
        {!isResetMode ? (
          <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg bg-indigo-950/40 border border-indigo-800/40 text-xs text-indigo-200">
            <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>Application is locked. Enter your security password to access billing records.</span>
          </div>
        ) : (
          <div className="flex items-start gap-2.5 px-3.5 py-2.5 rounded-lg bg-amber-950/50 border border-amber-800/50 text-xs text-amber-200">
            <Wrench className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-300">Developer Master Code Verified:</strong>
              <div className="mt-0.5 text-amber-200/90">Please create a new password below for the user to access the billing system.</div>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-950/60 border border-rose-800/60 text-xs text-rose-300 animate-shake">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Normal Login Form */}
        {!isResetMode ? (
          <form onSubmit={handleSubmitUnlock} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Security Password / PIN
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your security password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  autoFocus
                  className="w-full bg-slate-900/80 border border-slate-700/80 rounded-lg px-3.5 py-2.5 pr-10 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors p-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full justify-center py-2.5 text-sm font-semibold shadow-lg shadow-indigo-600/20 cursor-pointer"
              isLoading={isVerifying}
              icon={ArrowRight}
            >
              Unlock Application
            </Button>
          </form>
        ) : (
          /* Developer Reset / Create Password Form */
          <form onSubmit={handleSaveNewPassword} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Create New Password <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  placeholder="Enter new password (min. 4 chars)"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (error) setError('');
                  }}
                  autoFocus
                  required
                  className="w-full bg-slate-900/80 border border-slate-700/80 rounded-lg px-3.5 py-2.5 pr-10 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1"
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Confirm New Password <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (error) setError('');
                  }}
                  required
                  className="w-full bg-slate-900/80 border border-slate-700/80 rounded-lg px-3.5 py-2.5 pr-10 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <Button
                type="submit"
                variant="primary"
                className="w-full justify-center py-2.5 text-sm font-semibold shadow-lg shadow-indigo-600/20 cursor-pointer"
                isLoading={isVerifying}
                icon={KeyRound}
              >
                Save New Password &amp; Enter
              </Button>

              <button
                type="button"
                onClick={handleDisablePassword}
                disabled={isVerifying}
                className="w-full py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 rounded-lg transition-colors cursor-pointer text-center"
              >
                Disable Password Protection &amp; Enter
              </button>
            </div>
          </form>
        )}

        <div className="text-center pt-2 border-t border-slate-800/60 text-[11px] text-slate-400">
          Offline Security Lock • Password Protected
        </div>
      </div>
    </div>
  );
}
