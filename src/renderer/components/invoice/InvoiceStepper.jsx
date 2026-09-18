import React from 'react';

export function InvoiceStepper({ currentStep, setStep, steps }) {
  return (
    <div className="w-full glass-panel p-4 rounded-xl border border-slate-800 mb-6 select-none">
      <div className="flex items-center justify-between overflow-x-auto gap-2">
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
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isCurrent
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : isCompleted
                    ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/50 cursor-pointer hover:bg-emerald-900/80'
                    : canNavigate
                    ? 'bg-slate-800 text-slate-200 cursor-pointer hover:bg-slate-700'
                    : 'bg-slate-800/50 text-slate-500 cursor-not-allowed'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  isCurrent ? 'bg-white text-indigo-600 font-bold' : isCompleted ? 'bg-emerald-400 text-slate-950 font-bold' : 'bg-slate-700 text-slate-400'
                }`}>
                  {stepNum}
                </span>
                <span>{step.label}</span>
              </button>

              {idx < steps.length - 1 && (
                <div className="w-6 h-[1px] bg-slate-800 hidden sm:block" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
