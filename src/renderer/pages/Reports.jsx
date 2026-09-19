import React, { useState, useEffect } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { ReportSelector } from '../components/reports/ReportSelector';
import { ReportSummary } from '../components/reports/ReportSummary';
import { ReportTable } from '../components/reports/ReportTable';
import { Loading } from '../components/common/Loading';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Table } from '../components/common/Table';
import { FileSpreadsheet, Download, Users, FileText } from 'lucide-react';
import { ipcClient } from '../services/ipcClient';

export function Reports({ toast }) {
  const [reportType, setReportType] = useState('daily');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

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
    if (!reportData) return;
    setIsExporting(true);
    try {
      const typeLabels = {
        daily: `Shepherd_Daily_Report_${dailyDate}`,
        monthly: `Shepherd_Monthly_Report_${monthYear.year}_${String(monthYear.month).padStart(2, '0')}`,
        financialYear: `Shepherd_FY_Report_${startFyYear}_${startFyYear + 1}`,
        customer: `Shepherd_Customer_Billing_Summary`
      };
      const title = typeLabels[reportType] || `Shepherd_${reportType.toUpperCase()}_Report`;
      
      const res = await ipcClient.exportReportExcel({ 
        reportData, 
        title, 
        reportType 
      });

      if (res && !res.canceled && res.path) {
        toast('success', `Excel spreadsheet saved successfully to: ${res.path}`);
      }
    } catch (e) {
      console.error('Export error:', e);
      toast('error', e.message || 'Excel export failed.');
    } finally {
      setIsExporting(false);
    }
  };

  const isCustomerReport = reportType === 'customer';
  const customerList = isCustomerReport ? (Array.isArray(reportData) ? reportData : []) : [];

  const customerHeaders = [
    { label: '#' },
    { label: 'Buyer / Customer Name' },
    { label: 'GSTIN' },
    { label: 'Invoices', align: 'center' },
    { label: 'Taxable Value (₹)', align: 'right' },
    { label: 'GST Tax (₹)', align: 'right' },
    { label: 'Total Billed (₹)', align: 'right' }
  ];

  return (
    <PageContainer>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <ReportSelector activeType={reportType} onSelectType={setReportType} />

        <Button 
          variant="success" 
          icon={FileSpreadsheet} 
          onClick={handleExportExcel} 
          disabled={!reportData || loading}
          isLoading={isExporting}
        >
          Download Excel Spreadsheet (.xlsx)
        </Button>
      </div>

      {/* Date controls per report type */}
      <div className="p-4 glass-panel rounded-xl border border-slate-800 flex flex-wrap items-center gap-4 text-xs shadow-sm">
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
            <div className="w-36">
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
          <div className="w-56">
            <Select
              label="Financial Year (April 1 to March 31)"
              value={startFyYear}
              onChange={(e) => setStartFyYear(parseInt(e.target.value, 10))}
              options={[
                { value: 2026, label: 'FY 2026 - 2027' },
                { value: 2025, label: 'FY 2025 - 2026' },
                { value: 2024, label: 'FY 2024 - 2025' },
                { value: 2023, label: 'FY 2023 - 2024' }
              ]}
            />
          </div>
        )}

        {reportType === 'customer' && (
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Users className="w-4 h-4 text-indigo-400" />
            <span>Aggregated billing summary across all registered client accounts.</span>
          </div>
        )}
      </div>

      {loading ? (
        <Loading text="Generating Financial Report..." />
      ) : isCustomerReport ? (
        <div className="space-y-4">
          <div className="p-5 glass-panel rounded-xl border border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-100">Customer Account Summary</h3>
              <span className="text-xs text-slate-400">{customerList.length} Clients Recorded</span>
            </div>

            {customerList.length === 0 ? (
              <div className="text-xs text-slate-400 text-center py-8">No customer billing records found.</div>
            ) : (
              <Table headers={customerHeaders}>
                {customerList.map((c, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 text-xs">
                    <td className="px-4 py-3 text-slate-400 font-mono">{idx + 1}</td>
                    <td className="px-4 py-3 font-semibold text-slate-100">{c.buyer_name}</td>
                    <td className="px-4 py-3 font-mono text-slate-400">{c.customer_gstin || 'N/A'}</td>
                    <td className="px-4 py-3 text-center font-bold text-indigo-400">{c.total_invoices}</td>
                    <td className="px-4 py-3 text-right">₹{Number(c.total_taxable || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className="px-4 py-3 text-right text-slate-400">₹{Number(c.total_tax || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className="px-4 py-3 text-right font-bold text-emerald-400">
                      ₹{Number(c.total_billing || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </Table>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <ReportSummary stats={reportData?.stats} />
          <ReportTable invoices={reportData?.invoices || []} />
        </div>
      )}
    </PageContainer>
  );
}
