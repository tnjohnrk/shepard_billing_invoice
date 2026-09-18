import React from 'react';

export function AdditionalDetailsForm({ formData, onChange }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
          Notes / Remarks / Payment Instructions
        </label>
        <textarea
          rows={4}
          className="w-full bg-slate-800/90 border border-slate-700/80 rounded-lg p-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/80"
          placeholder="Enter optional notes to display on the invoice..."
          value={formData.notes || ''}
          onChange={(e) => onChange('notes', e.target.value)}
        />
      </div>
    </div>
  );
}
