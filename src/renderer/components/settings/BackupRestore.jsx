import React, { useState, useEffect } from 'react';
import { 
  HardDriveDownload, RotateCcw, Mail, RefreshCw, Save, Laptop, 
  ArrowRight, CheckCircle2, ShieldCheck, HelpCircle, Send, 
  Clock, AlertCircle, Eye, EyeOff, Check 
} from 'lucide-react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Dialog } from '../common/Dialog';
import { ipcClient } from '../../services/ipcClient';
import { COMPANY_CONFIG } from '../../../main/config/companyConfig';

export function BackupRestore({ toast }) {
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);

  // Email SMTP Settings State
  const [backupEmail, setBackupEmail] = useState(COMPANY_CONFIG.backup_email);
  const [smtpHost, setSmtpHost] = useState('smtp.gmail.com');
  const [smtpPort, setSmtpPort] = useState('587');
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPass, setSmtpPass] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Queue Status State
  const [queueSummary, setQueueSummary] = useState({
    pendingCount: 0,
    sentCount: 0,
    todaySentCount: 0,
    totalCount: 0,
    lastSentAt: null,
    lastRecipient: null
  });
  const [isSendingQueue, setIsSendingQueue] = useState(false);
  const [isRefreshingQueue, setIsRefreshingQueue] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isTestingEmail, setIsTestingEmail] = useState(false);

  useEffect(() => {
    loadSettings();
    loadQueueSummary();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await ipcClient.getAllSettings();
      if (settings.backup_email) setBackupEmail(settings.backup_email);
      if (settings.smtp_host) setSmtpHost(settings.smtp_host);
      if (settings.smtp_port) setSmtpPort(settings.smtp_port);
      if (settings.smtp_user) setSmtpUser(settings.smtp_user);
      if (settings.smtp_pass) setSmtpPass(settings.smtp_pass);
    } catch (e) {
      console.error('Failed to load email settings:', e);
    }
  };

  const loadQueueSummary = async () => {
    try {
      setIsRefreshingQueue(true);
      const summary = await ipcClient.getEmailQueueSummary();
      if (summary) {
        setQueueSummary(summary);
      }
    } catch (e) {
      console.error('Failed to load email queue summary:', e);
    } finally {
      setIsRefreshingQueue(false);
    }
  };

  const handleSaveEmailSettings = async (e) => {
    if (e) e.preventDefault();
    setIsSavingSettings(true);
    try {
      await ipcClient.setSetting('backup_email', backupEmail);
      await ipcClient.setSetting('smtp_host', smtpHost);
      await ipcClient.setSetting('smtp_port', smtpPort);
      await ipcClient.setSetting('smtp_user', smtpUser);
      await ipcClient.setSetting('smtp_pass', smtpPass);
      toast('success', 'Email Backup & SMTP credentials saved!');
    } catch (err) {
      toast('error', err.message || 'Failed to save email settings.');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleTestEmail = async () => {
    if (!backupEmail || !smtpUser || !smtpPass) {
      toast('error', 'Please enter Receiver Email, Sender Email, and Password before testing.');
      return;
    }
    setIsTestingEmail(true);
    try {
      // Auto-save form values first
      await ipcClient.setSetting('backup_email', backupEmail);
      await ipcClient.setSetting('smtp_host', smtpHost);
      await ipcClient.setSetting('smtp_port', smtpPort);
      await ipcClient.setSetting('smtp_user', smtpUser);
      await ipcClient.setSetting('smtp_pass', smtpPass);

      const res = await ipcClient.testEmailConnection({
        backup_email: backupEmail,
        smtp_host: smtpHost,
        smtp_port: smtpPort,
        smtp_user: smtpUser,
        smtp_pass: smtpPass
      });

      if (res && res.success) {
        toast('success', res.message || `Test email sent successfully to ${backupEmail}!`);
      } else {
        toast('error', res?.error || 'Test email failed. Please verify credentials.');
      }
    } catch (err) {
      toast('error', err.message || 'SMTP connection failed. Check credentials or Google App Password.');
    } finally {
      setIsTestingEmail(false);
    }
  };

  const handleSendQueuedEmails = async () => {
    if (!backupEmail || !smtpUser || !smtpPass) {
      toast('error', 'Please fill in Receiver Email, Sender Email, and 16-character App Password first.');
      return;
    }

    if (queueSummary.pendingCount === 0) {
      toast('info', 'There are no pending backup emails in the queue.');
      return;
    }

    const batchSize = 10;
    const batchAttempt = Math.min(queueSummary.pendingCount, batchSize);
    setIsSendingQueue(true);

    try {
      // Save credentials first
      await ipcClient.setSetting('backup_email', backupEmail);
      await ipcClient.setSetting('smtp_host', smtpHost || 'smtp.gmail.com');
      await ipcClient.setSetting('smtp_port', smtpPort || '587');
      await ipcClient.setSetting('smtp_user', smtpUser);
      await ipcClient.setSetting('smtp_pass', smtpPass);

      const res = await ipcClient.sendQueuedEmailBackups({
        backup_email: backupEmail,
        smtp_host: smtpHost || 'smtp.gmail.com',
        smtp_port: smtpPort || '587',
        smtp_user: smtpUser,
        smtp_pass: smtpPass
      }, batchSize);

      if (res && res.success) {
        const remaining = res.remainingPending !== undefined ? res.remainingPending : Math.max(0, queueSummary.pendingCount - (res.sent || batchAttempt));
        if (remaining > 0) {
          toast('success', `Batch sent! Dispatched ${res.sent || batchAttempt} invoice PDF(s) to ${backupEmail}. ${remaining} invoice(s) remaining in queue.`);
        } else {
          toast('success', `All done! Dispatched ${res.sent || batchAttempt} invoice PDF(s) to ${backupEmail}. Queue is now completely clear.`);
        }
      } else if (res && res.sent > 0) {
        toast('warning', `Dispatched ${res.sent} invoice(s), but ${res.failed || 1} failed. ${res.errors?.[0] || ''}`);
      } else {
        const errorDetail = res?.errors?.[0] || res?.message || 'Failed to dispatch email batch. Please verify your Google App Password and connection.';
        toast('error', errorDetail);
      }

      await loadQueueSummary();
    } catch (err) {
      toast('error', err.message || 'Failed to dispatch email queue. Please check your credentials.');
    } finally {
      setIsSendingQueue(false);
    }
  };

  const handleCreateBackup = async () => {
    setIsBackingUp(true);
    try {
      const res = await ipcClient.createManualBackup();
      if (!res.canceled && res.backupPath) {
        const statsMsg = res.stats ? ` (${res.stats.invoices} Invoices, ${res.stats.proformas} Proformas, ${res.stats.customers} Customers)` : '';
        toast('success', `Migration package saved to: ${res.backupPath}${statsMsg}`);
      }
    } catch (err) {
      toast('error', err.message || 'Backup creation failed.');
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleRestore = async () => {
    setShowRestoreConfirm(false);
    setIsRestoring(true);
    try {
      const res = await ipcClient.restoreBackup();
      if (!res.canceled) {
        const statsMsg = res.stats ? ` (${res.stats.invoices} Invoices, ${res.stats.proformas} Proformas)` : '';
        toast('success', `Database migrated & restored successfully!${statsMsg}`);
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      }
    } catch (err) {
      toast('error', err.message || 'Restore failed.');
    } finally {
      setIsRestoring(false);
    }
  };

  const nextBatchCount = Math.min(queueSummary.pendingCount, 10);

  return (
    <div className="space-y-6">
      {/* System Migration & Transfer Card */}
      <div className="p-5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-4 shadow-xs">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Data Migration & Computer Transfer</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 uppercase">
                  System Transfer
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Easily move 100% of your billing data (all Tax Invoices, Proformas, Customers, and Settings) from this computer to any new computer or laptop.
              </p>
            </div>
          </div>
        </div>

        {/* 3-Step Migration Guide */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          <div className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400">
              <span className="w-4 h-4 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-[10px]">1</span>
              <span>Export on Old PC</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
              Click <strong>Export Migration Package</strong> to save your full database to a USB drive or cloud folder.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400">
              <span className="w-4 h-4 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-[10px]">2</span>
              <span>Install on New PC</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
              Install the Shepherd Invoice application on the new computer and plug in your USB drive.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <span className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-[10px]">3</span>
              <span>Import on New PC</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
              Open <strong>Settings &gt; Backup</strong> on the new PC and click <strong>Import &amp; Restore</strong>. All data will load instantly!
            </p>
          </div>
        </div>

        {/* Action Buttons for Migration */}
        <div className="flex flex-wrap gap-3 pt-1">
          <Button variant="primary" icon={HardDriveDownload} onClick={handleCreateBackup} isLoading={isBackingUp}>
            Export Migration Package (.zip)
          </Button>

          <Button variant="danger" icon={RotateCcw} onClick={() => setShowRestoreConfirm(true)} isLoading={isRestoring}>
            Import &amp; Restore on this PC
          </Button>
        </div>
      </div>

      {/* Email Backup & Queue Section */}
      <div className="p-5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-5 shadow-xs">
        
        {/* Header with Title & Queue Status Badge */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-50 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Email Dispatch Queue (Invoice PDFs)</h3>
                {queueSummary.pendingCount > 0 ? (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                    <Clock className="w-3 h-3" />
                    {queueSummary.pendingCount} Queued PDF{queueSummary.pendingCount > 1 ? 's' : ''}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                    <CheckCircle2 className="w-3 h-3" />
                    Queue All Clear
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Every saved invoice and proforma is queued for email backup. Dispatches occur in batches of <strong>10 invoices at a time</strong> for optimal Gmail reliability.
              </p>
            </div>
          </div>

          <Button 
            variant="secondary" 
            size="sm" 
            icon={RefreshCw} 
            onClick={loadQueueSummary} 
            isLoading={isRefreshingQueue}
            title="Refresh Queue Count"
          >
            Refresh Status
          </Button>
        </div>

        {/* 3 Queue Metrics Dashboard Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between shadow-none">
            <div>
              <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Queued in System</div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">{queueSummary.pendingCount}</div>
              <div className="text-[10.5px] text-slate-500 dark:text-slate-400 mt-0.5">Awaiting transmission</div>
            </div>
            <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between shadow-none">
            <div>
              <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Next Batch Ready</div>
              <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-0.5">{nextBatchCount} <span className="text-xs font-medium text-slate-500">/ 10 max</span></div>
              <div className="text-[10.5px] text-slate-500 dark:text-slate-400 mt-0.5">Ready for next click</div>
            </div>
            <div className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
              <Send className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between shadow-none">
            <div>
              <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Dispatched Today</div>
              <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">{queueSummary.todaySentCount || 0}</div>
              <div className="text-[10.5px] text-slate-500 dark:text-slate-400 mt-0.5">
                {queueSummary.lastSentAt ? `Last: ${new Date(queueSummary.lastSentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'No emails sent today'}
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              <Check className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* 4-Step Google App Password Guide */}
        <div className="p-4 bg-gradient-to-r from-sky-50 to-indigo-50 dark:from-slate-800 dark:to-slate-850 rounded-xl border border-sky-200 dark:border-slate-700 space-y-3 shadow-none">
          <div className="flex items-center gap-2 text-xs font-bold text-sky-900 dark:text-sky-200">
            <ShieldCheck className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <span>How to get your 16-character Google App Password (Required for Gmail)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
            <div className="p-2.5 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-sky-100 dark:border-slate-700 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-sky-700 dark:text-sky-300">
                <span className="w-4 h-4 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 flex items-center justify-center text-[10px] font-bold">1</span>
                <span>Open Google Security</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                Go to <strong className="text-slate-800 dark:text-slate-200">myaccount.google.com</strong> and click <strong className="text-slate-800 dark:text-slate-200">Security</strong>.
              </p>
            </div>

            <div className="p-2.5 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-sky-100 dark:border-slate-700 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-sky-700 dark:text-sky-300">
                <span className="w-4 h-4 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 flex items-center justify-center text-[10px] font-bold">2</span>
                <span>2-Step Verification</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                Ensure <strong className="text-slate-800 dark:text-slate-200">2-Step Verification</strong> is switched <strong className="text-emerald-600 dark:text-emerald-400">ON</strong>.
              </p>
            </div>

            <div className="p-2.5 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-sky-100 dark:border-slate-700 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-sky-700 dark:text-sky-300">
                <span className="w-4 h-4 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 flex items-center justify-center text-[10px] font-bold">3</span>
                <span>Search App Passwords</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                Type <strong className="text-slate-800 dark:text-slate-200">"App Passwords"</strong> in the search bar at top of Google Account.
              </p>
            </div>

            <div className="p-2.5 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-sky-100 dark:border-slate-700 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                <span className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-[10px] font-bold">4</span>
                <span>Generate &amp; Paste</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                Name app <strong className="text-slate-800 dark:text-slate-200">"Shepherd Billing"</strong>, copy 16-character code, and paste below.
              </p>
            </div>
          </div>
        </div>

        {/* Credentials Form (Cleaned: Host & Port hidden from view) */}
        <form onSubmit={handleSaveEmailSettings} className="space-y-4 pt-1">
          <Input
            label="Receiver Email Address (Destination for Invoice PDFs)"
            placeholder="e.g. recipient-backup@gmail.com"
            value={backupEmail}
            onChange={(e) => setBackupEmail(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Sender Email Address (Your Gmail Account)"
              placeholder="e.g. your-company@gmail.com"
              value={smtpUser}
              onChange={(e) => setSmtpUser(e.target.value)}
              required
            />

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                Google App Password (16 characters)
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter 16-character App Password"
                  value={smtpPass}
                  onChange={(e) => setSmtpPass(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-sky-500 transition-colors pr-10 shadow-none font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Action Button Strip with 10-Invoice Batch Dispatch */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex flex-wrap items-center gap-3">
              {/* Batch Send Button */}
              <Button 
                type="button" 
                variant="primary" 
                icon={Send} 
                onClick={handleSendQueuedEmails} 
                isLoading={isSendingQueue}
                disabled={queueSummary.pendingCount === 0}
              >
                {queueSummary.pendingCount > 10 
                  ? `Send Next Batch (10 Invoices)` 
                  : queueSummary.pendingCount > 0 
                    ? `Send Batch (${queueSummary.pendingCount} Invoice${queueSummary.pendingCount > 1 ? 's' : ''})`
                    : 'Queue All Clear'}
              </Button>

              <Button 
                type="button" 
                variant="secondary" 
                icon={Mail} 
                onClick={handleTestEmail} 
                isLoading={isTestingEmail}
              >
                Test Connection
              </Button>

              <Button 
                type="submit" 
                variant="secondary" 
                icon={Save} 
                isLoading={isSavingSettings}
              >
                Save Credentials
              </Button>
            </div>
          </div>
        </form>
      </div>

      <Dialog
        isOpen={showRestoreConfirm}
        onClose={() => setShowRestoreConfirm(false)}
        onConfirm={handleRestore}
        title="Confirm Database Migration & Restore"
        message="Importing and restoring a migration package will replace the active SQLite database on this computer with the backup archive. An automatic safety snapshot of your current database will be saved before replacing. Would you like to select the backup file now?"
        confirmText="Select Backup Archive (.zip)"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}


