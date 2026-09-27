import React from 'react';

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  icon: Icon,
  className = '',
  onClick,
  type = 'button',
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-150 focus:outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98] shrink-0';

  const sizeStyles = {
    sm: 'px-2.5 py-1.5 text-xs gap-1.5 min-h-[32px]',
    md: 'px-3.5 py-2 text-xs gap-2 min-h-[38px]',
    lg: 'px-5 py-2.5 text-sm gap-2.5 min-h-[44px]'
  };

  const variantStyles = {
    primary: 'btn-primary bg-[#ddf4ff] hover:bg-[#b6e3ff] active:bg-[#80ccff] text-[#0969da] border border-[#54aeff] dark:bg-[#0c2d6b]/60 dark:hover:bg-[#0c2d6b] dark:text-[#58a6ff] dark:border-[#1f6feb]/60 shadow-none',
    solid: 'btn-solid bg-[#0969da] hover:bg-[#085ac5] active:bg-[#074ea8] dark:bg-[#1f6feb] dark:hover:bg-[#388bfd] text-white shadow-none border border-[#0969da] dark:border-[#1f6feb]',
    secondary: 'btn-secondary bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700',
    accent: 'btn-accent bg-[#ddf4ff] hover:bg-[#b6e3ff] dark:bg-[#0c2d6b]/60 dark:hover:bg-[#0c2d6b] text-[#0969da] dark:text-[#58a6ff] border border-[#54aeff]/80 dark:border-[#1f6feb]/60',
    success: 'btn-success bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white shadow-xs border border-emerald-500/30',
    danger: 'btn-danger bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60',
    ghost: 'btn-ghost bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800/70 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 border border-transparent'
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin h-3.5 w-3.5 text-current" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : Icon ? (
        <Icon className="w-3.5 h-3.5 shrink-0" />
      ) : null}
      <span>{children}</span>
    </button>
  );
}
