import React from 'react';

export function AdditionalDetailsForm({ formData, onChange }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Notes / Remarks / Payment Instructions
        </label>
        <textarea
          rows={4}
          className="w-full bg-slate-50/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0078d4]/20 focus:border-[#0078d4] transition-all shadow-xs"
          placeholder="Enter optional notes to display on the invoice..."
          value={formData.notes || ''}
          onChange={(e) => onChange('notes', e.target.value)}
        />
      </div>
    </div>
  );
}
