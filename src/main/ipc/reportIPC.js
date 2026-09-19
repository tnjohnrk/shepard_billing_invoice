import { ipcMain, dialog, BrowserWindow, app } from 'electron';
import path from 'path';
import { getDailyReport, getMonthlyReport, getFinancialYearReport, getCustomerSummaryReport } from '../services/reportService.js';
import { exportReportToExcel } from '../services/excelService.js';

export function registerReportIPC() {
  ipcMain.handle('report:daily', async (_, dateStr) => {
    return getDailyReport(dateStr);
  });

  ipcMain.handle('report:monthly', async (_, { year, month }) => {
    return getMonthlyReport(year, month);
  });

  ipcMain.handle('report:financialYear', async (_, startYear) => {
    return getFinancialYearReport(startYear);
  });

  ipcMain.handle('report:customerSummary', async () => {
    return getCustomerSummaryReport();
  });

  ipcMain.handle('report:exportExcel', async (event, args = {}) => {
    try {
      const { reportData, title, reportType, targetPath } = args || {};
      let finalPath = targetPath;

      if (!finalPath) {
        const safeTitle = (title || 'Billing_Report').replace(/[\/\\?%*:|"<> ]/g, '_');
        const defaultFileName = `${safeTitle}.xlsx`;
        let defaultFolder = '';
        try {
          defaultFolder = app.getPath('documents') || app.getPath('downloads');
        } catch {
          defaultFolder = process.cwd();
        }
        const defaultPath = path.join(defaultFolder, defaultFileName);

        let win = null;
        try {
          if (event?.sender) {
            win = BrowserWindow.fromWebContents(event.sender);
          }
        } catch (e) {
          console.warn('Could not get BrowserWindow from sender:', e);
        }

        if (win) {
          const { canceled, filePath } = await dialog.showSaveDialog(win, {
            title: 'Save Report Excel Spreadsheet',
            defaultPath,
            filters: [
              { name: 'Excel Spreadsheets (*.xlsx)', extensions: ['xlsx'] },
              { name: 'All Files (*.*)', extensions: ['*'] }
            ]
          });

          if (canceled || !filePath) {
            return { canceled: true };
          }
          finalPath = filePath;
        } else {
          finalPath = defaultPath;
        }
      }

      const savedPath = await exportReportToExcel(reportData, title, finalPath, reportType);
      return { canceled: false, path: savedPath };
    } catch (err) {
      console.error('Error in report:exportExcel IPC:', err);
      throw err;
    }
  });
}
