import React from 'react';
import { ShieldAlert, Building, CheckCircle2 } from 'lucide-react';
import { COMPANY_CONFIG } from '../../../main/config/companyConfig';

export function About() {
  return (
    <div className="p-5 glass-panel rounded-xl border border-slate-800 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white font-black text-xl shadow-lg">
          S
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-100">Shepherd Enterprises Private Limited</h3>
          <p className="text-xs text-slate-400">Offline-First Windows Desktop Invoice Billing Application v1.0.0</p>
        </div>
      </div>

      <div className="p-4 rounded-lg bg-slate-900/80 border border-slate-800 text-xs space-y-2 text-slate-300">
        <div className="font-bold text-slate-100 uppercase tracking-wider text-[10px] text-indigo-400">Developer-Locked System Policy</div>
        <p className="leading-relaxed">
          The invoice design, company GSTIN, company address, bank account details, QR codes, signature blocks, and declarations are strictly fixed and developer-controlled for complete audit and GST compliance.
        </p>
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-[11px]">
          <div><strong>GSTIN:</strong> {COMPANY_CONFIG.gstin}</div>
          <div><strong>State Code:</strong> {COMPANY_CONFIG.state_code} ({COMPANY_CONFIG.state})</div>
          <div><strong>Bank:</strong> {COMPANY_CONFIG.bank_name}</div>
          <div><strong>IFSC:</strong> {COMPANY_CONFIG.ifsc_code}</div>
        </div>
      </div>
    </div>
  );
}
