import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { StatusBar } from './StatusBar';

export function AppLayout({ activeTab, setActiveTab, title, subtitle, onLockApp, children }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleSelectTab = (tab) => {
    setActiveTab(tab);
    setMobileSidebarOpen(false);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white dark:bg-[#0d1117] text-slate-900 dark:text-slate-100">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex h-full shrink-0">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      {/* Mobile Drawer Backdrop & Sidebar */}
      {mobileSidebarOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={() => setMobileSidebarOpen(false)}
        >
          <div 
            className="w-64 h-full bg-white dark:bg-[#161b22] border-r border-slate-200 dark:border-[#30363d] shadow-2xl animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <Sidebar activeTab={activeTab} setActiveTab={handleSelectTab} isMobile onClose={() => setMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        <Header 
          title={title} 
          subtitle={subtitle} 
          onLockApp={onLockApp} 
          onToggleMobileMenu={() => setMobileSidebarOpen(prev => !prev)} 
        />
        <main className="flex-1 overflow-y-auto bg-white dark:bg-[#0d1117] min-w-0">
          {children}
        </main>
        <StatusBar />
      </div>
    </div>
  );
}

