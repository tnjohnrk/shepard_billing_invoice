import { ipcMain } from 'electron';
import { saveNewProforma, fetchProforma, queryProformas, getNextProformaNumber, convertProformaToTaxInvoice } from '../services/proformaService.js';

export function registerProformaIPC() {
  ipcMain.handle('proforma:create', async (_, formData) => {
    return saveNewProforma(formData);
  });

  ipcMain.handle('proforma:get', async (_, id) => {
    return fetchProforma(id);
  });

  ipcMain.handle('proforma:list', async (_, filters) => {
    return queryProformas(filters);
  });

  ipcMain.handle('proforma:getNextNumber', async () => {
    return getNextProformaNumber();
  });

  ipcMain.handle('proforma:convertToInvoice', async (_, { proformaId, modifiedFormData }) => {
    return await convertProformaToTaxInvoice(proformaId, modifiedFormData);
  });
}
