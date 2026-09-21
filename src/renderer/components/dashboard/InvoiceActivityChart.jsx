import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useTheme } from '../../context/ThemeContext';

export function InvoiceActivityChart({ data = [] }) {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  return (
    <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-300 dark:border-slate-700 shadow-none">
      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4">Monthly Invoice Activity</h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={isLight ? '#e2e8f0' : '#334155'} />
            <XAxis dataKey="month" stroke={isLight ? '#64748b' : '#94a3b8'} fontSize={11} />
            <YAxis stroke={isLight ? '#64748b' : '#94a3b8'} fontSize={11} />
            <Tooltip
              contentStyle={{
                backgroundColor: isLight ? '#ffffff' : '#0f172a',
                borderColor: isLight ? '#cbd5e1' : '#334155',
                borderRadius: '8px',
                color: isLight ? '#0f172a' : '#f8fafc',
                fontSize: '12px',
                boxShadow: 'none'
              }}
            />
            <Bar dataKey="invoices" name="Tax Invoices" fill="#6366f1" radius={[4, 4, 0, 0]} />
            <Bar dataKey="proformas" name="Proforma" fill="#06b6d4" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
