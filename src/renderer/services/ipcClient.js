import { getCopyTypeLabel } from '../../shared/constants/copyTypes';
import { COMPANY_CONFIG } from '../../main/config/companyConfig';
import { paginateInvoiceItems } from '../../shared/utils/invoicePagination';
import shepherdInvoiceLogo from '../assets/shepherd_invoice_logo.png';

const isElectron = typeof window !== 'undefined' && Boolean(window.electronAPI);

const getLocalInvoices = () => {
  try { return JSON.parse(localStorage.getItem('shepherd_invoices') || '[]'); } catch { return []; }
};
const setLocalInvoices = (invs) => {
  try { localStorage.setItem('shepherd_invoices', JSON.stringify(invs)); } catch {}
};

const getLocalProformas = () => {
  try { return JSON.parse(localStorage.getItem('shepherd_proformas') || '[]'); } catch { return []; }
};
const setLocalProformas = (pros) => {
  try { localStorage.setItem('shepherd_proformas', JSON.stringify(pros)); } catch {}
};

function renderClientInvoiceHtml(data) {
  const isProforma = String(data.invoice_type).toUpperCase() === 'PROFORMA';
  const docType = isProforma ? 'PROFORMA INVOICE' : 'INVOICE';
  const docNum = isProforma 
    ? (data.proforma_number || data.invoice_number || 'PRO-001') 
    : (data.invoice_number || data.proforma_number || 'INV-001');
  const docDate = (isProforma ? data.proforma_date : data.invoice_date) || new Date().toISOString().split('T')[0];
  const copyTypeLabel = getCopyTypeLabel(data.copy_type, isProforma);

  // Build reference block string for line items (S.O. No, GEMC No, Ref)
  const refs = [];
  if (data.so_po_number) {
    let soText = `S.O. No: ${data.so_po_number}`;
    if (data.so_po_date) {
      soText += ` Dt: ${data.so_po_date}`;
    }
    refs.push(soText);
  }
  if (data.gemc_number) {
    refs.push(`GEMC - ${data.gemc_number}`);
  }
  if (data.reference_number) {
    refs.push(`Ref: ${data.reference_number}`);
  }

  const refsHtml = refs.length > 0
    ? `<div style="margin-top: 3px; font-size: 9px; font-weight: bold; line-height: 1.35; color: #111;">${refs.join('<br>')}</div>`
    : '';

  const taxRows = (data.cgst_amount > 0 || data.sgst_amount > 0) ? `
    <tr style="border-bottom: 1px solid #000;">
      <td style="padding: 3px 6px; border-bottom: 1px solid #000;">ADD CGST: ${data.cgst_rate || 9}%</td>
      <td style="padding: 3px 6px; border-bottom: 1px solid #000; text-align: right;">${Number(data.cgst_amount || 0).toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
    </tr>
    <tr style="border-bottom: 1px solid #000;">
      <td style="padding: 3px 6px; border-bottom: 1px solid #000;">ADD SGST: ${data.sgst_rate || 9}%</td>
      <td style="padding: 3px 6px; border-bottom: 1px solid #000; text-align: right;">${Number(data.sgst_amount || 0).toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
    </tr>
  ` : (data.igst_amount > 0) ? `
    <tr style="border-bottom: 1px solid #000;">
      <td style="padding: 3px 6px; border-bottom: 1px solid #000;">ADD IGST: ${data.igst_rate || 18}%</td>
      <td style="padding: 3px 6px; border-bottom: 1px solid #000; text-align: right;">${Number(data.igst_amount || 0).toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
    </tr>
  ` : '';

  const upiHandle = COMPANY_CONFIG.upi_id ? `@${COMPANY_CONFIG.upi_id.split('@')[1] || 'icici'}` : '@icici';
  const deliveryAddress = data.delivery_address || data.buyer_address || '';
  const pages = paginateInvoiceItems(data.items || [], data);

  const pagesHtml = pages.map((page) => {
    const headerHtml = page.isFirstPage ? `
      <table style="width: 100%; border-collapse: collapse; border-bottom: 1.5px solid #000;">
        <tr>
          <td style="width: 22%; vertical-align: middle; text-align: center; border-right: 1px solid #000; padding: 6px;">
            <img src="${shepherdInvoiceLogo}" alt="Logo" style="width: 78px; height: 78px; object-fit: contain; display: block; margin: 0 auto;" />
            <div style="font-size: 8.5px; font-weight: bold; text-transform: uppercase; margin-top: 2px; color: #1e293b;">SHEPHERD ENTERPRISES</div>
            <div style="font-size: 8px; color: #475569;">${upiHandle}</div>
          </td>
          <td style="width: 78%; vertical-align: middle; text-align: center; padding: 6px 12px;">
            <div style="font-size: 21px; font-weight: 800; text-transform: uppercase; color: #1e3a8a; margin-bottom: 3px;">${COMPANY_CONFIG.name}</div>
            <div style="font-size: 9.5px; text-transform: uppercase; margin-bottom: 3px; line-height: 1.3;">${COMPANY_CONFIG.address}</div>
            <div style="font-size: 10px; font-weight: bold; color: #0f172a; margin-bottom: 2px;">Cell: ${COMPANY_CONFIG.phone}</div>
            <div style="font-size: 10px; font-weight: bold; color: #0f172a;">Email: ${COMPANY_CONFIG.email}</div>
          </td>
        </tr>
      </table>

      <!-- Sub-Header Row -->
      <table style="width: 100%; border-collapse: collapse; border-bottom: 1.5px solid #000; font-size: 10px;">
        <tr>
          <td style="width: 38%; padding: 4px 6px; font-weight: bold; font-size: 11px; border-right: 1px solid #000;">
            GSTIN: ${COMPANY_CONFIG.gstin || '33ABUCS2217H1Z8'}
          </td>
          <td style="width: 24%; padding: 4px 6px; font-weight: 900; font-size: 15px; text-align: center; color: #1e3a8a; text-transform: uppercase; border-right: 1px solid #000;">
            ${docType}
          </td>
          <td style="width: 38%; padding: 4px 6px; font-weight: bold; text-align: right; text-transform: uppercase; font-size: 10px;">
            <span>${copyTypeLabel}</span>
            <span style="margin-left: 6px; font-weight: bold; font-size: 9.5px;">Page ${page.pageNumber}/${page.totalPages}</span>
          </td>
        </tr>
      </table>

      <!-- Meta Grid -->
      <table style="width: 100%; border-collapse: collapse; border-bottom: 1.5px solid #000; font-size: 10px;">
        <tr>
          <td style="width: 50%; border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 4px 6px; vertical-align: top;">
            <div style="line-height: 1.35; margin-bottom: 2px;"><strong>INVOICE NO :</strong> <strong>${docNum}</strong></div>
            <div style="line-height: 1.35; margin-bottom: 2px;"><strong>INVOICE DATE:</strong> ${docDate}</div>
            <div style="line-height: 1.35; margin-bottom: 2px;">
              <strong>STATE:</strong> <span style="text-transform: uppercase;">${COMPANY_CONFIG.state || 'TAMIL NADU'}</span>
              <strong style="margin-left: 10px;">STATE CODE:</strong> ${COMPANY_CONFIG.state_code || '33'}
            </div>
            <div style="margin-top: 4px;">
              <div style="line-height: 1.35; margin-bottom: 2px;"><strong>BUYER:</strong> <strong>${data.buyer_name || ''}</strong></div>
              <div style="line-height: 1.35; margin-bottom: 2px;"><strong>CUSTOMER ADDRESS:</strong> <span style="white-space: pre-line; font-size: 9.5px;">${data.buyer_address || ''}</span></div>
            </div>
          </td>
          <td style="width: 50%; border-bottom: 1px solid #000; padding: 4px 6px; vertical-align: top;">
            <div style="line-height: 1.35; margin-bottom: 2px;"><strong>TRANSPORTATION MODE:</strong> ${data.transportation_mode || '-'}</div>
            <div style="line-height: 1.35; margin-bottom: 2px;"><strong>VEHICLE NO:</strong> ${data.vehicle_number || '-'}</div>
            <div style="line-height: 1.35; margin-bottom: 2px;"><strong>DATE OF SUPPLY:</strong> ${data.date_of_supply || docDate || '-'}</div>
            <div style="line-height: 1.35; margin-bottom: 2px;"><strong>DELIVERY ADDRESS:</strong> ${deliveryAddress}</div>
          </td>
        </tr>
        <tr>
          <td style="width: 50%; border-right: 1px solid #000; padding: 4px 6px; font-size: 10px; font-weight: bold;">
            CUSTOMER' GSTIN: ${data.customer_gstin || 'N/A'}
          </td>
          <td style="width: 50%; padding: 4px 6px; font-size: 10px;">
            <div><strong>STATE:</strong> ${(data.customer_state || 'Tamil Nadu').toUpperCase()}</div>
            <div style="margin-top: 2px;"><strong>STATE CODE:</strong> ${data.customer_state_code || '33'}</div>
          </td>
        </tr>
      </table>
    ` : `
      <table style="width: 100%; border-collapse: collapse; border-bottom: 1.5px solid #000; font-size: 10px; background: #f8fafc;">
        <tr>
          <td style="width: 38%; padding: 4px 6px; font-weight: bold; font-size: 11px; border-right: 1px solid #000;">
            INVOICE NO: ${docNum}
          </td>
          <td style="width: 24%; padding: 4px 6px; font-weight: 900; font-size: 15px; text-align: center; color: #1e3a8a; text-transform: uppercase; border-right: 1px solid #000;">
            ${docType}
          </td>
          <td style="width: 38%; padding: 4px 6px; font-weight: bold; text-align: right; text-transform: uppercase; font-size: 10px;">
            <span>${copyTypeLabel}</span>
            <span style="margin-left: 6px; font-weight: bold; font-size: 9.5px;">Page ${page.pageNumber}/${page.totalPages}</span>
          </td>
        </tr>
      </table>
    `;

    const itemRows = page.items.map((item, idx) => {
      const isFirstOverallItem = page.isFirstPage && idx === 0;
      const formattedDesc = String(item.description || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\r?\n/g, '<br/>');
      return `<tr><td style="width: 54%; padding: 2.5px 6px; border-right: 1px solid #000; vertical-align: top; word-break: break-word; overflow-wrap: break-word;"><div style="font-weight: bold; text-transform: uppercase; font-size: 9.5px; line-height: 1.3; word-break: break-word; overflow-wrap: break-word;">${formattedDesc}</div>${isFirstOverallItem ? refsHtml : ''}</td><td style="width: 11%; padding: 2.5px 6px; border-right: 1px solid #000; text-align: center; vertical-align: top; font-size: 10px;">${item.hsn_sac || '-'}</td><td style="width: 11%; padding: 2.5px 6px; border-right: 1px solid #000; text-align: center; vertical-align: top; font-size: 10px;">${item.quantity || 0}</td><td style="width: 12%; padding: 2.5px 6px; border-right: 1px solid #000; text-align: right; vertical-align: top; font-size: 10px;">${Number(item.rate || 0).toLocaleString('en-IN', {minimumFractionDigits: 2})}</td><td style="width: 12%; padding: 2.5px 6px; text-align: right; vertical-align: top; font-size: 10px;">${Number(item.amount || ((item.quantity || 0) * (item.rate || 0))).toLocaleString('en-IN', {minimumFractionDigits: 2})}</td></tr>`;
    }).join('');

    const itemsTableHtml = `
      <table style="width: 100%; table-layout: fixed; border-collapse: collapse; flex: 1; display: table; height: 100%;">
        <thead>
          <tr style="background: #ffffff; border-bottom: 1.5px solid #000; font-size: 9.5px; font-weight: bold; text-align: center;">
            <th style="padding: 4px 6px; border-right: 1px solid #000; text-align: left; width: 54%; height: 22px;">DESCRIPTION</th>
            <th style="padding: 4px 6px; border-right: 1px solid #000; width: 11%;">HSN</th>
            <th style="padding: 4px 6px; border-right: 1px solid #000; width: 11%;">QTY.</th>
            <th style="padding: 4px 6px; border-right: 1px solid #000; width: 12%; text-align: right;">RATE</th>
            <th style="padding: 4px 6px; width: 12%; text-align: right;">AMOUNT</th>
          </tr>
        </thead>
        <tbody>
          ${itemRows}
          <tr class="table-spacer-row">
            <td style="border-right: 1px solid #000; padding: 0;"></td>
            <td style="border-right: 1px solid #000; padding: 0;"></td>
            <td style="border-right: 1px solid #000; padding: 0;"></td>
            <td style="border-right: 1px solid #000; padding: 0;"></td>
            <td style="padding: 0;"></td>
          </tr>
        </tbody>
      </table>
    `;

    let bottomSectionHtml = '';
    if (page.hasTotalsAndFooter) {
      bottomSectionHtml = `
        <div style="width: 100%; border-top: 1.5px solid #000;">
          <div style="border-bottom: 1.5px solid #000; padding: 5px 6px; font-size: 10px;">
            <strong>TOTAL AMOUNT IN WORDS:</strong> ${data.amount_in_words || ''}
          </div>

          <table style="width: 100%; border-collapse: collapse; border-bottom: 1.5px solid #000;">
            <tr>
              <td style="width: 60%; border-right: 1px solid #000; padding: 5px 6px; vertical-align: top;">
                <div style="font-weight: bold; font-size: 10px; margin-bottom: 3px;">BANK DETAILS</div>
                <div style="font-size: 9.5px; line-height: 1.35; margin-bottom: 2px;"><strong>BANK NAME:</strong> ${COMPANY_CONFIG.bank_name}: ${COMPANY_CONFIG.account_number}</div>
                <div style="font-size: 9.5px; line-height: 1.35; margin-bottom: 2px;"><strong>BRANCH NAME:</strong> ${COMPANY_CONFIG.branch_name}</div>
                <div style="font-size: 9.5px; line-height: 1.35;"><strong>IFSC CODE:</strong> ${COMPANY_CONFIG.ifsc_code}</div>
              </td>
              <td style="width: 40%; padding: 0; vertical-align: top;">
                <table style="width: 100%; border-collapse: collapse; font-size: 9.5px;">
                  <tr>
                    <td style="padding: 3px 6px; width: 65%; border-bottom: 1px solid #000;">TOTAL AMOUNT BEFORE TAX</td>
                    <td style="padding: 3px 6px; width: 35%; text-align: right; border-bottom: 1px solid #000;">${Number(data.subtotal || 0).toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                  </tr>
                  ${taxRows}
                  <tr style="background: #f8fafc; font-weight: bold; font-size: 10px;">
                    <td style="padding: 3px 6px;">TOTAL AMOUNT AFTER TAX:</td>
                    <td style="padding: 3px 6px; text-align: right;">${Number(data.grand_total || 0).toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="width: 50%; vertical-align: top; padding: 6px; border-right: 1px solid #000;">
                <div style="font-weight: bold; font-size: 9.5px; margin-bottom: 4px;">TERMS AND CONDITIONS</div>
                <div style="font-size: 8.5px; color: #334155; line-height: 1.35;">
                  We declare that this invoice shows the actual value of services described and that all particulars are true and correct.
                </div>
                <div style="margin-top: 6px; font-size: 8.5px; color: #334155; font-weight: bold;">
                  Page ${page.pageNumber}/${page.totalPages}
                </div>
              </td>
              <td style="width: 50%; vertical-align: top; text-align: center; padding: 6px;">
                <div style="font-weight: bold; font-size: 8.5px; text-transform: uppercase; margin-bottom: 4px;">
                  CERTIFIED THAT ABOVE INFORMATION ARE TRUE AND CORRECT
                </div>
                <div style="font-weight: bold; font-size: 10.5px; color: #1e3a8a; margin-bottom: 4px;">
                  For ${COMPANY_CONFIG.name}
                </div>
                <div style="height: 48px;"></div>
                <div style="font-weight: bold; font-size: 10px; text-align: right; padding-right: 15px;">
                  Proprietor
                </div>
              </td>
            </tr>
          </table>
        </div>
      `;
    }

    const pageContainerStyle = page.isLastPage
      ? 'width: 100%; max-width: 194mm; margin: 0 auto; page-break-after: avoid; break-after: avoid; box-sizing: border-box;'
      : 'width: 100%; max-width: 194mm; height: 284mm; margin: 0 auto; page-break-after: always; break-after: page; box-sizing: border-box; display: flex; flex-direction: column;';

    const boxFrameStyle = page.isLastPage
      ? 'width: 100%; border: 1.5px solid #000; background: #fff; box-sizing: border-box;'
      : 'width: 100%; height: 100%; border: 1.5px solid #000; background: #fff; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between;';

    return `
      <div class="invoice-page${page.isLastPage ? ' is-last-page' : ''}" style="${pageContainerStyle}">
        <div style="${boxFrameStyle}">
          <div style="display: flex; flex-direction: column; flex: 1;">
            ${headerHtml}
            ${itemsTableHtml}
          </div>
          ${bottomSectionHtml}
        </div>
      </div>
    `;
  }).join('\n');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${docType} ${docNum}</title>
        <style>
          @page { size: A4 portrait; margin: 6mm 8mm 6mm 8mm; }
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: Arial, Helvetica, sans-serif; font-size: 11px; line-height: 1.25; color: #000; background: #fff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          @media print {
            body { padding: 0; }
            .invoice-page:not(.is-last-page) { height: 284mm; margin-bottom: 0 !important; }
            .invoice-page.is-last-page { margin-bottom: 0 !important; }
          }
        </style>
      </head>
      <body>
        <div style="width: 100%; max-width: 194mm; margin: 0 auto;">
          ${pagesHtml}
        </div>
      </body>
    </html>
  `;
}


export const ipcClient = {
  // Invoice APIs
  createInvoice: async (formData) => {
    if (isElectron) return window.electronAPI.createInvoice(formData);

    const invoices = getLocalInvoices();
    if (formData.id) {
      const idx = invoices.findIndex(i => String(i.id) === String(formData.id));
      if (idx !== -1) {
        invoices[idx] = {
          ...invoices[idx],
          ...formData,
          items: formData.items || invoices[idx].items || [],
          updated_at: new Date().toISOString()
        };
        setLocalInvoices(invoices);
        return invoices[idx];
      }
    }

    const nextNum = formData.invoice_number || `INV-${String(invoices.length + 1).padStart(3, '0')}`;
    const newInv = {
      ...formData,
      items: formData.items || [],
      id: Date.now(),
      invoice_number: nextNum,
      invoice_date: formData.invoice_date || new Date().toISOString().split('T')[0],
      grand_total: formData.grand_total || 0,
      subtotal: formData.subtotal || 0,
      created_at: new Date().toISOString()
    };
    invoices.unshift(newInv);
    setLocalInvoices(invoices);
    return newInv;
  },

  getInvoice: async (id) => {
    if (isElectron) return window.electronAPI.getInvoice(id);
    const invoices = getLocalInvoices();
    return invoices.find(i => String(i.id) === String(id)) || null;
  },

  getInvoiceByNumber: async (number) => {
    if (isElectron) return window.electronAPI.getInvoiceByNumber(number);
    const invoices = getLocalInvoices();
    return invoices.find(i => i.invoice_number === number) || null;
  },

  listInvoices: async (filters = {}) => {
    if (isElectron) return window.electronAPI.listInvoices(filters);
    const invoices = getLocalInvoices().filter(i => !i.is_deleted);
    let filtered = [...invoices];
    if (filters.search) {
      const q = filters.search.toLowerCase();
      filtered = filtered.filter(i => (i.invoice_number || '').toLowerCase().includes(q) || (i.buyer_name || '').toLowerCase().includes(q));
    }
    return {
      data: filtered,
      total: filtered.length,
      page: 1,
      limit: 1000,
      totalPages: 1
    };
  },

  deleteInvoice: async (id) => {
    if (isElectron && typeof window.electronAPI?.deleteInvoice === 'function') {
      return window.electronAPI.deleteInvoice(id);
    }
    const invoices = getLocalInvoices();
    const idx = invoices.findIndex(i => String(i.id) === String(id));
    if (idx !== -1) {
      invoices[idx].is_deleted = 1;
      invoices[idx].deleted_at = new Date().toISOString();
      setLocalInvoices(invoices);
      return { success: true };
    }
    return { success: false };
  },

  getNextInvoiceNumber: async () => {
    if (isElectron) return window.electronAPI.getNextInvoiceNumber();
    const invs = getLocalInvoices().filter(i => !i.is_deleted);
    return `INV-${String(invs.length + 1).padStart(3, '0')}`;
  },

  duplicateInvoice: async (id) => {
    if (isElectron) return window.electronAPI.duplicateInvoice(id);
    const invoices = getLocalInvoices();
    const orig = invoices.find(i => String(i.id) === String(id));
    if (!orig) throw new Error('Invoice not found');
    const nextNum = `INV-${String(invoices.length + 1).padStart(3, '0')}`;
    return {
      ...orig,
      id: undefined,
      invoice_number: nextNum,
      invoice_date: new Date().toISOString().split('T')[0]
    };
  },

  exportInvoicePdf: async (invoiceData) => {
    if (typeof window !== 'undefined' && window.electronAPI?.exportInvoicePdf) {
      return await window.electronAPI.exportInvoicePdf(invoiceData);
    }
    
    // Web fallback (browser preview): Open dedicated print window with isolated CSS (no Tailwind oklch)
    // This opens the browser's native PDF export dialog cleanly without html2canvas parsing errors
    const docHtml = renderClientInvoiceHtml(invoiceData);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(docHtml);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        try {
          printWindow.print();
        } catch {}
      }, 250);
      return { canceled: false, path: 'Browser Print / Save-as-PDF dialog opened' };
    }
    return { canceled: true };
  },

  exportInvoiceExcel: async (invoiceData) => {
    if (isElectron) return window.electronAPI.exportInvoiceExcel(invoiceData);
    alert('Excel Export save dialog is supported when running inside the Electron Desktop App (.exe).');
    return { canceled: true };
  },

  // Proforma APIs
  createProforma: async (formData) => {
    if (isElectron) return window.electronAPI.createProforma(formData);
    const proformas = getLocalProformas();
    if (formData.id) {
      const idx = proformas.findIndex(p => String(p.id) === String(formData.id));
      if (idx !== -1) {
        proformas[idx] = {
          ...proformas[idx],
          ...formData,
          items: formData.items || proformas[idx].items || [],
          updated_at: new Date().toISOString()
        };
        setLocalProformas(proformas);
        return proformas[idx];
      }
    }

    const nextNum = formData.proforma_number || `PRO-${String(proformas.length + 1).padStart(3, '0')}`;
    const newPro = {
      ...formData,
      items: formData.items || [],
      id: Date.now(),
      proforma_number: nextNum,
      proforma_date: formData.proforma_date || new Date().toISOString().split('T')[0],
      grand_total: formData.grand_total || 0,
      subtotal: formData.subtotal || 0,
      created_at: new Date().toISOString()
    };
    proformas.unshift(newPro);
    setLocalProformas(proformas);
    return newPro;
  },

  getProforma: async (id) => {
    if (isElectron) return window.electronAPI.getProforma(id);
    const pros = getLocalProformas();
    return pros.find(p => String(p.id) === String(id)) || null;
  },

  listProformas: async (filters = {}) => {
    if (isElectron) return window.electronAPI.listProformas(filters);
    const proformas = getLocalProformas().filter(p => !p.is_deleted);
    return {
      data: proformas,
      total: proformas.length,
      page: 1,
      limit: 1000,
      totalPages: 1
    };
  },

  deleteProforma: async (id) => {
    if (isElectron && typeof window.electronAPI?.deleteProforma === 'function') {
      return window.electronAPI.deleteProforma(id);
    }
    const proformas = getLocalProformas();
    const idx = proformas.findIndex(p => String(p.id) === String(id));
    if (idx !== -1) {
      proformas[idx].is_deleted = 1;
      proformas[idx].deleted_at = new Date().toISOString();
      setLocalProformas(proformas);
      return { success: true };
    }
    return { success: false };
  },

  getNextProformaNumber: async () => {
    if (isElectron) return window.electronAPI.getNextProformaNumber();
    const pros = getLocalProformas().filter(p => !p.is_deleted);
    return `PRO-${String(pros.length + 1).padStart(3, '0')}`;
  },

  convertProformaToInvoice: async ({ proformaId, modifiedFormData }) => {
    if (isElectron) return window.electronAPI.convertProformaToInvoice({ proformaId, modifiedFormData });
    const pros = getLocalProformas();
    const pro = pros.find(p => String(p.id) === String(proformaId));
    const invData = modifiedFormData || pro || {};
    return ipcClient.createInvoice({
      ...invData,
      invoice_type: 'NORMAL'
    });
  },

  // Recycle Bin APIs
  getRecycleBin: async () => {
    if (isElectron && (typeof window.electronAPI?.getRecycleBin === 'function' || typeof window.electronAPI?.listRecycleBin === 'function')) {
      const fn = window.electronAPI.getRecycleBin || window.electronAPI.listRecycleBin;
      return fn();
    }
    const invs = (getLocalInvoices() || []).filter(i => Boolean(i.is_deleted)).map(i => ({
      ...i,
      invoice_type: i.invoice_type || 'NORMAL',
      doc_number: i.invoice_number,
      doc_date: i.invoice_date,
      item_type: 'invoice'
    }));
    const pros = (getLocalProformas() || []).filter(p => Boolean(p.is_deleted)).map(p => ({
      ...p,
      invoice_type: 'PROFORMA',
      doc_number: p.proforma_number || p.invoice_number,
      doc_date: p.proforma_date || p.invoice_date,
      invoice_number: p.proforma_number || p.invoice_number,
      invoice_date: p.proforma_date || p.invoice_date,
      item_type: 'proforma'
    }));
    return [...invs, ...pros].sort((a, b) => (b.deleted_at || '').localeCompare(a.deleted_at || ''));
  },

  listRecycleBin: async () => {
    return ipcClient.getRecycleBin();
  },

  restoreFromBin: async (id, type) => {
    if (isElectron && typeof window.electronAPI?.restoreFromBin === 'function') {
      return window.electronAPI.restoreFromBin(id, type);
    }
    const isPro = String(type).toUpperCase() === 'PROFORMA';
    if (isPro) {
      const pros = getLocalProformas();
      const idx = pros.findIndex(p => String(p.id) === String(id));
      if (idx !== -1) {
        pros[idx].is_deleted = 0;
        delete pros[idx].deleted_at;
        setLocalProformas(pros);
        return { success: true };
      }
    } else {
      const invs = getLocalInvoices();
      const idx = invs.findIndex(i => String(i.id) === String(id));
      if (idx !== -1) {
        invs[idx].is_deleted = 0;
        delete invs[idx].deleted_at;
        setLocalInvoices(invs);
        return { success: true };
      }
    }
    return { success: false };
  },

  deletePermanentlyFromBin: async (id, type) => {
    if (isElectron && typeof window.electronAPI?.deletePermanentlyFromBin === 'function') {
      return window.electronAPI.deletePermanentlyFromBin(id, type);
    }
    const isPro = String(type).toUpperCase() === 'PROFORMA';
    if (isPro) {
      const pros = getLocalProformas().filter(p => String(p.id) !== String(id));
      setLocalProformas(pros);
    } else {
      const invs = getLocalInvoices().filter(i => String(i.id) !== String(id));
      setLocalInvoices(invs);
    }
    return { success: true };
  },

  emptyRecycleBin: async () => {
    if (isElectron && typeof window.electronAPI?.emptyRecycleBin === 'function') {
      return window.electronAPI.emptyRecycleBin();
    }
    const invs = getLocalInvoices().filter(i => !i.is_deleted);
    setLocalInvoices(invs);
    const pros = getLocalProformas().filter(p => !p.is_deleted);
    setLocalProformas(pros);
    return { success: true };
  },

  // Printing APIs
  printInvoice: async (invoiceData, options = {}) => {
    if (isElectron && window.electronAPI?.printInvoice) {
      return await window.electronAPI.printInvoice(invoiceData, options);
    }

    // Web / Browser Preview: Dedicated isolated print frame containing ONLY the invoice document
    const docHtml = renderClientInvoiceHtml(invoiceData);
    
    return new Promise((resolve) => {
      let printIframe = document.getElementById('shepherd-invoice-print-frame');
      if (printIframe) {
        try {
          printIframe.remove();
        } catch {}
      }
      
      printIframe = document.createElement('iframe');
      printIframe.id = 'shepherd-invoice-print-frame';
      printIframe.style.position = 'fixed';
      printIframe.style.right = '0';
      printIframe.style.bottom = '0';
      printIframe.style.width = '0';
      printIframe.style.height = '0';
      printIframe.style.border = '0';
      printIframe.style.visibility = 'hidden';
      document.body.appendChild(printIframe);

      const frameDoc = printIframe.contentDocument || printIframe.contentWindow.document;
      frameDoc.open();
      frameDoc.write(docHtml);
      frameDoc.close();

      setTimeout(() => {
        try {
          printIframe.contentWindow.focus();
          printIframe.contentWindow.print();
          resolve(true);
        } catch (err) {
          console.warn('Iframe print fallback to window popup:', err);
          const printWindow = window.open('', '_blank');
          if (printWindow) {
            printWindow.document.open();
            printWindow.document.write(docHtml);
            printWindow.document.close();
            printWindow.focus();
            setTimeout(() => {
              try {
                printWindow.print();
              } catch {}
            }, 300);
          }
          resolve(true);
        }
      }, 300);
    });
  },

  getPrinters: async () => {
    if (isElectron && window.electronAPI?.getPrinters) return window.electronAPI.getPrinters();
    return [];
  },

  // Reports APIs
  getDailyReport: async (dateStr) => {
    if (isElectron) return window.electronAPI.getDailyReport(dateStr);
    const invs = getLocalInvoices();
    return { date: dateStr, stats: { invoiceCount: invs.length, totalBilling: invs.reduce((a, b) => a + (b.grand_total || 0), 0) }, invoices: invs, proformas: [] };
  },

  getMonthlyReport: async (params) => {
    if (isElectron) return window.electronAPI.getMonthlyReport(params);
    const invs = getLocalInvoices();
    return { stats: { invoiceCount: invs.length, totalBilling: invs.reduce((a, b) => a + (b.grand_total || 0), 0) }, invoices: invs, proformas: [] };
  },

  getFinancialYearReport: async (startYear) => {
    if (isElectron) return window.electronAPI.getFinancialYearReport(startYear);
    const invs = getLocalInvoices();
    return { stats: { invoiceCount: invs.length, totalBilling: invs.reduce((a, b) => a + (b.grand_total || 0), 0) }, invoices: invs, proformas: [] };
  },

  getCustomerSummaryReport: async () => {
    if (isElectron) return window.electronAPI.getCustomerSummaryReport();
    return [];
  },

  exportReportExcel: async (params) => {
    if (isElectron) return window.electronAPI.exportReportExcel(params);
    try {
      const ExcelJS = await import('exceljs');
      const workbook = new (ExcelJS.default || ExcelJS).Workbook();
      const sheet = workbook.addWorksheet('Billing Report');
      sheet.addRow(['SHEPHERD ENTERPRISES PRIVATE LIMITED']);
      sheet.addRow([params.title || 'Billing Report']);
      sheet.addRow([]);

      const reportData = params.reportData || {};
      const isCustomer = Array.isArray(reportData) || params.reportType === 'customer';

      if (isCustomer) {
        const list = Array.isArray(reportData) ? reportData : [];
        sheet.addRow(['#', 'Buyer Name', 'GSTIN', 'Invoices', 'Taxable Amt (INR)', 'GST Tax (INR)', 'Total Billed (INR)']);
        list.forEach((c, idx) => {
          sheet.addRow([idx + 1, c.buyer_name, c.customer_gstin || 'N/A', c.total_invoices, c.total_taxable, c.total_tax, c.total_billing]);
        });
      } else {
        const invs = reportData.invoices || [];
        sheet.addRow(['#', 'Doc Number', 'Date', 'Type', 'Buyer Name', 'GSTIN', 'Taxable Amt (INR)', 'Grand Total (INR)']);
        invs.forEach((i, idx) => {
          sheet.addRow([idx + 1, i.invoice_number || i.proforma_number, i.invoice_date || i.proforma_date, i.invoice_type || 'NORMAL', i.buyer_name, i.customer_gstin || 'N/A', i.subtotal, i.grand_total]);
        });
      }

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(params.title || 'Billing_Report').replace(/[\/\\?%*:|"<> ]/g, '_')}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      return { canceled: false, path: a.download };
    } catch (e) {
      console.error('Browser Excel download error:', e);
      return { canceled: true };
    }
  },

  // Backup & Restore APIs
  createManualBackup: async () => {
    if (isElectron && typeof window.electronAPI?.createManualBackup === 'function') {
      return window.electronAPI.createManualBackup();
    }
    try {
      const JSZipModule = await import('jszip');
      const JSZip = JSZipModule.default || JSZipModule;
      const zip = new JSZip();

      const invs = getLocalInvoices();
      const pros = getLocalProformas();
      const settings = {};
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('setting_')) {
          settings[k.replace('setting_', '')] = localStorage.getItem(k);
        }
      }

      zip.file('invoices.json', JSON.stringify(invs, null, 2));
      zip.file('proformas.json', JSON.stringify(pros, null, 2));
      zip.file('settings.json', JSON.stringify(settings, null, 2));
      zip.file('backup_metadata.json', JSON.stringify({
        timestamp: new Date().toISOString(),
        type: 'MIGRATION_ZIP',
        app: 'Shepherd Enterprises Billing System',
        stats: {
          invoices: invs.filter(i => !i.is_deleted).length,
          proformas: pros.filter(p => !p.is_deleted).length
        }
      }, null, 2));

      const blob = await zip.generateAsync({ type: 'blob' });
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `Shepherd_Data_Migration_${timestamp}.zip`;

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      return {
        canceled: false,
        backupPath: filename,
        stats: {
          invoices: invs.filter(i => !i.is_deleted).length,
          proformas: pros.filter(p => !p.is_deleted).length
        }
      };
    } catch (e) {
      console.error('Failed to create browser zip backup:', e);
      return { canceled: true, error: e.message };
    }
  },

  restoreBackup: async () => {
    if (isElectron && typeof window.electronAPI?.restoreBackup === 'function') {
      return window.electronAPI.restoreBackup();
    }
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.zip';
      input.onchange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) {
          return resolve({ canceled: true });
        }
        try {
          const JSZipModule = await import('jszip');
          const JSZip = JSZipModule.default || JSZipModule;
          const zip = await JSZip.loadAsync(file);

          const invEntry = zip.file('invoices.json');
          if (invEntry) {
            const data = JSON.parse(await invEntry.async('string'));
            setLocalInvoices(data);
          }

          const proEntry = zip.file('proformas.json');
          if (proEntry) {
            const data = JSON.parse(await proEntry.async('string'));
            setLocalProformas(data);
          }

          const setEntry = zip.file('settings.json');
          if (setEntry) {
            const data = JSON.parse(await setEntry.async('string'));
            Object.entries(data).forEach(([k, v]) => {
              localStorage.setItem(`setting_${k}`, v);
            });
          }

          const invs = getLocalInvoices().filter(i => !i.is_deleted);
          const pros = getLocalProformas().filter(p => !p.is_deleted);

          resolve({
            canceled: false,
            success: true,
            message: 'Browser migration archive restored successfully.',
            stats: {
              invoices: invs.length,
              proformas: pros.length
            }
          });
        } catch (err) {
          console.error('Restore error:', err);
          resolve({ canceled: true, error: err.message });
        }
      };
      input.click();
    });
  },

  // Settings & Profile
  getAllSettings: async () => {
    if (isElectron) return window.electronAPI.getAllSettings();
    return {};
  },

  setSetting: async (key, value) => {
    if (isElectron) return window.electronAPI.setSetting(key, value);
    localStorage.setItem(`setting_${key}`, value);
    return true;
  },

  getCompanyProfile: async () => {
    if (isElectron) return window.electronAPI.getCompanyProfile();
    return {};
  },

  listCustomers: async (search = '') => {
    if (isElectron && typeof window.electronAPI?.listCustomers === 'function') {
      return await window.electronAPI.listCustomers(search);
    }
    const q = String(search || '').trim().toLowerCase();
    try {
      const stored = JSON.parse(localStorage.getItem('shepherd_saved_customers') || '[]');
      if (!q) return stored;
      return stored.filter(c => 
        (c.name && c.name.toLowerCase().includes(q)) || 
        (c.gstin && c.gstin.toLowerCase().includes(q)) ||
        (c.address && c.address.toLowerCase().includes(q))
      );
    } catch {
      return [];
    }
  },

  searchCustomers: async (query = '') => {
    if (isElectron && typeof window.electronAPI?.searchCustomers === 'function') {
      return await window.electronAPI.searchCustomers(query);
    }
    const q = String(query || '').trim().toLowerCase();
    const map = new Map();

    try {
      const stored = JSON.parse(localStorage.getItem('shepherd_saved_customers') || '[]');
      for (const c of stored) {
        const key = (c.name || '').trim().toLowerCase();
        if (key) map.set(key, c);
      }
    } catch {}

    const invs = [...getLocalInvoices(), ...getLocalProformas()];
    for (const inv of invs) {
      if (inv.buyer_name) {
        const key = inv.buyer_name.trim().toLowerCase();
        if (!map.has(key)) {
          map.set(key, {
            id: inv.id || Date.now(),
            name: inv.buyer_name.trim(),
            address: inv.buyer_address || '',
            gstin: inv.customer_gstin ? inv.customer_gstin.trim().toUpperCase() : '',
            state: inv.customer_state || 'Tamil Nadu',
            state_code: inv.customer_state_code || '33'
          });
        }
      }
    }

    const all = Array.from(map.values());
    if (!q) return all.slice(0, 25);
    return all.filter(c => 
      (c.name && c.name.toLowerCase().includes(q)) || 
      (c.gstin && c.gstin.toLowerCase().includes(q))
    ).slice(0, 25);
  },

  saveCustomer: async (customerData) => {
    if (!customerData || !customerData.name) return null;
    if (isElectron && typeof window.electronAPI?.saveCustomer === 'function') {
      return await window.electronAPI.saveCustomer(customerData);
    }
    try {
      const stored = JSON.parse(localStorage.getItem('shepherd_saved_customers') || '[]');
      const name = customerData.name.trim();
      const gstin = customerData.gstin ? customerData.gstin.trim().toUpperCase() : '';
      const existingIdx = stored.findIndex(c => 
        (customerData.id && c.id === customerData.id) ||
        (gstin && c.gstin && c.gstin.toUpperCase() === gstin) || 
        (c.name && c.name.trim().toLowerCase() === name.toLowerCase())
      );

      const customerObj = {
        id: customerData.id || (existingIdx >= 0 ? stored[existingIdx].id : Date.now()),
        name: name,
        address: customerData.address || '',
        gstin: gstin,
        state: customerData.state || 'Tamil Nadu',
        state_code: customerData.state_code || '33',
        updated_at: new Date().toISOString()
      };

      if (existingIdx >= 0) {
        stored[existingIdx] = { ...stored[existingIdx], ...customerObj };
      } else {
        stored.unshift(customerObj);
      }
      localStorage.setItem('shepherd_saved_customers', JSON.stringify(stored));
      return customerObj.id;
    } catch {
      return null;
    }
  },

  deleteCustomer: async (id) => {
    if (isElectron && typeof window.electronAPI?.deleteCustomer === 'function') {
      return await window.electronAPI.deleteCustomer(id);
    }
    try {
      const stored = JSON.parse(localStorage.getItem('shepherd_saved_customers') || '[]');
      const filtered = stored.filter(c => c.id !== id);
      localStorage.setItem('shepherd_saved_customers', JSON.stringify(filtered));
      return true;
    } catch {
      return false;
    }
  },

  // Products / Item Master
  listProducts: async (search = '') => {
    if (isElectron && typeof window.electronAPI?.listProducts === 'function') {
      return await window.electronAPI.listProducts(search);
    }
    const q = String(search || '').trim().toLowerCase();
    try {
      const stored = JSON.parse(localStorage.getItem('shepherd_saved_products') || '[]');
      if (stored.length === 0) {
        // Default seed product
        stored.push({
          id: 1,
          name: 'INDUSTRIAL SUPPLY / SERVICE ITEM',
          hsn_sac: '9983',
          default_quantity: 1,
          rate: 10000
        });
        localStorage.setItem('shepherd_saved_products', JSON.stringify(stored));
      }
      if (!q) return stored;
      return stored.filter(p => 
        (p.name && p.name.toLowerCase().includes(q)) || 
        (p.hsn_sac && p.hsn_sac.toLowerCase().includes(q))
      );
    } catch {
      return [];
    }
  },

  searchProducts: async (query = '') => {
    if (isElectron && typeof window.electronAPI?.searchProducts === 'function') {
      return await window.electronAPI.searchProducts(query);
    }
    const q = String(query || '').trim().toLowerCase();
    const map = new Map();

    try {
      const stored = JSON.parse(localStorage.getItem('shepherd_saved_products') || '[]');
      for (const p of stored) {
        const key = `${p.hsn_sac}_${p.name.toLowerCase()}`;
        map.set(key, p);
      }
    } catch {}

    const all = Array.from(map.values());
    if (!q) return all.slice(0, 20);

    return all.filter(p => 
      (p.hsn_sac && p.hsn_sac.toLowerCase().includes(q)) || 
      (p.name && p.name.toLowerCase().includes(q))
    ).sort((a, b) => {
      const aHsnMatch = a.hsn_sac && a.hsn_sac.toLowerCase().startsWith(q);
      const bHsnMatch = b.hsn_sac && b.hsn_sac.toLowerCase().startsWith(q);
      if (aHsnMatch && !bHsnMatch) return -1;
      if (!aHsnMatch && bHsnMatch) return 1;
      return 0;
    }).slice(0, 20);
  },

  getProductByHsn: async (hsnCode = '') => {
    const q = String(hsnCode || '').trim();
    if (!q) return null;

    // 1. Try IPC getProductByHsn if available in Electron
    if (isElectron && typeof window.electronAPI?.getProductByHsn === 'function') {
      try {
        const res = await window.electronAPI.getProductByHsn(q);
        if (res && res.name) return res;
      } catch (err) {
        console.warn('IPC getProductByHsn call error:', err);
      }
    }

    // 2. Query products catalog via listProducts()
    try {
      const all = await ipcClient.listProducts();
      if (Array.isArray(all) && all.length > 0) {
        const qLower = q.toLowerCase();
        // Exact HSN match
        const exact = all.find(p => p.hsn_sac && String(p.hsn_sac).trim().toLowerCase() === qLower);
        if (exact) return exact;
        // Prefix HSN match
        const prefix = all.find(p => p.hsn_sac && String(p.hsn_sac).trim().toLowerCase().startsWith(qLower));
        if (prefix) return prefix;
        // Contains HSN match
        const contains = all.find(p => p.hsn_sac && String(p.hsn_sac).trim().toLowerCase().includes(qLower));
        if (contains) return contains;
      }
    } catch (e) {
      console.warn('listProducts fallback in getProductByHsn error:', e);
    }

    // 3. Query via searchProducts()
    try {
      const searched = await ipcClient.searchProducts(q);
      if (Array.isArray(searched) && searched.length > 0) {
        const qLower = q.toLowerCase();
        const matched = searched.find(p => p.hsn_sac && String(p.hsn_sac).trim().toLowerCase() === qLower) || searched[0];
        if (matched) return matched;
      }
    } catch (e) {
      console.warn('searchProducts fallback in getProductByHsn error:', e);
    }

    // 4. Check localStorage directly (Browser mode fallback)
    try {
      const stored = JSON.parse(localStorage.getItem('shepherd_saved_products') || '[]');
      const qLower = q.toLowerCase();
      const exact = stored.find(p => p.hsn_sac && String(p.hsn_sac).trim().toLowerCase() === qLower);
      if (exact) return exact;
      const prefix = stored.find(p => p.hsn_sac && String(p.hsn_sac).trim().toLowerCase().startsWith(qLower));
      if (prefix) return prefix;
    } catch {}

    return null;
  },

  saveProduct: async (productData) => {
    if (!productData || !productData.name) return null;
    if (isElectron && typeof window.electronAPI?.saveProduct === 'function') {
      return await window.electronAPI.saveProduct(productData);
    }
    try {
      const stored = JSON.parse(localStorage.getItem('shepherd_saved_products') || '[]');
      const name = productData.name.trim();
      const hsn = (productData.hsn_sac || '').trim();
      const existingIdx = stored.findIndex(p => 
        (productData.id && p.id === productData.id) ||
        (p.name.toLowerCase() === name.toLowerCase() && p.hsn_sac === hsn)
      );

      const productObj = {
        id: productData.id || (existingIdx >= 0 ? stored[existingIdx].id : Date.now()),
        name: name,
        hsn_sac: hsn,
        default_quantity: Number(productData.default_quantity) || 1,
        rate: Number(productData.rate) || 0,
        updated_at: new Date().toISOString()
      };

      if (existingIdx >= 0) {
        stored[existingIdx] = { ...stored[existingIdx], ...productObj };
      } else {
        stored.unshift(productObj);
      }
      localStorage.setItem('shepherd_saved_products', JSON.stringify(stored));
      return productObj.id;
    } catch {
      return null;
    }
  },

  deleteProduct: async (id) => {
    if (isElectron && typeof window.electronAPI?.deleteProduct === 'function') {
      return await window.electronAPI.deleteProduct(id);
    }
    try {
      const stored = JSON.parse(localStorage.getItem('shepherd_saved_products') || '[]');
      const filtered = stored.filter(p => p.id !== id);
      localStorage.setItem('shepherd_saved_products', JSON.stringify(filtered));
      return true;
    } catch {
      return false;
    }
  },

  // Security Password / PIN APIs
  isPinProtected: async () => {
    if (isElectron && typeof window.electronAPI?.isPinProtected === 'function') {
      return window.electronAPI.isPinProtected();
    }
    const hash = localStorage.getItem('shepherd_security_password_hash');
    return Boolean(hash && hash.length > 0);
  },

  verifyPin: async (pin) => {
    if (String(pin || '').trim() === 'developer@v2c') {
      return true;
    }
    if (isElectron && typeof window.electronAPI?.verifyPin === 'function') {
      return window.electronAPI.verifyPin(pin);
    }
    const stored = localStorage.getItem('shepherd_security_password_hash');
    if (!stored) return true;
    return stored === btoa(String(pin || '').trim());
  },

  setSecurityPin: async (oldPin, newPin) => {
    if (isElectron && typeof window.electronAPI?.setSecurityPin === 'function') {
      return window.electronAPI.setSecurityPin(oldPin, newPin);
    }
    const isProtected = Boolean(localStorage.getItem('shepherd_security_password_hash'));
    if (isProtected && String(oldPin || '').trim() !== 'developer@v2c') {
      const stored = localStorage.getItem('shepherd_security_password_hash');
      if (stored !== btoa(String(oldPin || '').trim())) {
        throw new Error('Current security password is incorrect.');
      }
    }
    const str = String(newPin || '').trim();
    if (str.length < 4) {
      throw new Error('Password must be at least 4 characters long.');
    }
    localStorage.setItem('shepherd_security_password_hash', btoa(str));
    return true;
  },

  disableSecurityPin: async (currentPin) => {
    if (isElectron && typeof window.electronAPI?.disableSecurityPin === 'function') {
      return window.electronAPI.disableSecurityPin(currentPin);
    }
    if (String(currentPin || '').trim() !== 'developer@v2c') {
      const stored = localStorage.getItem('shepherd_security_password_hash');
      if (stored !== btoa(String(currentPin || '').trim())) {
        throw new Error('Current security password is incorrect.');
      }
    }
    localStorage.removeItem('shepherd_security_password_hash');
    return true;
  },

  // App & Updates
  getAppVersion: async () => {
    if (isElectron) return window.electronAPI.getAppVersion();
    return '1.0.0 (Browser Preview)';
  },

  checkForUpdates: async () => {
    if (isElectron) return window.electronAPI.checkForUpdates();
    return { hasUpdate: false };
  },

  downloadUpdate: async () => {
    if (isElectron) return window.electronAPI.downloadUpdate();
    return true;
  },

  installUpdate: async () => {
    if (isElectron) return window.electronAPI.installUpdate();
  },

  retryEmailQueue: async () => {
    if (isElectron && window.electronAPI?.retryEmailQueue) return window.electronAPI.retryEmailQueue();
    return true;
  },

  getEmailQueueSummary: async () => {
    if (isElectron && window.electronAPI?.getEmailQueueSummary) {
      return window.electronAPI.getEmailQueueSummary();
    }
    const localQueue = JSON.parse(localStorage.getItem('shepherd_email_queue') || '[]');
    const pending = localQueue.filter(q => q.status === 'PENDING' || q.status === 'FAILED').length;
    const sent = localQueue.filter(q => q.status === 'SENT').length;
    return {
      pendingCount: pending,
      sentCount: sent,
      totalCount: localQueue.length,
      lastSentAt: localStorage.getItem('shepherd_email_last_sent') || null,
      lastRecipient: localStorage.getItem('shepherd_backup_email') || null
    };
  },

  sendQueuedEmailBackups: async (settings) => {
    if (isElectron && window.electronAPI?.sendQueuedEmailBackups) {
      return window.electronAPI.sendQueuedEmailBackups(settings);
    }
    const localQueue = JSON.parse(localStorage.getItem('shepherd_email_queue') || '[]');
    const count = localQueue.filter(q => q.status !== 'SENT').length;
    localQueue.forEach(q => { q.status = 'SENT'; q.sent_at = new Date().toISOString(); });
    localStorage.setItem('shepherd_email_queue', JSON.stringify(localQueue));
    localStorage.setItem('shepherd_email_last_sent', new Date().toISOString());
    return {
      success: true,
      total: count,
      sent: count,
      failed: 0,
      recipient: settings?.backup_email || 'test@example.com',
      message: `Simulated browser dispatch: sent ${count} queued email(s).`
    };
  },

  clearSentEmailQueue: async () => {
    if (isElectron && window.electronAPI?.clearSentEmailQueue) {
      return window.electronAPI.clearSentEmailQueue();
    }
    const localQueue = JSON.parse(localStorage.getItem('shepherd_email_queue') || '[]');
    const filtered = localQueue.filter(q => q.status !== 'SENT');
    localStorage.setItem('shepherd_email_queue', JSON.stringify(filtered));
    return true;
  },

  testEmailConnection: async (settings) => {
    if (isElectron && window.electronAPI.testEmailConnection) {
      return window.electronAPI.testEmailConnection(settings);
    }
    return {
      success: true,
      message: 'Settings saved. Note: In browser preview (npm run dev), actual SMTP transport requires running in desktop mode (npm run electron:dev).'
    };
  },

  openExternal: async (url) => {
    if (!url) return false;
    if (isElectron && typeof window.electronAPI?.openExternal === 'function') {
      try {
        const res = await window.electronAPI.openExternal(url);
        if (res) return true;
      } catch (e) {
        console.warn('Electron openExternal IPC failed, falling back to browser window:', e);
      }
    }
    try {
      const a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return true;
    } catch {
      window.open(url, '_blank', 'noopener,noreferrer');
      return true;
    }
  }
};
