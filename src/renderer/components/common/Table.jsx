import React from 'react';

export function Table({ headers = [], children, emptyText = 'No records found' }) {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-slate-700/60 bg-slate-900/60 shadow-lg">
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr className="bg-slate-800/80 border-b border-slate-700/80 text-xs font-semibold uppercase tracking-wider text-slate-400">
            {headers.map((h, idx) => (
              <th key={idx} className={`px-4 py-3.5 ${typeof h === 'object' && h.align === 'right' ? 'text-right' : typeof h === 'object' && h.align === 'center' ? 'text-center' : ''}`}>
                {typeof h === 'object' ? h.label : h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800 text-slate-200">
          {children}
        </tbody>
      </table>
    </div>
  );
}
