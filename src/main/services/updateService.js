let autoUpdater = null;

try {
  const electronUpdater = await import('electron-updater');
  autoUpdater = electronUpdater.default?.autoUpdater || electronUpdater.autoUpdater;
} catch (e) {
  console.warn('electron-updater module load notice:', e.message);
}

export function initializeAutoUpdater(webContents) {
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
  if (!autoUpdater) return null;
  try {
    return await autoUpdater.checkForUpdates();
  } catch (err) {
    console.warn('Check for updates check notice:', err.message);
    return null;
  }
}

export async function downloadUpdate() {
  if (!autoUpdater) return null;
  try {
    return await autoUpdater.downloadUpdate();
  } catch (err) {
    console.warn('Download update notice:', err.message);
    return null;
  }
}

export function quitAndInstall() {
  if (!autoUpdater) return;
  try {
    autoUpdater.quitAndInstall();
  } catch (err) {
    console.warn('Quit and install notice:', err.message);
  }
}
