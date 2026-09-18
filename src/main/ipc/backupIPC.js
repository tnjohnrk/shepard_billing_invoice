import { ipcMain, dialog } from 'electron';
import { createManualBackup, restoreFromBackup } from '../services/backupService.js';

export function registerBackupIPC() {
  ipcMain.handle('backup:createManual', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      title: 'Select Destination Directory for Backup',
      properties: ['openDirectory']
    });

    if (canceled || filePaths.length === 0) {
      return { canceled: true };
    }

    const backupPath = createManualBackup(filePaths[0]);
    return { canceled: false, backupPath };
  });

  ipcMain.handle('backup:restore', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      title: 'Select Shepherd Invoice Backup Zip File',
      filters: [{ name: 'Zip Backup Files', extensions: ['zip'] }],
      properties: ['openFile']
    });

    if (canceled || filePaths.length === 0) {
      return { canceled: true };
    }

    const result = restoreFromBackup(filePaths[0]);
    return { canceled: false, ...result };
  });
}
