// Client wrapper over window.electronAPI contextBridge with browser preview fallback

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
  const docType = isProforma ? 'PROFORMA INVOICE' : 'TAX INVOICE';
  const docNum = isProforma 
    ? (data.proforma_number || 'PRO-001') 
    : (data.invoice_number || 'INV-001');
  const docDate = (isProforma ? data.proforma_date : data.invoice_date) || new Date().toISOString().split('T')[0];
  const items = data.items || [];

  const itemRows = items.map((item, idx) => `
    <tr>
      <td style="text-align:center; padding: 6px; border: 1px solid #000;">${idx + 1}</td>
      <td style="padding: 6px; border: 1px solid #000;"><strong>${item.description || ''}</strong></td>
      <td style="text-align:center; padding: 6px; border: 1px solid #000;">${item.hsn_sac || '-'}</td>
      <td style="text-align:right; padding: 6px; border: 1px solid #000;">${item.quantity || 0}</td>
      <td style="text-align:right; padding: 6px; border: 1px solid #000;">₹${Number(item.rate || 0).toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
      <td style="text-align:right; padding: 6px; border: 1px solid #000;">₹${Number(item.amount || ((item.quantity || 0) * (item.rate || 0))).toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${docType} - ${docNum}</title>
      <style>
        body { font-family: Arial, sans-serif; font-size: 11px; margin: 0; padding: 20px; background: #fff; color: #000; }
        .box { width: 100%; max-width: 800px; margin: 0 auto; border: 2px solid #000; padding: 16px; box-sizing: border-box; }
        .header { border-bottom: 2px solid #000; padding-bottom: 12px; display: flex; justify-content: space-between; align-items: flex-start; }
        .company-name { font-size: 16px; font-weight: bold; }
        .doc-title { font-size: 18px; font-weight: 900; text-align: right; text-transform: uppercase; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; border-bottom: 2px solid #000; padding: 12px 0; font-size: 11px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th { background: #f1f5f9; border: 1px solid #000; padding: 6px; font-size: 10px; text-transform: uppercase; }
        .totals { margin-top: 10px; border-top: 2px solid #000; padding-top: 10px; display: flex; justify-content: space-between; font-size: 11px; }
        .footer { margin-top: 20px; border-top: 2px solid #000; padding-top: 10px; display: flex; justify-content: space-between; font-size: 10px; }
        @media print {
          body { padding: 0; }
          .box { border: none; }
        }
      </style>
    </head>
    <body>
      <div class="box">
        <div class="header">
          <div>
            <div class="company-name">SHEPHERD ENTERPRISES PRIVATE LIMITED</div>
            <div>Plot No. 42, Shepherd Industrial Estate, MIDC Area, Thane, Maharashtra - 400604</div>
            <div>Phone: +91 98765 43210 | Email: billing@shepherdenterprises.com</div>
            <div><strong>GSTIN: 27AAACS1234F1Z5</strong> | State Code: 27 (Maharashtra)</div>
          </div>
          <div>
            <div class="doc-title">${docType}</div>
            <div style="text-align:right; font-weight:bold; font-size: 10px; border: 1px solid #000; padding: 2px 6px; margin-top: 4px; display: inline-block;">Original for Recipient</div>
          </div>
        </div>

        <div class="grid">
          <div>
            <div style="font-weight:bold; color: #475569; font-size: 9px; text-transform: uppercase;">Billed To (Buyer):</div>
            <div style="font-size: 13px; font-weight: bold; margin-top: 2px;">${data.buyer_name || ''}</div>
            <div style="margin-top: 2px;">${data.buyer_address || ''}</div>
            <div style="margin-top: 4px;">
              <strong>GSTIN:</strong> ${data.customer_gstin || 'N/A'}<br>
              <strong>State:</strong> ${data.customer_state || 'Maharashtra'} (Code: ${data.customer_state_code || '27'})
            </div>
          </div>
          <div style="text-align: right; line-height: 1.5;">
            <strong>Document No:</strong> ${docNum}<br>
            <strong>Date:</strong> ${docDate}<br>
            <strong>Transport Mode:</strong> ${data.transportation_mode || '-'}<br>
            <strong>Vehicle No:</strong> ${data.vehicle_number || '-'}<br>
            <strong>PO/SO No:</strong> ${data.so_po_number || '-'}
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 5%;">#</th>
              <th style="text-align:left;">Description of Goods / Services</th>
              <th style="width: 12%;">HSN/SAC</th>
              <th style="text-align:right; width: 10%;">Qty</th>
              <th style="text-align:right; width: 15%;">Rate (₹)</th>
              <th style="text-align:right; width: 18%;">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            ${itemRows}
          </tbody>
        </table>

        <div class="totals">
          <div style="max-width: 60%;">
            <div style="font-weight:bold; color: #475569; font-size: 9px; text-transform: uppercase;">Amount Chargeable (in words):</div>
            <div style="font-weight: bold; font-size: 11px; margin-top: 2px;">${data.amount_in_words || 'Zero Rupees Only'}</div>
          </div>
          <div style="text-align:right; line-height: 1.6;">
            <div>Subtotal: ₹${Number(data.subtotal || 0).toLocaleString('en-IN', {minimumFractionDigits: 2})}</div>
            ${data.cgst_amount > 0 ? `<div>CGST @ ${data.cgst_rate || 9}%: ₹${Number(data.cgst_amount).toLocaleString('en-IN', {minimumFractionDigits: 2})}</div>` : ''}
            ${data.sgst_amount > 0 ? `<div>SGST @ ${data.sgst_rate || 9}%: ₹${Number(data.sgst_amount).toLocaleString('en-IN', {minimumFractionDigits: 2})}</div>` : ''}
            ${data.igst_amount > 0 ? `<div>IGST @ ${data.igst_rate || 18}%: ₹${Number(data.igst_amount).toLocaleString('en-IN', {minimumFractionDigits: 2})}</div>` : ''}
            <div style="font-size: 14px; font-weight: bold; margin-top: 4px; border-top: 1px solid #000; padding-top: 4px;">Grand Total: ₹${Number(data.grand_total || 0).toLocaleString('en-IN', {minimumFractionDigits: 2})}</div>
          </div>
        </div>

        <div class="footer">
          <div>
            <strong>Bank Account Details:</strong><br>
            Bank Name: HDFC Bank Ltd. | A/C: 50200012345678<br>
            IFSC: HDFC0001234 | Branch: Thane Industrial Estate
          </div>
          <div style="text-align:right;">
            <strong>For SHEPHERD ENTERPRISES PRIVATE LIMITED</strong>
            <div style="height: 35px;"></div>
            <div>(Authorized Signatory)</div>
          </div>
        </div>
      </div>
      <script>
        window.onload = function() { window.print(); };
      </script>
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
          updated_at: new Date().toISOString()
        };
        setLocalInvoices(invoices);
        return invoices[idx];
      }
    }

    const nextNum = formData.invoice_number || `INV-${String(invoices.length + 1).padStart(3, '0')}`;
    const newInv = {
      ...formData,
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
    const invoices = getLocalInvoices();
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

  getNextInvoiceNumber: async () => {
    if (isElectron) return window.electronAPI.getNextInvoiceNumber();
    const invs = getLocalInvoices();
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
    if (isElectron) return window.electronAPI.exportInvoicePdf(invoiceData);
    
    // Render full invoice document in printable window for PDF download
    const docHtml = renderClientInvoiceHtml(invoiceData);
    const printWin = window.open('', '_blank');
    if (printWin) {
      printWin.document.write(docHtml);
      printWin.document.close();
      return { canceled: false, path: 'Downloads/Full_Invoice_Document.pdf' };
    }
    window.print();
    return { canceled: false, path: 'Downloads/Full_Invoice_Document.pdf' };
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
          updated_at: new Date().toISOString()
        };
        setLocalProformas(proformas);
        return proformas[idx];
      }
    }

    const nextNum = formData.proforma_number || `PRO-${String(proformas.length + 1).padStart(3, '0')}`;
    const newPro = {
      ...formData,
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
    const proformas = getLocalProformas();
    return {
      data: proformas,
      total: proformas.length,
      page: 1,
      limit: 1000,
      totalPages: 1
    };
  },

  getNextProformaNumber: async () => {
    if (isElectron) return window.electronAPI.getNextProformaNumber();
    const pros = getLocalProformas();
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
    return { canceled: true };
  },

  // Backup & Restore APIs
  createManualBackup: async () => {
    if (isElectron) return window.electronAPI.createManualBackup();
    alert('Database Backup is supported in Electron Desktop App (.exe).');
    return { canceled: true };
  },

  restoreBackup: async () => {
    if (isElectron) return window.electronAPI.restoreBackup();
    alert('Database Restore is supported in Electron Desktop App (.exe).');
    return { canceled: true };
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

  // Security PIN APIs
  isPinProtected: async () => {
    if (isElectron) return window.electronAPI.isPinProtected();
    return false;
  },

  verifyPin: async (pin) => {
    if (isElectron) return window.electronAPI.verifyPin(pin);
    return true;
  },

  setSecurityPin: async (oldPin, newPin) => {
    if (isElectron) return window.electronAPI.setSecurityPin(oldPin, newPin);
    return true;
  },

  disableSecurityPin: async (currentPin) => {
    if (isElectron) return window.electronAPI.disableSecurityPin(currentPin);
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
