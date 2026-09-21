import React from 'react';
import { Check } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export function InvoiceStepper({ currentStep, setStep, steps }) {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  return (
    <nav aria-label="Invoice Creation Steps" className="w-full bg-white dark:bg-slate-900 p-3 rounded-2xl border-2 border-slate-300 dark:border-slate-700 mb-6 select-none shadow-none">
      <ol className="flex items-center justify-between overflow-x-auto gap-2 py-0.5 scrollbar-thin">
        {steps.map((step, idx) => {
          const stepNum = idx + 1;
          const isCompleted = stepNum < currentStep;
          const isCurrent = stepNum === currentStep;
          const canNavigate = stepNum <= currentStep || (currentStep >= 7 && stepNum === 8);

          return (
            <li key={step.id} className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => canNavigate && setStep(stepNum)}
                disabled={!canNavigate}
                aria-current={isCurrent ? 'step' : undefined}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer shadow-none min-h-[38px] ${
                  isCurrent
                    ? 'bg-emerald-600 text-white border-2 border-emerald-500'
                    : isCompleted
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900'
                    : canNavigate
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                    : 'bg-slate-50 dark:bg-slate-900/60 text-slate-400 dark:text-slate-600 border border-slate-200 dark:border-slate-800 cursor-not-allowed'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition-colors ${
                    isCurrent
                      ? 'bg-white text-emerald-700 font-extrabold'
                      : isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : stepNum}
                </span>
                <span className="whitespace-nowrap">{step.label}</span>
              </button>

              {idx < steps.length - 1 && (
                <div
                  aria-hidden="true"
                  className={`w-3.5 h-[2px] hidden lg:block rounded-full ${
                    isCompleted
                      ? isLight
                        ? 'bg-emerald-400'
                        : 'bg-emerald-600'
                      : isLight
                      ? 'bg-slate-200'
                      : 'bg-slate-800'
                  }`}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
