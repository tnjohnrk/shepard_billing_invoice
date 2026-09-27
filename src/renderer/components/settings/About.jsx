import React from 'react';
import { ShieldAlert, Building, CheckCircle2 } from 'lucide-react';
import { COMPANY_CONFIG } from '../../../main/config/companyConfig';
import shepherdInvoiceLogo from '../../assets/shepherd_invoice_logo.png';

export function About() {
  return (
    <div className="p-5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-4 shadow-xs">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-white dark:bg-[#161b22] p-1 border border-slate-200 dark:border-[#30363d] flex items-center justify-center shrink-0 shadow-2xs overflow-hidden">
          <img
            src={shepherdInvoiceLogo}
            alt="Shepherd Enterprises"
            className="w-full h-full object-contain"
          />
        </div>
        <div>
          <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">Shepherd Enterprises Private Limited</h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Offline-First Windows Desktop Invoice Billing Application v1.0.0</p>
        </div>
      </div>

      <div className="p-3.5 rounded-xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 text-xs space-y-2 text-slate-700 dark:text-slate-300 shadow-xs">
        <div className="font-bold uppercase tracking-wider text-[10px] text-indigo-600 dark:text-indigo-400">Developer-Locked System Policy</div>
        <p className="leading-relaxed text-xs">
          The invoice design, company GSTIN, company address, bank account details, QR codes, signature blocks, and declarations are strictly fixed and developer-controlled for complete audit and GST compliance.
        </p>
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-850 text-[11px] text-slate-700 dark:text-slate-300">
          <div><strong className="text-slate-900 dark:text-slate-100">GSTIN:</strong> {COMPANY_CONFIG.gstin}</div>
          <div><strong className="text-slate-900 dark:text-slate-100">State Code:</strong> {COMPANY_CONFIG.state_code} ({COMPANY_CONFIG.state})</div>
          <div><strong className="text-slate-900 dark:text-slate-100">Bank:</strong> {COMPANY_CONFIG.bank_name}</div>
          <div><strong className="text-slate-900 dark:text-slate-100">A/C No:</strong> {COMPANY_CONFIG.account_number}</div>
          <div><strong className="text-slate-900 dark:text-slate-100">IFSC:</strong> {COMPANY_CONFIG.ifsc_code}</div>
          <div><strong className="text-slate-900 dark:text-slate-100">Branch:</strong> {COMPANY_CONFIG.branch_name}</div>
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
        <span>Powered by <strong className="text-indigo-600 dark:text-indigo-400">Vibe2Code</strong></span>
        <span>Website: <strong className="text-slate-700 dark:text-slate-300">vibe2code.in</strong></span>
      </div>
    </div>
  );
}
