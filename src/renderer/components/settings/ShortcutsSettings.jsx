import React, { useState } from 'react';
import { Keyboard, Search, Compass, FileText, FolderKanban, Sparkles, ShieldCheck } from 'lucide-react';
import { KEYBOARD_SHORTCUTS, SHORTCUT_CATEGORIES, CATEGORY_LABELS } from '../../../shared/constants/shortcuts';

export function ShortcutsSettings() {
  const [search, setSearch] = useState('');

  const filteredShortcuts = KEYBOARD_SHORTCUTS.filter(s => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      s.label.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.keys.join(' ').toLowerCase().includes(q) ||
      (s.altKeys && s.altKeys.join(' ').toLowerCase().includes(q))
    );
  });

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case SHORTCUT_CATEGORIES.NAVIGATION:
        return <Compass className="w-4 h-4 text-indigo-500" />;
      case SHORTCUT_CATEGORIES.INVOICE:
        return <FileText className="w-4 h-4 text-emerald-500" />;
      default:
        return <FolderKanban className="w-4 h-4 text-sky-500" />;
    }
  };

  const categories = [
    SHORTCUT_CATEGORIES.NAVIGATION,
    SHORTCUT_CATEGORIES.INVOICE,
    SHORTCUT_CATEGORIES.DOCUMENT
  ];

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="p-5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Keyboard Shortcuts Reference
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 uppercase">
                  Productivity
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Master fast keyboard workflows. Press <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[10.5px] font-bold text-slate-800 dark:text-slate-200">F1</kbd> anywhere to open the quick cheat sheet.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold shrink-0">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Zero Windows OS Conflicts</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative pt-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search any shortcut by name, description, or key combination..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>

      {/* Categorized Shortcut Sections */}
      <div className="space-y-5">
        {categories.map((cat) => {
          const items = filteredShortcuts.filter(s => s.category === cat);
          if (items.length === 0) return null;

          return (
            <div
              key={cat}
              className="p-5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3"
            >
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider pb-2 border-b border-slate-100 dark:border-slate-800">
                {getCategoryIcon(cat)}
                <span>{CATEGORY_LABELS[cat]}</span>
                <span className="text-[10px] font-normal text-slate-400 normal-case ml-auto">
                  {items.length} shortcut{items.length > 1 ? 's' : ''}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between gap-3 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {item.label}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                        {item.description}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {item.keys.map((k, idx) => (
                        <React.Fragment key={idx}>
                          <kbd className="px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-bold font-mono text-slate-900 dark:text-slate-100 shadow-2xs">
                            {k}
                          </kbd>
                          {idx < item.keys.length - 1 && (
                            <span className="text-[10px] text-slate-400 font-bold">+</span>
                          )}
                        </React.Fragment>
                      ))}

                      {item.altKeys && (
                        <>
                          <span className="text-xs text-slate-400 mx-1">/</span>
                          {item.altKeys.map((k, idx) => (
                            <React.Fragment key={idx}>
                              <kbd className="px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-bold font-mono text-slate-900 dark:text-slate-100 shadow-2xs">
                                {k}
                              </kbd>
                              {idx < item.altKeys.length - 1 && (
                                <span className="text-[10px] text-slate-400 font-bold">+</span>
                              )}
                            </React.Fragment>
                          ))}
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {filteredShortcuts.length === 0 && (
          <div className="p-8 text-center text-xs text-slate-400 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-slate-200/80 dark:border-slate-800">
            No shortcuts found matching &quot;{search}&quot;.
          </div>
        )}
      </div>
    </div>
  );
}
