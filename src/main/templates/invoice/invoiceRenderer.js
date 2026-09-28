import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { COMPANY_CONFIG } from '../../config/companyConfig.js';
import { TEMPLATE_CONFIG } from './templateConfig.js';
import { getCopyTypeLabel } from '../../../shared/constants/copyTypes.js';
import { paginateInvoiceItems } from '../../../shared/utils/invoicePagination.js';
import { COMPANY_LOGO_DATA_URI } from '../../../shared/constants/companyLogo.js';

// Embedded bulletproof fallback CSS ensuring PDF and Print are 100% styled in all bundled and packaged environments
export const DEFAULT_INVOICE_CSS = `
/* Exact Hardcoded Print & PDF Layout for Shepherd Enterprises Private Limited */
@page {
  size: A4 portrait;
  margin: 8mm;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 11px;
  line-height: 1.25;
  color: #000;
  background: #fff;
  margin: 0;
  padding: 0;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

.invoice-container {
  width: 100%;
  max-width: 194mm;
  margin: 0 auto;
  padding: 0;
}

.invoice-page {
  width: 100%;
  max-width: 194mm;
  height: 281mm;
  min-height: 281mm;
  max-height: 281mm;
  page-break-after: avoid;
  break-after: avoid;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
}

.invoice-page.is-last-page,
.invoice-page:last-child {
  page-break-after: avoid;
  break-after: avoid;
}

.invoice-box-frame {
  width: 100%;
  height: 100%;
  min-height: 281mm;
  border: 2px solid #000;
  background: #fff;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.top-content {
  display: flex;
  flex-direction: column;
  width: 100%;
  flex: 1;
}

.bottom-content {
  width: 100%;
}

@media print {
  .invoice-page {
    width: 100%;
    max-width: 194mm;
    height: 281mm !important;
    min-height: 281mm !important;
    max-height: 281mm !important;
    margin: 0;
    padding: 0;
    page-break-after: avoid;
    break-after: avoid;
    display: flex !important;
    flex-direction: column !important;
    justify-content: space-between !important;
    overflow: hidden !important;
  }

  .invoice-box-frame {
    width: 100%;
    height: 100% !important;
    min-height: 281mm !important;
    display: flex !important;
    flex-direction: column !important;
    justify-content: space-between !important;
  }
}

/* 1. Header Section */
.header-table {
  width: 100%;
  border-collapse: collapse;
  border-bottom: 2px solid #000;
}

.header-left-col {
  width: 24%;
  vertical-align: middle;
  text-align: center;
  padding: 10px 8px;
  border-right: 1.5px solid #000;
}

.header-logo-img {
  width: 125px;
  height: 125px;
  object-fit: contain;
  display: block;
  margin: 0 auto;
}

.company-sub-brand {
  font-size: 10px;
  font-weight: 900;
  text-transform: uppercase;
  margin-top: 6px;
  letter-spacing: 0.5px;
  color: #0f172a;
  white-space: nowrap;
}

.company-upi-tag {
  font-size: 8px;
  font-family: monospace;
  font-weight: 700;
  color: #1e293b;
  word-break: break-all;
  line-height: 1.25;
  margin-top: 4px;
  max-width: 155px;
  margin-left: auto;
  margin-right: auto;
}

.header-center-col {
  width: 76%;
  vertical-align: middle;
  text-align: center;
  padding: 12px;
}

.company-brand-title {
  font-size: 42px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 12px;
  color: #1e3a8a;
  line-height: 1;
  margin: 0;
  padding-left: 12px;
  white-space: nowrap;
}

.company-sub-title {
  font-size: 19px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 7px;
  color: #1e3a8a;
  line-height: 1.15;
  margin-top: 6px;
  padding-left: 7px;
  white-space: nowrap;
}

.company-address-line {
  font-size: 8.8px;
  font-weight: bold;
  color: #0f172a;
  text-transform: uppercase;
  letter-spacing: 0.2px;
  line-height: 1.3;
  margin-top: 10px;
  margin-bottom: 4px;
  white-space: nowrap;
}

.company-contact-line {
  font-size: 9.5px;
  font-weight: bold;
  color: #020617;
  line-height: 1.3;
  letter-spacing: 0.2px;
  white-space: nowrap;
}

/* 2. Sub Header Row Table */
.sub-header-table {
  width: 100%;
  border-collapse: collapse;
  border-bottom: 2px solid #000;
  font-size: 11px;
}

.sub-header-row td {
  padding: 8px;
  vertical-align: middle;
}

.cell-gstin {
  width: 38%;
  font-size: 12px;
  font-weight: bold;
  border-right: 1.5px solid #000;
}

.cell-doc-title {
  width: 24%;
  text-align: center;
  font-size: 17px;
  font-weight: 900;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: #1e3a8a;
  border-right: 1.5px solid #000;
}

.cell-copy-type {
  width: 38%;
  text-align: right;
  font-size: 11px;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.cont-sub-header {
  background: #f8fafc;
}

/* 3. Meta Grid Table */
.meta-table {
  width: 100%;
  border-collapse: collapse;
  border-bottom: 2px solid #000;
  font-size: 11px;
}

.meta-left-cell {
  width: 50%;
  border-right: 1.5px solid #000;
  border-bottom: 1.5px solid #000;
  padding: 8px;
  vertical-align: top;
}

.meta-right-cell {
  width: 50%;
  border-bottom: 1.5px solid #000;
  padding: 8px;
  vertical-align: top;
}

.meta-field {
  font-size: 11px;
  line-height: 1.35;
  margin-bottom: 4px;
}

.meta-lbl {
  font-weight: bold;
}

.meta-txt {
  font-weight: normal;
}

.meta-field-table {
  width: 100%;
  border-collapse: collapse;
  margin: 0;
  padding: 0;
}

.meta-field-table td {
  padding: 0;
  vertical-align: top;
  border: none !important;
}

.meta-field-lbl {
  width: 1%;
  white-space: nowrap;
  font-size: 11px;
  font-weight: bold;
  line-height: 1.25;
  padding-right: 4px !important;
}

.meta-field-txt {
  vertical-align: top;
  font-size: 10.5px;
  line-height: 1.25;
  white-space: pre-line;
}

.buyer-block {
  margin-top: 4px;
}

.buyer-layout-table {
  width: 100%;
  border-collapse: collapse;
  margin: 0;
  padding: 0;
}

.buyer-layout-table td {
  padding: 0;
  vertical-align: top;
  border: none !important;
}

.buyer-lbl-cell {
  width: 1%;
  white-space: nowrap;
  font-size: 11px;
  font-weight: bold;
  line-height: 1.25;
  padding-right: 4px !important;
}

.buyer-content-cell {
  vertical-align: top;
}

.buyer-name {
  font-size: 11.5px;
  font-weight: 900;
  color: #020617;
  line-height: 1.25;
}

.buyer-addr {
  font-size: 10.5px;
  font-weight: 500;
  color: #0f172a;
  white-space: pre-line;
  line-height: 1.25;
}

/* Customer GSTIN Row */
.customer-info-row td {
  padding: 8px;
  vertical-align: middle;
}

.cust-gstin-cell {
  width: 50%;
  border-right: 1.5px solid #000;
  font-size: 11.5px;
  font-weight: bold;
}

.cust-state-cell {
  width: 50%;
  font-size: 11px;
}

/* 4. Items Grid Table */
.items-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  border-bottom: 2px solid #000;
  font-size: 11px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.items-table thead {
  width: 100%;
}

.items-head-row {
  display: flex;
  width: 100%;
  background: #ffffff;
  border-bottom: 2px solid #000;
  font-size: 10.5px;
  font-weight: bold;
  text-transform: uppercase;
}

.items-head-row th {
  border-right: 1.5px solid #000;
  border-bottom: none;
  background: #ffffff;
  font-size: 10.5px;
  font-weight: bold;
  padding: 8px 10px;
  box-sizing: border-box;
}

.items-head-row th.col-desc {
  padding: 8px 12px;
  text-align: left;
}

.items-head-row th.col-amount {
  border-right: none;
  text-align: right;
}

.items-table tbody {
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.item-data-row {
  display: flex;
  width: 100%;
  min-height: 34px;
  border-bottom: 1.5px solid #000;
  align-items: stretch;
  box-sizing: border-box;
}

.item-data-row td {
  border-right: 1.5px solid #000;
  border-bottom: none;
  padding: 6px 10px;
  font-size: 11px;
  box-sizing: border-box;
}

.item-data-row td.col-desc {
  padding: 6px 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.item-data-row td.col-hsn {
  text-align: center;
  font-family: monospace;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
}

.item-data-row td.col-qty {
  text-align: center;
  font-family: monospace;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
}

.item-data-row td.col-rate {
  text-align: right;
  font-family: monospace;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.item-data-row td.col-amount {
  border-right: none;
  text-align: right;
  font-family: monospace;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.filler-row {
  display: flex;
  width: 100%;
  flex: 1;
  border-bottom: none;
}

.filler-row td {
  border-right: 1.5px solid #000;
  border-bottom: none;
  padding: 0;
  height: 100%;
  box-sizing: border-box;
}

.filler-row td.col-amount {
  border-right: none;
}

.col-desc {
  width: 54%;
  word-break: break-word;
  overflow-wrap: break-word;
}

.col-hsn {
  width: 11%;
}

.col-qty {
  width: 11%;
}

.col-rate {
  width: 12%;
}

.col-amount {
  width: 12%;
}

.item-desc-text {
  font-weight: bold;
  text-transform: uppercase;
  font-size: 11px;
  line-height: 1.35;
  word-break: break-word;
  overflow-wrap: break-word;
  text-align: left;
  white-space: pre-wrap;
  color: #020617;
}

.item-refs-block {
  margin-top: 4px;
  font-size: 9px;
  font-weight: bold;
  line-height: 1.35;
  color: #0f172a;
}

/* Page-wise Subtotal Row (Multi-page invoices) */
.page-subtotal-row {
  display: flex;
  width: 100%;
  border-top: 2px solid #000;
  background: #f8fafc;
  font-size: 10.5px;
  font-weight: bold;
}

.page-subtotal-row td {
  padding: 8px 10px;
}

.page-subtotal-label {
  width: 88%;
  text-align: right;
  border-right: 1.5px solid #000;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.page-subtotal-amount {
  width: 12%;
  text-align: right;
  font-family: monospace;
  font-size: 11px;
  font-weight: bold;
}

.cont-notice {
  float: left;
  font-size: 9px;
  font-style: italic;
  font-weight: normal;
  color: #475569;
}

.page-breakdown-subtotal-row td {
  font-size: 10px !important;
  background: #f8fafc;
}

/* 5. Words Row Table */
.words-table {
  width: 100%;
  border-collapse: collapse;
  border-bottom: 2px solid #000;
  background: #ffffff;
  font-size: 11px;
}

.amount-words-cell {
  padding: 6px 12px !important;
  font-size: 11px !important;
  font-weight: normal !important;
  text-align: left !important;
  line-height: 1.3 !important;
  background: #ffffff !important;
}

/* 6. Bank Details & Tax Section */
.bank-tax-table {
  width: 100%;
  border-collapse: collapse;
  border-bottom: 2px solid #000;
  font-size: 11px;
}

.bank-tax-table td {
  border-bottom: 1.5px solid #000;
  padding: 6px;
  font-size: 11px;
  white-space: nowrap;
}

.bank-details-cell {
  width: 50% !important;
  border-right: 1.5px solid #000 !important;
  border-bottom: none !important;
  padding: 10px !important;
  vertical-align: top !important;
  white-space: normal !important;
}

.bank-heading {
  font-size: 11.5px !important;
  font-weight: 900 !important;
  text-transform: uppercase !important;
  margin-bottom: 4px !important;
}

.bank-item {
  font-size: 11px !important;
  line-height: 1.4 !important;
  margin-bottom: 3px !important;
}

.tax-title-col {
  width: 34% !important;
  text-align: left !important;
  border-right: 1.5px solid #000 !important;
  white-space: nowrap !important;
}

.tax-num-col {
  width: 16% !important;
  text-align: right !important;
  font-family: monospace !important;
  white-space: nowrap !important;
}

.total-after-tax-line td {
  font-size: 11.5px !important;
  font-weight: 900 !important;
  background: #f8fafc !important;
  border-bottom: none !important;
  white-space: nowrap !important;
}

/* 7. Footer Section */
.footer-layout-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 10px;
}

.footer-terms-col {
  width: 50%;
  vertical-align: top;
  padding: 12px;
  border-right: 1.5px solid #000;
}

.terms-title {
  font-size: 11px;
  margin-bottom: 5px;
  font-weight: bold;
  text-transform: uppercase;
  color: #0f172a;
}

.terms-list {
  font-size: 9.5px;
  line-height: 1.4;
  color: #1e293b;
}

.notes-text {
  font-size: 9.5px;
  color: #0f172a;
  margin-top: 6px;
}

.footer-sign-col {
  width: 50%;
  vertical-align: top;
  padding: 12px;
  text-align: center;
}

.certify-text {
  font-size: 9.5px;
  text-transform: uppercase;
  margin-bottom: 4px;
  font-weight: bold;
  color: #1e293b;
}

.company-sign-title {
  font-size: 12px;
  color: #1e3a8a;
  margin-bottom: 4px;
  font-weight: 900;
}

.signature-space {
  height: 88px;
}

.signatory-label {
  font-size: 11.5px;
  font-weight: bold;
  text-align: right;
  padding-right: 16px;
  color: #020617;
}

/* Utilities */
.font-bold { font-weight: bold; }
.uppercase { text-transform: uppercase; }
.text-center { text-align: center; }
.text-right { text-align: right; }
`;

