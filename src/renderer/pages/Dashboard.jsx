import React, { useState, useEffect, useMemo } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { StatCard } from '../components/dashboard/StatCard';
import { InvoiceActivityChart } from '../components/dashboard/InvoiceActivityChart';
import { BillingAmountChart } from '../components/dashboard/BillingAmountChart';
import { RecentInvoices } from '../components/dashboard/RecentInvoices';
import { Loading } from '../components/common/Loading';
import { ipcClient } from '../services/ipcClient';
import { CalendarDays, Filter, Clock, ShieldCheck, AlertCircle } from 'lucide-react';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const FULL_MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function formatDateTime(isoString) {
  if (!isoString) return 'Not configured';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return 'Invalid date';
    return d.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (e) {
    return isoString;
  }
}

function getRemainingTimeText(endIsoString) {
  if (!endIsoString) return 'Active';
  try {
    const now = new Date();
    const end = new Date(endIsoString);
    const diffMs = end.getTime() - now.getTime();
    if (diffMs <= 0) return 'Trial Expired';
    
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''}, ${hours} hr${hours > 1 ? 's' : ''} remaining`;
    }
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours} hr${hours > 1 ? 's' : ''}, ${minutes} min${minutes > 1 ? 's' : ''} remaining`;
  } catch (e) {
    return 'Active';
  }
}

