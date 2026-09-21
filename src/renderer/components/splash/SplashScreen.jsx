import React from 'react';
import companyLogo from '../../assets/logo.png';

export function SplashScreen() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 select-none p-4">
      <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 p-8 rounded-2xl border-2 border-slate-300 dark:border-slate-700 shadow-none space-y-6">
        
        {/* Brand & Header */}
        <div className="flex flex-col items-center text-center">
          <img
            src={companyLogo}
            alt="Shepherd Enterprises"
            className="w-20 h-20 object-contain shadow-none -mb-1"
          />

          <div className="mt-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-wide uppercase">
              Shepherd Enterprises
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Billing &amp; Invoice Management System
            </p>
          </div>
        </div>

        {/* Loading Progress */}
        <div className="pt-2 pb-2 flex flex-col items-center gap-2.5 w-full">
          <div 
            className="relative w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 isolate"
            style={{ contain: 'paint', maskImage: '-webkit-radial-gradient(white, black)' }}
          >
            <div className="absolute inset-y-0 left-0 w-1/3 bg-sky-500 dark:bg-sky-400 rounded-full animate-progress" />
          </div>
          <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 animate-pulse">
            Loading workspace...
          </p>
        </div>

      </div>
    </div>
  );
}
