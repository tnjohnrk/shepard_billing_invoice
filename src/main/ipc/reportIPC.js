import { ipcMain } from 'electron';
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

  ipcMain.handle('report:exportExcel', async (_, { reportData, title, targetPath }) => {
    return await exportReportToExcel(reportData, title, targetPath);
  });
}
