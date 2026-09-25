import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { useTheme } from '../../context/ThemeContext';

export function InvoiceActivityChart({ data = [], title = "Invoice Activity", subtitle }) {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  return (
    <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-300 dark:border-slate-700 shadow-none flex flex-col justify-between">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-300">
            <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500 inline-block"></span>
            <span>Tax Invoices</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-300">
            <span className="w-2.5 h-2.5 rounded-sm bg-cyan-500 inline-block"></span>
            <span>Proformas</span>
          </div>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={isLight ? '#e2e8f0' : '#334155'} vertical={false} />
            <XAxis dataKey="month" stroke={isLight ? '#64748b' : '#94a3b8'} fontSize={11} tickLine={false} />
            <YAxis stroke={isLight ? '#64748b' : '#94a3b8'} fontSize={11} tickLine={false} allowDecimals={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: isLight ? '#ffffff' : '#0f172a',
                borderColor: isLight ? '#cbd5e1' : '#334155',
                borderRadius: '10px',
                color: isLight ? '#0f172a' : '#f8fafc',
                fontSize: '12px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
              cursor={{ fill: isLight ? 'rgba(241, 245, 249, 0.6)' : 'rgba(30, 41, 59, 0.6)' }}
            />
            <Bar dataKey="invoices" name="Tax Invoices" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={32} />
            <Bar dataKey="proformas" name="Proforma" fill="#06b6d4" radius={[4, 4, 0, 0]} maxBarSize={32} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
