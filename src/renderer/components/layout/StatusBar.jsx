import React, { useState, useEffect } from 'react';
import { WifiOff, Database, Mail } from 'lucide-react';
import { ipcClient } from '../../services/ipcClient';

export function StatusBar() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);
  const [isDbConnected, setIsDbConnected] = useState(true);

  const checkDbStatus = async () => {
    try {
      const res = await ipcClient.listInvoices({ limit: 1 });
      setIsDbConnected(Boolean(res && (Array.isArray(res.data) || Array.isArray(res))));
    } catch (e) {
      setIsDbConnected(false);
    }
  };

  const fetchQueueCount = async () => {
    try {
      const summary = await ipcClient.getEmailQueueSummary();
      if (summary && typeof summary.pendingCount === 'number') {
        setPendingCount(summary.pendingCount);
      }
    } catch (e) {
      // Ignore
    }
  };

  useEffect(() => {
    checkDbStatus();
    fetchQueueCount();
    const interval = setInterval(() => {
      fetchQueueCount();
      checkDbStatus();
    }, 15000);

    const handleOnline = () => {
      setIsOnline(true);
      fetchQueueCount();
      checkDbStatus();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <footer className="h-6 bg-slate-50 dark:bg-[#161b22] border-t border-slate-200 dark:border-[#30363d] px-4 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 select-none">
      <div className="flex items-center gap-3">
        {/* SQL Database Symbol with Connection Signal */}
        <div 
          className="flex items-center gap-1.5 cursor-default" 
          title={isDbConnected ? 'SQL Database: Connected' : 'SQL Database: Disconnected'}
        >
          <Database className={`w-3 h-3 ${isDbConnected ? 'text-emerald-500' : 'text-rose-500'}`} />
          <span 
            className={`w-1.5 h-1.5 rounded-full ${
              isDbConnected 
                ? 'bg-emerald-500 animate-pulse' 
                : 'bg-rose-500'
            }`} 
          />
          <span className="text-[10px] font-medium text-slate-600 dark:text-slate-400">SQLite Active</span>
        </div>
        <span className="text-slate-300 dark:text-slate-700">•</span>
        <span className="flex items-center gap-1.5 text-[10px]">
          <Mail className={`w-3 h-3 ${pendingCount > 0 ? 'text-amber-500' : 'text-slate-400'}`} />
          <span>
            {pendingCount > 0 ? `Queue: ${pendingCount} Pending` : 'Queue: Idle'}
          </span>
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className={`flex items-center gap-1.5 px-1.5 py-0.5 rounded text-[10px] font-medium ${
          isOnline 
            ? 'text-emerald-600 dark:text-emerald-400' 
            : 'text-amber-600 dark:text-amber-400'
        }`}>
          {isOnline ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>Online</span>
            </>
          ) : (
            <>
              <WifiOff className="w-2.5 h-2.5" />
              <span>Offline Mode</span>
            </>
          )}
        </div>
      </div>
    </footer>
  );
}
