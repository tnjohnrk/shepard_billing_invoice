import React from 'react';
import { Check } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export function InvoiceStepper({ currentStep, setStep, steps }) {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  return (
    <div className="w-full glass-panel p-3.5 rounded-xl border border-slate-800 mb-6 select-none shadow-sm">
      <div className="flex items-center justify-between overflow-x-auto gap-2 py-0.5">
        {steps.map((step, idx) => {
          const stepNum = idx + 1;
          const isCompleted = stepNum < currentStep;
          const isCurrent = stepNum === currentStep;
          const canNavigate = stepNum <= currentStep || (currentStep >= 7 && stepNum === 8);

          return (
            <div key={step.id} className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => canNavigate && setStep(stepNum)}
                disabled={!canNavigate}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  isCurrent
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-2 ring-indigo-500/40'
                    : isCompleted
                    ? isLight
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 hover:border-emerald-400'
                      : 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/50 hover:bg-emerald-900/80'
                    : canNavigate
                    ? isLight
                      ? 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 hover:text-slate-900'
                      : 'bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700'
                    : isLight
                    ? 'bg-slate-100/60 text-slate-400 border border-slate-200/60 cursor-not-allowed opacity-80'
                    : 'bg-slate-800/40 text-slate-500 border border-slate-700/40 cursor-not-allowed opacity-60'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition-colors ${
                    isCurrent
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : isCompleted
                      ? isLight
                        ? 'bg-emerald-600 text-white'
                        : 'bg-emerald-400 text-slate-950'
                      : isLight
                      ? 'bg-slate-200 text-slate-700 border border-slate-300'
                      : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  {isCompleted ? <Check className="w-3 h-3 stroke-[3]" /> : stepNum}
                </span>
                <span className="whitespace-nowrap">{step.label}</span>
              </button>

              {idx < steps.length - 1 && (
                <div
                  className={`w-4 h-[1px] hidden sm:block ${
                    isCompleted
                      ? isLight
                        ? 'bg-emerald-300'
                        : 'bg-emerald-600/60'
                      : isLight
                      ? 'bg-slate-200'
                      : 'bg-slate-800'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
