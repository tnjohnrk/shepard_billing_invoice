import React, { useState, useEffect } from 'react';
import companyLogo from '../../assets/billing_image.png';
import { ShieldCheck, Sparkles, Database, CheckCircle2 } from 'lucide-react';

export function SplashScreen() {
  const [progress, setProgress] = useState(15);
  const [stageText, setStageText] = useState('Initializing secure database...');

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setProgress(45);
      setStageText('Loading business configuration & catalogs...');
    }, 300);

    const timer2 = setTimeout(() => {
      setProgress(80);
      setStageText('Preparing billing workspace...');
    }, 650);

    const timer3 = setTimeout(() => {
      setProgress(100);
      setStageText('Ready');
    }, 900);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-100/95 dark:bg-[#090d13]/95 backdrop-blur-md text-slate-900 dark:text-slate-100 select-none p-4 transition-colors">
      <div className="relative w-full max-w-sm bg-white dark:bg-[#161b22] p-7 sm:p-8 rounded-3xl border border-slate-200 dark:border-[#30363d] shadow-2xl flex flex-col items-center text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Glowing Logo Container */}
        <div className="relative flex items-center justify-center">
          {/* Subtle Ambient Glow */}
          <div className="absolute -inset-2 bg-gradient-to-r from-[#0078d4]/20 to-[#4cc2ff]/20 rounded-full blur-xl animate-pulse" />
          
          <div className="relative p-3 rounded-2xl bg-slate-50/80 dark:bg-[#0d1117] border border-slate-100 dark:border-[#30363d] shadow-inner">
            <img
              src={companyLogo}
              alt="Shepherd Enterprises"
              className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-md transition-transform duration-500 hover:scale-105"
            />
          </div>
        </div>

        {/* Brand Titles */}
        <div className="space-y-1">
          <div className="flex items-center justify-center gap-1.5">
            <h1 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100 tracking-wider uppercase">
              Shepherd Enterprises
            </h1>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium">
            Private Limited • Billing &amp; Invoice System
          </p>
        </div>

        {/* Progress Bar & Dynamic Stage Loading */}
        <div className="w-full space-y-2.5 pt-1">
          <div className="relative w-full h-1.5 bg-slate-100 dark:bg-[#0d1117] rounded-full overflow-hidden border border-slate-200 dark:border-[#30363d]">
            <div
              className="h-full bg-gradient-to-r from-[#0969da] to-[#4cc2ff] rounded-full transition-all duration-300 ease-out shadow-xs"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium px-0.5">
            <span className="truncate max-w-[200px] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0078d4] animate-ping inline-block shrink-0" />
              {stageText}
            </span>
            <span className="font-mono text-[10px] font-bold text-slate-400 dark:text-slate-500">
              {progress}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
