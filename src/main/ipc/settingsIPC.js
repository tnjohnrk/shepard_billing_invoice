import { ipcMain } from 'electron';
import { fetchAppSettings, saveAppSetting } from '../services/settingsService.js';
import { isPinProtected, verifyPin, setSecurityPin, disableSecurityPin } from '../services/pinService.js';
import { getLicenseStatus, setLicenseMode } from '../services/licenseService.js';
import { getCompanyProfile } from '../services/companyService.js';
import { findCustomers, saveCustomerInfo } from '../services/customerService.js';
import { processPendingEmailQueue, getEmailQueueStatus, clearSentEmailQueue } from '../services/emailQueueService.js';
import { testSmtpConnection } from '../services/emailService.js';

export function registerSettingsIPC() {
  ipcMain.handle('settings:getAll', async () => {
    return fetchAppSettings();
  });

  ipcMain.handle('settings:set', async (_, { key, value }) => {
    return saveAppSetting(key, value);
  });

  ipcMain.handle('settings:testEmail', async (_, settings) => {
    return await testSmtpConnection(settings);
  });

  ipcMain.handle('emailQueue:getSummary', async () => {
    return getEmailQueueStatus();
  });

  ipcMain.handle('emailQueue:sendAll', async (_, settings) => {
    return await processPendingEmailQueue(settings || {});
  });

  ipcMain.handle('emailQueue:clearSent', async () => {
    return clearSentEmailQueue();
  });

  ipcMain.handle('company:getProfile', async () => {
    return getCompanyProfile();
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

  // License & Test Mode IPCs
  ipcMain.handle('license:getStatus', async () => {
    return getLicenseStatus();
  });

  ipcMain.handle('license:setMode', async (_, { developerKey, mode, startDateTime, endDateTime }) => {
    return setLicenseMode(developerKey, { mode, startDateTime, endDateTime });
  });
}
