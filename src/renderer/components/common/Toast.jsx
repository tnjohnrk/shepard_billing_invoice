import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, XCircle, Info, X } from 'lucide-react';

export function Toast({ type = 'error', message, onClose, duration = 5000 }) {
  useEffect(() => {
    if (duration && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  if (!message) return null;

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />,
    error: <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />,
    warning: <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />,
    info: <Info className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
  };

  const styles = {
    success: 'bg-emerald-50 dark:bg-emerald-950/90 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200',
    error: 'bg-rose-50 dark:bg-rose-950/90 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200',
    warning: 'bg-amber-50 dark:bg-amber-950/90 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200',
    info: 'bg-sky-50 dark:bg-sky-950/90 border-sky-200 dark:border-sky-800 text-sky-900 dark:text-sky-200'
  };

  const progressColors = {
    success: 'bg-emerald-500 dark:bg-emerald-400',
    error: 'bg-rose-500 dark:bg-rose-400',
    warning: 'bg-amber-500 dark:bg-amber-400',
    info: 'bg-sky-500 dark:bg-sky-400'
  };

  return (
    <div className={`fixed bottom-6 right-6 z-[9999] flex flex-col rounded-xl border ${styles[type] || styles.error} shadow-md transition-all animate-slide-up max-w-md select-none overflow-hidden`}>
      <div className="flex items-center gap-2.5 px-4 py-3">
        {icons[type] || icons.error}
        <p className="text-xs sm:text-sm font-medium pr-1">{message}</p>
        {onClose && (
          <button
            onClick={onClose}
            type="button"
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer ml-auto shrink-0"
            aria-label="Close notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Countdown progress bar below */}
      {duration > 0 && (
        <div className="w-full h-0.5 bg-black/5 dark:bg-white/10">
          <div
            className={`h-full ${progressColors[type] || progressColors.error}`}
            style={{
              animation: `toast-progress ${duration}ms linear forwards`
            }}
          />
        </div>
      )}
    </div>
  );
}


