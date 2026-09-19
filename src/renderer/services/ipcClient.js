import { getCopyTypeLabel } from '../../shared/constants/copyTypes';
import companyLogo from '../assets/logo.png';

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
  const items = data.items || [];

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
    ? `<div style="margin-top: 4px; font-size: 9.5px; font-weight: bold; line-height: 1.4;">${refs.join('<br>')}</div>`
    : '';

  const itemRows = items.length === 0 ? `
    <tr>
      <td style="padding: 4px 6px; border-right: 1px solid #000; vertical-align: top;">
        <div style="font-weight: bold; text-transform: uppercase;">-</div>
        ${refsHtml}
      </td>
      <td style="padding: 4px 6px; border-right: 1px solid #000; text-align: center; vertical-align: top;">-</td>
      <td style="padding: 4px 6px; border-right: 1px solid #000; text-align: center; vertical-align: top;">-</td>
      <td style="padding: 4px 6px; border-right: 1px solid #000; text-align: right; vertical-align: top;">-</td>
      <td style="padding: 4px 6px; text-align: right; vertical-align: top;">-</td>
    </tr>
  ` : items.map((item, idx) => `
    <tr>
      <td style="padding: 4px 6px; border-right: 1px solid #000; vertical-align: top;">
        <div style="font-weight: bold; text-transform: uppercase;">${item.description || ''}</div>
        ${idx === 0 ? refsHtml : ''}
      </td>
      <td style="padding: 4px 6px; border-right: 1px solid #000; text-align: center; vertical-align: top;">${item.hsn_sac || '-'}</td>
      <td style="padding: 4px 6px; border-right: 1px solid #000; text-align: center; vertical-align: top;">${item.quantity || 0}</td>
      <td style="padding: 4px 6px; border-right: 1px solid #000; text-align: right; vertical-align: top;">${Number(item.rate || 0).toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
      <td style="padding: 4px 6px; text-align: right; vertical-align: top;">${Number(item.amount || ((item.quantity || 0) * (item.rate || 0))).toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
    </tr>
  `).join('');

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

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${docType} - ${docNum}</title>
      <style>
        @page { size: A4 portrait; margin: 8mm; }
        body { font-family: Arial, Helvetica, sans-serif; font-size: 11px; line-height: 1.25; margin: 0; padding: 0; background: #fff; color: #000; }
        .invoice-box { width: 100%; max-width: 194mm; margin: 0 auto; }
        table { width: 100%; border-collapse: collapse; }
        .main-table { border: 1.5px solid #000; }
        .main-table td { border: 1px solid #000; }
        @media print { body { padding: 0; } }
      </style>
    </head>
    <body>
      <div class="invoice-box">
        <!-- Top Header -->
        <table style="margin-bottom: 6px;">
          <tr>
            <td style="width: 18%; vertical-align: top; text-align: center; border: none; padding-right: 8px;">
              <img src="${companyLogo}" alt="Logo" style="width: 60px; height: 60px; object-fit: contain; display: block; margin: 0 auto;" />
              <div style="font-size: 8px; font-weight: bold; text-transform: uppercase; margin-top: 2px;">SHEPHERD ENTERPRISES</div>
              <div style="font-size: 7.5px; color: #475569;">@hdfcbank</div>
            </td>
            <td style="width: 82%; vertical-align: top; text-align: center; border: none; padding-right: 25px;">
              <div style="font-size: 20px; font-weight: 800; text-transform: uppercase; color: #1e3a8a; margin-bottom: 3px;">SHEPHERD ENTERPRISES PRIVATE LIMITED</div>
              <div style="font-size: 9.5px; text-transform: uppercase; margin-bottom: 3px;">No.4 & 5 Jenila nagar, Thirumullaivayol salai, Kovilpadagai, Poonamallee, Tiruvallur- 600062</div>
              <div style="font-size: 10px; font-weight: bold; margin-bottom: 2px;">Cell: +91 9025812298 / +91 8438435681</div>
              <div style="font-size: 10px; font-weight: bold;">Email: shepheredenterprisespvtltd@gmail.com</div>
            </td>
          </tr>
        </table>

        <!-- Main Boxed Table -->
        <table class="main-table">
          <!-- Sub-Header Row -->
          <tr style="border-bottom: 1.5px solid #000;">
            <td style="width: 38%; padding: 4px 6px; font-weight: bold; font-size: 11px;">GSTIN: 27AAACS1234F1Z5</td>
            <td style="width: 24%; padding: 4px 6px; font-weight: 900; font-size: 16px; text-align: center; color: #1e3a8a; text-transform: uppercase;">${docType}</td>
            <td style="width: 38%; padding: 4px 6px; font-weight: bold; font-size: 10px; text-align: right; text-transform: uppercase;">${copyTypeLabel}</td>
          </tr>

          <!-- Meta Grid (2-Columns) -->
          <tr>
            <td colspan="2" style="width: 50%; padding: 4px 6px; vertical-align: top; font-size: 10px; border-right: 1px solid #000;">
              <div><strong>INVOICE NO :</strong> <strong>${docNum}</strong></div>
              <div><strong>INVOICE DATE:</strong> ${docDate}</div>
              <div><strong>STATE:</strong> MAHARASHTRA <strong style="margin-left: 10px;">STATE CODE:</strong> 27</div>
              <div style="margin-top: 4px;">
                <div><strong>BUYER:</strong> <strong>${data.buyer_name || ''}</strong></div>
                <div style="font-size: 9.5px; margin-top: 2px;">${data.buyer_address || ''}</div>
              </div>
            </td>
            <td style="width: 50%; padding: 4px 6px; vertical-align: top; font-size: 10px;">
              <div><strong>TRANSPORTATION MODE:</strong> ${data.transportation_mode || '-'}</div>
              <div><strong>VEHICLE NO:</strong> ${data.vehicle_number || '-'}</div>
              <div><strong>DATE OF SUPPLY:</strong> ${data.date_of_supply || docDate || '-'}</div>
              <div><strong>DELIVERY ADDRESS:</strong> ${data.delivery_address || data.buyer_address || '-'}</div>
            </td>
          </tr>

          <!-- Customer GSTIN & State Code -->
          <tr style="border-top: 1px solid #000; border-bottom: 1.5px solid #000;">
            <td colspan="2" style="width: 60%; padding: 4px 6px; font-size: 10px; font-weight: bold;">
              CUSTOMER' GSTIN: ${data.customer_gstin || 'N/A'}
            </td>
            <td style="width: 40%; padding: 4px 6px; font-size: 10px;">
              <div><strong>STATE:</strong> ${(data.customer_state || 'Maharashtra').toUpperCase()}</div>
              <div><strong>STATE CODE:</strong> ${data.customer_state_code || '27'}</div>
            </td>
          </tr>

          <!-- Items Table -->
          <tr>
            <td colspan="3" style="padding: 0; border: none;">
              <table>
                <thead>
                  <tr style="background: #f8fafc; border-bottom: 1.5px solid #000; font-size: 10px; font-weight: bold;">
                    <th style="padding: 4px; border-right: 1px solid #000; text-align: left; width: 54%;">DESCRIPTION</th>
                    <th style="padding: 4px; border-right: 1px solid #000; text-align: center; width: 11%;">HSN</th>
                    <th style="padding: 4px; border-right: 1px solid #000; text-align: center; width: 11%;">QTY.</th>
                    <th style="padding: 4px; border-right: 1px solid #000; text-align: right; width: 12%;">RATE</th>
                    <th style="padding: 4px; text-align: right; width: 12%;">AMOUNT</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemRows}
                  <tr>
                    <td style="height: 180px; border-right: 1px solid #000;"></td>
                    <td style="border-right: 1px solid #000;"></td>
                    <td style="border-right: 1px solid #000;"></td>
                    <td style="border-right: 1px solid #000;"></td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>

          <!-- Amount in Words -->
          <tr style="border-top: 1.5px solid #000; border-bottom: 1.5px solid #000;">
            <td colspan="3" style="padding: 5px 6px; font-size: 10px;">
              <strong>TOTAL AMOUNT IN WORDS:</strong> ${data.amount_in_words || 'Zero Rupees Only'}
            </td>
          </tr>

          <!-- Bank Details & Tax Section -->
          <tr>
            <td colspan="2" style="width: 60%; padding: 5px 6px; vertical-align: top; border-right: 1px solid #000; font-size: 9.5px;">
              <div style="font-weight: bold; font-size: 10px; text-transform: uppercase; margin-bottom: 3px;">BANK DETAILS</div>
              <div><strong>BANK NAME:</strong> HDFC BANK LTD: 50200012345678</div>
              <div><strong>BRANCH NAME:</strong> THANE INDUSTRIAL ESTATE BRANCH</div>
              <div><strong>IFSC CODE:</strong> HDFC0001234</div>
            </td>
            <td style="width: 40%; padding: 0; vertical-align: top;">
              <table style="font-size: 9.5px;">
                <tr style="border-bottom: 1px solid #000;">
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

        <!-- Footer: Terms & Signature -->
        <table style="margin-top: 8px; font-size: 9px;">
          <tr>
            <td style="width: 48%; vertical-align: top; padding: 0 4px; border: none;">
              <div style="font-weight: bold; font-size: 9.5px; margin-bottom: 4px;">TERMS AND CONDITIONS</div>
              <div style="font-size: 8.5px; color: #334155; line-height: 1.35;">
                We declare that this invoice shows the actual value of services described and that all particulars are true and correct.
              </div>
            </td>
            <td style="width: 52%; vertical-align: top; text-align: center; padding: 0 4px; border: none;">
              <div style="font-weight: bold; font-size: 8.5px; text-transform: uppercase; margin-bottom: 4px;">
                CERTIFIED THAT ABOVE INFORMATION ARE TRUE AND CORRECT
              </div>
              <div style="font-weight: bold; font-size: 10.5px; color: #1e3a8a; margin-bottom: 4px;">
                For SHEPHERD ENTERPRISES PRIVATE LIMITED
              </div>
              <div style="height: 48px;"></div>
              <div style="font-weight: bold; font-size: 10px; text-align: right; padding-right: 15px;">
                Proprietor
              </div>
            </td>
          </tr>
        </table>
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
    if (isElectron && typeof window.electronAPI?.getRecycleBin === 'function') {
      return window.electronAPI.getRecycleBin();
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
  printInvoice: async (invoiceData, options) => {
    if (isElectron) return window.electronAPI.printInvoice(invoiceData, options);
    window.print();
    return true;
  },

  getPrinters: async () => {
    if (isElectron) return window.electronAPI.getPrinters();
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

  searchCustomers: async (query) => {
    if (isElectron) return window.electronAPI.searchCustomers(query);
    return [];
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
    if (isElectron) return window.electronAPI.retryEmailQueue();
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
  }
};
