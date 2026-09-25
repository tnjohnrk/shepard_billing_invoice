import React from 'react';
import { LayoutDashboard, FilePlus, History, BarChart3, Layers, Settings, ShieldCheck } from 'lucide-react';
import companyLogo from '../../assets/logo.png';
import { FEATURE_FLAGS } from '../../../shared/constants/featureFlags';

export function Sidebar({ activeTab, setActiveTab }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'create', label: 'Create Invoice', icon: FilePlus },
    { id: 'history', label: 'History', icon: History },
    ...(FEATURE_FLAGS.DETAILS_PANEL_ENABLED ? [{ id: 'details', label: 'Details', icon: Layers }] : []),
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <aside className="w-64 bg-white dark:bg-slate-950 border-r border-slate-300 dark:border-slate-800 flex flex-col justify-between select-none shadow-none">
      <div>
        {/* Company Branding Header */}
        <div className="h-16 px-5 border-b border-slate-300 dark:border-slate-800 flex items-center gap-3">
          <img
            src={companyLogo}
            alt="Shepherd Enterprises"
            className="w-9 h-9 object-contain rounded-full border border-slate-300 dark:border-slate-700 shadow-none flex-shrink-0"
          />
          <div className="overflow-hidden">
            <h1 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 leading-tight truncate">
              Shepherd Enterprises
            </h1>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">Billing System v1.0</p>
          </div>
        </div>

        {/* Primary Navigation */}
        <nav className="p-3 space-y-1 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer shadow-none ${
                  isActive
                    ? 'bg-sky-500 dark:bg-sky-600 text-white border border-sky-400 dark:border-sky-500'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Offline Badge */}
      <div className="p-4 border-t border-slate-300 dark:border-slate-800">
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 flex items-center gap-2.5 shadow-none">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <div>
            <div className="text-[11px] font-semibold text-slate-800 dark:text-slate-200">Offline Local Mode</div>
            <div className="text-[9px] text-slate-500 dark:text-slate-400">Data stored safely in AppData</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