export function Dashboard({ onViewInvoice, onNavigateCreate, licenseStatus: propLicenseStatus }) {
  const [loading, setLoading] = useState(true);
  const [rawInvoices, setRawInvoices] = useState([]);
  const [rawProformas, setRawProformas] = useState([]);
  const [licenseStatus, setLicenseStatus] = useState(propLicenseStatus || null);
  
  // Period filter: 'this_month' | 'last_6_months' | 'last_12_months' | 'current_fy' | 'all_time' | 'custom_month'
  const [selectedPeriod, setSelectedPeriod] = useState('all_time');
  const [customMonth, setCustomMonth] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    if (propLicenseStatus) {
      setLicenseStatus(propLicenseStatus);
    }
  }, [propLicenseStatus]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [invResult, proResult, licResult] = await Promise.all([
        ipcClient.listInvoices({ page: 1, limit: 2000 }),
        ipcClient.listProformas({ page: 1, limit: 2000 }),
        propLicenseStatus ? Promise.resolve(propLicenseStatus) : ipcClient.getLicenseStatus()
      ]);

      const invoices = invResult?.data || [];
      const proformas = proResult?.data || [];

      setRawInvoices(invoices);
      setRawProformas(proformas);
      if (licResult) setLicenseStatus(licResult);

      // Set default customMonth to current month (e.g. 2026-09)
      const now = new Date();
      const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      setCustomMonth(currentMonthKey);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Extract all distinct months available in data or current calendar year
  const availableMonthOptions = useMemo(() => {
    const monthSet = new Set();
    const now = new Date();
    
    // Add all months of the current year
    for (let m = 0; m < 12; m++) {
      monthSet.add(`${now.getFullYear()}-${String(m + 1).padStart(2, '0')}`);
    }

    // Add any historical months from invoices
    rawInvoices.forEach(i => {
      if (i.invoice_date && i.invoice_date.length >= 7) {
        monthSet.add(i.invoice_date.substring(0, 7));
      }
    });

    // Add any historical months from proformas
    rawProformas.forEach(p => {
      const d = p.proforma_date || p.invoice_date;
      if (d && d.length >= 7) {
        monthSet.add(d.substring(0, 7));
      }
    });

    return Array.from(monthSet).sort().reverse().map(key => {
      const [yStr, mStr] = key.split('-');
      const year = parseInt(yStr, 10);
      const monthIdx = parseInt(mStr, 10) - 1;
      const label = `${FULL_MONTH_NAMES[monthIdx]} ${year}`;
      
      const invCount = rawInvoices.filter(i => (i.invoice_date || '').startsWith(key)).length;
      const proCount = rawProformas.filter(p => ((p.proforma_date || p.invoice_date) || '').startsWith(key)).length;
      const totalDocs = invCount + proCount;

      return {
        key,
        label,
        totalDocs
      };
    });
  }, [rawInvoices, rawProformas]);

  // Determine current active date range / months list based on selected filter
  const { activeMonths, periodLabel } = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-indexed

    if (selectedPeriod === 'custom_month' && customMonth) {
      const [yStr, mStr] = customMonth.split('-');
      const year = parseInt(yStr, 10);
      const monthIdx = parseInt(mStr, 10) - 1;
      return {
        activeMonths: [{ key: customMonth, label: `${MONTH_NAMES[monthIdx]} ${year}` }],
        periodLabel: `${FULL_MONTH_NAMES[monthIdx]} ${year}`
      };
    }

    if (selectedPeriod === 'this_month') {
      const key = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
      return {
        activeMonths: [{ key, label: `${MONTH_NAMES[currentMonth]} ${currentYear}` }],
        periodLabel: `${FULL_MONTH_NAMES[currentMonth]} ${currentYear}`
      };
    }

    if (selectedPeriod === 'last_6_months') {
      const months = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(currentYear, currentMonth - i, 1);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const key = `${y}-${m}`;
        const label = `${MONTH_NAMES[d.getMonth()]}${y !== currentYear ? " '" + String(y).slice(2) : ''}`;
        months.push({ key, label });
      }
      return {
        activeMonths: months,
        periodLabel: 'Past 6 Months'
      };
    }

    if (selectedPeriod === 'last_12_months') {
      const months = [];
      for (let i = 11; i >= 0; i--) {
        const d = new Date(currentYear, currentMonth - i, 1);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const key = `${y}-${m}`;
        const label = `${MONTH_NAMES[d.getMonth()]}${y !== currentYear ? " '" + String(y).slice(2) : ''}`;
        months.push({ key, label });
      }
      return {
        activeMonths: months,
        periodLabel: 'Past 12 Months'
      };
    }

    if (selectedPeriod === 'current_fy') {
      // Indian Financial Year: April of this FY to March of next FY
      const fyStartYear = currentMonth >= 3 ? currentYear : currentYear - 1;
      const months = [];
      for (let i = 0; i < 12; i++) {
        const monthNum = (i + 3) % 12; // 3 = April, 4 = May ... 2 = March
        const year = i < 9 ? fyStartYear : fyStartYear + 1;
        const key = `${year}-${String(monthNum + 1).padStart(2, '0')}`;
        const label = `${MONTH_NAMES[monthNum]} '${String(year).slice(2)}`;
        months.push({ key, label });
      }
      return {
        activeMonths: months,
        periodLabel: `FY ${fyStartYear}-${String(fyStartYear + 1).slice(2)}`
      };
    }

    // Default: 'all_time' - all months that exist or current year
    const allKeys = new Set();
    rawInvoices.forEach(i => {
      if (i.invoice_date) allKeys.add(i.invoice_date.substring(0, 7));
    });
    rawProformas.forEach(p => {
      const d = p.proforma_date || p.invoice_date;
      if (d) allKeys.add(d.substring(0, 7));
    });

    // Ensure at least trailing 6 months exist in all_time view
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      allKeys.add(key);
    }

    const sortedKeys = Array.from(allKeys).sort();
    const months = sortedKeys.map(k => {
      const [yStr, mStr] = k.split('-');
      const y = parseInt(yStr, 10);
      const m = parseInt(mStr, 10) - 1;
      return {
        key: k,
        label: `${MONTH_NAMES[m]}${y !== currentYear ? " '" + String(y).slice(2) : ''}`
      };
    });

    return {
      activeMonths: months,
      periodLabel: 'All Recorded Months'
    };
  }, [selectedPeriod, customMonth, rawInvoices, rawProformas]);

  // Compute stats and charts for active period
  const { stats, activityChartData, revenueChartData, recentInvoices } = useMemo(() => {
    const activeKeys = new Set(activeMonths.map(m => m.key));

    const periodInvoices = rawInvoices.filter(i => activeKeys.has((i.invoice_date || '').substring(0, 7)));
    const periodProformas = rawProformas.filter(p => activeKeys.has(((p.proforma_date || p.invoice_date) || '').substring(0, 7)));

    const periodBilling = periodInvoices.reduce((acc, i) => acc + (Number(i.grand_total) || 0), 0);
    const avgInvoiceValue = periodInvoices.length > 0 ? Math.round(periodBilling / periodInvoices.length) : 0;

    // Build Chart Data
    const actData = activeMonths.map(({ key, label }) => {
      const invCount = rawInvoices.filter(i => (i.invoice_date || '').startsWith(key)).length;
      const proCount = rawProformas.filter(p => ((p.proforma_date || p.invoice_date) || '').startsWith(key)).length;
      return {
        month: label,
        invoices: invCount,
        proformas: proCount
      };
    });

    const revData = activeMonths.map(({ key, label }) => {
      const rev = rawInvoices
        .filter(i => (i.invoice_date || '').startsWith(key))
        .reduce((acc, i) => acc + (Number(i.grand_total) || 0), 0);
      return {
        month: label,
        amount: Math.round(rev)
      };
    });

    // Recent combined invoices
    const combinedRaw = [
      ...rawInvoices.map(i => ({ ...i, invoice_type: i.invoice_type || 'NORMAL', doc_date: i.invoice_date, doc_number: i.invoice_number })),
      ...rawProformas.map(p => ({
        ...p,
        invoice_type: 'PROFORMA',
        doc_date: p.proforma_date || p.invoice_date,
        doc_number: p.proforma_number || p.invoice_number,
        invoice_number: p.proforma_number || p.invoice_number,
        invoice_date: p.proforma_date || p.invoice_date
      }))
    ].sort((a, b) => {
      const dateA = a.created_at || a.doc_date || '';
      const dateB = b.created_at || b.doc_date || '';
      return dateB.localeCompare(dateA);
    });

    return {
      stats: {
        totalTaxInvoices: periodInvoices.length,
        totalAllTaxInvoices: rawInvoices.length,
        totalProformas: periodProformas.length,
        totalAllProformas: rawProformas.length,
        billingRevenue: periodBilling,
        avgInvoiceValue,
        totalActivityDocs: periodInvoices.length + periodProformas.length
      },
      activityChartData: actData,
      revenueChartData: revData,
      recentInvoices: combinedRaw.slice(0, 8)
    };
  }, [activeMonths, rawInvoices, rawProformas]);

  const handleQuickPeriodChange = (period) => {
    setSelectedPeriod(period);
  };

  const handleCustomMonthChange = (e) => {
    const val = e.target.value;
    if (val) {
      setCustomMonth(val);
      setSelectedPeriod('custom_month');
    }
  };

  if (loading) {
    return <Loading text="Loading Dashboard Analytics..." />;
  }

  const isTestMode = licenseStatus?.mode === 'TEST';

  return (
    <PageContainer>
      {/* Test Mode Banner Box (Visible when Test Mode is Active) */}
      {isTestMode && (
        <div className="p-4 rounded-2xl border-2 border-amber-400 dark:border-amber-600/80 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-950/40 dark:via-amber-950/20 text-slate-900 dark:text-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 dark:bg-amber-500/30 flex items-center justify-center shrink-0 border border-amber-500/30 text-amber-600 dark:text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-500 text-white dark:bg-amber-600">
                  Test / Trial Mode Active
                </span>
                <span className="text-xs font-bold text-amber-700 dark:text-amber-300 font-mono">
                  {getRemainingTimeText(licenseStatus?.endDateTime)}
                </span>
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-300">
                <span>
                  <strong className="text-slate-800 dark:text-slate-100">Started:</strong> {formatDateTime(licenseStatus?.startDateTime)}
                </span>
                <span>•</span>
                <span>
                  <strong className="text-slate-800 dark:text-slate-100">Trial Ends:</strong> {formatDateTime(licenseStatus?.endDateTime)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-center px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>All records &amp; backups remain 100% permanently safe</span>
          </div>
        </div>
      )}

      {/* Interactive Time Period & Month Selector Control Bar */}
      <div className="p-4 rounded-2xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mr-1">
            <Filter className="w-3.5 h-3.5 text-indigo-500" />
            <span>Time Range:</span>
          </div>

          <button
            type="button"
            onClick={() => handleQuickPeriodChange('all_time')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedPeriod === 'all_time'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            All Recorded Months
          </button>

          <button
            type="button"
            onClick={() => handleQuickPeriodChange('current_fy')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedPeriod === 'current_fy'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Current FY
          </button>

          <button
            type="button"
            onClick={() => handleQuickPeriodChange('last_12_months')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedPeriod === 'last_12_months'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Past 12 Months
          </button>

          <button
            type="button"
            onClick={() => handleQuickPeriodChange('last_6_months')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedPeriod === 'last_6_months'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Past 6 Months
          </button>

          <button
            type="button"
            onClick={() => handleQuickPeriodChange('this_month')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedPeriod === 'this_month'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            This Month
          </button>
        </div>

        {/* Specific Month Dropdown */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
            <CalendarDays className="w-3.5 h-3.5 text-indigo-500" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">Select Month:</span>
          </div>
          <select
            value={selectedPeriod === 'custom_month' ? customMonth : ''}
            onChange={handleCustomMonthChange}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
          >
            <option value="" disabled>-- Pick Month --</option>
            {availableMonthOptions.map(opt => (
              <option key={opt.key} value={opt.key}>
                {opt.label} ({opt.totalDocs} docs)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Top 4 KPI Metrics with Real Dynamic Calculation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Tax Invoices"
          value={stats.totalTaxInvoices}
          subtitle={`Issued in ${periodLabel}`}
          badge={`${stats.totalAllTaxInvoices} All-Time`}
        />
        <StatCard
          title="Proformas"
          value={stats.totalProformas}
          subtitle={`Estimates in ${periodLabel}`}
          badge={`${stats.totalAllProformas} All-Time`}
        />
        <StatCard
          title="Billing Revenue"
          value={`₹${Math.round(stats.billingRevenue).toLocaleString('en-IN')}`}
          subtitle={`${stats.totalTaxInvoices} invoices billed`}
          badge={periodLabel}
        />
        <StatCard
          title="Total Activity"
          value={`${stats.totalActivityDocs} Docs`}
          subtitle={`Avg: ₹${stats.avgInvoiceValue.toLocaleString('en-IN')}/inv`}
          badge={periodLabel}
        />
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InvoiceActivityChart 
          data={activityChartData} 
          title="Monthly Document Activity" 
          subtitle={`Breakdown of Tax Invoices vs Proformas for ${periodLabel}`}
        />
        <BillingAmountChart 
          data={revenueChartData} 
          title="Billing Revenue Trend (₹)" 
          subtitle={`Total revenue trend for ${periodLabel} (₹${Math.round(stats.billingRevenue).toLocaleString('en-IN')})`}
        />
      </div>

      {/* Recent Invoices & Proformas Combined Table */}
      <RecentInvoices invoices={recentInvoices} onViewInvoice={onViewInvoice} />
    </PageContainer>
  );
}

