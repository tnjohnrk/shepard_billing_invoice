import React, { useState, useEffect } from 'react';
import { AppLayout } from './components/layout/AppLayout';
import { SplashScreen } from './components/splash/SplashScreen';
import { Toast } from './components/common/Toast';
import { Modal } from './components/common/Modal';
import { Input } from './components/common/Input';
import { Button } from './components/common/Button';
import { Dashboard } from './pages/Dashboard';
import { CreateInvoice } from './pages/CreateInvoice';
import { History } from './pages/History';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import { ipcClient } from './services/ipcClient';
import { Lock } from 'lucide-react';

export default function App() {
  const [isInitializing, setIsInitializing] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [toastState, setToastState] = useState(null);
  const [createInitialData, setCreateInitialData] = useState(null);

  // PIN Protection state
  const [isLocked, setIsLocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

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
      console.error('Error checking PIN status:', e);
    } finally {
      setTimeout(() => {
        setIsInitializing(false);
      }, 1200);
    }
  };

  const showToast = (type, message) => {
    setToastState({ type, message });
  };

  const handlePinUnlock = async (e) => {
    e.preventDefault();
    try {
      const isValid = await ipcClient.verifyPin(pinInput);
      if (isValid) {
        setIsLocked(false);
        setPinInput('');
        setPinError('');
      } else {
        setPinError('Incorrect 4-digit security PIN.');
      }
    } catch (err) {
      setPinError('PIN verification failed.');
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

  const tabTitles = {
    dashboard: { title: 'Dashboard Analytics', subtitle: 'Shepherd Enterprises Private Limited Billing Control Panel' },
    create: { title: 'Create Invoice', subtitle: 'Step-by-step invoice creation wizard' },
    history: { title: 'Invoice History & Search', subtitle: 'Search, filter, print, and export historical invoice records' },
    reports: { title: 'Financial & Tax Reports', subtitle: 'Daily, Monthly, Financial Year (Apr-Mar) and Customer Billing summaries' },
    settings: { title: 'Application Settings', subtitle: 'Backup, restore, and security lock configuration' }
  };

  return (
    <>
      <AppLayout
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab !== 'create') setCreateInitialData(null);
          setActiveTab(tab);
        }}
        title={tabTitles[activeTab]?.title}
        subtitle={tabTitles[activeTab]?.subtitle}
        onLockApp={() => setIsLocked(true)}
      >
        {activeTab === 'dashboard' && (
          <Dashboard
            onViewInvoice={(inv) => {
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
              setActiveTab('dashboard');
              showToast('success', `Invoice ${inv.invoice_number || inv.proforma_number} saved! Returned to Dashboard.`);
            }}
          />
        )}

        {activeTab === 'history' && (
          <History
            toast={showToast}
            onNavigateCreate={() => setActiveTab('create')}
            onDuplicateInvoice={handleDuplicateInvoice}
            onConvertProforma={handleConvertProforma}
          />
        )}

        {activeTab === 'reports' && <Reports toast={showToast} />}

        {activeTab === 'settings' && <Settings toast={showToast} />}
      </AppLayout>

      {/* Security PIN Lock Modal Overlay */}
      <Modal isOpen={isLocked} onClose={() => {}} title="Security PIN Lock Required" maxWidth="max-w-md">
        <form onSubmit={handlePinUnlock} className="space-y-4 py-2">
          <div className="flex flex-col items-center justify-center p-4 text-center">
            <div className="p-3 rounded-full bg-amber-950/80 border border-amber-800/60 text-amber-400 mb-2">
              <Lock className="w-8 h-8" />
            </div>
            <p className="text-xs text-slate-300">Enter your 4-digit security PIN to unlock the billing application.</p>
          </div>

          <Input
            type="password"
            maxLength={4}
            placeholder="Enter 4-digit PIN"
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value)}
            error={pinError}
            autoFocus
          />

          <Button type="submit" variant="primary" className="w-full">
            Unlock Application
          </Button>
        </form>
      </Modal>

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
