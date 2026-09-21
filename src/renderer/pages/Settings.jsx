import React, { useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { Button } from '../components/common/Button';
import { AppearanceSettings } from '../components/settings/AppearanceSettings';
import { BackupRestore } from '../components/settings/BackupRestore';
import { RecycleBin } from '../components/settings/RecycleBin';
import { PinSettings } from '../components/settings/PinSettings';
import { About } from '../components/settings/About';
import { Palette, HardDrive, Trash2, Shield, Info } from 'lucide-react';

export function Settings({ toast }) {
  const [activeTab, setActiveTab] = useState('backup');

  const tabs = [
    { id: 'backup', label: 'Backup & Restore', icon: HardDrive },
    { id: 'bin', label: 'Recycle Bin', icon: Trash2 },
    { id: 'pin', label: 'Security Password Lock', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'about', label: 'About & Policy', icon: Info }
  ];

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Top Horizontal Tab Navigation (Fit to content up to last button) */}
        <div className="inline-flex flex-wrap items-center gap-2 p-1.5 bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-300 dark:border-slate-700 shadow-none w-fit">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <Button
                key={tab.id}
                variant={isActive ? 'primary' : 'ghost'}
                size="sm"
                icon={Icon}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </Button>
            );
          })}
        </div>

        {/* Settings Content Area */}
        <div>
          {activeTab === 'backup' && <BackupRestore toast={toast} />}
          {activeTab === 'bin' && <RecycleBin toast={toast} />}
          {activeTab === 'pin' && <PinSettings toast={toast} />}
          {activeTab === 'appearance' && <AppearanceSettings />}
          {activeTab === 'about' && <About />}
        </div>
      </div>
    </PageContainer>
  );
}
