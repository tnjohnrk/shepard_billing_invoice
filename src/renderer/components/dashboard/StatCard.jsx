import React from 'react';

export function StatCard({ title, value, subtitle, icon: Icon, color = 'sky' }) {
  const iconColorStyles = {
    sky: 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950 border-sky-200 dark:border-sky-800',
    indigo: 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950 border-sky-200 dark:border-sky-800',
    cyan: 'text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950 border-cyan-200 dark:border-cyan-800',
    emerald: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800',
    amber: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800'
  };

  return (
    <div className="p-5 rounded-2xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-none flex items-center justify-between">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{title}</span>
        <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{value}</div>
        {subtitle && <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">{subtitle}</div>}
      </div>

      {Icon && (
        <div className={`p-3 rounded-xl border shrink-0 ${iconColorStyles[color] || iconColorStyles.indigo}`}>
          <Icon className="w-6 h-6" />
        </div>
      )}
    </div>
  );
}
