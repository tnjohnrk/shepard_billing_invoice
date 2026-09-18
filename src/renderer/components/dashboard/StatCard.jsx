import React from 'react';

export function StatCard({ title, value, subtitle, icon: Icon, color = 'indigo' }) {
  const colorStyles = {
    indigo: 'from-indigo-600/20 to-indigo-900/10 border-indigo-500/30 text-indigo-400',
    cyan: 'from-cyan-600/20 to-cyan-900/10 border-cyan-500/30 text-cyan-400',
    emerald: 'from-emerald-600/20 to-emerald-900/10 border-emerald-500/30 text-emerald-400',
    amber: 'from-amber-600/20 to-amber-900/10 border-amber-500/30 text-amber-400'
  };

  return (
    <div className={`p-5 rounded-xl border bg-gradient-to-br ${colorStyles[color]} glass-card shadow-lg flex items-center justify-between`}>
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</span>
        <div className="text-2xl font-bold text-slate-100 mt-1">{value}</div>
        {subtitle && <div className="text-xs text-slate-400 mt-1">{subtitle}</div>}
      </div>

      {Icon && (
        <div className={`p-3 rounded-xl bg-slate-900/80 border border-slate-800 shrink-0 ${colorStyles[color].split(' ').pop()}`}>
          <Icon className="w-6 h-6" />
        </div>
      )}
    </div>
  );
}
