import React from 'react';
import { Building2, Lock, Sun, Moon, Menu, Keyboard } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { COMPANY_CONFIG } from '../../../main/config/companyConfig';

export function Header({ title, subtitle, onLockApp, onToggleMobileMenu, onOpenShortcuts }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="h-14 bg-white dark:bg-[#161b22] border-b border-slate-200 dark:border-[#30363d] px-3 sm:px-6 flex items-center justify-between sticky top-0 z-30 select-none transition-colors">
      {/* Mobile Menu Toggle & Breadcrumb / Title Area */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {onToggleMobileMenu && (
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="lg:hidden p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#21262d] border border-slate-200 dark:border-[#30363d] cursor-pointer shrink-0"
            title="Toggle Navigation Menu"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <span className="hidden sm:inline-block text-xs font-semibold text-slate-400 dark:text-slate-400 uppercase tracking-wider shrink-0">
            Workspace
          </span>
          <span className="hidden sm:inline-block text-slate-300 dark:text-slate-600">/</span>
          <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight truncate">
            {title}
          </h2>
        </div>
        {subtitle && (
          <span className="hidden xl:inline-flex items-center text-xs text-slate-500 dark:text-slate-400 font-normal pl-2.5 border-l border-slate-200 dark:border-slate-800 truncate max-w-xs">
            {subtitle}
          </span>
        )}
      </div>

      {/* Header Actions & Widgets */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* Company GSTIN Badge (hidden on mobile, visible on tablet/desktop) */}
        <div className="hidden md:flex h-8 px-2.5 rounded-lg bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-[#30363d] items-center gap-1.5 text-[11px] text-slate-700 dark:text-slate-300 font-medium">
          <Building2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
          <span className="font-mono font-semibold tracking-wide">GSTIN: {COMPANY_CONFIG?.gstin || '33ABUCS2217H1Z8'}</span>
        </div>

        {/* Keyboard Shortcuts Button */}
        {onOpenShortcuts && (
          <button
            onClick={onOpenShortcuts}
            className="h-8 px-2 sm:px-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-[#0d1117] dark:hover:bg-[#21262d] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer border border-slate-200 dark:border-[#30363d] flex items-center gap-1.5 text-xs font-semibold active:scale-95"
            title="Keyboard Shortcuts Cheat Sheet (F1 or Shift+?)"
            aria-label="Open keyboard shortcuts guide"
          >
            <Keyboard className="w-3.5 h-3.5 text-indigo-500" />
            <span className="hidden xl:inline text-[11px] text-slate-500 font-mono">F1</span>
          </button>
        )}

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="h-8 w-8 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-[#0d1117] dark:hover:bg-[#21262d] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer border border-slate-200 dark:border-[#30363d] flex items-center justify-center active:scale-95"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle visual theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-3.5 h-3.5 text-amber-400" />
          ) : (
            <Moon className="w-3.5 h-3.5 text-blue-600" />
          )}
        </button>

        {/* Security Lock Button */}
        {onLockApp && (
          <button
            onClick={onLockApp}
            className="h-8 px-2 sm:px-2.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/15 dark:bg-amber-500/10 dark:hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 transition-all cursor-pointer border border-amber-500/20 flex items-center gap-1.5 text-xs font-semibold active:scale-95"
            title="Lock Application with Security Password (Ctrl+Shift+L)"
          >
            <Lock className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="hidden sm:inline">Lock</span>
          </button>
        )}
      </div>
    </header>
  );
}
