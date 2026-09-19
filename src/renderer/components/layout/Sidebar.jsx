import React from 'react';
import { LayoutDashboard, FilePlus, History, BarChart3, Settings, ShieldCheck } from 'lucide-react';
import companyLogo from '../../assets/logo.png';

export function Sidebar({ activeTab, setActiveTab }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'create', label: 'Create Invoice', icon: FilePlus },
    { id: 'history', label: 'History', icon: History },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800/80 flex flex-col justify-between select-none">
      <div>
        {/* Company Branding Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center gap-3">
          <img
            src={companyLogo}
            alt="Shepherd Enterprises"
            className="w-10 h-10 object-contain rounded-full border border-slate-700 shadow-md flex-shrink-0"
          />
          <div>
            <h1 className="text-xs font-bold uppercase tracking-wider text-slate-100 leading-tight">
              Shepherd Enterprises
            </h1>
            <p className="text-[10px] text-slate-400 font-medium">Billing System v1.0</p>
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
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 border border-indigo-500/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
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
      <div className="p-4 border-t border-slate-900">
        <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/60 flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <div>
            <div className="text-[11px] font-semibold text-slate-200">Offline Local Mode</div>
            <div className="text-[9px] text-slate-400">Data stored safely in AppData</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
