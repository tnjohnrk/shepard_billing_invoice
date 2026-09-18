import React from 'react';

export function Loading({ text = 'Loading data...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400">
      <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      <span className="text-xs font-medium tracking-wide uppercase">{text}</span>
    </div>
  );
}
