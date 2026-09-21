import React from 'react';

export function Table({ headers = [], children, emptyText = 'No records found' }) {
  return (
    <div className="w-full overflow-x-auto rounded-2xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-none">
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-300 dark:border-slate-700 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            {headers.map((h, idx) => (
              <th
                key={idx}
                className={`px-4 py-3.5 border-r border-slate-300 dark:border-slate-700 last:border-r-0 ${
                  typeof h === 'object' && h.align === 'right'
                    ? 'text-right'
                    : typeof h === 'object' && h.align === 'center'
                    ? 'text-center'
                    : ''
                }`}
              >
                {typeof h === 'object' ? h.label : h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-900 dark:text-slate-100">
          {children}
        </tbody>
      </table>
    </div>
  );
}
