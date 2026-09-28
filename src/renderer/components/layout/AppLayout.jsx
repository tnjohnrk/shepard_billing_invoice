import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { StatusBar } from './StatusBar';

export function AppLayout({ activeTab, setActiveTab, title, subtitle, onLockApp, onOpenShortcuts, children }) {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      if (typeof window !== 'undefined' && window.innerWidth < 1024) {
        return true;
      }
      return localStorage.getItem('shepherd_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  // Auto-collapse sidebar on smaller screens while allowing manual toggle
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsCollapsed(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem('shepherd_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white dark:bg-[#0d1117] text-slate-900 dark:text-slate-100">
      {/* Sidebar (Responsive desktop + collapsed modes) */}
      <div className="flex h-full shrink-0">
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          isCollapsed={isCollapsed}
          onToggleCollapse={toggleCollapse}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        <Header 
          title={title} 
          subtitle={subtitle} 
          isSidebarCollapsed={isCollapsed}
          onToggleSidebar={toggleCollapse}
          onLockApp={onLockApp} 
          onOpenShortcuts={onOpenShortcuts}
        />
        <main className="flex-1 overflow-y-auto bg-white dark:bg-[#0d1117] min-w-0">
          {children}
        </main>
        <StatusBar />
      </div>
    </div>
  );
}
