import fs from 'fs';
import path from 'path';
import { COMPANY_CONFIG } from '../../config/companyConfig.js';
import { TEMPLATE_CONFIG } from './templateConfig.js';
import { COPY_TYPE_LABELS } from '../../../shared/constants/copyTypes.js';

export function renderInvoiceHtml(invoiceData) {
  const htmlPath = path.join(__dirname, 'invoiceTemplate.html');
  const cssPath = path.join(__dirname, 'invoiceTemplate.css');

  let htmlTemplate = fs.readFileSync(htmlPath, 'utf8');
  let cssContent = fs.readFileSync(cssPath, 'utf8');

  const isProforma = String(invoiceData.invoice_type).toUpperCase() === 'PROFORMA';
  const docType = isProforma ? TEMPLATE_CONFIG.proformaHeaderTitle : TEMPLATE_CONFIG.headerTitle;
  const docNumLabel = isProforma ? 'Proforma No' : 'Invoice No';
  const docNum = isProforma ? (invoiceData.proforma_number || '') : (invoiceData.invoice_number || '');
  const docDate = (isProforma ? invoiceData.proforma_date : invoiceData.invoice_date) || '';
  const copyTypeLabel = COPY_TYPE_LABELS[invoiceData.copy_type] || COPY_TYPE_LABELS.ORIGINAL;

  // Build Item Rows HTML
  const items = invoiceData.items || [];
  let itemRowsHtml = items.map((item, idx) => `
    <tr>
      <td class="text-center">${idx + 1}</td>
      <td><strong>${escapeHtml(item.description)}</strong></td>
      <td class="text-center">${escapeHtml(item.hsn_sac || '-')}</td>
      <td class="text-right">${item.quantity}</td>
      <td class="text-right">${formatCurrency(item.rate)}</td>
      <td class="text-right">${formatCurrency(item.amount)}</td>
    </tr>
  `).join('');

  // Add min empty rows to fill page height cleanly
  const minRows = 6;
  if (items.length < minRows) {
    for (let i = items.length; i < minRows; i++) {
      itemRowsHtml += `
        <tr class="empty-row">
          <td></td><td></td><td></td><td></td><td></td><td></td>
        </tr>
      `;
    }
  }

  // Build Tax Rows HTML
  let taxRowsHtml = '';
  if (invoiceData.cgst_amount > 0 || invoiceData.sgst_amount > 0) {
    taxRowsHtml += `
      <tr>
        <td>CGST @ ${invoiceData.cgst_rate || 9}%</td>
        <td class="text-right">₹${formatCurrency(invoiceData.cgst_amount)}</td>
      </tr>
      <tr>
        <td>SGST @ ${invoiceData.sgst_rate || 9}%</td>
        <td class="text-right">₹${formatCurrency(invoiceData.sgst_amount)}</td>
      </tr>
    `;
  } else if (invoiceData.igst_amount > 0) {
    taxRowsHtml += `
      <tr>
        <td>IGST @ ${invoiceData.igst_rate || 18}%</td>
        <td class="text-right">₹${formatCurrency(invoiceData.igst_amount)}</td>
      </tr>
    `;
  }

  // Round Off row
  let roundOffHtml = '';
  if (invoiceData.roundOff && invoiceData.roundOff !== 0) {
    roundOffHtml = `
      <tr>
        <td>Round Off</td>
        <td class="text-right">${invoiceData.roundOff > 0 ? '+' : ''}${formatCurrency(invoiceData.roundOff)}</td>
      </tr>
    `;
  }

  // PO/SO string
  let soPoInfo = '-';
  if (invoiceData.so_po_number) {
    soPoInfo = invoiceData.so_po_number;
    if (invoiceData.so_po_date) {
      soPoInfo += ` (${invoiceData.so_po_date})`;
    }
  }

  // Terms HTML list
  const termsHtml = TEMPLATE_CONFIG.termsAndConditions.map(t => `<div>${escapeHtml(t)}</div>`).join('');

  // Notes HTML
  let notesHtml = '';
  if (invoiceData.notes) {
    notesHtml = `
      <div class="section-label" style="margin-top: 8px;">Notes / Remarks:</div>
      <div style="font-size: 10px; color: #334155;">${escapeHtml(invoiceData.notes)}</div>
    `;
  }

  // Perform replacements
  let rendered = htmlTemplate
    .replace('{{CSS_CONTENT}}', cssContent)
    .replace(/{{DOC_TYPE}}/g, docType)
    .replace('{{DOC_NUM_LABEL}}', docNumLabel)
    .replace(/{{INVOICE_NUMBER}}/g, docNum)
    .replace('{{COPY_TYPE_LABEL}}', copyTypeLabel)
    .replace('{{COMPANY_NAME}}', COMPANY_CONFIG.name)
    .replace('{{COMPANY_ADDRESS}}', COMPANY_CONFIG.address)
    .replace('{{COMPANY_PHONE}}', COMPANY_CONFIG.phone)
    .replace('{{COMPANY_EMAIL}}', COMPANY_CONFIG.email)
    .replace('{{COMPANY_GSTIN}}', COMPANY_CONFIG.gstin)
    .replace('{{COMPANY_STATE}}', COMPANY_CONFIG.state)
    .replace('{{COMPANY_STATE_CODE}}', COMPANY_CONFIG.state_code)
    .replace('{{BUYER_NAME}}', escapeHtml(invoiceData.buyer_name || ''))
    .replace('{{BUYER_ADDRESS}}', escapeHtml(invoiceData.buyer_address || ''))
    .replace('{{BUYER_GSTIN}}', escapeHtml(invoiceData.customer_gstin || 'N/A'))
    .replace('{{BUYER_STATE}}', escapeHtml(invoiceData.customer_state || ''))
    .replace('{{BUYER_STATE_CODE}}', escapeHtml(invoiceData.customer_state_code || ''))
    .replace('{{INVOICE_DATE}}', docDate)
    .replace('{{TRANSPORTATION_MODE}}', escapeHtml(invoiceData.transportation_mode || '-'))
    .replace('{{VEHICLE_NUMBER}}', escapeHtml(invoiceData.vehicle_number || '-'))
    .replace('{{SO_PO_INFO}}', escapeHtml(soPoInfo))
    .replace('{{GEMC_NUMBER}}', escapeHtml(invoiceData.gemc_number || '-'))
    .replace('{{ITEM_ROWS}}', itemRowsHtml)
    .replace('{{AMOUNT_IN_WORDS}}', invoiceData.amount_in_words || '')
    .replace('{{SUBTOTAL}}', formatCurrency(invoiceData.subtotal))
    .replace('{{TAX_ROWS}}', taxRowsHtml)
    .replace('{{ROUND_OFF_ROW}}', roundOffHtml)
    .replace('{{GRAND_TOTAL}}', formatCurrency(invoiceData.grand_total))
    .replace('{{NOTES_SECTION}}', notesHtml)
    .replace('{{BANK_NAME}}', COMPANY_CONFIG.bank_name)
    .replace('{{ACCOUNT_NUMBER}}', COMPANY_CONFIG.account_number)
    .replace('{{IFSC_CODE}}', COMPANY_CONFIG.ifsc_code)
    .replace('{{BRANCH_NAME}}', COMPANY_CONFIG.branch_name)
    .replace('{{TERMS_AND_CONDITIONS}}', termsHtml)
    .replace('{{DECLARATION}}', TEMPLATE_CONFIG.footerDeclaration)
    .replace('{{AUTHORIZED_SIGNATORY_LABEL}}', TEMPLATE_CONFIG.authorizedSignatoryLabel);

  return rendered;
}

function formatCurrency(val) {
  return (parseFloat(val) || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
