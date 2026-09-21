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
      <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-300 dark:border-slate-700 shadow-none">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shrink-0 shadow-md">
              <Code2 className="w-7 h-7" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 mb-2">
                <Heart className="w-3 h-3 fill-indigo-500 text-indigo-500" /> Powered by Vibe2Code
              </div>
              <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                Vibe2Code Support & Solutions
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-xl leading-relaxed">
                Need help with the billing system, custom invoice templates, feature requests, or technical assistance? Our dedicated engineering team is here to support you.
              </p>
            </div>
          </div>

          <div className="flex sm:flex-col gap-2.5 shrink-0">
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Email Support Card */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-300 dark:border-slate-700 flex flex-col justify-between shadow-none space-y-5">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Email Helpdesk
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Direct developer & support channel
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Send your bug reports, queries, or backup restoration requests directly to our team. We usually respond promptly.
            </p>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <span className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-200 truncate select-all">
                {supportEmail}
              </span>
              <button
                type="button"
                onClick={handleCopyEmail}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors ml-2 shrink-0 cursor-pointer"
                title="Copy email"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-500 font-medium">Quick Mailto:</span>
            <a
              href={`mailto:${supportEmail}`}
              onClick={(e) => {
                e.preventDefault();
                handleOpenEmail();
              }}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
            >
              Compose Email <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Website Card */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-300 dark:border-slate-700 flex flex-col justify-between shadow-none space-y-5">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 shrink-0">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Official Website
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Explore products & updates
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Visit our official website to discover software updates, custom application development services, and business tooling.
            </p>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 truncate">
                <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'} shrink-0`} title={isOnline ? 'Internet Connected' : 'Offline'}></span>
                <span className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {websiteDisplay}
                </span>
              </div>
              <button
                type="button"
                onClick={handleOpenWebsite}
                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors ml-2 shrink-0 cursor-pointer inline-flex items-center gap-1"
              >
                Open <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-500 font-medium">Domain:</span>
            <a
              href={websiteUrl}
              onClick={(e) => {
                e.preventDefault();
                handleOpenWebsite();
              }}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
            >
              https://{websiteDisplay} <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Information Banner */}
      <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>This application is built, engineered, and powered by <strong>Vibe2Code</strong>.</span>
        </div>
        <span className="text-[11px] text-slate-500">Website: <strong className="text-slate-700 dark:text-slate-300">{websiteDisplay}</strong></span>
      </div>
    </div>
  );
}
