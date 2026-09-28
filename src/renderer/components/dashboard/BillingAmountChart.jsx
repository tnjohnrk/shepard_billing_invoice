import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useTheme } from '../../context/ThemeContext';
import { TrendingUp } from 'lucide-react';

export function BillingAmountChart({ data = [], title = "Billing Revenue Trend (₹)", subtitle }) {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  // Smart tick formatter for Indian currency
  const formatYTick = (val) => {
    if (val === 0) return '₹0';
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)}Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(0)}k`;
    return `₹${val}`;
  };

  return (
    <div className="p-4 bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] shadow-xs flex flex-col justify-between">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div>
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">{title}</h3>
          </div>
          {subtitle && <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200/80 dark:border-emerald-800/40 self-start sm:self-auto">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
          <span>Billed Revenue</span>
        </div>
      </div>

      <div className="h-60 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="billingGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={isLight ? '#f1f5f9' : '#21262d'} vertical={false} />
            <XAxis dataKey="month" stroke={isLight ? '#94a3b8' : '#6e7681'} fontSize={10} tickLine={false} minTickGap={16} />
            <YAxis 
              stroke={isLight ? '#94a3b8' : '#6e7681'} 
              fontSize={10} 
              tickLine={false}
              tickFormatter={formatYTick} 
            />
            <Tooltip
              contentStyle={{
                backgroundColor: isLight ? '#ffffff' : '#161b22',
                borderColor: isLight ? '#e2e8f0' : '#30363d',
                borderRadius: '8px',
                color: isLight ? '#0f172a' : '#f0f6fc',
                fontSize: '11px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.08)'
              }}
              formatter={(val) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Billing Amount']}
            />
            <Area 
              type="monotone" 
              dataKey="amount" 
              stroke="#10b981" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#billingGrad)" 
              dot={{ r: 2.5, fill: '#10b981', strokeWidth: 1, stroke: '#fff' }}
              activeDot={{ r: 4.5, strokeWidth: 1.5, stroke: '#fff' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
