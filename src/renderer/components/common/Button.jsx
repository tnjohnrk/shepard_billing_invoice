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
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-150 focus:outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none shadow-none';

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs gap-1.5 min-h-[36px]',
    md: 'px-4 py-2 text-sm gap-2 min-h-[42px]',
    lg: 'px-6 py-2.5 text-base gap-2.5 min-h-[48px]'
  };

  const variantStyles = {
    primary: 'btn-primary bg-sky-100 hover:bg-sky-200 active:bg-sky-300 text-sky-900 border border-sky-300 dark:bg-sky-950 dark:hover:bg-sky-900 dark:text-sky-200 dark:border-sky-800',
    secondary: 'btn-secondary bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 border border-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-700',
    accent: 'btn-accent bg-cyan-100 hover:bg-cyan-200 active:bg-cyan-300 text-cyan-900 border border-cyan-300 dark:bg-cyan-950 dark:hover:bg-cyan-900 dark:text-cyan-200 dark:border-cyan-800',
    success: 'btn-success bg-emerald-100 hover:bg-emerald-200 active:bg-emerald-300 text-emerald-900 border border-emerald-300 dark:bg-emerald-950 dark:hover:bg-emerald-900 dark:text-emerald-200 dark:border-emerald-800',
    danger: 'btn-danger bg-rose-100 hover:bg-rose-200 active:bg-rose-300 text-rose-900 border border-rose-300 dark:bg-rose-950 dark:hover:bg-rose-900 dark:text-rose-200 dark:border-rose-800',
    ghost: 'btn-ghost bg-transparent hover:bg-slate-100 active:bg-slate-200 text-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white border border-transparent'
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
        <svg className="animate-spin h-4 w-4 text-current" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : Icon ? (
        <Icon className="w-4 h-4 shrink-0" />
      ) : null}
      <span>{children}</span>
    </button>
  );
}
