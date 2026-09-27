import React from 'react';

export function Table({ headers = [], children, emptyText = 'No records found' }) {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-400">
            {headers.map((h, idx) => (
              <th
                key={idx}
                className={`px-3.5 py-2.5 font-semibold ${idx < headers.length - 1 ? 'border-r border-slate-200 dark:border-slate-800' : ''} ${
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
        <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
          {children}
        </tbody>
      </table>
    </div>
  );
}
