import React from 'react';
import { ShieldAlert, Building, CheckCircle2 } from 'lucide-react';
import { COMPANY_CONFIG } from '../../../main/config/companyConfig';

export function About() {
  return (
    <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-300 dark:border-slate-700 space-y-5 shadow-none">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-none">
          S
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Shepherd Enterprises Private Limited</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Offline-First Windows Desktop Invoice Billing Application v1.0.0</p>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs space-y-2 text-slate-700 dark:text-slate-300 shadow-none">
        <div className="font-bold uppercase tracking-wider text-[10px] text-indigo-600 dark:text-indigo-400">Developer-Locked System Policy</div>
        <p className="leading-relaxed">
          The invoice design, company GSTIN, company address, bank account details, QR codes, signature blocks, and declarations are strictly fixed and developer-controlled for complete audit and GST compliance.
        </p>
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-slate-700 text-[11px] text-slate-800 dark:text-slate-200">
          <div><strong>GSTIN:</strong> {COMPANY_CONFIG.gstin}</div>
          <div><strong>State Code:</strong> {COMPANY_CONFIG.state_code} ({COMPANY_CONFIG.state})</div>
          <div><strong>Bank:</strong> {COMPANY_CONFIG.bank_name}</div>
          <div><strong>A/C No:</strong> {COMPANY_CONFIG.account_number}</div>
          <div><strong>IFSC:</strong> {COMPANY_CONFIG.ifsc_code}</div>
          <div><strong>Branch:</strong> {COMPANY_CONFIG.branch_name}</div>
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
        <span>Powered by <strong className="text-indigo-600 dark:text-indigo-400">Vibe2Code</strong></span>
        <span>Website: <strong className="text-slate-700 dark:text-slate-300">vibe2code.in</strong></span>
      </div>
    </div>
  );
}
