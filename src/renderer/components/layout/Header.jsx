import React from 'react';
import { Building2, Lock, Sun, Moon, Keyboard, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { COMPANY_CONFIG } from '../../../main/config/companyConfig';

export function Header({ 
  title, 
  subtitle, 
  isSidebarCollapsed, 
  onToggleSidebar, 
  onLockApp, 
  onOpenShortcuts 
}) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="h-16 bg-white dark:bg-[#161b22] border-b border-slate-200 dark:border-[#30363d] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 select-none transition-colors">
      {/* Sidebar Toggle & Breadcrumb / Title Area */}
      <div className="flex items-center gap-3 min-w-0">
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#21262d] border border-slate-200 dark:border-[#30363d] cursor-pointer shrink-0 transition-all active:scale-95 shadow-2xs"
            title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            aria-label={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isSidebarCollapsed ? (
              <PanelLeftOpen className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            ) : (
              <PanelLeftClose className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            )}
          </button>
        )}

        <div className="flex items-center gap-2 min-w-0">
          <span className="hidden sm:inline-block text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider shrink-0">
            Workspace
          </span>
          <span className="hidden sm:inline-block text-slate-300 dark:text-slate-600 font-bold">/</span>
          <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100 tracking-tight truncate">
            {title}
          </h2>
        </div>
        {subtitle && (
          <span className="hidden xl:inline-flex items-center text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium pl-3 border-l border-slate-200 dark:border-[#30363d] truncate max-w-md">
            {subtitle}
          </span>
        )}
      </div>

      {/* Header Actions & Widgets */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Company GSTIN Badge */}
        <div className="hidden md:flex h-9 px-3 rounded-xl bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-[#30363d] items-center gap-2 text-xs text-slate-700 dark:text-slate-300 font-medium shadow-2xs">
          <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
          <span className="font-mono font-bold tracking-wide">GSTIN: {COMPANY_CONFIG?.gstin || '33ABUCS2217H1Z8'}</span>
        </div>

        {/* Keyboard Shortcuts Button */}
        {onOpenShortcuts && (
          <button
            onClick={onOpenShortcuts}
            className="h-9 px-2.5 sm:px-3 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-[#0d1117] dark:hover:bg-[#21262d] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer border border-slate-200 dark:border-[#30363d] flex items-center gap-2 text-xs font-bold active:scale-95 shadow-2xs"
            title="Keyboard Shortcuts Cheat Sheet (F1 or Shift+?)"
            aria-label="Open keyboard shortcuts guide"
          >
            <Keyboard className="w-4 h-4 text-indigo-500" />
            <span className="hidden xl:inline text-xs text-slate-500 font-mono">F1</span>
          </button>
        )}

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="h-9 w-9 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-[#0d1117] dark:hover:bg-[#21262d] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer border border-slate-200 dark:border-[#30363d] flex items-center justify-center active:scale-95 shadow-2xs"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle visual theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-blue-600" />
          )}
        </button>

        {/* Security Lock Button */}
        {onLockApp && (
          <button
            onClick={onLockApp}
            className="h-9 px-3 sm:px-3.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/15 dark:bg-amber-500/10 dark:hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 transition-all cursor-pointer border border-amber-500/20 flex items-center gap-1.5 text-xs font-bold active:scale-95 shadow-2xs"
            title="Lock Application with Security Password (Ctrl+Shift+L)"
          >
            <Lock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="hidden sm:inline">Lock</span>
          </button>
        )}
      </div>
    </header>
  );
}
