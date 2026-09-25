import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { COMPANY_CONFIG } from '../../config/companyConfig.js';
import { TEMPLATE_CONFIG } from './templateConfig.js';
import { getCopyTypeLabel } from '../../../shared/constants/copyTypes.js';
import { paginateInvoiceItems } from '../../../shared/utils/invoicePagination.js';

export function renderInvoiceHtml(invoiceData) {
  const htmlPath = path.join(__dirname, 'invoiceTemplate.html');
  const cssPath = path.join(__dirname, 'invoiceTemplate.css');

  let htmlTemplate = fs.existsSync(htmlPath) ? fs.readFileSync(htmlPath, 'utf8') : '';
  let cssContent = fs.existsSync(cssPath) ? fs.readFileSync(cssPath, 'utf8') : '';

  const isProforma = String(invoiceData.invoice_type).toUpperCase() === 'PROFORMA';
  const docType = isProforma ? 'PROFORMA INVOICE' : 'INVOICE';
  const docNum = isProforma ? (invoiceData.proforma_number || invoiceData.invoice_number || '') : (invoiceData.invoice_number || invoiceData.proforma_number || '');
  const docDate = (isProforma ? invoiceData.proforma_date : invoiceData.invoice_date) || invoiceData.invoice_date || invoiceData.proforma_date || '';
  const copyTypeLabel = getCopyTypeLabel(invoiceData.copy_type, isProforma);

  // Read and encode company logo to base64 Data URI
  const logoPath = path.join(__dirname, 'logo.png');
  let logoHtml = '';
  if (fs.existsSync(logoPath)) {
    const logoBase64 = fs.readFileSync(logoPath).toString('base64');
    logoHtml = `<img src="data:image/png;base64,${logoBase64}" alt="Shepherd Enterprises" class="header-logo-img" />`;
  }

  const upiTag = COMPANY_CONFIG.upi_id ? `@${COMPANY_CONFIG.upi_id.split('@')[1] || 'icici'}` : '@icici';
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
              <div class="company-upi-tag">${upiTag}</div>
            </td>
            <td class="header-center-col">
              <div class="company-name">${escapeHtml(COMPANY_CONFIG.name)}</div>
              <div class="company-address">${escapeHtml(COMPANY_CONFIG.address)}</div>
              <div class="company-cell">Cell: ${escapeHtml(COMPANY_CONFIG.phone)}</div>
              <div class="company-email">Email: ${escapeHtml(COMPANY_CONFIG.email)}</div>
            </td>
          </tr>
        </table>

        <!-- 2. Sub-Header Row: GSTIN | DOC TYPE | COPY TYPE & PAGE -->
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
              <span class="page-num-text">Page ${page.pageNumber}/${page.totalPages}</span>
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
              <div class="buyer-block">
                <div class="meta-field"><span class="meta-lbl font-bold">BUYER:</span> <span class="meta-txt font-bold">${escapeHtml(invoiceData.buyer_name || '')}</span></div>
                <div class="meta-field"><span class="meta-lbl font-bold">CUSTOMER ADDRESS:</span> <span class="meta-txt" style="white-space: pre-line;">${escapeHtml(invoiceData.buyer_address || '')}</span></div>
              </div>
            </td>
            <td class="meta-right-cell">
              <div class="meta-field"><span class="meta-lbl font-bold">TRANSPORTATION MODE:</span> <span class="meta-txt">${escapeHtml(invoiceData.transportation_mode || '-')}</span></div>
              <div class="meta-field"><span class="meta-lbl font-bold">VEHICLE NO:</span> <span class="meta-txt">${escapeHtml(invoiceData.vehicle_number || '-')}</span></div>
              <div class="meta-field"><span class="meta-lbl font-bold">DATE OF SUPPLY:</span> <span class="meta-txt">${escapeHtml(invoiceData.date_of_supply || docDate || '-')}</span></div>
              <div class="meta-field"><span class="meta-lbl font-bold">DELIVERY ADDRESS:</span> <span class="meta-txt">${escapeHtml(deliveryAddress)}</span></div>
            </td>
          </tr>
          <tr class="customer-info-row">
            <td class="cust-gstin-cell">
              <span class="font-bold">CUSTOMER' GSTIN:</span> ${escapeHtml(invoiceData.customer_gstin || 'N/A')}
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
              <span class="page-num-text">Page ${page.pageNumber}/${page.totalPages}</span>
            </td>
          </tr>
        </table>
      `;
    }

    // Items table for this page
    const itemRowsHtml = page.items.map((item, idx) => {
      const isFirstOverallItem = page.isFirstPage && idx === 0;
      const formattedDesc = escapeHtml(item.description || '').replace(/\r?\n/g, '<br/>');
      return `<tr class="item-data-row"><td class="col-desc"><div class="item-desc-text">${formattedDesc}</div>${isFirstOverallItem ? refsHtml : ''}</td><td class="col-hsn">${escapeHtml(item.hsn_sac || '-')}</td><td class="col-qty">${item.quantity || 0}</td><td class="col-rate">${formatCurrency(item.rate)}</td><td class="col-amount">${formatCurrency(item.amount || (item.quantity * item.rate))}</td></tr>`;
    }).join('');

    const pageSubtotal = (page.items || []).reduce(
      (sum, it) => sum + Number(it.amount || (it.quantity * it.rate) || 0),
      0
    );

    const pageSubtotalRowHtml = page.totalPages > 1 ? `
      <tr class="page-subtotal-row">
        <td colspan="4" class="page-subtotal-label">
          ${!page.isLastPage ? `<span class="cont-notice">Continued on Page ${page.pageNumber + 1}...</span>` : ''}
          PAGE ${page.pageNumber} SUB TOTAL:
        </td>
        <td class="col-amount page-subtotal-amount">${formatCurrency(pageSubtotal)}</td>
      </tr>
    ` : '';

    const totalWordsRowHtml = page.hasTotalsAndFooter ? `
      <tr class="amount-words-row">
        <td colspan="5" class="amount-words-cell">
          <span class="font-bold">TOTAL AMOUNT IN WORDS:</span> ${escapeHtml(invoiceData.amount_in_words || '')}
        </td>
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
          <tr class="table-spacer-row">
            <td class="col-desc"></td>
            <td class="col-hsn"></td>
            <td class="col-qty"></td>
            <td class="col-rate"></td>
            <td class="col-amount"></td>
          </tr>
          ${pageSubtotalRowHtml}
          ${totalWordsRowHtml}
        </tbody>
      </table>
    `;

    let footerSectionHtml = '';
    if (page.hasTotalsAndFooter) {
      const multiPageBreakdownHtml = pages.length > 1 ? pages.map((p) => {
        const pSub = (p.items || []).reduce((sum, it) => sum + Number(it.amount || (it.quantity * it.rate) || 0), 0);
        return `
          <tr class="page-breakdown-subtotal-row">
            <td class="tax-title-col">PAGE ${p.pageNumber} SUB TOTAL</td>
            <td class="tax-num-col">${formatCurrency(pSub)}</td>
          </tr>
        `;
      }).join('') : '';

      footerSectionHtml = `
        <div class="bottom-content">
          <!-- 6. Bank Details & Tax Totals Section -->
          <table class="bank-tax-table">
            <tr class="bank-tax-row">
              <td class="bank-details-cell">
                <div class="bank-heading font-bold">BANK DETAILS</div>
                <div class="bank-item"><span class="font-bold">BANK NAME:</span> ${escapeHtml(COMPANY_CONFIG.bank_name)}: ${escapeHtml(COMPANY_CONFIG.account_number)}</div>
                <div class="bank-item"><span class="font-bold">BRANCH NAME:</span> ${escapeHtml(COMPANY_CONFIG.branch_name || 'Ambattur - Officer Colony')}</div>
                <div class="bank-item"><span class="font-bold">IFSC CODE:</span> ${escapeHtml(COMPANY_CONFIG.ifsc_code)}</div>
              </td>
              <td class="tax-summary-cell">
                <table class="tax-breakdown-table">
                  ${multiPageBreakdownHtml}
                  <tr>
                    <td class="tax-title-col font-bold">TOTAL AMOUNT BEFORE TAX</td>
                    <td class="tax-num-col font-bold">${formatCurrency(invoiceData.subtotal)}</td>
                  </tr>
                  ${taxRowsHtml}
                  ${roundOffHtml}
                  <tr class="total-after-tax-line">
                    <td class="tax-title-col font-bold">TOTAL AMOUNT AFTER TAX:</td>
                    <td class="tax-num-col font-bold">${formatCurrency(invoiceData.grand_total)}</td>
                  </tr>
                </table>
              </td>
            </tr>
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
                <div class="footer-page-num">
                  Page ${page.pageNumber}/${page.totalPages}
                </div>
              </td>
              <td class="footer-sign-col">
                <div class="certify-text font-bold">CERTIFIED THAT ABOVE INFORMATION ARE TRUE AND CORRECT</div>
                <div class="company-sign-title font-bold">For ${escapeHtml(COMPANY_CONFIG.name)}</div>
                <div class="signature-space"></div>
                <div class="signatory-label font-bold">Proprietor</div>
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
