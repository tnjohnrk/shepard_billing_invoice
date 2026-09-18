import React, { useState, useEffect } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { StatCard } from '../components/dashboard/StatCard';
import { InvoiceActivityChart } from '../components/dashboard/InvoiceActivityChart';
import { BillingAmountChart } from '../components/dashboard/BillingAmountChart';
import { RecentInvoices } from '../components/dashboard/RecentInvoices';
import { Loading } from '../components/common/Loading';
import { FileText, FileSpreadsheet, DollarSign, Calendar } from 'lucide-react';
import { ipcClient } from '../services/ipcClient';

export function Dashboard({ onViewInvoice, onNavigateCreate }) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalInvoices: 0,
    totalProformas: 0,
    monthlyBilling: 0,
    monthlyCount: 0
  });
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [activityChartData, setActivityChartData] = useState([]);
  const [revenueChartData, setRevenueChartData] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const invResult = await ipcClient.listInvoices({ page: 1, limit: 1000 });
      const proResult = await ipcClient.listProformas({ page: 1, limit: 1000 });

      const totalInvoices = invResult?.total || 0;
      const totalProformas = proResult?.total || 0;

      const invoices = invResult?.data || [];
      setRecentInvoices(invoices.slice(0, 5));

      // Calculate current month stats
      const now = new Date();
      const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

      const currentMonthInvoices = invoices.filter(i => i.invoice_date && i.invoice_date.startsWith(currentMonthStr));
      const monthlyBilling = currentMonthInvoices.reduce((acc, i) => acc + (i.grand_total || 0), 0);

      setStats({
        totalInvoices,
        totalProformas,
        monthlyBilling,
        monthlyCount: currentMonthInvoices.length
      });

      // Real monthly aggregation from actual invoice and proforma records
      const proformas = proResult?.data || [];
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      // Trailing 6 months up to current month
      const pastMonths = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const key = `${y}-${m}`;
        const label = `${monthNames[d.getMonth()]}${y !== now.getFullYear() ? " '" + String(y).slice(2) : ''}`;
        pastMonths.push({ key, label });
      }

      const actData = pastMonths.map(({ key, label }) => {
        const invCount = invoices.filter(i => (i.invoice_date || '').startsWith(key)).length;
        const proCount = proformas.filter(p => (p.proforma_date || '').startsWith(key)).length;
        return {
          month: label,
          invoices: invCount,
          proformas: proCount
        };
      });
      setActivityChartData(actData);

      const revData = pastMonths.map(({ key, label }) => {
        const rev = invoices
          .filter(i => (i.invoice_date || '').startsWith(key))
          .reduce((acc, i) => acc + (Number(i.grand_total) || 0), 0);
        return {
          month: label,
          amount: Math.round(rev)
        };
      });
      setRevenueChartData(revData);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading text="Loading Dashboard Analytics..." />;
  }

  return (
    <PageContainer>
      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Tax Invoices"
          value={stats.totalInvoices}
          subtitle="Saved to SQLite"
          icon={FileText}
          color="indigo"
        />
        <StatCard
          title="Total Proformas"
          value={stats.totalProformas}
          subtitle="Estimates / Quotations"
          icon={FileSpreadsheet}
          color="cyan"
        />
        <StatCard
          title="This Month Revenue"
          value={`₹${stats.monthlyBilling.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
          subtitle="Current Billing Month"
          icon={DollarSign}
          color="emerald"
        />
        <StatCard
          title="This Month Invoices"
          value={stats.monthlyCount}
          subtitle="New Invoices Created"
          icon={Calendar}
          color="amber"
        />
      </div>

      {/* Visual Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InvoiceActivityChart data={activityChartData} />
        <BillingAmountChart data={revenueChartData} />
      </div>

      {/* Recent Activity Table */}
      <RecentInvoices invoices={recentInvoices} onViewInvoice={onViewInvoice} />
    </PageContainer>
  );
}
