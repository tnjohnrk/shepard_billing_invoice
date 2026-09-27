import React, { useState, useEffect } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { Button } from '../components/common/Button';
import { AppearanceSettings } from '../components/settings/AppearanceSettings';
import { BackupRestore } from '../components/settings/BackupRestore';
import { RecycleBin } from '../components/settings/RecycleBin';
import { PinSettings } from '../components/settings/PinSettings';
import { Support } from '../components/settings/Support';
import { About } from '../components/settings/About';
import { Palette, HardDrive, Trash2, Shield, Info, Headphones } from 'lucide-react';
import { ipcClient } from '../services/ipcClient';

export function Settings({ toast, licenseStatus: initialLicenseStatus }) {
  const [licenseStatus, setLicenseStatus] = useState(initialLicenseStatus || null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const s = await ipcClient.getLicenseStatus();
        setLicenseStatus(s);
      } catch {}
    };
    fetchStatus();
  }, []);

  const isLive = licenseStatus?.mode === 'LIVE' || licenseStatus?.isLive;

  // In Trial mode, Data Migration & Restore is hidden; in Live mode, it is visible
  const tabs = [
    ...(isLive ? [{ id: 'backup', label: 'Backup & Restore', icon: HardDrive }] : []),
    { id: 'pin', label: 'Security Password', icon: Shield },
    { id: 'bin', label: 'Recycle Bin', icon: Trash2 },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'support', label: 'Support', icon: Headphones },
    { id: 'about', label: 'About & Policy', icon: Info }
  ];

  const [activeTab, setActiveTab] = useState(isLive ? 'backup' : 'pin');

  useEffect(() => {
    if (!isLive && activeTab === 'backup') {
      setActiveTab('pin');
    }
  }, [isLive, activeTab]);

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Top Horizontal Tab Navigation */}
        <div className="inline-flex flex-wrap items-center gap-1 p-1 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs w-fit">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Settings Content Area */}
        <div>
          {isLive && activeTab === 'backup' && <BackupRestore toast={toast} />}
          {activeTab === 'pin' && <PinSettings toast={toast} />}
          {activeTab === 'bin' && <RecycleBin toast={toast} />}
          {activeTab === 'appearance' && <AppearanceSettings />}
          {activeTab === 'support' && <Support toast={toast} />}
          {activeTab === 'about' && <About />}
        </div>
      </div>
    </PageContainer>
  );
}
