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
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs gap-1.5 min-h-[36px]',
    md: 'px-4 py-2 text-sm gap-2 min-h-[42px]',
    lg: 'px-6 py-2.5 text-base gap-2.5 min-h-[48px]'
  };

  const variantStyles = {
    primary: 'btn-primary bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 focus:ring-indigo-500 border border-indigo-500/30',
    secondary: 'btn-secondary bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 focus:ring-slate-500 shadow-sm',
    accent: 'btn-accent bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 text-white shadow-md shadow-cyan-600/20 focus:ring-cyan-500 border border-cyan-500/30',
    success: 'btn-success bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 focus:ring-emerald-500 border border-emerald-500/30',
    danger: 'btn-danger bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white shadow-md shadow-rose-600/20 focus:ring-rose-500 border border-rose-500/30',
    ghost: 'btn-ghost bg-transparent hover:bg-slate-800/60 text-slate-300 hover:text-white focus:ring-slate-500'
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
