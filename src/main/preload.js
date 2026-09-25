import { contextBridge, ipcRenderer } from 'electron';

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
  listRecycleBin: () => ipcRenderer.invoke('bin:list'),
  restoreFromBin: (id, type) => ipcRenderer.invoke('bin:restore', { id, type }),
  deletePermanentlyFromBin: (id, type) => ipcRenderer.invoke('bin:deletePermanent', { id, type }),
  emptyRecycleBin: () => ipcRenderer.invoke('bin:empty'),

  // Settings, Master Details & Profile
  getAllSettings: () => ipcRenderer.invoke('settings:getAll'),
  setSetting: (key, value) => ipcRenderer.invoke('settings:set', { key, value }),
  testEmailConnection: (settings) => ipcRenderer.invoke('settings:testEmail', settings),
  getCompanyProfile: () => ipcRenderer.invoke('company:getProfile'),

  // Company / Customer Directory
  listCustomers: (search) => ipcRenderer.invoke('customers:list', search),
  searchCustomers: (query) => ipcRenderer.invoke('customers:search', query),
  saveCustomer: (customerData) => ipcRenderer.invoke('customers:save', customerData),
  deleteCustomer: (id) => ipcRenderer.invoke('customers:delete', id),
  getCustomer: (id) => ipcRenderer.invoke('customers:get', id),

  // Product Catalog
  listProducts: (search) => ipcRenderer.invoke('products:list', search),
  searchProducts: (query) => ipcRenderer.invoke('products:search', query),
  getProductByHsn: (hsnCode) => ipcRenderer.invoke('products:getByHsn', hsnCode),
  saveProduct: (productData) => ipcRenderer.invoke('products:save', productData),
  deleteProduct: (id) => ipcRenderer.invoke('products:delete', id),
  getProduct: (id) => ipcRenderer.invoke('products:get', id),

  // Security PIN
  isPinProtected: () => ipcRenderer.invoke('pin:isProtected'),
  verifyPin: (pin) => ipcRenderer.invoke('pin:verify', pin),
  setSecurityPin: (oldPin, newPin) => ipcRenderer.invoke('pin:set', { oldPin, newPin }),
  disableSecurityPin: (currentPin) => ipcRenderer.invoke('pin:disable', currentPin),

  // License & Test Mode
  getLicenseStatus: () => ipcRenderer.invoke('license:getStatus'),
  setLicenseMode: (payload) => ipcRenderer.invoke('license:setMode', payload),

  // App & Updates
  getAppVersion: () => ipcRenderer.invoke('app:getVersion'),
  openExternal: (url) => ipcRenderer.invoke('app:openExternal', url),
  checkForUpdates: () => ipcRenderer.invoke('app:checkForUpdates'),
  downloadUpdate: () => ipcRenderer.invoke('app:downloadUpdate'),
  retryEmailQueue: () => ipcRenderer.invoke('app:retryEmailQueue'),
  getEmailQueueSummary: () => ipcRenderer.invoke('emailQueue:getSummary'),
  sendQueuedEmailBackups: (settings) => ipcRenderer.invoke('emailQueue:sendAll', settings),
  clearSentEmailQueue: () => ipcRenderer.invoke('emailQueue:clearSent'),

  // Listeners
  onUpdateAvailable: (callback) => {
    ipcRenderer.on('app:update-available', (_, info) => callback(info));
  },
  onUpdateDownloaded: (callback) => {
    ipcRenderer.on('app:update-downloaded', (_, info) => callback(info));
  }
});
