import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Database, Mail } from 'lucide-react';
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
    <footer className="h-7 bg-white dark:bg-slate-950 border-t border-slate-300 dark:border-slate-800 px-4 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 select-none shadow-none">
      <div className="flex items-center gap-3">
        {/* SQL Database Symbol with Green / Red Connection Signal */}
        <div 
          className="flex items-center gap-1.5 cursor-default" 
          title={isDbConnected ? 'SQL Database: Connected' : 'SQL Database: Disconnected'}
        >
          <Database className={`w-3.5 h-3.5 ${isDbConnected ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`} />
          <span 
            className={`w-2 h-2 rounded-full transition-colors ${
              isDbConnected 
                ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.7)] animate-pulse' 
                : 'bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.7)]'
            }`} 
          />
        </div>
        <span className="text-slate-300 dark:text-slate-700">|</span>
        <span className="flex items-center gap-1.5">
          <Mail className={`w-3 h-3 ${pendingCount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-sky-600 dark:text-cyan-400'}`} />
          <span>
            {pendingCount > 0 ? `Email Queue: ${pendingCount} Pending` : 'Email Queue: Ready'}
          </span>
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold ${isOnline ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' : 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'}`}>
          {isOnline ? (
            <>
              <Wifi className="w-3 h-3" />
              <span>System Online</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3 h-3" />
              <span>Offline Mode</span>
            </>
          )}
        </div>
      </div>
    </footer>
  );
}
