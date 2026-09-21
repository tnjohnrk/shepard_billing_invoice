import { createRequire } from 'module';
const require = createRequire(import.meta.url);

function getAutoUpdater() {
  try {
    const updaterModule = require('electron-updater');
    return updaterModule?.autoUpdater || updaterModule?.default?.autoUpdater || null;
  } catch {
    return null;
  }
}

export function initializeAutoUpdater(webContents) {
  const autoUpdater = getAutoUpdater();
  if (!autoUpdater) return;

  try {
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
  } catch (err) {
    console.warn('Auto updater initialization warning:', err.message);
  }
}

export async function checkForUpdates() {
  const autoUpdater = getAutoUpdater();
  if (!autoUpdater) return null;
  try {
    return await autoUpdater.checkForUpdates();
  } catch {
    return null;
  }
}

export async function downloadUpdate() {
  const autoUpdater = getAutoUpdater();
  if (!autoUpdater) return null;
  try {
    return await autoUpdater.downloadUpdate();
  } catch {
    return null;
  }
}

export function quitAndInstall() {
  const autoUpdater = getAutoUpdater();
  if (!autoUpdater) return;
  try {
    autoUpdater.quitAndInstall();
  } catch (err) {
    console.warn('Quit and install notice:', err.message);
  }
}
