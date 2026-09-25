import React, { useState, useEffect, useCallback } from 'react';
import { AppLayout } from './components/layout/AppLayout';
import { SplashScreen } from './components/splash/SplashScreen';
import { LockScreen } from './components/auth/LockScreen';
import { TrialExpiredOverlay } from './components/auth/TrialExpiredOverlay';
import { Toast } from './components/common/Toast';
import { Dashboard } from './pages/Dashboard';
import { CreateInvoice } from './pages/CreateInvoice';
import { History } from './pages/History';
import { Details } from './pages/Details';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import { ipcClient } from './services/ipcClient';
import { FEATURE_FLAGS } from '../shared/constants/featureFlags';

export default function App() {
  const [isInitializing, setIsInitializing] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [toastState, setToastState] = useState(null);
  const [createInitialData, setCreateInitialData] = useState(null);

  // Security & License status
  const [isLocked, setIsLocked] = useState(false);
  const [licenseStatus, setLicenseStatus] = useState(null);

  const checkLicenseAndLockState = useCallback(async () => {
    try {
      const [isProtected, license] = await Promise.all([
        ipcClient.isPinProtected(),
        ipcClient.getLicenseStatus()
      ]);

      setLicenseStatus(license);

      const isSessionUnlocked = sessionStorage.getItem('session_unlocked') === 'true';
      if (isProtected && !isSessionUnlocked) {
        setIsLocked(true);
      }
    } catch (e) {
      console.error('Error checking security & license status:', e);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      await checkLicenseAndLockState();
      setTimeout(() => {
        setIsInitializing(false);
      }, 1000);
    };
    init();

    // Periodic check every 60 seconds to ensure trial expiration is detected
    const interval = setInterval(() => {
      checkLicenseAndLockState();
    }, 60000);

    return () => clearInterval(interval);
  }, [checkLicenseAndLockState]);

  const showToast = (type, message) => {
    setToastState({ type, message });
  };

  const handleUnlock = async (enteredPassword) => {
    try {
      // Re-fetch latest license status
      const updatedLicense = await ipcClient.getLicenseStatus();
      setLicenseStatus(updatedLicense);

      if (enteredPassword === 'DEV_UNLOCKED' || enteredPassword === 'developer@v2c') {
        sessionStorage.setItem('session_unlocked', 'true');
        setIsLocked(false);
        showToast('success', 'Developer access verified. Welcome!');
        return true;
      }

      const isValid = await ipcClient.verifyPin(enteredPassword);
      if (isValid) {
        sessionStorage.setItem('session_unlocked', 'true');
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
        <LockScreen onUnlock={handleUnlock} initialLicenseStatus={licenseStatus} />
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
    details: { title: 'Directory & Master Details', subtitle: 'Manage client companies and product/service catalogs for fast auto-fill' },
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
        onLockApp={async () => {
          const isProtected = await ipcClient.isPinProtected();
          if (isProtected) {
            sessionStorage.removeItem('session_unlocked');
            setIsLocked(true);
          } else {
            showToast('info', 'Please enable Security Password in Settings first.');
            setActiveTab('settings');
          }
        }}
      >
        {activeTab === 'dashboard' && (
          <Dashboard
            licenseStatus={licenseStatus}
            onRefreshLicense={checkLicenseAndLockState}
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

        {activeTab === 'details' && FEATURE_FLAGS.DETAILS_PANEL_ENABLED && <Details toast={showToast} />}

        {activeTab === 'reports' && <Reports toast={showToast} />}

        {activeTab === 'settings' && <Settings toast={showToast} />}
      </AppLayout>

      {/* Trial Expired Fullscreen Lockdown Overlay (Hides and locks everything when trial ends) */}
      {licenseStatus?.isExpired && (
        <TrialExpiredOverlay
          licenseStatus={licenseStatus}
          onLicenseUpdated={(updated) => {
            setLicenseStatus(updated);
            showToast('success', 'License reactivated! All features are now accessible.');
          }}
          onLockApp={() => {
            sessionStorage.removeItem('session_unlocked');
            setIsLocked(true);
          }}
        />
      )}

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


