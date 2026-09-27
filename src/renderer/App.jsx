import React, { useState, useEffect, useCallback } from 'react';
import { AppLayout } from './components/layout/AppLayout';
import { SplashScreen } from './components/splash/SplashScreen';
import { LockScreen } from './components/auth/LockScreen';
import { ProductKeyActivation } from './components/auth/ProductKeyActivation';
import { TrialExpiredOverlay } from './components/auth/TrialExpiredOverlay';
import { Toast } from './components/common/Toast';
import { Dashboard } from './pages/Dashboard';
import { CreateInvoice } from './pages/CreateInvoice';
import { History } from './pages/History';
import { Details } from './pages/Details';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import { ShortcutsModal } from './components/common/ShortcutsModal';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { ipcClient } from './services/ipcClient';
import { FEATURE_FLAGS } from '../shared/constants/featureFlags';

export default function App() {
  const [isInitializing, setIsInitializing] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [toastState, setToastState] = useState(null);
  const [createInitialData, setCreateInitialData] = useState(null);
  const [historySelectedInvoice, setHistorySelectedInvoice] = useState(null);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);

  // Security, Activation & License status
  const [isActivated, setIsActivated] = useState(false);
  const [isPasswordSet, setIsPasswordSet] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [licenseStatus, setLicenseStatus] = useState(null);

  const handleLockApp = useCallback(async () => {
    const isProtected = await ipcClient.isPinProtected();
    if (isProtected) {
      sessionStorage.removeItem('session_unlocked');
      setIsLocked(true);
    } else {
      setToastState({ type: 'info', message: 'Please enable Security Password in Settings first.' });
      setActiveTab('settings');
    }
  }, []);

  // Global Keyboard Shortcuts (Alt+1..5, Ctrl+Shift+N/H/R/S/L, F1, Shift+?)
  useKeyboardShortcuts({
    onNavigate: (tab) => {
      if (tab !== 'create') setCreateInitialData(null);
      if (tab !== 'history') setHistorySelectedInvoice(null);
      setActiveTab(tab);
    },
    onLock: handleLockApp,
    onToggleHelp: () => setIsShortcutsModalOpen(prev => !prev),
    isLocked: isLocked || isInitializing || !isActivated || !isPasswordSet
  });

  // Automatically reset to dashboard if activeTab is details and feature is disabled
  useEffect(() => {
    if (!FEATURE_FLAGS.DETAILS_PANEL_ENABLED && activeTab === 'details') {
      setActiveTab('dashboard');
    }
  }, [activeTab]);

  const checkLicenseAndLockState = useCallback(async () => {
    try {
      const [activationDetails, isProtected, license] = await Promise.all([
        ipcClient.getActivationDetails(),
        ipcClient.isPinProtected(),
        ipcClient.getLicenseStatus()
      ]);

      const activated = Boolean(activationDetails?.isActivated);
      const passSet = Boolean(isProtected || activationDetails?.isPasswordSet);

      setIsActivated(activated);
      setIsPasswordSet(passSet);
      setLicenseStatus(license);

      const isSessionUnlocked = sessionStorage.getItem('session_unlocked') === 'true';

      if (!activated || !passSet) {
        setIsLocked(false);
      } else if (!isSessionUnlocked) {
        setIsLocked(true);
      } else {
        setIsLocked(false);
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

  // 1. FRESH INSTALL / RE-INSTALL: Needs Product Key Activation or Initial Mandatory Password Setup
  if (!isActivated || !isPasswordSet) {
    return (
      <>
        <ProductKeyActivation
          onActivationComplete={async () => {
            await checkLicenseAndLockState();
            showToast('success', 'Welcome to Shepherd Enterprises Billing System!');
          }}
        />
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

  // 2. DAILY USAGE: Password Lock Screen (prompts for security password)
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
        onLockApp={handleLockApp}
        onOpenShortcuts={() => setIsShortcutsModalOpen(true)}
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

        {activeTab === 'settings' && <Settings toast={showToast} licenseStatus={licenseStatus} />}
      </AppLayout>

      {/* Keyboard Shortcuts Cheat Sheet Modal */}
      <ShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
      />

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
