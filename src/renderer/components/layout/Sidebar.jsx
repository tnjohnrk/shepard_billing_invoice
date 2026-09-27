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
  ChevronRight
} from 'lucide-react';
import companyLogo from '../../assets/billing_image.png';
import { FEATURE_FLAGS } from '../../../shared/constants/featureFlags';

export function Sidebar({ activeTab, setActiveTab }) {
  const operationsItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'create', label: 'Create Invoice', icon: FilePlus2 },
    { id: 'history', label: 'Invoices & History', icon: History, badge: null },
  ];

  const managementItems = [
    ...(FEATURE_FLAGS.DETAILS_PANEL_ENABLED ? [{ id: 'details', label: 'Details View', icon: Layers, badge: null }] : []),
    { id: 'reports', label: 'GST & Reports', icon: BarChart3, badge: null },
    { id: 'settings', label: 'Settings', icon: Settings, badge: null }
  ];

  return (
    <aside className="w-64 bg-slate-50/70 dark:bg-slate-950/90 border-r border-slate-200 dark:border-slate-800/80 flex flex-col justify-between select-none backdrop-blur-md transition-all duration-200">
      <div className="flex flex-col h-full">
        {/* Workspace Brand Card */}
        <div className="p-3.5 border-b border-slate-200/80 dark:border-slate-800/80">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
            <img
              src={companyLogo}
              alt="Shepherd Enterprises"
              className="w-8 h-8 rounded-lg object-contain bg-slate-50 dark:bg-slate-800 p-0.5 border border-slate-100 dark:border-slate-700 shrink-0"
            />
            <div className="overflow-hidden flex-1">
              <div className="flex items-center justify-between">
                <h1 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate tracking-tight">
                  Shepherd Billing
                </h1>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate flex items-center gap-1">
                <span>Enterprise v1.0</span>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-semibold">Active</span>
              </p>
            </div>
          </div>

          {/* Quick Create Invoice Action Button */}
          <button
            onClick={() => setActiveTab('create')}
            className="w-full mt-2.5 flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white shadow-xs hover:shadow-sm transition-all duration-150 cursor-pointer active:scale-[0.99] group"
          >
            <div className="flex items-center gap-2">
              <Plus className="w-3.5 h-3.5 transition-transform group-hover:rotate-90 duration-200" />
              <span>New Invoice</span>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-800/60 text-indigo-200 border border-indigo-500/30">
              Ctrl+N
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
            <nav className="space-y-0.5">
              {operationsItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer group ${
                      isActive
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold border border-indigo-200/80 dark:border-indigo-800/60 shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/80 dark:hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge ? (
                      <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                        {item.badge}
                      </span>
                    ) : isActive ? (
                      <ChevronRight className="w-3.5 h-3.5 text-indigo-500/60" />
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
            <nav className="space-y-0.5">
              {managementItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer group ${
                      isActive
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold border border-indigo-200/80 dark:border-indigo-800/60 shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/80 dark:hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
                      <span>{item.label}</span>
                    </div>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 text-indigo-500/60" />}
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
