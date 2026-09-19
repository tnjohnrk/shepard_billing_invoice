const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Invoice Operations
  createInvoice: (formData) => ipcRenderer.invoke('invoice:create', formData),
  getInvoice: (id) => ipcRenderer.invoke('invoice:get', id),
  getInvoiceByNumber: (number) => ipcRenderer.invoke('invoice:getByNumber', number),
  listInvoices: (filters) => ipcRenderer.invoke('invoice:list', filters),
  getNextInvoiceNumber: () => ipcRenderer.invoke('invoice:getNextNumber'),
  duplicateInvoice: (id) => ipcRenderer.invoke('invoice:duplicate', id),
  exportInvoicePdf: (invoiceData) => ipcRenderer.invoke('invoice:exportPdf', invoiceData),
  exportInvoiceExcel: (invoiceData) => ipcRenderer.invoke('invoice:exportExcel', invoiceData),

  // Proforma Operations
  createProforma: (formData) => ipcRenderer.invoke('proforma:create', formData),
  getProforma: (id) => ipcRenderer.invoke('proforma:get', id),
  listProformas: (filters) => ipcRenderer.invoke('proforma:list', filters),
  getNextProformaNumber: () => ipcRenderer.invoke('proforma:getNextNumber'),
  convertProformaToInvoice: (params) => ipcRenderer.invoke('proforma:convertToInvoice', params),

  // Printing
  printInvoice: (invoiceData, options) => ipcRenderer.invoke('print:invoice', { invoiceData, options }),
  getPrinters: () => ipcRenderer.invoke('print:getPrinters'),

  // Reports
  getDailyReport: (dateStr) => ipcRenderer.invoke('report:daily', dateStr),
  getMonthlyReport: (params) => ipcRenderer.invoke('report:monthly', params),
  getFinancialYearReport: (startYear) => ipcRenderer.invoke('report:financialYear', startYear),
  getCustomerSummaryReport: () => ipcRenderer.invoke('report:customerSummary'),
  exportReportExcel: (params) => ipcRenderer.invoke('report:exportExcel', params),

  // Backups
  createManualBackup: () => ipcRenderer.invoke('backup:createManual'),
  restoreBackup: () => ipcRenderer.invoke('backup:restore'),

  // Recycle Bin & Deletion
  deleteInvoice: (id) => ipcRenderer.invoke('invoice:delete', id),
  deleteProforma: (id) => ipcRenderer.invoke('proforma:delete', id),
  getRecycleBin: () => ipcRenderer.invoke('bin:list'),
  restoreFromBin: (id, type) => ipcRenderer.invoke('bin:restore', { id, type }),
  deletePermanentlyFromBin: (id, type) => ipcRenderer.invoke('bin:deletePermanent', { id, type }),
  emptyRecycleBin: () => ipcRenderer.invoke('bin:empty'),

  // Settings & Profile
  getAllSettings: () => ipcRenderer.invoke('settings:getAll'),
  setSetting: (key, value) => ipcRenderer.invoke('settings:set', { key, value }),
  testEmailConnection: (settings) => ipcRenderer.invoke('settings:testEmail', settings),
  getCompanyProfile: () => ipcRenderer.invoke('company:getProfile'),
  searchCustomers: (query) => ipcRenderer.invoke('customers:search', query),

  // Security PIN
  isPinProtected: () => ipcRenderer.invoke('pin:isProtected'),
  verifyPin: (pin) => ipcRenderer.invoke('pin:verify', pin),
  setSecurityPin: (oldPin, newPin) => ipcRenderer.invoke('pin:set', { oldPin, newPin }),
  disableSecurityPin: (currentPin) => ipcRenderer.invoke('pin:disable', currentPin),

  // App & Updates
  getAppVersion: () => ipcRenderer.invoke('app:getVersion'),
  checkForUpdates: () => ipcRenderer.invoke('app:checkForUpdates'),
  downloadUpdate: () => ipcRenderer.invoke('app:downloadUpdate'),
  installUpdate: () => ipcRenderer.invoke('app:installUpdate'),
  retryEmailQueue: () => ipcRenderer.invoke('app:retryEmailQueue'),

  // Listeners
  onUpdateAvailable: (callback) => {
    ipcRenderer.on('app:update-available', (_, info) => callback(info));
  },
  onUpdateDownloaded: (callback) => {
    ipcRenderer.on('app:update-downloaded', (_, info) => callback(info));
  }
});
