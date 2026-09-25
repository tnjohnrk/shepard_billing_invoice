import React from 'react';

export function StatCard({ title, value, subtitle, badge }) {
  return (
    <div className="p-5 rounded-2xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-none flex flex-col justify-between transition-all hover:border-slate-400 dark:hover:border-slate-600">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{title}</span>
        <div className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1.5 tracking-tight">{value}</div>
      </div>

      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/60">
        {subtitle && <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{subtitle}</span>}
        {badge && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 ml-auto">
            {badge}
          </span>
        )}
      </div>
    </div>
  );
}

