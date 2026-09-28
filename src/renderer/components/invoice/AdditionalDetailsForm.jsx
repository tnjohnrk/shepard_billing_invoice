import React from 'react';

export function AdditionalDetailsForm({ formData, onChange }) {
  const notesLength = (formData.notes || '').length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Notes / Remarks / Payment Instructions
          </label>
          <span className={`text-[11px] font-mono font-medium ${notesLength >= 65 ? 'text-rose-500 font-bold' : 'text-slate-400 dark:text-slate-500'}`}>
            {notesLength} / 65 characters
          </span>
        </div>
        <textarea
          rows={3}
          maxLength={65}
          className="w-full bg-slate-50/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-xs"
          placeholder="Enter optional notes to display on the invoice (max 65 characters)..."
          value={formData.notes || ''}
          onChange={(e) => onChange('notes', e.target.value.slice(0, 65))}
        />
      </div>
    </div>
  );
}

