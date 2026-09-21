import { ipcMain, app, shell } from 'electron';
import { checkForUpdates, downloadUpdate, quitAndInstall } from '../services/updateService.js';
import { processPendingEmailQueue } from '../services/emailQueueService.js';

export function registerAppIPC() {
  ipcMain.handle('app:getVersion', () => {
    return app.getVersion();
  });

  ipcMain.handle('app:openExternal', async (_, url) => {
    if (url && (typeof url === 'string') && (url.startsWith('https://') || url.startsWith('http://') || url.startsWith('mailto:'))) {
      await shell.openExternal(url);
      return true;
    }
    return false;
  });

  ipcMain.handle('app:checkForUpdates', async () => {
    return await checkForUpdates();
  });

  ipcMain.handle('app:downloadUpdate', async () => {
    return await downloadUpdate();
  });

  ipcMain.handle('app:installUpdate', () => {
    quitAndInstall();
  });

  ipcMain.handle('app:retryEmailQueue', async () => {
    await processPendingEmailQueue();
    return true;
  });
}
