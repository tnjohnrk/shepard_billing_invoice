import React, { useState, useEffect } from 'react';
import { HardDriveDownload, RotateCcw, Mail, RefreshCw, Save, Laptop, ArrowRight, CheckCircle2, ShieldCheck, HelpCircle } from 'lucide-react';
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
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isTestingEmail, setIsTestingEmail] = useState(false);

  useEffect(() => {
    loadSettings();
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

  const handleSaveEmailSettings = async (e) => {
    if (e) e.preventDefault();
    setIsSavingSettings(true);
    try {
      await ipcClient.setSetting('backup_email', backupEmail);
      await ipcClient.setSetting('smtp_host', smtpHost);
      await ipcClient.setSetting('smtp_port', smtpPort);
      await ipcClient.setSetting('smtp_user', smtpUser);
      await ipcClient.setSetting('smtp_pass', smtpPass);
      toast('success', 'Email Backup & SMTP settings saved!');
    } catch (err) {
      toast('error', err.message || 'Failed to save email settings.');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleTestEmail = async () => {
    if (!smtpHost || !smtpUser || !smtpPass) {
      toast('error', 'Please fill in SMTP Host, Username, and Password before testing.');
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
      toast('error', err.message || 'SMTP connection failed. Check host, port, or app password.');
    } finally {
      setIsTestingEmail(false);
    }
  };

  const handleRetryQueue = async () => {
    setIsProcessingQueue(true);
    try {
      await ipcClient.retryEmailQueue();
      toast('success', 'Processed pending email backup queue!');
    } catch (err) {
      toast('error', err.message || 'Email queue processing failed.');
    } finally {
      setIsProcessingQueue(false);
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
      <div className="p-6 glass-panel rounded-xl border border-indigo-500/30 bg-indigo-950/20 space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Laptop className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-100">Data Migration & Computer Transfer</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase">
                  System Transfer
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Easily move 100% of your billing data (all Tax Invoices, Proformas, Customers, and Settings) from this computer to any new computer or laptop.
              </p>
            </div>
          </div>
        </div>

        {/* 3-Step Migration Guide */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          <div className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-400">
              <span className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center text-[10px]">1</span>
              <span>Export on Old PC</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Click <strong>Export Migration Package</strong> to save your full database to a USB drive or cloud folder.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-400">
              <span className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center text-[10px]">2</span>
              <span>Install on New PC</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Install the Shepherd Invoice application on the new computer and plug in your USB drive.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-[10px]">3</span>
              <span>Import on New PC</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
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

      {/* Email Backup & SMTP Settings Section */}
      <div className="p-5 glass-panel rounded-xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-200">Off-Site Email Backup (Automated SMTP)</h3>
            <p className="text-xs text-slate-400">Automatically send a compressed SQLite backup copy to your email address every time an invoice is created.</p>
          </div>
          <Button variant="secondary" size="sm" icon={RefreshCw} onClick={handleRetryQueue} isLoading={isProcessingQueue}>
            Retry Email Queue
          </Button>
        </div>

        <form onSubmit={handleSaveEmailSettings} className="space-y-4 pt-2">
          <Input
            label="Backup Recipient Email Address"
            placeholder="e.g. tnjohnrk@gmail.com"
            value={backupEmail}
            onChange={(e) => setBackupEmail(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="SMTP Server Host"
              placeholder="e.g. smtp.gmail.com"
              value={smtpHost}
              onChange={(e) => setSmtpHost(e.target.value)}
            />

            <Input
              label="SMTP Port"
              placeholder="e.g. 587 or 465"
              value={smtpPort}
              onChange={(e) => setSmtpPort(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="SMTP Sender Email / Username"
              placeholder="e.g. your-company@gmail.com"
              value={smtpUser}
              onChange={(e) => setSmtpUser(e.target.value)}
            />

            <Input
              label="SMTP Password / Gmail App Password"
              type="password"
              placeholder="Enter App Password"
              value={smtpPass}
              onChange={(e) => setSmtpPass(e.target.value)}
            />
          </div>

          <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 text-[11px] text-slate-300 space-y-1">
            <div className="font-semibold text-slate-200">💡 Google / Gmail Setup Instructions:</div>
            <div>• Use <strong>smtp.gmail.com</strong> on port <strong>587</strong> (TLS) or <strong>465</strong> (SSL).</div>
            <div>• Google requires a <strong>16-character App Password</strong> (not your regular account password).</div>
            <div>• Generate one via: <em>Google Account &gt; Security &gt; 2-Step Verification &gt; App Passwords</em>.</div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Button type="submit" variant="primary" icon={Save} isLoading={isSavingSettings}>
              Save Email & SMTP Settings
            </Button>

            <Button type="button" variant="secondary" icon={Mail} onClick={handleTestEmail} isLoading={isTestingEmail}>
              Send Test Email
            </Button>
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

