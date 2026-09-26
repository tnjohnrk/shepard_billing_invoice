import nodemailer from 'nodemailer';
import { getSetting } from '../repositories/settingsRepository.js';
import { COMPANY_CONFIG } from '../config/companyConfig.js';

export function translateSmtpError(err) {
  if (!err) return 'Email transmission failed. Please verify credentials.';
  const str = String(err?.message || err || '').toLowerCase();
  const code = String(err?.code || '').toUpperCase();
  const response = String(err?.response || '').toLowerCase();

  if (
    code === 'EAUTH' || 
    str.includes('535') || 
    str.includes('authentication failed') || 
    str.includes('invalid login') || 
    str.includes('badcredentials') || 
    str.includes('username and password not accepted') ||
    str.includes('application-specific password')
  ) {
    return 'Wrong Google App Password. Please check your 16-character App Password or generate a new one in Google Account Security.';
  }

  if (
    code === 'EENVELOPE' || 
    str.includes('recipient') || 
    str.includes('550 5.1.1') || 
    str.includes('no recipients') || 
    str.includes('invalid address') || 
    str.includes('syntax error in') ||
    str.includes('must provide')
  ) {
    return 'Invalid email address. Please check both Sender Email and Receiver Email addresses.';
  }

  if (
    code === 'ETIMEDOUT' || 
    code === 'ECONNREFUSED' || 
    code === 'ENOTFOUND' || 
    code === 'ESOCKET' || 
    str.includes('timeout') || 
    str.includes('getaddrinfo') || 
    str.includes('network') ||
    str.includes('econnreset')
  ) {
    return 'Connection timeout or no internet. Unable to connect to Gmail SMTP server. Please check your network connection.';
  }

  if (str.includes('quota') || str.includes('limit') || str.includes('550 5.7.1') || response.includes('quota')) {
    return 'Daily Gmail sending quota reached. Please wait before dispatching the next batch.';
  }

  if (str.includes('credentials not configured') || str.includes('required')) {
    return 'Sender Email, Receiver Email, and 16-character App Password are required.';
  }

  return (err?.message || 'SMTP Connection failed.').replace(/^Error:\s*/, '');
}

function getSmtpConfig(overrideSettings = {}) {
  // Default to standard Gmail SMTP Host and TLS Port 587
  const smtpHost = (overrideSettings.smtp_host || getSetting('smtp_host', '') || 'smtp.gmail.com').trim();
  const rawPort = overrideSettings.smtp_port || getSetting('smtp_port', '587');
  const smtpPort = parseInt(rawPort, 10) || 587;
  const smtpUser = (overrideSettings.smtp_user || getSetting('smtp_user', '')).trim();
  const smtpPass = (overrideSettings.smtp_pass || getSetting('smtp_pass', '')).trim();
  const recipient = (overrideSettings.backup_email || getSetting('backup_email', '') || COMPANY_CONFIG.backup_email || '').trim();

  return { smtpHost, smtpPort, smtpUser, smtpPass, recipient };
}

function createTransporter(config) {
  const { smtpHost, smtpPort, smtpUser, smtpPass } = config;

  if (!smtpUser || !smtpPass) {
    throw new Error('Sender Email and Google App Password are required.');
  }

  return nodemailer.createTransport({
    host: smtpHost || 'smtp.gmail.com',
    port: smtpPort || 587,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass
    },
    connectionTimeout: 12000,
    tls: {
      rejectUnauthorized: false
    }
  });
}

export async function sendInvoicePdfEmail({ pdfPath, docNumber, docType = 'NORMAL', invoiceData = null, recipient = null, overrideSettings = {} }) {
  const config = getSmtpConfig(overrideSettings);
  const targetRecipient = (recipient || overrideSettings.backup_email || config.recipient || '').trim();

  if (!targetRecipient) {
    throw new Error('Receiver email address is required.');
  }

  const isProforma = docType === 'PROFORMA' || Boolean(invoiceData?.proforma_number) || String(invoiceData?.invoice_type).toUpperCase() === 'PROFORMA';
  const label = isProforma ? 'Proforma Invoice' : 'Invoice';
  const cleanDocNum = docNumber || (isProforma ? invoiceData?.proforma_number : invoiceData?.invoice_number) || 'Document';

  try {
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
  } catch (err) {
    throw new Error(translateSmtpError(err));
  }
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

  if (!config.recipient || !config.smtpUser || !config.smtpPass) {
    throw new Error('Please fill in Receiver Email, Sender Email, and 16-character App Password.');
  }

  try {
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
  } catch (err) {
    throw new Error(translateSmtpError(err));
  }
}

