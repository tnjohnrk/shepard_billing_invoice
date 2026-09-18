import React, { useState, useEffect } from 'react';
import { HardDriveDownload, RotateCcw, Mail, RefreshCw, Save } from 'lucide-react';
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
      if (!res.canceled) {
        toast('success', `Backup saved to: ${res.backupPath}`);
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
        toast('success', `Database restored successfully! Safety snapshot created at ${res.safetySnapshot}`);
        window.location.reload();
      }
    } catch (err) {
      toast('error', err.message || 'Restore failed.');
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Manual Backup & Restore Section */}
      <div className="p-5 glass-panel rounded-xl border border-slate-800 space-y-4">
        <h3 className="text-sm font-semibold text-slate-200">Manual Database Backup & Restore</h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Create complete zipped backups of your SQLite database or restore from a previously saved backup archive file. Automatic backups are also performed seamlessly on every invoice creation.
        </p>

        <div className="flex flex-wrap gap-4 pt-2">
          <Button variant="primary" icon={HardDriveDownload} onClick={handleCreateBackup} isLoading={isBackingUp}>
            Create Manual Backup
          </Button>

          <Button variant="danger" icon={RotateCcw} onClick={() => setShowRestoreConfirm(true)} isLoading={isRestoring}>
            Restore Database from Backup File
          </Button>
        </div>
      </div>

      {/* Email Backup & SMTP Settings Section */}
      <div className="p-5 glass-panel rounded-xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-200">Email Backup & SMTP Configuration</h3>
            <p className="text-xs text-slate-400">Configure recipient email and SMTP server for automatic database backup emails.</p>
          </div>
          <Button variant="secondary" size="sm" icon={RefreshCw} onClick={handleRetryQueue} isLoading={isProcessingQueue}>
            Retry Email Queue Now
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
            <div>• Google requires a <strong>16-character App Password</strong> (not your standard email password).</div>
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
        title="Confirm Database Restoration"
        message="Restoring from a backup will replace your current active SQLite database. An automatic safety snapshot of your current database will be created first before replacing. Are you sure you want to proceed?"
        confirmText="Select Backup & Restore"
        variant="danger"
      />
    </div>
  );
}
