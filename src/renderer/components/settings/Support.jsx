import React, { useState } from 'react';
import { Mail, Globe, ExternalLink, Copy, Check, MessageSquare, Heart, ShieldCheck, Code2 } from 'lucide-react';
import { Button } from '../common/Button';
import { ipcClient } from '../../services/ipcClient';

export function Support({ toast }) {
  const [copied, setCopied] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  const supportEmail = 'vibe2codeteam@gmail.com';
  const websiteUrl = 'https://vibe2code.in';
  const websiteDisplay = 'vibe2code.in';

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(supportEmail);
    setCopied(true);
    if (toast) toast('success', 'Email copied to clipboard: ' + supportEmail);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenEmail = () => {
    ipcClient.openExternal(`mailto:${supportEmail}`);
    if (toast) toast('info', 'Opening mail client...');
  };

  const handleOpenWebsite = () => {
    if (!navigator.onLine) {
      if (toast) toast('warning', 'You are currently in Offline Mode. Please connect to the internet to visit the website.');
      return;
    }
    ipcClient.openExternal(websiteUrl);
    if (toast) toast('info', 'Opening vibe2code.in in your browser...');
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner Card */}
      <div className="p-6 sm:p-7 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white shrink-0 shadow-xs">
              <Code2 className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 mb-1.5">
                <Heart className="w-3 h-3 fill-indigo-500 text-indigo-500" /> Powered by Vibe2Code
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                Vibe2Code Support &amp; Solutions
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-xl leading-relaxed">
                Need help with the billing system, custom invoice templates, feature requests, or technical assistance? Our dedicated engineering team is here to support you.
              </p>
            </div>
          </div>

          <div className="flex sm:flex-col gap-2 shrink-0">
            <Button
              variant="primary"
              icon={Globe}
              onClick={handleOpenWebsite}
              className="w-full justify-center"
            >
              Visit Website
            </Button>
            <Button
              variant="secondary"
              icon={Mail}
              onClick={handleOpenEmail}
              className="w-full justify-center"
            >
              Contact Email
            </Button>
          </div>
        </div>
      </div>

      {/* Support Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Email Support Card */}
        <div className="p-5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-xl border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between shadow-xs space-y-4">
          <div className="space-y-2.5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Email Helpdesk
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Direct developer &amp; support channel
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Send your bug reports, queries, or backup restoration requests directly to our team. We usually respond promptly.
            </p>
          </div>

          <div className="flex items-center justify-between p-2.5 px-3 rounded-lg bg-slate-50/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
            <span className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-200 truncate select-all">
              {supportEmail}
            </span>
            <div className="flex items-center gap-1 ml-2 shrink-0">
              <button
                type="button"
                onClick={handleCopyEmail}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                title="Copy email to clipboard"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={handleOpenEmail}
                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors cursor-pointer inline-flex items-center gap-1"
                title="Compose Email"
              >
                Compose <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Website Card */}
        <div className="p-5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-xl border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between shadow-xs space-y-4">
          <div className="space-y-2.5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800 shrink-0">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Official Website
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Explore products &amp; updates
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Visit our official website to discover software updates, custom application development services, and business tooling.
            </p>
          </div>

          <div className="flex items-center justify-between p-2.5 px-3 rounded-lg bg-slate-50/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 truncate">
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'} shrink-0`} title={isOnline ? 'Internet Connected' : 'Offline'}></span>
              <span className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                {websiteDisplay}
              </span>
            </div>
            <button
              type="button"
              onClick={handleOpenWebsite}
              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-cyan-600 text-white hover:bg-cyan-700 transition-colors ml-2 shrink-0 cursor-pointer inline-flex items-center gap-1"
            >
              Open <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Information Banner */}
      <div className="p-3.5 rounded-xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex items-center justify-center shadow-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>This application is built, engineered, and powered by <strong>Vibe2Code</strong>.</span>
        </div>
      </div>
    </div>
  );
}
