import React from 'react';
import companyLogo from '../../assets/logo.png';

export function SplashScreen() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 select-none p-4">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-none space-y-6">
        
        {/* Brand & Header */}
        <div className="flex flex-col items-center text-center">
          <img
            src={companyLogo}
            alt="Shepherd Enterprises"
            className="w-24 h-24 object-contain shadow-none -mb-2"
          />

          <div className="mt-1">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-wide uppercase">
              Shepherd Enterprises
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Private Limited • Billing &amp; Invoice System
            </p>
          </div>
        </div>

        {/* Loading Progress */}
        <div className="pt-2 pb-4 flex flex-col items-center gap-3">
          <div className="w-full h-1.5 bg-sky-100 dark:bg-slate-800 rounded-full overflow-hidden border border-sky-200 dark:border-slate-700">
            <div className="h-full w-full bg-sky-400 dark:bg-sky-500 rounded-full animate-progress" />
          </div>
        </div>

      </div>
    </div>
  );
}
