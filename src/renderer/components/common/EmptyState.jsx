import React from 'react';
import { FileQuestion } from 'lucide-react';

export function EmptyState({
  icon: Icon = FileQuestion,
  title = 'No Records Found',
  description = 'There are no items matching your criteria right now.',
  action
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center glass-panel rounded-xl border border-slate-800">
      <div className="p-4 rounded-full bg-slate-800/80 text-slate-400 mb-3 border border-slate-700/50">
        <Icon className="w-8 h-8" />
      </div>
      <h4 className="text-base font-semibold text-slate-200">{title}</h4>
      <p className="text-xs text-slate-400 max-w-sm mt-1 mb-4">{description}</p>
      {action}
    </div>
  );
}
