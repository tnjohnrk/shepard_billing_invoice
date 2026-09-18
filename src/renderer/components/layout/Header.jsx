import React from 'react';
import { Building2, Lock } from 'lucide-react';

export function Header({ title, subtitle, onLockApp }) {
  return (
    <header className="h-16 bg-slate-900/80 border-b border-slate-800/80 px-6 flex items-center justify-between backdrop-blur-md sticky top-0 z-30 select-none">
      <div>
        <h2 className="text-base font-semibold text-slate-100">{title}</h2>
        {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/50 text-xs text-slate-300">
          <Building2 className="w-3.5 h-3.5 text-indigo-400" />
          <span className="font-medium">GSTIN: 27AAACS1234F1Z5</span>
        </div>

        {onLockApp && (
          <button
            onClick={onLockApp}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-700"
            title="Lock Application"
          >
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>Lock</span>
          </button>
        )}
      </div>
    </header>
  );
}
