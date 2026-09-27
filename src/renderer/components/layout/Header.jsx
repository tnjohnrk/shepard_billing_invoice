import React from 'react';
import { Building2, Lock, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { COMPANY_CONFIG } from '../../../main/config/companyConfig';

export function Header({ title, subtitle, onLockApp }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="h-14 bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800/80 px-6 flex items-center justify-between sticky top-0 z-30 select-none backdrop-blur-md transition-colors">
      {/* Breadcrumb / Title Area */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Workspace
          </span>
          <span className="text-slate-300 dark:text-slate-700">/</span>
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            {title}
          </h2>
        </div>
        {subtitle && (
          <span className="hidden md:inline-flex items-center text-xs text-slate-400 dark:text-slate-500 font-normal pl-2 border-l border-slate-200 dark:border-slate-800 truncate max-w-xs">
            {subtitle}
          </span>
        )}
      </div>

      {/* Header Actions & Widgets */}
      <div className="flex items-center gap-2.5">
        {/* Company GSTIN Badge */}
        <div className="h-8 px-2.5 rounded-lg bg-slate-100/70 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-300 font-medium">
          <Building2 className="w-3 h-3 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <span className="font-mono font-semibold tracking-wide">GSTIN: {COMPANY_CONFIG?.gstin || '33ABUCS2217H1Z8'}</span>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="h-8 w-8 rounded-lg bg-slate-100/70 hover:bg-slate-200/70 dark:bg-slate-800/60 dark:hover:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-center active:scale-95"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle visual theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-3.5 h-3.5 text-amber-400" />
          ) : (
            <Moon className="w-3.5 h-3.5 text-indigo-600" />
          )}
        </button>

        {/* Security Lock Button */}
        {onLockApp && (
          <button
            onClick={onLockApp}
            className="h-8 px-2.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/15 dark:bg-amber-500/10 dark:hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 transition-all cursor-pointer border border-amber-500/20 flex items-center gap-1.5 text-xs font-semibold active:scale-95"
            title="Lock Application with Security Password"
          >
            <Lock className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>Lock</span>
          </button>
        )}
      </div>
    </header>
  );
}
