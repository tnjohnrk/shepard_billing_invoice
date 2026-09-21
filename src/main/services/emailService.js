import nodemailer from 'nodemailer';
import { getSetting } from '../repositories/settingsRepository.js';
import { COMPANY_CONFIG } from '../config/companyConfig.js';

function getSmtpConfig(overrideSettings = {}) {
  const smtpHost = overrideSettings.smtp_host ?? getSetting('smtp_host', '');
  const smtpPort = parseInt(overrideSettings.smtp_port ?? getSetting('smtp_port', '587'), 10);
  const smtpUser = overrideSettings.smtp_user ?? getSetting('smtp_user', '');
  const smtpPass = overrideSettings.smtp_pass ?? getSetting('smtp_pass', '');
  const recipient = overrideSettings.backup_email || getSetting('backup_email', '') || COMPANY_CONFIG.backup_email;

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

export async function sendInvoicePdfEmail({ pdfPath, docNumber, docType = 'NORMAL', invoiceData = null, recipient = null, overrideSettings = {} }) {
  const config = getSmtpConfig(overrideSettings);
  const targetRecipient = recipient || overrideSettings.backup_email || config.recipient;

  if (!targetRecipient) {
    throw new Error('Receiver email address is required.');
  }

  const isProforma = docType === 'PROFORMA' || Boolean(invoiceData?.proforma_number) || String(invoiceData?.invoice_type).toUpperCase() === 'PROFORMA';
  const label = isProforma ? 'Proforma Invoice' : 'Invoice';
  const cleanDocNum = docNumber || (isProforma ? invoiceData?.proforma_number : invoiceData?.invoice_number) || 'Document';

  const transporter = createTransporter(config);

  const subject = `${label} ${cleanDocNum} - ${COMPANY_CONFIG.name}`;
  const docDate = (isProforma ? invoiceData?.proforma_date : invoiceData?.invoice_date) || new Date().toISOString().split('T')[0];
  const grandTotal = invoiceData?.grand_total ? `₹${Number(invoiceData.grand_total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : null;

  let bodyText = `Dear Customer / Recipient,\n\nPlease find attached the official PDF of ${label} ${cleanDocNum}.\n\n`;
  bodyText += `• Document Number: ${cleanDocNum}\n`;
  bodyText += `• Date of Issue: ${docDate}\n`;
  if (grandTotal) {
    bodyText += `• Total Amount: ${grandTotal}\n`;
  }
  bodyText += `\nThank you for your business.\n\nBest Regards,\n${COMPANY_CONFIG.name}`;

  const mailOptions = {
    from: `"${COMPANY_CONFIG.name}" <${config.smtpUser}>`,
    to: targetRecipient,
    subject,
    text: bodyText,
    attachments: [
      {
        filename: `${cleanDocNum}.pdf`,
        path: pdfPath,
        contentType: 'application/pdf'
      }
    ]
  };

  const info = await transporter.sendMail(mailOptions);
  return info;
}

export async function sendBackupEmail(backupPath, recipientEmailOverride = null, overrideSettings = {}) {
  return sendInvoicePdfEmail({
    pdfPath: backupPath,
    docNumber: 'Document',
    recipient: recipientEmailOverride,
    overrideSettings
  });
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
    subject: `[Test Verification] Shepherd Enterprises Email Delivery Test`,
    text: `This is a test verification email from the Shepherd Enterprises Billing System.\n\nTimestamp: ${new Date().toLocaleString()}\nStatus: SMTP Verified and Operational.`
  });

  return {
    success: true,
    message: `Test email sent successfully to ${config.recipient}!`,
    messageId: testInfo.messageId
  };
}

