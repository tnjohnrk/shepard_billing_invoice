import React, { useState, useEffect } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { InvoiceStepper } from '../components/invoice/InvoiceStepper';
import { InvoiceTypeSelector } from '../components/invoice/InvoiceTypeSelector';
import { InvoiceDetailsForm } from '../components/invoice/InvoiceDetailsForm';
import { BuyerDetailsForm } from '../components/invoice/BuyerDetailsForm';
import { ReferenceDetailsForm } from '../components/invoice/ReferenceDetailsForm';
import { ItemTable } from '../components/invoice/ItemTable';
import { TaxSection } from '../components/invoice/TaxSection';
import { AdditionalDetailsForm } from '../components/invoice/AdditionalDetailsForm';
import { InvoiceReview } from '../components/invoice/InvoiceReview';
import { InvoicePreview } from '../components/invoice/InvoicePreview';
import { Button } from '../components/common/Button';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { ipcClient } from '../services/ipcClient';
import { SHEPHERD_DEFAULT_STATE_CODE } from '../../shared/constants/application';

export function CreateInvoice({ initialData = null, toast, onInvoiceSaved, onNavigateHome }) {
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    invoice_type: 'NORMAL',
    invoice_number: '',
    proforma_number: '',
    invoice_date: new Date().toISOString().split('T')[0],
    proforma_date: new Date().toISOString().split('T')[0],
    copy_type: 'ORIGINAL',

    transportation_mode: '',
    vehicle_number: '',
    date_of_supply: '',
    delivery_address: '',

    buyer_name: '',
    buyer_address: '',
    customer_gstin: '',
    customer_state: 'Maharashtra',
    customer_state_code: SHEPHERD_DEFAULT_STATE_CODE,

    so_po_number: '',
    so_po_date: '',
    gemc_number: '',
    additional_reference: '',

    items: [
      { description: 'Industrial Supply / Service Item', hsn_sac: '9983', quantity: 1, rate: 10000 }
    ],

    notes: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData
      }));
    } else {
      fetchNextDocNumbers();
    }
  }, [initialData]);

  const fetchNextDocNumbers = async () => {
    try {
      if (formData.invoice_type === 'PROFORMA') {
        const proNum = await ipcClient.getNextProformaNumber();
        setFormData(prev => ({
          ...prev,
          proforma_number: proNum || 'PRO-001',
          invoice_number: ''
        }));
      } else {
        const invNum = await ipcClient.getNextInvoiceNumber();
        setFormData(prev => ({
          ...prev,
          invoice_number: invNum || 'INV-001',
          proforma_number: ''
        }));
      }
    } catch (e) {
      console.error('Error fetching next numbers:', e);
    }
  };

  const handleTypeSelect = async (type) => {
    // Immediately set selected type and advance to next step (Invoice Details)
    setFormData(prev => ({
      ...prev,
      invoice_type: type,
      ...(type === 'PROFORMA' ? { invoice_number: '' } : { proforma_number: '' })
    }));
    setStep(2);

    try {
      if (type === 'PROFORMA') {
        const proNum = await ipcClient.getNextProformaNumber();
        setFormData(prev => ({
          ...prev,
          invoice_type: 'PROFORMA',
          proforma_number: proNum || 'PRO-001',
          invoice_number: ''
        }));
      } else {
        const invNum = await ipcClient.getNextInvoiceNumber();
        setFormData(prev => ({
          ...prev,
          invoice_type: 'NORMAL',
          invoice_number: invNum || 'INV-001',
          proforma_number: ''
        }));
      }
    } catch (e) {
      console.error('Error fetching sequence number on type select:', e);
    }
  };

  const steps = [
    { id: 1, label: 'Select Type' },
    { id: 2, label: 'Invoice Details' },
    { id: 3, label: 'Buyer Details' },
    { id: 4, label: 'References' },
    { id: 5, label: 'Items & Tax' },
    { id: 6, label: 'Additional' },
    { id: 7, label: 'Review' },
    { id: 8, label: 'Generate & Preview' }
  ];

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateCurrentStep = () => {
    const newErrors = {};

    if (step === 3) {
      if (!formData.buyer_name || !formData.buyer_name.trim()) {
        newErrors.buyer_name = 'Buyer name is required';
      }
      if (!formData.buyer_address || !formData.buyer_address.trim()) {
        newErrors.buyer_address = 'Buyer address is required';
      }
      if (formData.customer_gstin && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(formData.customer_gstin)) {
        newErrors.customer_gstin = 'Invalid GSTIN format (15 chars required)';
      }
    }

    if (step === 5) {
      if (!formData.items || formData.items.length === 0) {
        toast('error', 'Please add at least one line item.');
        return false;
      }
      const invalidItem = formData.items.find(i => !i.description || i.quantity <= 0 || i.rate < 0);
      if (invalidItem) {
        toast('error', 'Please ensure all line items have valid descriptions, quantities, and rates.');
        return false;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const handlePrev = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const isProforma = formData.invoice_type === 'PROFORMA';

  return (
    <PageContainer>
      <InvoiceStepper currentStep={step} setStep={setStep} steps={steps} />

      <div className="p-6 glass-panel rounded-xl border border-slate-800 min-h-[450px] flex flex-col justify-between">
        <div>
          {step === 1 && (
            <InvoiceTypeSelector
              selectedType={formData.invoice_type}
              onSelect={handleTypeSelect}
            />
          )}

          {step === 2 && (
            <InvoiceDetailsForm
              formData={formData}
              onChange={handleFieldChange}
              isProforma={isProforma}
            />
          )}

          {step === 3 && (
            <BuyerDetailsForm
              formData={formData}
              onChange={handleFieldChange}
              errors={errors}
            />
          )}

          {step === 4 && (
            <ReferenceDetailsForm
              formData={formData}
              onChange={handleFieldChange}
            />
          )}

          {step === 5 && (
            <div className="space-y-6">
              <ItemTable
                items={formData.items}
                setItems={(items) => handleFieldChange('items', items)}
              />
              <TaxSection
                items={formData.items}
                customerStateCode={formData.customer_state_code}
                cgstRate={formData.cgst_rate ?? 9}
                sgstRate={formData.sgst_rate ?? 9}
                igstRate={formData.igst_rate ?? 18}
                onChangeTaxRate={handleFieldChange}
              />
            </div>
          )}

          {step === 6 && (
            <AdditionalDetailsForm
              formData={formData}
              onChange={handleFieldChange}
            />
          )}

          {step === 7 && (
            <InvoiceReview
              formData={formData}
              isProforma={isProforma}
            />
          )}

          {step === 8 && (
            <InvoicePreview
              formData={formData}
              onBack={() => setStep(7)}
              onSaveSuccess={onInvoiceSaved}
              onGoHome={onNavigateHome}
              toast={toast}
            />
          )}
        </div>

        {/* Wizard Bottom Nav */}
        {step < 8 && (
          <div className="flex items-center justify-between pt-6 border-t border-slate-800 mt-6">
            <Button
              variant="secondary"
              icon={ArrowLeft}
              onClick={handlePrev}
              disabled={step === 1}
            >
              Previous
            </Button>

            <Button
              variant={step === 7 ? 'success' : 'primary'}
              icon={step === 7 ? CheckCircle : ArrowRight}
              onClick={handleNext}
            >
              {step === 7 ? 'Generate Invoice Document' : 'Next Step'}
            </Button>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
