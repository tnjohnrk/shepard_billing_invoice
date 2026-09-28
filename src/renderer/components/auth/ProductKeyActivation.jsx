import React, { useState, useRef } from 'react';
import { Key, ShieldCheck, Lock, CheckCircle2, ArrowRight, ShieldAlert, Sparkles, Laptop, Shield, Eye, EyeOff } from 'lucide-react';
import companyLogo from '../../assets/app_icon.png';
import { Button } from '../common/Button';
import { Toast } from '../common/Toast';
import { ipcClient } from '../../services/ipcClient';

export function ProductKeyActivation({ onActivationComplete }) {
  // Step: 1 = 'ENTER_PRODUCT_KEY', 2 = 'CREATE_PASSWORD', 3 = 'SUCCESS'
  const [step, setStep] = useState(1);
  const [productKey, setProductKey] = useState('');
  const [showProductKey, setShowProductKey] = useState(false);

  // 4-Digit PIN creation state
  const [newPin, setNewPin] = useState(['', '', '', '']);
  const [confirmPin, setConfirmPin] = useState(['', '', '', '']);
  const newPinRefs = useRef([]);
  const confirmPinRefs = useRef([]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [toastState, setToastState] = useState(null);

  const formatCleanError = (err) => {
    if (!err) return 'Invalid Product Key. Please check the key and try again.';
    const raw = typeof err === 'string' ? err : (err.message || String(err));
    return raw
      .replace(/^Error invoking remote method '.*?': Error: /i, '')
      .replace(/^Error invoking remote method '.*?': /i, '')
      .replace(/^Error: /i, '')
      .trim();
  };

  const handlePinChange = (type, index, val) => {
    const digit = val.slice(-1).replace(/\D/g, '');
    const isNew = type === 'new';
    const currentList = isNew ? [...newPin] : [...confirmPin];
    const refs = isNew ? newPinRefs : confirmPinRefs;

    currentList[index] = digit;
    if (isNew) {
      setNewPin(currentList);
    } else {
      setConfirmPin(currentList);
    }
    if (error) setError('');

    if (digit && index < 3) {
      refs.current[index + 1]?.focus();
    } else if (digit && index === 3 && isNew) {
      confirmPinRefs.current[0]?.focus();
    }
  };

  const handlePinKeyDown = (type, index, e) => {
    const isNew = type === 'new';
    const currentList = isNew ? newPin : confirmPin;
    const refs = isNew ? newPinRefs : confirmPinRefs;

    if (e.key === 'Backspace' && !currentList[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  };

  const handlePinPaste = (type, e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 4).replace(/\D/g, '');
    if (pastedData) {
      const isNew = type === 'new';
      const updated = isNew ? [...newPin] : [...confirmPin];
      const refs = isNew ? newPinRefs : confirmPinRefs;

      for (let i = 0; i < pastedData.length; i++) {
        updated[i] = pastedData[i];
      }
      if (isNew) {
        setNewPin(updated);
      } else {
        setConfirmPin(updated);
      }
      if (error) setError('');
      const focusIndex = Math.min(pastedData.length, 3);
      refs.current[focusIndex]?.focus();
    }
  };

  // Step 1: Submit Product Key
  const handleVerifyProductKey = async (e) => {
    if (e) e.preventDefault();
    const rawKey = productKey.trim();
    if (!rawKey) {
      setError('Please enter the Product Key provided for this installation.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await ipcClient.activateProductKey(rawKey);
      if (res.success) {
        setToastState({ type: 'success', message: 'Product Key verified and machine activated!' });
        if (res.isPasswordSet) {
          // If password was already set from before
          setTimeout(() => {
            onActivationComplete();
          }, 800);
        } else {
          // Move to mandatory password creation
          setTimeout(() => {
            setStep(2);
            setIsLoading(false);
            setTimeout(() => {
              newPinRefs.current[0]?.focus();
            }, 300);
          }, 600);
        }
      }
    } catch (err) {
      setError(formatCleanError(err));
      setIsLoading(false);
    }
  };

  // Step 2: Create Mandatory 4-Digit Security PIN
  const handleCreatePassword = async (e) => {
    if (e) e.preventDefault();
    const p1 = newPin.join('');
    const p2 = confirmPin.join('');

    if (p1.length !== 4) {
      setError('Security PIN must be exactly 4 digits.');
      return;
    }

    if (p1 !== p2) {
      setError('4-digit PINs do not match. Please re-enter.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await ipcClient.createInitialPassword(p1);
      setStep(3);
      setToastState({ type: 'success', message: '4-digit security PIN configured successfully!' });

      setTimeout(() => {
        sessionStorage.setItem('session_unlocked', 'true');
        onActivationComplete();
      }, 1000);
    } catch (err) {
      setError(formatCleanError(err));
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md text-slate-900 dark:text-slate-100 select-none p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 p-8 rounded-3xl border-2 border-slate-300 dark:border-slate-700 shadow-2xl transition-all duration-300 my-auto">
        
        {/* Brand & Logo Header */}
        <div className="flex flex-col items-center text-center">
          <div className="relative">
            <img
              src={companyLogo}
              alt="Shepherd Enterprises"
              className="w-24 h-24 object-contain mx-auto block mb-1"
            />
            <span className="absolute -bottom-1 -right-1 p-1.5 bg-blue-600 text-white rounded-full shadow-md">
              <ShieldCheck className="w-4 h-4" />
            </span>
          </div>

          <div className="mt-2">
            <h2 className="text-lg font-black text-slate-900 dark:text-slate-100 tracking-wide uppercase">
              Shepherd Enterprises
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Private Limited • Billing &amp; Invoicing System
            </p>
          </div>
        </div>

        {/* Multi-Step Wizard Indicator */}
        <div className="mt-6 flex items-center justify-center gap-2">
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
            step === 1 
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
              : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
          }`}>
            {step > 1 ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Key className="w-3.5 h-3.5" />}
            <span>Step 1: Product Key</span>
          </div>

          <div className="w-6 h-0.5 bg-slate-200 dark:bg-slate-700"></div>

          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
            step === 2 
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
              : step === 3
              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
          }`}>
            {step === 3 ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
            <span>Step 2: Security Password</span>
          </div>
        </div>

        {/* STEP 1: Product Key Activation */}
        {step === 1 && (
          <div className="mt-6 space-y-5">
            <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-200 leading-relaxed">
              <div className="flex items-center gap-2 font-bold mb-1">
                <Laptop className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <span>Installation Activation Required</span>
              </div>
              <span>
                Please enter the installation product key provided by the developer to activate and unlock this software on this system.
              </span>
            </div>

            <form onSubmit={handleVerifyProductKey} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-blue-600" />
                  Product Activation Key <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showProductKey ? 'text' : 'password'}
                    placeholder="Enter or paste installation product key"
                    value={productKey}
                    onChange={(e) => {
                      setProductKey(e.target.value);
                      if (error) setError('');
                    }}
                    autoFocus
                    required
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-3 pr-10 text-sm font-mono text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors shadow-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowProductKey(!showProductKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                    title={showProductKey ? 'Hide key' : 'Show key'}
                  >
                    {showProductKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                className="w-full justify-center py-3 text-sm font-bold shadow-lg shadow-blue-500/20"
                isLoading={isLoading}
                icon={Sparkles}
              >
                Activate Software License
              </Button>
            </form>
          </div>
        )}

        {/* STEP 2: Mandatory 4-Digit Security PIN Creation */}
        {step === 2 && (
          <div className="mt-6 space-y-5">
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
              <div className="flex items-center gap-2 font-bold mb-1">
                <Shield className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>Mandatory 4-Digit Security PIN Setup</span>
              </div>
              <span>
                To secure your billing and tax records, create a 4-digit security PIN. You will use this PIN every day to unlock the application.
              </span>
            </div>

            <form onSubmit={handleCreatePassword} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block text-center">
                  Create 4-Digit Security PIN <span className="text-rose-500">*</span>
                </label>
                <div className="flex justify-center gap-2.5 sm:gap-3">
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
                      className="w-11 h-13 sm:w-12 sm:h-14 font-mono text-center text-2xl font-bold rounded-xl bg-slate-50 dark:bg-[#0d1117] border border-slate-300 dark:border-[#30363d] text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none transition-all shadow-2xs"
                      autoFocus={index === 0}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block text-center">
                  Confirm 4-Digit Security PIN <span className="text-rose-500">*</span>
                </label>
                <div className="flex justify-center gap-2.5 sm:gap-3">
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
                      className="w-11 h-13 sm:w-12 sm:h-14 font-mono text-center text-2xl font-bold rounded-xl bg-slate-50 dark:bg-[#0d1117] border border-slate-300 dark:border-[#30363d] text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none transition-all shadow-2xs"
                    />
                  ))}
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center justify-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                className="w-full justify-center py-3 text-sm font-bold shadow-lg shadow-blue-500/20"
                isLoading={isLoading}
                icon={ArrowRight}
              >
                Save 4-Digit PIN &amp; Open Billing System
              </Button>
            </form>
          </div>
        )}

        {/* STEP 3: Success Screen */}
        {step === 3 && (
          <div className="mt-8 text-center space-y-4 py-4">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-lg animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-slate-100 uppercase">
                Activation Completed!
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Your software license and security password are active. Launching dashboard...
              </p>
            </div>
          </div>
        )}

      </div>

      {/* Global Toast */}
      {toastState && (
        <Toast
          type={toastState.type}
          message={toastState.message}
          onClose={() => setToastState(null)}
        />
      )}
    </div>
  );
}
