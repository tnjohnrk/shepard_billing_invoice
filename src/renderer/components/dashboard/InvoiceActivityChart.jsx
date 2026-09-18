import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export function InvoiceActivityChart({ data = [] }) {
  return (
    <div className="p-5 glass-panel rounded-xl border border-slate-800 shadow-lg">
      <h3 className="text-sm font-semibold text-slate-200 mb-4">Monthly Invoice Activity</h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
            <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
            <YAxis stroke="#94a3b8" fontSize={11} />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc', fontSize: '12px' }}
            />
            <Bar dataKey="invoices" name="Tax Invoices" fill="#6366f1" radius={[4, 4, 0, 0]} />
            <Bar dataKey="proformas" name="Proforma" fill="#06b6d4" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
