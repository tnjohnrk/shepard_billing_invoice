import nodemailer from 'nodemailer';
import { getSetting } from '../repositories/settingsRepository.js';
import { COMPANY_CONFIG } from '../config/companyConfig.js';

function getSmtpConfig(overrideSettings = {}) {
  const smtpHost = overrideSettings.smtp_host ?? getSetting('smtp_host', '');
  const smtpPort = parseInt(overrideSettings.smtp_port ?? getSetting('smtp_port', '587'), 10);
  const smtpUser = overrideSettings.smtp_user ?? getSetting('smtp_user', '');
  const smtpPass = overrideSettings.smtp_pass ?? getSetting('smtp_pass', '');
  const recipient = overrideSettings.backup_email ?? getSetting('backup_email', '') || COMPANY_CONFIG.backup_email;

  return { smtpHost, smtpPort, smtpUser, smtpPass, recipient };
}

function createTransporter(config) {
  const { smtpHost, smtpPort, smtpUser, smtpPass } = config;

  if (!smtpHost || !smtpUser || !smtpPass) {
    throw new Error('SMTP credentials not configured. Please enter SMTP Host, Username, and Password.');
  }

  return nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass
    },
    connectionTimeout: 10000,
    tls: {
      rejectUnauthorized: false
    }
  });
}

export async function sendBackupEmail(backupPath, recipientEmailOverride = null) {
  const config = getSmtpConfig();
  const recipient = recipientEmailOverride || config.recipient;

  const transporter = createTransporter(config);

  const mailOptions = {
    from: `"${COMPANY_CONFIG.name}" <${config.smtpUser}>`,
    to: recipient,
    subject: `[Automatic Backup] ${COMPANY_CONFIG.name} Database Backup`,
    text: `Attached is the automatic backup of the Shepherd Enterprises Billing System database created on ${new Date().toLocaleString()}.`,
    attachments: [
      {
        path: backupPath
      }
    ]
  };

  const info = await transporter.sendMail(mailOptions);
  return info;
}

export async function testSmtpConnection(settings = {}) {
  const config = getSmtpConfig(settings);
  const transporter = createTransporter(config);

  // Verify SMTP server handshake
  await transporter.verify();

  // Send test message
  const testInfo = await transporter.sendMail({
    from: `"${COMPANY_CONFIG.name}" <${config.smtpUser}>`,
    to: config.recipient,
    subject: `[Test Verification] Shepherd Enterprises Email Backup Test`,
    text: `This is a test verification email sent from the Shepherd Enterprises Billing System.\n\nTimestamp: ${new Date().toLocaleString()}\nSMTP Server: ${config.smtpHost}:${config.smtpPort}\nStatus: Verified and Operational.`
  });

  return {
    success: true,
    message: `Test email sent successfully to ${config.recipient}!`,
    messageId: testInfo.messageId
  };
}
