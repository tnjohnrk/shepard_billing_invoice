import React from 'react';

export function Input({
  label,
  error,
  helperText,
  icon: Icon,
  className = '',
  id,
  required = false,
  ...props
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label htmlFor={inputId} className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1">
          {label}
          {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3 text-slate-400 dark:text-slate-500 pointer-events-none">
            <Icon className="w-3.5 h-3.5" />
          </div>
        )}
        <input
          id={inputId}
          className={`w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-[#0078d4] focus:ring-2 focus:ring-[#0078d4]/20 transition-all shadow-2xs ${Icon ? 'pl-9' : ''} ${error ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20' : ''} ${className}`}
          {...props}
        />
      </div>

      {error ? (
        <span className="text-[11px] text-rose-500 font-medium">{error}</span>
      ) : helperText ? (
        <span className="text-[11px] text-slate-400 dark:text-slate-500">{helperText}</span>
      ) : null}
    </div>
  );
}
