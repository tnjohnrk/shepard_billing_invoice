import React from 'react';

export function StatCard({ title, value, subtitle, badge }) {
  return (
    <div className="p-4 rounded-xl border border-slate-200 dark:border-[#30363d] bg-white dark:bg-[#161b22] shadow-xs hover:border-slate-300 dark:hover:border-slate-600 transition-all flex flex-col justify-between group">
      <div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {title}
          </span>
          {badge && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#21262d] text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-[#30363d]">
              {badge}
            </span>
          )}
        </div>
        <div className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-2 tracking-tight font-mono">
          {value}
        </div>
      </div>

      {subtitle && (
        <div className="mt-3 pt-2 border-t border-slate-100 dark:border-[#30363d] flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
          <span>{subtitle}</span>
        </div>
      )}
    </div>
  );
}

