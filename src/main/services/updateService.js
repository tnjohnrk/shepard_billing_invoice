import { autoUpdater } from 'electron-updater';

export function initializeAutoUpdater(webContents) {
  autoUpdater.autoDownload = false;

  autoUpdater.on('update-available', (info) => {
    if (webContents && !webContents.isDestroyed()) {
      webContents.send('app:update-available', info);
    }
  });

  autoUpdater.on('update-downloaded', (info) => {
    if (webContents && !webContents.isDestroyed()) {
      webContents.send('app:update-downloaded', info);
    }
  });

  autoUpdater.on('error', (err) => {
    if (webContents && !webContents.isDestroyed()) {
      webContents.send('app:update-error', err.message);
    }
  });
}

export function checkForUpdates() {
  return autoUpdater.checkForUpdates();
}

export function downloadUpdate() {
  return autoUpdater.downloadUpdate();
}

export function quitAndInstall() {
  autoUpdater.quitAndInstall();
}
