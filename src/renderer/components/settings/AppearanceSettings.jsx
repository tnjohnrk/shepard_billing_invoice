import React from 'react';
import { Sun, Moon } from 'lucide-react';

export function AppearanceSettings() {
  return (
    <div className="p-5 glass-panel rounded-xl border border-slate-800 space-y-4">
      <h3 className="text-sm font-semibold text-slate-200">Appearance Settings</h3>
      <p className="text-xs text-slate-400">Choose visual theme for the desktop app interface.</p>

      <div className="flex gap-4">
        <div className="p-4 rounded-xl border-2 border-indigo-500 bg-slate-900 flex items-center gap-3 cursor-pointer">
          <Moon className="w-5 h-5 text-indigo-400" />
          <div>
            <div className="text-xs font-bold text-slate-100">Dark Mode (Default)</div>
            <div className="text-[10px] text-slate-400">High contrast business desktop interface</div>
          </div>
        </div>
      </div>
    </div>
  );
}
