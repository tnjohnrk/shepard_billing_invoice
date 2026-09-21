import React from 'react';

export function AdditionalDetailsForm({ formData, onChange }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          Notes / Remarks / Payment Instructions
        </label>
        <textarea
          rows={4}
          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-sky-500 shadow-none"
          placeholder="Enter optional notes to display on the invoice..."
          value={formData.notes || ''}
          onChange={(e) => onChange('notes', e.target.value)}
        />
      </div>
    </div>
  );
}
