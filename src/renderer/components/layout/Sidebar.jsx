import React from 'react';
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
  X
} from 'lucide-react';
import companyLogo from '../../assets/billing_image.png';
import { FEATURE_FLAGS } from '../../../shared/constants/featureFlags';

export function Sidebar({ activeTab, setActiveTab, isMobile = false, onClose }) {
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
    <aside className="w-64 h-full bg-slate-50 dark:bg-[#161b22] border-r border-slate-200 dark:border-[#30363d] flex flex-col justify-between select-none transition-all duration-200 shrink-0">
      <div className="flex flex-col h-full">
        {/* Workspace Brand Header */}
        <div className="p-3.5 border-b border-slate-200 dark:border-[#30363d] space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-[#30363d] shadow-xs flex-1 min-w-0">
              <img
                src={companyLogo}
                alt="Shepherd Enterprises"
                className="w-8.5 h-8.5 rounded-lg object-contain bg-slate-50 dark:bg-[#161b22] p-0.5 border border-slate-100 dark:border-[#30363d] shrink-0"
              />
              <div className="overflow-hidden flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h1 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate tracking-tight">
                    Shepherd Billing Enterprise
                  </h1>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate flex items-center gap-1">
                  <span>v1.0</span>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <span className="text-blue-600 dark:text-blue-400 font-semibold">Active</span>
                </p>
              </div>
            </div>

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

          {/* Quick Create Invoice Action Button */}
          <button
            onClick={() => {
              setActiveTab('create');
              if (isMobile && onClose) onClose();
            }}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold bg-[#0969da] hover:bg-[#085ac5] dark:bg-[#1f6feb] dark:hover:bg-[#388bfd] text-white shadow-2xs transition-all duration-150 cursor-pointer active:scale-[0.99] group"
          >
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4 transition-transform group-hover:rotate-90 duration-200" />
              <span>New Invoice</span>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/20 text-white/90 border border-white/20">
              ALT + 2
            </span>
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
          {/* Operations Section */}
          <div>
            <div className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Operations
            </div>
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
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-[13px] font-medium transition-all duration-150 cursor-pointer group ${
                      isActive
                        ? 'bg-slate-200/80 dark:bg-[#21262d] text-slate-900 dark:text-slate-100 font-bold border border-slate-300 dark:border-[#30363d]'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/80 dark:hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge ? (
                      <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-[#30363d] text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-[#484f58]">
                        {item.badge}
                      </span>
                    ) : isActive ? (
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                    ) : null}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Management Section */}
          <div>
            <div className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Management
            </div>
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
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-[13px] font-medium transition-all duration-150 cursor-pointer group ${
                      isActive
                        ? 'bg-slate-200/80 dark:bg-[#21262d] text-slate-900 dark:text-slate-100 font-bold border border-slate-300 dark:border-[#30363d]'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/80 dark:hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
                      <span>{item.label}</span>
                    </div>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Footer Offline & Security Badge */}
        <div className="p-3 border-t border-slate-200/80 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/50">
          <div className="p-2.5 rounded-xl bg-slate-100/80 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center shrink-0 border border-emerald-500/20">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="overflow-hidden">
              <div className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 leading-tight truncate">
                Offline Local Mode
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
