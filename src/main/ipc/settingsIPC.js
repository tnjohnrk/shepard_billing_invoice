import { ipcMain } from 'electron';
import { fetchAppSettings, saveAppSetting } from '../services/settingsService.js';
import { isPinProtected, verifyPin, setSecurityPin, disableSecurityPin } from '../services/pinService.js';
import { getCompanyProfile } from '../services/companyService.js';
import { findCustomers } from '../services/customerService.js';
import { processPendingEmailQueue } from '../services/emailQueueService.js';
import { testSmtpConnection } from '../services/emailService.js';

export function registerSettingsIPC() {
  ipcMain.handle('settings:getAll', async () => {
    return fetchAppSettings();
  });

  ipcMain.handle('settings:set', async (_, { key, value }) => {
    const result = saveAppSetting(key, value);
    if (key === 'backup_email' || key.startsWith('smtp_')) {
      processPendingEmailQueue().catch(() => {});
    }
    return result;
  });

  ipcMain.handle('settings:testEmail', async (_, settings) => {
    return await testSmtpConnection(settings);
  });

  ipcMain.handle('company:getProfile', async () => {
    return getCompanyProfile();
  });

  ipcMain.handle('customers:search', async (_, query) => {
    return findCustomers(query);
  });

  // Security PIN IPCs
  ipcMain.handle('pin:isProtected', async () => {
    return isPinProtected();
  });

  ipcMain.handle('pin:verify', async (_, pin) => {
    return verifyPin(pin);
  });

  ipcMain.handle('pin:set', async (_, { oldPin, newPin }) => {
    return setSecurityPin(oldPin, newPin);
  });

  ipcMain.handle('pin:disable', async (_, currentPin) => {
    return disableSecurityPin(currentPin);
  });
}
