import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export function BillingAmountChart({ data = [] }) {
  return (
    <div className="p-5 glass-panel rounded-xl border border-slate-800 shadow-lg">
      <h3 className="text-sm font-semibold text-slate-200 mb-4">Billing Revenue Trend (₹)</h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="billingGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
            <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
            <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`} />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc', fontSize: '12px' }}
              formatter={(val) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Billing Amount']}
            />
            <Area type="monotone" dataKey="amount" stroke="#10b981" fillOpacity={1} fill="url(#billingGrad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
