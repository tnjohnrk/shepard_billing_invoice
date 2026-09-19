import React, { useState, useEffect } from 'react';
import { AppLayout } from './components/layout/AppLayout';
import { SplashScreen } from './components/splash/SplashScreen';
import { LockScreen } from './components/auth/LockScreen';
import { Toast } from './components/common/Toast';
import { Dashboard } from './pages/Dashboard';
import { CreateInvoice } from './pages/CreateInvoice';
import { History } from './pages/History';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import { ipcClient } from './services/ipcClient';

export default function App() {
  const [isInitializing, setIsInitializing] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [toastState, setToastState] = useState(null);
  const [createInitialData, setCreateInitialData] = useState(null);

  // Security Password Protection state
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    bootstrapApp();
  }, []);

  const bootstrapApp = async () => {
    try {
      const isProtected = await ipcClient.isPinProtected();
      if (isProtected) {
        setIsLocked(true);
      }
    } catch (e) {
      console.error('Error checking security lock status:', e);
    } finally {
      setTimeout(() => {
        setIsInitializing(false);
      }, 1000);
    }
  };

  const showToast = (type, message) => {
    setToastState({ type, message });
  };

  const handleUnlock = async (enteredPassword) => {
    try {
      const isValid = await ipcClient.verifyPin(enteredPassword);
      if (isValid) {
        setIsLocked(false);
        showToast('success', 'Security verification successful. Welcome!');
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  };

  const [historySelectedInvoice, setHistorySelectedInvoice] = useState(null);

  const handleDuplicateInvoice = (invoiceData) => {
    setCreateInitialData(invoiceData);
    setActiveTab('create');
    showToast('info', 'Loaded invoice data for duplication. Review and save.');
  };

  const handleConvertProforma = (proformaData) => {
    setCreateInitialData({
      ...proformaData,
      invoice_type: 'NORMAL',
      proforma_id: proformaData.id
    });
    setActiveTab('create');
    showToast('info', 'Loaded proforma data for tax invoice conversion.');
  };

  if (isInitializing) {
    return <SplashScreen />;
  }

  if (isLocked) {
    return (
      <>
        <LockScreen onUnlock={handleUnlock} />
        {toastState && (
          <Toast
            type={toastState.type}
            message={toastState.message}
            onClose={() => setToastState(null)}
          />
        )}
      </>
    );
  }

  const tabTitles = {
    dashboard: { title: 'Dashboard Analytics', subtitle: 'Shepherd Enterprises Private Limited Billing Control Panel' },
    create: { title: 'Create Invoice', subtitle: 'Step-by-step invoice creation wizard' },
    history: { title: 'Invoice History & Search', subtitle: 'Search, filter, print, and export historical invoice records' },
    reports: { title: 'Financial & Tax Reports', subtitle: 'Daily, Monthly, Financial Year (Apr-Mar) and Customer Billing summaries' },
    settings: { title: 'Application Settings', subtitle: 'Backup, restore, data migration, and security lock configuration' }
  };

  return (
    <>
      <AppLayout
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab !== 'create') setCreateInitialData(null);
          if (tab !== 'history') setHistorySelectedInvoice(null);
          setActiveTab(tab);
        }}
        title={tabTitles[activeTab]?.title}
        subtitle={tabTitles[activeTab]?.subtitle}
        onLockApp={() => setIsLocked(true)}
      >
        {activeTab === 'dashboard' && (
          <Dashboard
            onViewInvoice={(inv) => {
              setHistorySelectedInvoice(inv);
              setActiveTab('history');
            }}
            onNavigateCreate={() => setActiveTab('create')}
          />
        )}

        {activeTab === 'create' && (
          <CreateInvoice
            initialData={createInitialData}
            toast={showToast}
            onInvoiceSaved={(inv) => {
              setCreateInitialData(null);
            }}
            onNavigateHome={() => {
              setCreateInitialData(null);
              setActiveTab('dashboard');
            }}
          />
        )}

        {activeTab === 'history' && (
          <History
            initialInvoice={historySelectedInvoice}
            toast={showToast}
            onNavigateCreate={() => setActiveTab('create')}
            onDuplicateInvoice={handleDuplicateInvoice}
            onConvertProforma={handleConvertProforma}
          />
        )}

        {activeTab === 'reports' && <Reports toast={showToast} />}

        {activeTab === 'settings' && <Settings toast={showToast} />}
      </AppLayout>

      {/* Global Toast Notification */}
      {toastState && (
        <Toast
          type={toastState.type}
          message={toastState.message}
          onClose={() => setToastState(null)}
        />
      )}
    </>
  );
}