function resolveFile(fileName) {
  const candidatePaths = [
    path.join(__dirname, fileName),
    path.join(__dirname, 'templates', 'invoice', fileName),
    path.join(__dirname, '..', 'templates', 'invoice', fileName),
    path.join(__dirname, '..', 'src', 'main', 'templates', 'invoice', fileName),
    path.join(process.cwd(), 'src', 'main', 'templates', 'invoice', fileName),
    path.join(process.cwd(), 'dist', 'main', 'templates', 'invoice', fileName),
    path.join(process.cwd(), 'dist', 'main', fileName),
    path.join(process.cwd(), fileName)
  ];

  for (const p of candidatePaths) {
    try {
      if (fs.existsSync(p)) {
        return p;
      }
    } catch {}
  }
  return null;
}

export function renderInvoiceHtml(invoiceData) {
  const resolvedCssPath = resolveFile('invoiceTemplate.css');
  let cssContent = '';
  if (resolvedCssPath) {
    try {
      cssContent = fs.readFileSync(resolvedCssPath, 'utf8');
    } catch {}
  }
  if (!cssContent || cssContent.trim().length === 0) {
    cssContent = DEFAULT_INVOICE_CSS;
  }

  const isProforma = String(invoiceData.invoice_type).toUpperCase() === 'PROFORMA';
  const docType = isProforma ? 'PROFORMA INVOICE' : 'INVOICE';
  const docNum = isProforma ? (invoiceData.proforma_number || invoiceData.invoice_number || '') : (invoiceData.invoice_number || invoiceData.proforma_number || '');
  const docDate = (isProforma ? invoiceData.proforma_date : invoiceData.invoice_date) || invoiceData.invoice_date || invoiceData.proforma_date || '';
  const copyTypeLabel = getCopyTypeLabel(invoiceData.copy_type, isProforma);

  // Read and encode company logo to base64 Data URI with fallbacks
  let logoDataUri = COMPANY_LOGO_DATA_URI;
  const resolvedLogoPath = resolveFile('logo.png');
  if (resolvedLogoPath) {
    try {
      const logoBuffer = fs.readFileSync(resolvedLogoPath);
      logoDataUri = `data:image/png;base64,${logoBuffer.toString('base64')}`;
    } catch {}
  }

  const logoHtml = logoDataUri
    ? `<img src="${logoDataUri}" alt="Shepherd Enterprises" class="header-logo-img" />`
    : '';

  const upiId = COMPANY_CONFIG.upi_id || 'msshepherdenterprisesprivatelimited.eazypay@icici';
  const deliveryAddress = invoiceData.delivery_address || invoiceData.buyer_address || '-';

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

  // Build Tax Rows HTML
  let taxRowsHtml = '';
  const isIntraState = (invoiceData.cgst_amount > 0 || invoiceData.sgst_amount > 0) || !invoiceData.igst_amount || Number(invoiceData.igst_amount) === 0;
  if (isIntraState) {
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
  } else {
    taxRowsHtml += `
      <tr>
        <td class="tax-title-col">ADD IGST: ${invoiceData.igst_rate || 18}%</td>
        <td class="tax-num-col">${formatCurrency(invoiceData.igst_amount)}</td>
      </tr>
    `;
  }

  // Round Off row
  let roundOffHtml = '';
  if (invoiceData.round_off && Number(invoiceData.round_off) !== 0) {
    const roundVal = Number(invoiceData.round_off);
    roundOffHtml = `
      <tr>
        <td class="tax-title-col">ROUND OFF</td>
        <td class="tax-num-col">${roundVal > 0 ? '+' : ''}${formatCurrency(roundVal)}</td>
      </tr>
    `;
  }

  // Terms HTML list
  const termsHtml = TEMPLATE_CONFIG.termsAndConditions.map(t => `<div>${escapeHtml(t)}</div>`).join('');

  // Notes HTML
  let notesHtml = '';
  if (invoiceData.notes) {
    notesHtml = `
      <div class="notes-text">
        <strong>Notes:</strong> ${escapeHtml(invoiceData.notes)}
      </div>
    `;
  }

  // Paginate items across A4 pages deterministically
  const rawItems = (invoiceData.items && invoiceData.items.length > 0) ? invoiceData.items : [];
  const pages = paginateInvoiceItems(rawItems, invoiceData);

  const pagesHtml = pages.map((page) => {
    let headerSectionHtml = '';
    if (page.isFirstPage) {
      headerSectionHtml = `
        <!-- 1. Header Section -->
        <table class="header-table">
          <tr>
            <td class="header-left-col">
              ${logoHtml}
              <div class="company-sub-brand">SHEPHERD ENTERPRISES</div>
              <div class="company-upi-tag">${escapeHtml(upiId)}</div>
            </td>
            <td class="header-center-col">
              <div class="company-brand-title">SHEPHERD</div>
              <div class="company-sub-title">ENTERPRISES PRIVATE LIMITED</div>
              <div class="company-address-line">${escapeHtml(COMPANY_CONFIG.address)}</div>
              <div class="company-contact-line">Cell: ${escapeHtml(COMPANY_CONFIG.phone)} &nbsp;&middot;&nbsp; Email: ${escapeHtml(COMPANY_CONFIG.email)}</div>
            </td>
          </tr>
        </table>

        <!-- 2. Sub-Header Row: GSTIN | DOC TYPE | COPY TYPE -->
        <table class="sub-header-table">
          <tr class="sub-header-row">
            <td class="cell-gstin">
              GSTIN: ${escapeHtml(COMPANY_CONFIG.gstin || '33ABUCS2217H1Z8')}
            </td>
            <td class="cell-doc-title">
              ${docType}
            </td>
            <td class="cell-copy-type">
              <span>${copyTypeLabel}</span>
            </td>
          </tr>
        </table>

        <!-- 3. Meta Grid: Invoice Details & Logistics (2 Columns) -->
        <table class="meta-table">
          <tr class="meta-row">
            <td class="meta-left-cell">
              <div class="meta-field"><span class="meta-lbl font-bold">INVOICE NO :</span> <span class="meta-txt font-bold">${escapeHtml(docNum)}</span></div>
              <div class="meta-field"><span class="meta-lbl font-bold">INVOICE DATE:</span> <span class="meta-txt">${escapeHtml(docDate)}</span></div>
              <div class="meta-field">
                <span class="meta-lbl font-bold">STATE:</span> <span class="meta-txt uppercase">${escapeHtml(COMPANY_CONFIG.state || 'TAMIL NADU')}</span>
                <span class="meta-lbl font-bold" style="margin-left: 10px;">STATE CODE:</span> <span class="meta-txt">${escapeHtml(COMPANY_CONFIG.state_code || '33')}</span>
              </div>
              <div class="meta-field" style="margin-top: 4px;">
                <table class="meta-field-table">
                  <tr>
                    <td class="meta-field-lbl"><span class="meta-lbl font-bold">BUYER:</span></td>
                    <td class="meta-field-txt"><span class="meta-txt font-bold buyer-name">${escapeHtml(invoiceData.buyer_name || '')}</span></td>
                  </tr>
                </table>
              </div>
              <div class="meta-field">
                <table class="meta-field-table">
                  <tr>
                    <td class="meta-field-lbl"><span class="meta-lbl font-bold">CUSTOMER ADDRESS:</span></td>
                    <td class="meta-field-txt"><span class="meta-txt buyer-addr">${escapeHtml(invoiceData.buyer_address || '-')}</span></td>
                  </tr>
                </table>
              </div>
            </td>
            <td class="meta-right-cell">
              <div class="meta-field"><span class="meta-lbl font-bold">TRANSPORTATION MODE:</span> <span class="meta-txt">${escapeHtml(invoiceData.transportation_mode || '-')}</span></div>
              <div class="meta-field"><span class="meta-lbl font-bold">VEHICLE NO:</span> <span class="meta-txt">${escapeHtml(invoiceData.vehicle_number || '-')}</span></div>
              <div class="meta-field"><span class="meta-lbl font-bold">DATE OF SUPPLY:</span> <span class="meta-txt font-medium">${escapeHtml(formatSupplyDates(invoiceData.date_of_supply_from, invoiceData.date_of_supply_to, invoiceData.date_of_supply || docDate))}</span></div>
              <div class="meta-field">
                <table class="meta-field-table">
                  <tr>
                    <td class="meta-field-lbl"><span class="meta-lbl font-bold">DELIVERY ADDRESS:</span></td>
                    <td class="meta-field-txt"><span class="meta-txt">${escapeHtml(deliveryAddress)}</span></td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>
          <tr class="customer-info-row">
            <td class="cust-gstin-cell">
              <span class="font-bold">CUSTOMER'S GSTIN:</span> ${escapeHtml(invoiceData.customer_gstin || 'N/A')}
            </td>
            <td class="cust-state-cell">
              <div class="meta-field"><span class="meta-lbl font-bold">STATE:</span> <span class="meta-txt uppercase">${escapeHtml(invoiceData.customer_state || 'Tamil Nadu')}</span></div>
              <div class="meta-field" style="margin-top: 2px;"><span class="meta-lbl font-bold">STATE CODE:</span> <span class="meta-txt">${escapeHtml(invoiceData.customer_state_code || '33')}</span></div>
            </td>
          </tr>
        </table>
      `;
    } else {
      headerSectionHtml = `
        <!-- Continuation Page Sub-Header Row -->
        <table class="sub-header-table cont-sub-header">
          <tr class="sub-header-row">
            <td class="cell-gstin">
              INVOICE NO: ${escapeHtml(docNum)}
            </td>
            <td class="cell-doc-title">
              ${docType}
            </td>
            <td class="cell-copy-type">
              <span>${copyTypeLabel}</span>
            </td>
          </tr>
        </table>
      `;
    }

    // Items table for this page
    const itemRowsHtml = page.items.map((item, idx) => {
      const isFirstOverallItem = page.isFirstPage && idx === 0;
      const formattedDesc = escapeHtml(item.description || '').replace(/\r?\n/g, '<br/>');
      const isBlankItem = !item.description && !item.quantity && !item.rate && !item.amount;

      const descHtml = formattedDesc ? `<div class="item-desc-text">${formattedDesc}</div>` : '&nbsp;';
      const hsnHtml = isBlankItem || !item.hsn_sac || item.hsn_sac === '-' ? '&nbsp;' : escapeHtml(item.hsn_sac);
      const qtyHtml = isBlankItem || item.quantity === '' || item.quantity == null ? '&nbsp;' : item.quantity;
      const rateHtml = isBlankItem || item.rate === '' || item.rate == null ? '&nbsp;' : formatCurrency(item.rate);
      const amountHtml = isBlankItem || item.amount === '' || item.amount == null ? '&nbsp;' : formatCurrency(item.amount || (item.quantity * item.rate));

      return `<tr class="item-data-row"><td class="col-desc">${descHtml}${isFirstOverallItem ? refsHtml : ''}</td><td class="col-hsn">${hsnHtml}</td><td class="col-qty">${qtyHtml}</td><td class="col-rate">${rateHtml}</td><td class="col-amount">${amountHtml}</td></tr>`;
    }).join('');

    const fillerRowsHtml = page.hasTotalsAndFooter ? `
      <tr class="item-data-row filler-row" style="height: 100%;">
        <td class="col-desc">&nbsp;</td>
        <td class="col-hsn">&nbsp;</td>
        <td class="col-qty">&nbsp;</td>
        <td class="col-rate">&nbsp;</td>
        <td class="col-amount">&nbsp;</td>
      </tr>
    ` : '';

    const pageSubtotal = (page.items || []).reduce(
      (sum, it) => sum + Number(it.amount || (it.quantity * it.rate) || 0),
      0
    );

    const pageSubtotalRowHtml = page.totalPages > 1 ? `
      <tr class="page-subtotal-row">
        <td colspan="4" class="page-subtotal-label">
          ${!page.isLastPage ? `<span class="cont-notice">Continued on Next Page...</span>` : ''}
          SUB TOTAL:
        </td>
        <td class="col-amount page-subtotal-amount">${formatCurrency(pageSubtotal)}</td>
      </tr>
    ` : '';

    const itemsTableHtml = `
      <table class="items-table">
        <thead>
          <tr class="items-head-row">
            <th class="col-desc">DESCRIPTION</th>
            <th class="col-hsn">HSN</th>
            <th class="col-qty">QTY.</th>
            <th class="col-rate">RATE</th>
            <th class="col-amount">AMOUNT</th>
          </tr>
        </thead>
        <tbody>
          ${itemRowsHtml}
          ${fillerRowsHtml}
          ${pageSubtotalRowHtml}
        </tbody>
      </table>
    `;

    let footerSectionHtml = '';
    if (page.hasTotalsAndFooter) {
      const multiPageBreakdownRows = pages.length > 1 ? pages.map((p) => {
        const pSub = (p.items || []).reduce((sum, it) => sum + Number(it.amount || (it.quantity * it.rate) || 0), 0);
        return `
          <tr class="page-breakdown-subtotal-row">
            <td class="tax-title-col">SUB TOTAL</td>
            <td class="tax-num-col">${formatCurrency(pSub)}</td>
          </tr>
        `;
      }) : [];

      const rightRows = [
        ...multiPageBreakdownRows,
        `<tr>
          <td class="tax-title-col font-bold">TOTAL AMOUNT BEFORE TAX</td>
          <td class="tax-num-col font-bold">${formatCurrency(invoiceData.subtotal)}</td>
        </tr>`,
        ...(taxRowsHtml ? [taxRowsHtml] : []),
        ...(roundOffHtml ? [roundOffHtml] : []),
        `<tr class="total-after-tax-line">
          <td class="tax-title-col font-bold">TOTAL AMOUNT AFTER TAX:</td>
          <td class="tax-num-col font-bold">${formatCurrency(invoiceData.grand_total)}</td>
        </tr>`
      ];

      // Clean rightRows by filtering empty and splitting by <tr>
      const combinedHtmlRows = [];
      const bankDetailsCellHtml = `
        <td class="bank-details-cell" rowspan="__ROWSPAN__">
          <div class="bank-heading font-bold">BANK DETAILS</div>
          <div class="bank-item"><span class="font-bold">BANK NAME:</span> ${escapeHtml(COMPANY_CONFIG.bank_name)}</div>
          <div class="bank-item"><span class="font-bold">ACCOUNT NUMBER:</span> ${escapeHtml(COMPANY_CONFIG.account_number)}</div>
          <div class="bank-item"><span class="font-bold">BRANCH NAME:</span> ${escapeHtml((COMPANY_CONFIG.branch_name || 'Ambattur - Officer Colony').toUpperCase())}</div>
          <div class="bank-item"><span class="font-bold">IFSC CODE:</span> ${escapeHtml(COMPANY_CONFIG.ifsc_code)}</div>
        </td>
      `;

      let rightRowsFlat = rightRows.join('').trim();
      const trMatches = rightRowsFlat.split(/(?=<tr[\s>])/i).filter(r => r.trim());
      const totalRowCount = trMatches.length;

      const unifiedBankTaxRowsHtml = trMatches.map((rowStr, idx) => {
        if (idx === 0) {
          return rowStr.replace(/<tr([^>]*)>/i, `<tr$1>${bankDetailsCellHtml.replace('__ROWSPAN__', String(totalRowCount))}`);
        }
        return rowStr;
      }).join('');

      footerSectionHtml = `
        <div class="bottom-content">
          <!-- 5. Total Amount in Words Row (Attached directly on top of Bank Details & Tax) -->
          <table class="words-table">
            <tr>
              <td class="amount-words-cell">
                <span class="font-bold">TOTAL AMOUNT IN WORDS:</span> ${escapeHtml(invoiceData.amount_in_words || '')}
              </td>
            </tr>
          </table>

          <!-- 6. Bank Details & Tax Totals Section (Unified Single Table) -->
          <table class="bank-tax-table">
            ${unifiedBankTaxRowsHtml}
          </table>

          <!-- 7. Footer Section -->
          <table class="footer-layout-table">
            <tr>
              <td class="footer-terms-col">
                <div class="terms-title font-bold">TERMS AND CONDITIONS</div>
                <div class="terms-list">
                  ${termsHtml}
                </div>
                ${notesHtml}
              </td>
              <td class="footer-sign-col">
                <div class="certify-text font-bold">CERTIFIED THAT ABOVE INFORMATION ARE TRUE AND CORRECT</div>
                <div class="company-sign-title font-bold">For ${escapeHtml(COMPANY_CONFIG.name)}</div>
                <div class="signature-space"></div>
                <div class="signatory-label font-bold">Director</div>
              </td>
            </tr>
          </table>
        </div>
      `;
    }

    return `
      <div class="invoice-page${page.isLastPage ? ' is-last-page' : ''}">
        <div class="invoice-box-frame">
          <div class="top-content">
            ${headerSectionHtml}
            ${itemsTableHtml}
          </div>
          ${footerSectionHtml}
        </div>
      </div>
    `;
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(docType)} - ${escapeHtml(docNum)}</title>
  <style>
${cssContent}
  </style>
</head>
<body>
  <div class="invoice-container">
    ${pagesHtml}
  </div>
</body>
</html>`;
}

function formatSupplyDates(fromDate, toDate, fallback) {
  const cleanFrom = (fromDate || '').trim();
  const cleanTo = (toDate || '').trim();
  const f = cleanFrom || fallback;
  const t = cleanTo || cleanFrom || fallback;
  if (f && t) {
    return `From ${formatDateStr(f)} To ${formatDateStr(t)}`;
  }
  if (f) return `From ${formatDateStr(f)} To ${formatDateStr(f)}`;
  return '-';
}

function formatDateStr(dateStr) {
  if (!dateStr || dateStr === '-') return '-';
  try {
    const parts = String(dateStr).split('T')[0].split('-');
    if (parts.length === 3 && parts[0].length === 4) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  } catch {
    return dateStr;
  }
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
