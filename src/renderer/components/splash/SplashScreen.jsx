import React from 'react';

export function SplashScreen() {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center text-slate-100 select-none">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center text-white font-black text-3xl shadow-2xl shadow-indigo-600/50 mb-6 animate-pulse">
        S
      </div>

      <h1 className="text-xl font-bold uppercase tracking-wider text-slate-100">
        Shepherd Enterprises
      </h1>
      <p className="text-xs text-slate-400 mt-1">Invoice Billing System</p>

      <div className="mt-8 flex flex-col items-center gap-2">
        <div className="w-48 h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full animate-progress" />
        </div>
        <span className="text-[10px] text-slate-500 tracking-widest uppercase font-semibold">
          Initializing SQLite Engine...
        </span>
      </div>
    </div>
  );
}
