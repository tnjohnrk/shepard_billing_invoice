import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, HardDrive, Mail } from 'lucide-react';
import { ipcClient } from '../../services/ipcClient';

export function StatusBar() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      ipcClient.retryEmailQueue().catch(() => {});
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <footer className="h-7 bg-slate-950 border-t border-slate-900 px-4 flex items-center justify-between text-[11px] text-slate-400 select-none">
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1.5">
          <HardDrive className="w-3 h-3 text-emerald-400" />
          <span>SQLite Engine Connected</span>
        </span>
        <span className="text-slate-700">|</span>
        <span className="flex items-center gap-1.5">
          <Mail className="w-3 h-3 text-cyan-400" />
          <span>Email Queue Active</span>
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold ${isOnline ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40' : 'bg-amber-950 text-amber-400 border border-amber-800/40'}`}>
          {isOnline ? (
            <>
              <Wifi className="w-3 h-3" />
              <span>Online</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3 h-3" />
              <span>Offline (Queue Enabled)</span>
            </>
          )}
        </div>
      </div>
    </footer>
  );
}
