import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { StatusBar } from './StatusBar';

export function AppLayout({ activeTab, setActiveTab, title, subtitle, onLockApp, children }) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-900 text-slate-100">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header title={title} subtitle={subtitle} onLockApp={onLockApp} />
        <main className="flex-1 overflow-y-auto bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950">
          {children}
        </main>
        <StatusBar />
      </div>
    </div>
  );
}
