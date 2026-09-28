import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  FilePlus2, 
  History, 
  BarChart3, 
  Layers, 
  Settings, 
  ShieldCheck, 
  Plus, 
  ChevronRight,
  PanelLeftOpen,
  X
} from 'lucide-react';
import companyLogo from '../../assets/billing_image.png';
import { FEATURE_FLAGS } from '../../../shared/constants/featureFlags';

export function Sidebar({ 
  activeTab, 
  setActiveTab, 
  isCollapsed: propIsCollapsed, 
  onToggleCollapse, 
  isMobile = false, 
  onClose 
}) {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const isCollapsed = propIsCollapsed !== undefined ? propIsCollapsed : internalCollapsed;
  const handleToggle = onToggleCollapse || (() => setInternalCollapsed(prev => !prev));

  const operationsItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'create', label: 'Create Invoice', icon: FilePlus2 },
    { id: 'history', label: 'Invoices & History', icon: History, badge: null },
  ];

  const managementItems = [
    ...(FEATURE_FLAGS.DETAILS_PANEL_ENABLED ? [{ id: 'details', label: 'Directory & Masters', icon: Layers, badge: null }] : []),
    { id: 'reports', label: 'GST & Reports', icon: BarChart3, badge: null },
    { id: 'settings', label: 'Settings', icon: Settings, badge: null }
  ];

  return (
    <aside 
      className={`h-full bg-slate-50 dark:bg-[#161b22] border-r border-slate-200 dark:border-[#30363d] flex flex-col justify-between select-none transition-[width] duration-200 ease-in-out shrink-0 ${
        isCollapsed ? 'w-17' : 'w-64'
      }`}
    >
      <div className="flex flex-col h-full min-w-0">
        {/* Workspace Brand Header */}
        <div className={`border-b border-slate-200 dark:border-[#30363d] ${isCollapsed ? 'p-2 space-y-2' : 'p-3.5 space-y-3'}`}>
          {/* Top Brand Container */}
          {!isCollapsed ? (
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-[#30363d] shadow-2xs flex-1 min-w-0">
                <div className="relative shrink-0">
                  <img
                    src={companyLogo}
                    alt="Shepherd Enterprises"
                    className="w-8.5 h-8.5 rounded-lg object-contain bg-slate-50 dark:bg-[#161b22] p-0.5 border border-slate-100 dark:border-[#30363d]"
                  />
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#0d1117] animate-pulse"></span>
                </div>
                <div className="overflow-hidden flex-1 min-w-0">
                  <h1 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate tracking-tight">
                    Shepherd Billing Enterprise
                  </h1>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate flex items-center gap-1 mt-0.5">
                    <span>v1.0</span>
                    <span className="text-slate-300 dark:text-slate-700">•</span>
                    <span className="text-blue-600 dark:text-blue-400 font-semibold">Active</span>
                  </p>
                </div>
              </div>

              {/* Mobile Close Button */}
              {isMobile && onClose && (
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                  title="Close Menu"
                  aria-label="Close navigation menu"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : (
            /* Collapsed Brand Container (Click to expand) */
            <div className="flex flex-col items-center">
              <button
                onClick={handleToggle}
                className="w-11 h-11 p-1 rounded-xl bg-white hover:bg-slate-100 dark:bg-[#0d1117] dark:hover:bg-[#21262d] border border-slate-200 dark:border-[#30363d] shadow-2xs flex items-center justify-center relative group cursor-pointer transition-all active:scale-95"
                title="Click to Expand Sidebar"
                aria-label="Expand Sidebar"
              >
                <img
                  src={companyLogo}
                  alt="Shepherd Enterprises"
                  className="w-7 h-7 rounded-lg object-contain"
                />
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#0d1117] animate-pulse"></span>
                <div className="absolute inset-0 bg-black/40 dark:bg-black/60 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <PanelLeftOpen className="w-4 h-4" />
                </div>
              </button>
            </div>
          )}

          {/* Quick Create Invoice Action Button */}
          <button
            onClick={() => {
              setActiveTab('create');
              if (isMobile && onClose) onClose();
            }}
            className={`rounded-xl text-xs font-bold bg-[#0969da] hover:bg-[#085ac5] dark:bg-[#1f6feb] dark:hover:bg-[#388bfd] text-white shadow-2xs transition-all duration-150 cursor-pointer active:scale-[0.98] group flex items-center ${
              isCollapsed 
                ? 'w-11 h-10 mx-auto justify-center' 
                : 'w-full px-3.5 py-2.5 justify-between'
            }`}
            title={isCollapsed ? "New Invoice (Alt + 2)" : undefined}
          >
            <div className="flex items-center gap-2">
              <Plus className={`transition-transform group-hover:rotate-90 duration-200 ${isCollapsed ? 'w-5 h-5' : 'w-4 h-4'}`} />
              {!isCollapsed && <span>New Invoice</span>}
            </div>
            {!isCollapsed && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/20 text-white/90 border border-white/20">
                ALT + 2
              </span>
            )}
          </button>
        </div>

        {/* Navigation Sections */}
        <div className={`flex-1 overflow-y-auto ${isCollapsed ? 'px-1.5 py-2.5 space-y-2' : 'px-3 py-3 space-y-4'}`}>
          {/* Operations Section */}
          <div>
            {!isCollapsed ? (
              <div className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Operations
              </div>
            ) : null}
            <nav className="space-y-1">
              {operationsItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      if (isMobile && onClose) onClose();
                    }}
                    title={isCollapsed ? item.label : undefined}
                    className={`flex items-center rounded-xl font-medium transition-all duration-150 cursor-pointer group ${
                      isCollapsed 
                        ? 'w-11 h-10 mx-auto justify-center' 
                        : 'w-full justify-between px-3 py-2.5 text-xs sm:text-[13px]'
                    } ${
                      isActive
                        ? 'bg-slate-200/80 dark:bg-[#21262d] text-slate-900 dark:text-slate-100 font-bold border border-slate-300 dark:border-[#30363d]'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/80 dark:hover:bg-slate-900/60'
                    }`}
                  >
                    <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-2.5'}`}>
                      <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
                      {!isCollapsed && <span>{item.label}</span>}
                    </div>
                    {!isCollapsed && (
                      item.badge ? (
                        <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-[#30363d] text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-[#484f58]">
                          {item.badge}
                        </span>
                      ) : isActive ? (
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                      ) : null
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Divider in collapsed mode */}
          {isCollapsed && <div className="w-8 h-px bg-slate-200 dark:bg-[#30363d] mx-auto my-1"></div>}

          {/* Management Section */}
          <div>
            {!isCollapsed ? (
              <div className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Management
              </div>
            ) : null}
            <nav className="space-y-1">
              {managementItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      if (isMobile && onClose) onClose();
                    }}
                    title={isCollapsed ? item.label : undefined}
                    className={`flex items-center rounded-xl font-medium transition-all duration-150 cursor-pointer group ${
                      isCollapsed 
                        ? 'w-11 h-10 mx-auto justify-center' 
                        : 'w-full justify-between px-3 py-2.5 text-xs sm:text-[13px]'
                    } ${
                      isActive
                        ? 'bg-slate-200/80 dark:bg-[#21262d] text-slate-900 dark:text-slate-100 font-bold border border-slate-300 dark:border-[#30363d]'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/80 dark:hover:bg-slate-900/60'
                    }`}
                  >
                    <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-2.5'}`}>
                      <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
                      {!isCollapsed && <span>{item.label}</span>}
                    </div>
                    {!isCollapsed && isActive && (
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Footer Offline & Security Badge */}
        <div className={`border-t border-slate-200/80 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/50 ${isCollapsed ? 'p-2' : 'p-3'}`}>
          <div 
            className={`rounded-xl bg-slate-100/80 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center ${
              isCollapsed 
                ? 'w-11 h-10 mx-auto justify-center' 
                : 'p-2.5 gap-2.5'
            }`}
            title={isCollapsed ? "Offline Local Mode" : undefined}
          >
            <div className="w-6 h-6 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center shrink-0 border border-emerald-500/20">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden">
                <div className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 leading-tight truncate">
                  Offline Local Mode
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
