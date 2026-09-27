import React from 'react';
import { Check } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export function InvoiceStepper({ currentStep, setStep, steps }) {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  return (
    <nav aria-label="Invoice Creation Steps" className="w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-2 rounded-xl border border-slate-200/80 dark:border-slate-800 mb-4 select-none shadow-xs overflow-hidden">
      <ol className="flex items-center justify-between overflow-x-auto gap-1 py-0.5 no-scrollbar">
        {steps.map((step, idx) => {
          const stepNum = idx + 1;
          const isCompleted = stepNum < currentStep;
          const isCurrent = stepNum === currentStep;
          const canNavigate = stepNum <= currentStep || (currentStep >= 7 && stepNum === 8);

          return (
            <li key={step.id} className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => canNavigate && setStep(stepNum)}
                disabled={!canNavigate}
                aria-current={isCurrent ? 'step' : undefined}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${
                  isCurrent
                    ? 'bg-[#0969da] dark:bg-[#1f6feb] text-white shadow-xs'
                    : isCompleted
                    ? 'bg-blue-50 dark:bg-blue-950/40 text-[#0969da] dark:text-[#388bfd] border border-blue-200/60 dark:border-blue-900/60 hover:bg-blue-100 dark:hover:bg-blue-900/40'
                    : canNavigate
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                    : 'bg-transparent text-slate-400 dark:text-slate-600 border border-transparent cursor-not-allowed'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition-colors ${
                    isCurrent
                      ? 'bg-white text-[#0969da] dark:text-[#1f6feb] font-extrabold'
                      : isCompleted
                      ? 'bg-[#0969da] dark:bg-[#1f6feb] text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {isCompleted ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : stepNum}
                </span>
                <span className="whitespace-nowrap">{step.label}</span>
              </button>

              {idx < steps.length - 1 && (
                <div
                  aria-hidden="true"
                  className={`w-3 h-[2px] hidden lg:block rounded-full ${
                    isCompleted
                      ? 'bg-[#0969da] dark:bg-[#1f6feb]'
                      : 'bg-slate-200 dark:bg-slate-800'
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
