import React from 'react';
import { Building2, Lock, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { COMPANY_CONFIG } from '../../../main/config/companyConfig';

export function Header({ title, subtitle, onLockApp }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-300 dark:border-slate-800 px-6 flex items-center justify-between sticky top-0 z-30 select-none shadow-none">
      <div className="flex flex-col justify-center">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2.5">
        {/* Company GSTIN Badge */}
        <div className="h-9 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 font-medium shadow-none">
          <Building2 className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
          <span className="font-mono font-semibold tracking-wide">GSTIN: {COMPANY_CONFIG?.gstin || '33ABUCS2217H1Z8'}</span>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="h-9 w-9 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer border border-slate-300 dark:border-slate-700 flex items-center justify-center shadow-none"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle visual theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-500 dark:text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          )}
        </button>

        {/* Security Lock Button */}
        {onLockApp && (
          <button
            onClick={onLockApp}
            className="h-9 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/50 text-amber-800 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-200 transition-colors cursor-pointer border border-amber-300 dark:border-amber-700/60 flex items-center gap-1.5 text-xs font-semibold shadow-none"
            title="Lock Application with Security Password"
          >
            <Lock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>Lock</span>
          </button>
        )}
      </div>
    </header>
  );
}
