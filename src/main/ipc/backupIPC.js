import { ipcMain, dialog } from 'electron';
import { createManualBackup, restoreFromBackup } from '../services/backupService.js';

export function registerBackupIPC() {
  ipcMain.handle('backup:createManual', async () => {
    const timestamp = new Date().toISOString().split('T')[0];
    const defaultName = `Shepherd_Data_Migration_${timestamp}.zip`;

    const { canceled, filePath } = await dialog.showSaveDialog({
      title: 'Export Complete Data Package (For Backup / PC Migration)',
      defaultPath: defaultName,
      filters: [{ name: 'Zip Backup Archive', extensions: ['zip'] }]
    });

    if (canceled || !filePath) {
      return { canceled: true };
    }

    const result = createManualBackup(filePath);
    return { canceled: false, backupPath: result.destinationPath, stats: result.stats };
  });

  ipcMain.handle('backup:restore', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      title: 'Select Shepherd Invoice Migration / Backup Zip File',
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
