import React, { useState, useEffect } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { ReportSelector } from '../components/reports/ReportSelector';
import { ReportSummary } from '../components/reports/ReportSummary';
import { ReportTable } from '../components/reports/ReportTable';
import { Loading } from '../components/common/Loading';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { FileSpreadsheet } from 'lucide-react';
import { ipcClient } from '../services/ipcClient';

export function Reports({ toast }) {
  const [reportType, setReportType] = useState('daily');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);

  // Filter params
  const [dailyDate, setDailyDate] = useState(new Date().toISOString().split('T')[0]);
  const [monthYear, setMonthYear] = useState({ year: new Date().getFullYear(), month: new Date().getMonth() + 1 });
  const [startFyYear, setStartFyYear] = useState(new Date().getMonth() >= 3 ? new Date().getFullYear() : new Date().getFullYear() - 1);

  useEffect(() => {
    loadReport();
  }, [reportType, dailyDate, monthYear, startFyYear]);

  const loadReport = async () => {
    setLoading(true);
    try {
      let res;
      if (reportType === 'daily') {
        res = await ipcClient.getDailyReport(dailyDate);
      } else if (reportType === 'monthly') {
        res = await ipcClient.getMonthlyReport(monthYear);
      } else if (reportType === 'financialYear') {
        res = await ipcClient.getFinancialYearReport(startFyYear);
      } else if (reportType === 'customer') {
        res = await ipcClient.getCustomerSummaryReport();
      }
      setReportData(res);
    } catch (err) {
      toast('error', err.message || 'Failed to generate report.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      const title = `${reportType.toUpperCase()} Report`;
      const targetPath = `Report_${reportType}_${Date.now()}.xlsx`;
      await ipcClient.exportReportExcel({ reportData, title, targetPath });
      toast('success', 'Report exported to Excel successfully!');
    } catch (e) {
      toast('error', e.message || 'Excel export failed.');
    }
  };

  return (
    <PageContainer>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <ReportSelector activeType={reportType} onSelectType={setReportType} />

        <Button variant="accent" icon={FileSpreadsheet} onClick={handleExportExcel} disabled={!reportData}>
          Export Report to Excel
        </Button>
      </div>

      {/* Date controls per report type */}
      <div className="p-4 glass-panel rounded-xl border border-slate-800 flex flex-wrap items-center gap-4 text-xs">
        {reportType === 'daily' && (
          <div className="w-48">
            <Input
              label="Select Date"
              type="date"
              value={dailyDate}
              onChange={(e) => setDailyDate(e.target.value)}
            />
          </div>
        )}

        {reportType === 'monthly' && (
          <div className="flex gap-4">
            <div className="w-32">
              <Select
                label="Month"
                value={monthYear.month}
                onChange={(e) => setMonthYear({ ...monthYear, month: parseInt(e.target.value, 10) })}
                options={[
                  { value: 1, label: 'January' }, { value: 2, label: 'February' }, { value: 3, label: 'March' },
                  { value: 4, label: 'April' }, { value: 5, label: 'May' }, { value: 6, label: 'June' },
                  { value: 7, label: 'July' }, { value: 8, label: 'August' }, { value: 9, label: 'September' },
                  { value: 10, label: 'October' }, { value: 11, label: 'November' }, { value: 12, label: 'December' }
                ]}
              />
            </div>
            <div className="w-32">
              <Input
                label="Year"
                type="number"
                value={monthYear.year}
                onChange={(e) => setMonthYear({ ...monthYear, year: parseInt(e.target.value, 10) })}
              />
            </div>
          </div>
        )}

        {reportType === 'financialYear' && (
          <div className="w-48">
            <Select
              label="Financial Year (April 1 to March 31)"
              value={startFyYear}
              onChange={(e) => setStartFyYear(parseInt(e.target.value, 10))}
              options={[
                { value: 2026, label: '2026 - 2027' },
                { value: 2025, label: '2025 - 2026' },
                { value: 2024, label: '2024 - 2025' }
              ]}
            />
          </div>
        )}
      </div>

      {loading ? (
        <Loading text="Generating Financial Report..." />
      ) : (
        <div className="space-y-6">
          <ReportSummary stats={reportData?.stats} />
          <ReportTable invoices={reportData?.invoices || []} />
        </div>
      )}
    </PageContainer>
  );
}
