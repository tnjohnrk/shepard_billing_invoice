import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export function Toast({ type = 'success', message, onClose, duration = 4000 }) {
  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    error: <XCircle className="w-5 h-5 text-rose-400 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-cyan-400 shrink-0" />
  };

  const borders = {
    success: 'border-emerald-500/40 bg-emerald-950/90',
    error: 'border-rose-500/40 bg-rose-950/90',
    warning: 'border-amber-500/40 bg-amber-950/90',
    info: 'border-cyan-500/40 bg-cyan-950/90'
  };

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-lg border ${borders[type]} text-slate-100 shadow-2xl backdrop-blur-md animate-slide-up max-w-md`}>
      {icons[type]}
      <p className="text-sm font-medium pr-2">{message}</p>
      <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-md">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
