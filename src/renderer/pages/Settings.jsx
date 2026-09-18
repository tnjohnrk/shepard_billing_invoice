import React, { useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { AppearanceSettings } from '../components/settings/AppearanceSettings';
import { BackupRestore } from '../components/settings/BackupRestore';
import { PinSettings } from '../components/settings/PinSettings';
import { About } from '../components/settings/About';
import { Palette, HardDrive, Shield, Info } from 'lucide-react';

export function Settings({ toast }) {
  const [activeTab, setActiveTab] = useState('backup');

  const tabs = [
    { id: 'backup', label: 'Backup & Restore', icon: HardDrive },
    { id: 'pin', label: 'Security PIN Lock', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'about', label: 'About & Policy', icon: Info }
  ];

  return (
    <PageContainer>
      <div className="flex flex-col md:flex-row gap-6">
        {/* Settings Navigation Sidebar */}
        <div className="w-full md:w-64 glass-panel p-2 rounded-xl border border-slate-800 shrink-0 h-fit space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Settings Content Area */}
        <div className="flex-1">
          {activeTab === 'backup' && <BackupRestore toast={toast} />}
          {activeTab === 'pin' && <PinSettings toast={toast} />}
          {activeTab === 'appearance' && <AppearanceSettings />}
          {activeTab === 'about' && <About />}
        </div>
      </div>
    </PageContainer>
  );
}
