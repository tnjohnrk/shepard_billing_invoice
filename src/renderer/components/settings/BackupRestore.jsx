import React, { useState, useEffect } from 'react';
import { 
  HardDriveDownload, RotateCcw, Mail, RefreshCw, Save, Laptop, 
  ArrowRight, CheckCircle2, ShieldCheck, HelpCircle, Send, 
  Clock, AlertCircle, Eye, EyeOff, Check, Trash2 
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
      toast('error', 'Please fill in Receiver Email, Sender Email, and App Password first.');
      return;
    }

    if (queueSummary.pendingCount === 0) {
      toast('info', 'There are no pending backup emails in the queue.');
      return;
    }

    setIsSendingQueue(true);
    try {
      // Save credentials first
      await ipcClient.setSetting('backup_email', backupEmail);
      await ipcClient.setSetting('smtp_host', smtpHost);
      await ipcClient.setSetting('smtp_port', smtpPort);
      await ipcClient.setSetting('smtp_user', smtpUser);
      await ipcClient.setSetting('smtp_pass', smtpPass);

      const res = await ipcClient.sendQueuedEmailBackups({
        backup_email: backupEmail,
        smtp_host: smtpHost,
        smtp_port: smtpPort,
        smtp_user: smtpUser,
        smtp_pass: smtpPass
      });

      if (res && res.success) {
        toast('success', res.message || `Successfully sent ${res.sent} queued backup(s) to ${backupEmail}!`);
      } else if (res && res.sent > 0) {
        toast('warning', res.message || `Sent ${res.sent} backups, but ${res.failed} failed.`);
      } else {
        toast('error', res?.errors?.[0] || res?.message || 'Failed to send queued emails. Check SMTP connection.');
      }

      await loadQueueSummary();
    } catch (err) {
      toast('error', err.message || 'Failed to dispatch email queue.');
    } finally {
      setIsSendingQueue(false);
    }
  };

  const handleClearSent = async () => {
    try {
      await ipcClient.clearSentEmailQueue();
      toast('info', 'Cleaned up sent backup history records.');
      await loadQueueSummary();
    } catch (err) {
      toast('error', err.message || 'Failed to clear sent queue.');
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

  return (
    <div className="space-y-6">
      {/* System Migration & Transfer Card */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-300 dark:border-slate-700 space-y-5 shadow-none">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
              <Laptop className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Data Migration & Computer Transfer</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 uppercase">
                  System Transfer
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                Easily move 100% of your billing data (all Tax Invoices, Proformas, Customers, and Settings) from this computer to any new computer or laptop.
              </p>
            </div>
          </div>
        </div>

        {/* 3-Step Migration Guide */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400">
              <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-[10px]">1</span>
              <span>Export on Old PC</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
              Click <strong>Export Migration Package</strong> to save your full database to a USB drive or cloud folder.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400">
              <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-[10px]">2</span>
              <span>Install on New PC</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
              Install the Shepherd Invoice application on the new computer and plug in your USB drive.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-[10px]">3</span>
              <span>Import on New PC</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
              Open <strong>Settings &gt; Backup</strong> on the new PC and click <strong>Import &amp; Restore</strong>. All data will load instantly!
            </p>
          </div>
        </div>

        {/* Action Buttons for Migration */}
        <div className="flex flex-wrap gap-4 pt-2">
          <Button variant="primary" icon={HardDriveDownload} onClick={handleCreateBackup} isLoading={isBackingUp}>
            Export Migration Package (.zip)
          </Button>

          <Button variant="danger" icon={RotateCcw} onClick={() => setShowRestoreConfirm(true)} isLoading={isRestoring}>
            Import &amp; Restore on this PC
          </Button>
        </div>
      </div>

      {/* Email Backup & Queue Section */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-300 dark:border-slate-700 space-y-6 shadow-none">
        
        {/* Header with Title & Queue Status Badge */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-cyan-50 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Email Dispatch Queue (Invoice PDFs)</h3>
                {queueSummary.pendingCount > 0 ? (
                  <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                    <Clock className="w-3.5 h-3.5" />
                    {queueSummary.pendingCount} Pending Invoice PDF{queueSummary.pendingCount > 1 ? 's' : ''}
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Queue All Clear
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Every invoice and proforma saved is safely queued locally (works offline). Enter your credentials below and click <strong>Send All Queued Invoices</strong> to dispatch official PDF copies directly to your receiver email address.
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

        {/* Queue Metrics Dashboard */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between shadow-none">
            <div>
              <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Pending PDFs in Queue</div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">{queueSummary.pendingCount}</div>
            </div>
            <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between shadow-none">
            <div>
              <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Successfully Dispatched</div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">{queueSummary.sentCount}</div>
            </div>
            <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              <Check className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between shadow-none">
            <div>
              <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Last Sent Timestamp</div>
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-1">
                {queueSummary.lastSentAt ? new Date(queueSummary.lastSentAt).toLocaleString() : 'No emails sent yet'}
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-cyan-50 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800">
              <Mail className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSaveEmailSettings} className="space-y-4 pt-1">
          <Input
            label="Receiver Email Address (Destination for Invoice PDFs)"
            placeholder="e.g. tnjohnrk@gmail.com"
            value={backupEmail}
            onChange={(e) => setBackupEmail(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Sender Email Address (SMTP Username / Google Account)"
              placeholder="e.g. your-company@gmail.com"
              value={smtpUser}
              onChange={(e) => setSmtpUser(e.target.value)}
              required
            />

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                Google App Password (16 characters) / SMTP Password
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="SMTP Server Host"
              placeholder="e.g. smtp.gmail.com"
              value={smtpHost}
              onChange={(e) => setSmtpHost(e.target.value)}
            />

            <Input
              label="SMTP Port"
              placeholder="e.g. 587 (TLS) or 465 (SSL)"
              value={smtpPort}
              onChange={(e) => setSmtpPort(e.target.value)}
            />
          </div>

          {/* Google App Password Guide Note */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-[11px] text-slate-700 dark:text-slate-300 space-y-1.5 shadow-none">
            <div className="font-bold text-slate-900 dark:text-slate-200 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Gmail Setup Note:</span>
            </div>
            <div>• Use <strong>smtp.gmail.com</strong> on port <strong>587</strong> (TLS).</div>
            <div>• Google requires a <strong>16-character App Password</strong> (not your regular account password).</div>
            <div>• Generate one in: <em>Google Account &gt; Security &gt; 2-Step Verification &gt; App Passwords</em>.</div>
          </div>

          {/* Action Button Strip */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex flex-wrap items-center gap-3">
              {/* Primary Send Button */}
              <Button 
                type="button" 
                variant="primary" 
                icon={Send} 
                onClick={handleSendQueuedEmails} 
                isLoading={isSendingQueue}
              >
                Send All Queued Invoices ({queueSummary.pendingCount})
              </Button>

              <Button 
                type="button" 
                variant="secondary" 
                icon={Mail} 
                onClick={handleTestEmail} 
                isLoading={isTestingEmail}
              >
                Test SMTP Connection
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

            {queueSummary.sentCount > 0 && (
              <button
                type="button"
                onClick={handleClearSent}
                className="text-[11px] text-slate-500 hover:text-rose-400 flex items-center gap-1 transition-colors px-2 py-1"
                title="Clear sent queue history"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Sent History ({queueSummary.sentCount})</span>
              </button>
            )}
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


