import React, { useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { CompanyDetailsTab } from '../components/details/CompanyDetailsTab';
import { ProductDetailsTab } from '../components/details/ProductDetailsTab';
import { Building2, Package, Sparkles } from 'lucide-react';

export function Details({ toast }) {
  const [activeSubTab, setActiveSubTab] = useState('companies'); // 'companies' | 'products'

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Sub-Tab Navigation Bar */}
        <div className="p-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-300 dark:border-slate-800 flex flex-wrap gap-2 shadow-none">
          <button
            onClick={() => setActiveSubTab('companies')}
            className={`flex items-center gap-2.5 px-5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'companies'
                ? 'bg-sky-500 dark:bg-sky-600 text-white shadow-none'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Company Details (Buyers Directory)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('products')}
            className={`flex items-center gap-2.5 px-5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'products'
                ? 'bg-sky-500 dark:bg-sky-600 text-white shadow-none'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Product Details (Items & HSN Catalog)</span>
          </button>
        </div>

        {/* Master Content Section */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-300 dark:border-slate-800 shadow-none">
          {activeSubTab === 'companies' && (
            <CompanyDetailsTab toast={toast} />
          )}

          {activeSubTab === 'products' && (
            <ProductDetailsTab toast={toast} />
          )}
        </div>
      </div>
    </PageContainer>
  );
}
