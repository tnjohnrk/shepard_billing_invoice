import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useTheme } from '../../context/ThemeContext';
import { BarChart2 } from 'lucide-react';

export function InvoiceActivityChart({ data = [], title = "Invoice Activity", subtitle }) {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  return (
    <div className="p-4 bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] shadow-xs flex flex-col justify-between">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div>
          <div className="flex items-center gap-1.5">
            <BarChart2 className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">{title}</h3>
          </div>
          {subtitle && <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2.5 text-[11px]">
          <div className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-300">
            <span className="w-2 h-2 rounded-xs bg-[#1f6feb] inline-block"></span>
            <span>Tax Invoices</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-300">
            <span className="w-2 h-2 rounded-xs bg-[#238636] inline-block"></span>
            <span>Proformas</span>
          </div>
        </div>
      </div>

      <div className="h-60 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={isLight ? '#f1f5f9' : '#21262d'} vertical={false} />
            <XAxis dataKey="month" stroke={isLight ? '#94a3b8' : '#6e7681'} fontSize={10} tickLine={false} minTickGap={16} />
            <YAxis stroke={isLight ? '#94a3b8' : '#6e7681'} fontSize={10} tickLine={false} allowDecimals={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: isLight ? '#ffffff' : '#161b22',
                borderColor: isLight ? '#e2e8f0' : '#30363d',
                borderRadius: '8px',
                color: isLight ? '#0f172a' : '#f0f6fc',
                fontSize: '11px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.08)'
              }}
              cursor={{ fill: isLight ? 'rgba(241, 245, 249, 0.6)' : 'rgba(48, 54, 61, 0.3)' }}
            />
            <Bar dataKey="invoices" name="Tax Invoices" fill="#1f6feb" radius={[3, 3, 0, 0]} maxBarSize={20} />
            <Bar dataKey="proformas" name="Proforma" fill="#238636" radius={[3, 3, 0, 0]} maxBarSize={20} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
