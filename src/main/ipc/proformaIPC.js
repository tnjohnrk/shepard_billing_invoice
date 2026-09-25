import { ipcMain } from 'electron';
import { saveNewProforma, fetchProforma, queryProformas, getNextProformaNumber, convertProformaToTaxInvoice } from '../services/proformaService.js';
import { formatHumanReadableError } from '../../shared/utils/errorHandler.js';

export function registerProformaIPC() {
  ipcMain.handle('proforma:create', async (_, formData) => {
    try {
      return await saveNewProforma(formData);
    } catch (err) {
      throw new Error(formatHumanReadableError(err));
    }
  });

  ipcMain.handle('proforma:get', async (_, id) => {
    try {
      return await fetchProforma(id);
    } catch (err) {
      throw new Error(formatHumanReadableError(err));
    }
  });

  ipcMain.handle('proforma:list', async (_, filters) => {
    try {
      return await queryProformas(filters);
    } catch (err) {
      throw new Error(formatHumanReadableError(err));
    }
  });

  ipcMain.handle('proforma:getNextNumber', async () => {
    try {
      return await getNextProformaNumber();
    } catch (err) {
      throw new Error(formatHumanReadableError(err));
    }
  });

  ipcMain.handle('proforma:convertToInvoice', async (_, { proformaId, modifiedFormData }) => {
    try {
      return await convertProformaToTaxInvoice(proformaId, modifiedFormData);
    } catch (err) {
      throw new Error(formatHumanReadableError(err));
    }
  });
}
