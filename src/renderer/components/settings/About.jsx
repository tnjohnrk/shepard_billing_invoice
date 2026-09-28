import React from 'react';
import { ShieldAlert, Building, CheckCircle2 } from 'lucide-react';
import { COMPANY_CONFIG } from '../../../main/config/companyConfig';
import shepherdInvoiceLogo from '../../assets/shepherd_invoice_logo.png';

export function About() {
  return (
    <div className="p-6 bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-[#30363d] space-y-5 shadow-none">
      <div className="flex items-center gap-3.5">
        <div className="w-12 h-12 rounded-xl bg-white dark:bg-[#0d1117] p-1 border border-slate-200 dark:border-[#30363d] flex items-center justify-center shrink-0 shadow-none overflow-hidden">
          <img
            src={shepherdInvoiceLogo}
            alt="Shepherd Enterprises"
            className="w-full h-full object-contain"
          />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Shepherd Enterprises Private Limited</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Offline-First Windows Desktop Invoice Billing Application v1.0.0</p>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-[#30363d] text-xs space-y-2 text-slate-700 dark:text-slate-300 shadow-none">
        <div className="font-bold uppercase tracking-wider text-[10px] text-slate-600 dark:text-slate-400">Developer-Locked System Policy</div>
        <p className="leading-relaxed">
          The invoice design, company GSTIN, company address, bank account details, QR codes, signature blocks, and declarations are strictly fixed and developer-controlled for complete audit and GST compliance.
        </p>
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-[#30363d] text-[11px] text-slate-800 dark:text-slate-200">
          <div><strong>GSTIN:</strong> {COMPANY_CONFIG.gstin}</div>
          <div><strong>State Code:</strong> {COMPANY_CONFIG.state_code} ({COMPANY_CONFIG.state})</div>
          <div><strong>Bank:</strong> {COMPANY_CONFIG.bank_name}</div>
          <div><strong>A/C No:</strong> {COMPANY_CONFIG.account_number}</div>
          <div><strong>IFSC:</strong> {COMPANY_CONFIG.ifsc_code}</div>
          <div><strong>Branch:</strong> {COMPANY_CONFIG.branch_name}</div>
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
        <span>Powered by <strong className="text-slate-700 dark:text-slate-300">Vibe2Code</strong></span>
        <span>Website: <strong className="text-slate-700 dark:text-slate-300">vibe2code.in</strong></span>
      </div>
    </div>
  );
}
