import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { COMPANY_CONFIG } from '../../config/companyConfig.js';
import { TEMPLATE_CONFIG } from './templateConfig.js';
import { getCopyTypeLabel } from '../../../shared/constants/copyTypes.js';

export function renderInvoiceHtml(invoiceData) {
  const htmlPath = path.join(__dirname, 'invoiceTemplate.html');
  const cssPath = path.join(__dirname, 'invoiceTemplate.css');

  let htmlTemplate = fs.readFileSync(htmlPath, 'utf8');
  let cssContent = fs.readFileSync(cssPath, 'utf8');

  const isProforma = String(invoiceData.invoice_type).toUpperCase() === 'PROFORMA';
  const docType = isProforma ? 'PROFORMA INVOICE' : 'INVOICE';
  const docNum = isProforma ? (invoiceData.proforma_number || '') : (invoiceData.invoice_number || '');
  const docDate = (isProforma ? invoiceData.proforma_date : invoiceData.invoice_date) || '';
  const copyTypeLabel = getCopyTypeLabel(invoiceData.copy_type, isProforma);

  // Read and encode company logo to base64 Data URI
  const logoPath = path.join(__dirname, 'logo.png');
  let logoHtml = '';
  if (fs.existsSync(logoPath)) {
    const logoBase64 = fs.readFileSync(logoPath).toString('base64');
    logoHtml = `<img src="data:image/png;base64,${logoBase64}" alt="Shepherd Enterprises" class="header-logo-img" />`;
  }

  // Build reference block string for line items (S.O. No, GEMC No, Ref)
  const refs = [];
  if (invoiceData.so_po_number) {
    let soText = `S.O. No: ${escapeHtml(invoiceData.so_po_number)}`;
    if (invoiceData.so_po_date) {
      soText += ` Dt: ${escapeHtml(invoiceData.so_po_date)}`;
    }
    refs.push(soText);
  }
  if (invoiceData.gemc_number) {
    refs.push(`GEMC - ${escapeHtml(invoiceData.gemc_number)}`);
  }
  if (invoiceData.reference_number) {
    refs.push(`Ref: ${escapeHtml(invoiceData.reference_number)}`);
  }

  const refsHtml = refs.length > 0
    ? `<div class="item-refs-block">${refs.join('<br>')}</div>`
    : '';

  // Build Item Rows HTML
  const items = invoiceData.items || [];
  let itemRowsHtml = '';

  if (items.length === 0) {
    itemRowsHtml = `
      <tr>
        <td class="col-desc">
          <div class="item-desc-text">-</div>
          ${refsHtml}
        </td>
        <td class="col-hsn">-</td>
        <td class="col-qty">-</td>
        <td class="col-rate">-</td>
        <td class="col-amount">-</td>
      </tr>
    `;
  } else {
    itemRowsHtml = items.map((item, idx) => `
      <tr>
        <td class="col-desc">
          <div class="item-desc-text">${escapeHtml(item.description)}</div>
          ${idx === 0 ? refsHtml : ''}
        </td>
        <td class="col-hsn">${escapeHtml(item.hsn_sac || '-')}</td>
        <td class="col-qty">${item.quantity}</td>
        <td class="col-rate">${formatCurrency(item.rate)}</td>
        <td class="col-amount">${formatCurrency(item.amount || (item.quantity * item.rate))}</td>
      </tr>
    `).join('');
  }

  // Add min spacer row to stretch table body nicely
  itemRowsHtml += `
    <tr class="items-table-spacer">
      <td class="col-desc"></td>
      <td class="col-hsn"></td>
      <td class="col-qty"></td>
      <td class="col-rate"></td>
      <td class="col-amount"></td>
    </tr>
  `;

  // Build Tax Rows HTML
  let taxRowsHtml = '';
  if (invoiceData.cgst_amount > 0 || invoiceData.sgst_amount > 0) {
    taxRowsHtml += `
      <tr>
        <td class="tax-title-col">ADD CGST: ${invoiceData.cgst_rate || 9}%</td>
        <td class="tax-num-col">${formatCurrency(invoiceData.cgst_amount)}</td>
      </tr>
      <tr>
        <td class="tax-title-col">ADD SGST: ${invoiceData.sgst_rate || 9}%</td>
        <td class="tax-num-col">${formatCurrency(invoiceData.sgst_amount)}</td>
      </tr>
    `;
  } else if (invoiceData.igst_amount > 0) {
    taxRowsHtml += `
      <tr>
        <td class="tax-title-col">ADD IGST: ${invoiceData.igst_rate || 18}%</td>
        <td class="tax-num-col">${formatCurrency(invoiceData.igst_amount)}</td>
      </tr>
    `;
  }

  // Round Off row
  let roundOffHtml = '';
  if (invoiceData.roundOff && invoiceData.roundOff !== 0) {
    roundOffHtml = `
      <tr>
        <td class="tax-title-col">ROUND OFF</td>
        <td class="tax-num-col">${invoiceData.roundOff > 0 ? '+' : ''}${formatCurrency(invoiceData.roundOff)}</td>
      </tr>
    `;
  }

  // Terms HTML list
  const termsHtml = TEMPLATE_CONFIG.termsAndConditions.map(t => `<div>${escapeHtml(t)}</div>`).join('');

  // Notes HTML
  let notesHtml = '';
  if (invoiceData.notes) {
    notesHtml = `
      <div style="font-size: 8.5px; color: #1f2937; margin-top: 4px;">
        <strong>Notes:</strong> ${escapeHtml(invoiceData.notes)}
      </div>
    `;
  }

  const deliveryAddress = invoiceData.delivery_address || invoiceData.buyer_address || '';

  // Perform replacements
  let rendered = htmlTemplate
    .replace('{{CSS_CONTENT}}', cssContent)
    .replace('{{COMPANY_LOGO_HTML}}', logoHtml)
    .replace('{{COMPANY_NAME_SHORT}}', 'SHEPHERD ENTERPRISES')
    .replace('{{COMPANY_UPI_ID}}', COMPANY_CONFIG.upi_id ? `@${COMPANY_CONFIG.upi_id.split('@')[1] || 'icici'}` : '@icici')
    .replace(/{{DOC_TYPE}}/g, docType)
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
    .replace('{{DELIVERY_ADDRESS}}', escapeHtml(deliveryAddress))
    .replace('{{BUYER_GSTIN}}', escapeHtml(invoiceData.customer_gstin || 'N/A'))
    .replace('{{BUYER_STATE}}', escapeHtml(invoiceData.customer_state || ''))
    .replace('{{BUYER_STATE_CODE}}', escapeHtml(invoiceData.customer_state_code || ''))
    .replace('{{INVOICE_DATE}}', docDate)
    .replace('{{DATE_OF_SUPPLY}}', escapeHtml(invoiceData.date_of_supply || docDate || '-'))
    .replace('{{TRANSPORTATION_MODE}}', escapeHtml(invoiceData.transportation_mode || '-'))
    .replace('{{VEHICLE_NUMBER}}', escapeHtml(invoiceData.vehicle_number || '-'))
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
    .replace('{{DECLARATION}}', 'CERTIFIED THAT ABOVE INFORMATION ARE TRUE AND CORRECT')
    .replace('{{AUTHORIZED_SIGNATORY_LABEL}}', `For ${COMPANY_CONFIG.name}`);

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

