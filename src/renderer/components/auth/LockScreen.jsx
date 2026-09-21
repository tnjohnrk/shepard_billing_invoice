import React, { useState, useRef } from 'react';
import { Eye, EyeOff, ShieldCheck, KeyRound, ArrowRight, Wrench } from 'lucide-react';
import companyLogo from '../../assets/logo.png';
import { Button } from '../common/Button';
import { Toast } from '../common/Toast';
import { ipcClient } from '../../services/ipcClient';

export function LockScreen({ onUnlock }) {
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState(['', '', '', '']);
  const pinRefs = useRef([]);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isDeveloperMode, setIsDeveloperMode] = useState(false);

  // Developer Reset Mode State
  const [isResetMode, setIsResetMode] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handlePinChange = (index, value) => {
    // Allow only numbers
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
      setError(isDeveloperMode ? 'Please enter the developer code.' : 'Please enter your 4-digit PIN.');
      return;
    }

    // Check if entered is the developer recovery password
    if (entered === 'developer@v2c') {
      setIsResetMode(true);
      setError('');
      setPassword('');
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
        setError(isDeveloperMode ? 'Incorrect developer code.' : 'Incorrect PIN. Please try again.');
        setPassword('');
        // Keep the wrong PIN visible for half a second before clearing so they can see the red flash
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 select-none p-4">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 p-8 rounded-2xl border-2 border-slate-300 dark:border-slate-700 shadow-none space-y-6">
        {/* Brand & Header */}
        <div className="flex flex-col items-center text-center">
          <img
            src={companyLogo}
            alt="Shepherd Enterprises"
            className="w-24 h-24 object-contain rounded-full shadow-none -mb-2"
          />

          <div className="mt-1">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-wide uppercase">
              Shepherd Enterprises
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Private Limited • Billing &amp; Invoice System
            </p>
          </div>
        </div>

        {/* Status / Instruction Banner */}
        {!isResetMode ? (
          <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-xs text-sky-900 dark:text-sky-200 font-medium">
            <ShieldCheck className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
            <span>Application is locked. Enter your security password to access billing records.</span>
          </div>
        ) : (
          <div className="flex items-start gap-2.5 px-3.5 py-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/50 text-xs text-amber-900 dark:text-amber-200">
            <Wrench className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-800 dark:text-amber-300">Developer Master Code Verified:</strong>
              <div className="mt-0.5 text-amber-700 dark:text-amber-200/90">Please create a new password below for the user to access the billing system.</div>
            </div>
          </div>
        )}

        {/* Normal Login Form */}
        {!isResetMode ? (
          <form onSubmit={handleSubmitUnlock} className="space-y-6">
            {!isDeveloperMode ? (
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 text-center block">
                    Enter 4-Digit PIN
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

                <div className="text-center !-mt-2">
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
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Developer Master Code
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter developer code"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (error) setError('');
                      }}
                      autoFocus
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3.5 py-2.5 pr-10 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-slate-400 dark:focus:border-slate-500 focus:ring-0 transition-colors font-mono shadow-none"
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
                    Verify Master Code <ArrowRight className="w-4 h-4" />
                  </div>
                </Button>

                <div className="text-center !-mt-1">
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
              </div>
            )}
          </form>
        ) : (
          /* Developer Reset / Create Password Form */
          <form onSubmit={handleSaveNewPassword} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
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
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3.5 py-2.5 pr-10 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-slate-400 dark:focus:border-slate-500 focus:ring-0 transition-colors font-mono shadow-none"
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
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3.5 py-2.5 pr-10 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-slate-400 dark:focus:border-slate-500 focus:ring-0 transition-colors font-mono shadow-none"
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

            <div className="space-y-2 pt-2">
              <Button
                type="submit"
                variant="primary"
                className="w-full justify-center py-2.5 text-sm font-semibold"
                isLoading={isVerifying}
                icon={KeyRound}
              >
                Save New Password &amp; Enter
              </Button>

              <button
                type="button"
                onClick={handleDisablePassword}
                disabled={isVerifying}
                className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/40 rounded-lg transition-colors cursor-pointer text-center"
              >
                Disable Password Protection &amp; Enter
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Bottom Right Notification Toast (5 seconds) */}
      {error && (
        <Toast
          type="error"
          message={error}
          onClose={() => setError('')}
          duration={5000}
        />
      )}
    </div>
  );
}
