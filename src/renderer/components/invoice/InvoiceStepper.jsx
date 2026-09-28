import React from 'react';
import { Check } from 'lucide-react';

export function InvoiceStepper({ currentStep, setStep, steps }) {
  return (
    <nav 
      aria-label="Invoice Creation Progress" 
      className="w-full bg-white dark:bg-[#161b22] rounded-2xl border border-slate-200 dark:border-[#30363d] mb-4 select-none shadow-xs transition-colors"
    >
      <div className="px-3.5 py-3 overflow-x-auto no-scrollbar">
        <ol className="flex items-center min-w-max lg:min-w-0 w-full justify-between gap-1">
          {steps.map((step, idx) => {
            const stepNum = idx + 1;
            const isCompleted = stepNum < currentStep;
            const isCurrent = stepNum === currentStep;
            const canNavigate = stepNum <= currentStep || (currentStep >= 7 && stepNum === 8);

            return (
              <React.Fragment key={step.id}>
                {/* Step Item Button */}
                <li className="flex items-center shrink-0">
                  <button
                    type="button"
                    onClick={() => canNavigate && setStep(stepNum)}
                    disabled={!canNavigate}
                    aria-current={isCurrent ? 'step' : undefined}
                    title={canNavigate ? `Go to ${step.label}` : step.label}
                    className={`group flex items-center gap-2 px-2.5 py-1.5 rounded-xl transition-all duration-200 ${
                      canNavigate ? 'cursor-pointer' : 'cursor-not-allowed'
                    } ${
                      isCurrent
                        ? 'bg-blue-50/90 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 ring-1 ring-blue-500/30'
                        : isCompleted
                        ? 'hover:bg-slate-100 dark:hover:bg-[#21262d] text-slate-700 dark:text-slate-300'
                        : 'text-slate-400 dark:text-slate-600'
                    }`}
                  >
                    {/* Badge / Number / Checkmark */}
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold transition-all duration-200 shrink-0 ${
                        isCurrent
                          ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30 ring-2 ring-blue-500/20'
                          : isCompleted
                          ? 'bg-emerald-500 text-white shadow-xs group-hover:bg-emerald-600'
                          : 'bg-slate-100 dark:bg-[#0d1117] border border-slate-200 dark:border-[#30363d] text-slate-400 dark:text-slate-500'
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      ) : (
                        <span>{stepNum}</span>
                      )}
                    </div>

                    {/* Step Label */}
                    <span 
                      className={`text-xs whitespace-nowrap tracking-tight transition-colors ${
                        isCurrent
                          ? 'font-bold text-blue-600 dark:text-blue-400'
                          : isCompleted
                          ? 'font-semibold text-slate-700 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                          : 'font-medium text-slate-400 dark:text-slate-500'
                      }`}
                    >
                      {step.label}
                    </span>
                  </button>
                </li>

                {/* Connecting Line between steps */}
                {idx < steps.length - 1 && (
                  <li aria-hidden="true" className="flex-1 min-w-3 mx-1 lg:mx-1.5">
                    <div 
                      className={`h-[2px] w-full rounded-full transition-all duration-300 ${
                        stepNum < currentStep
                          ? 'bg-emerald-500 dark:bg-emerald-500'
                          : stepNum === currentStep
                          ? 'bg-gradient-to-r from-blue-500 to-slate-200 dark:to-[#30363d]'
                          : 'bg-slate-200 dark:bg-[#30363d]'
                      }`}
                    />
                  </li>
                )}
              </React.Fragment>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}
