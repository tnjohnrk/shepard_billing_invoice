import React, { useState, useEffect } from 'react';
import { Keyboard, X, Search, Compass, FileText, FolderKanban } from 'lucide-react';
import { KEYBOARD_SHORTCUTS, SHORTCUT_CATEGORIES, CATEGORY_LABELS } from '../../../shared/constants/shortcuts';

export function ShortcutsModal({ isOpen, onClose }) {
  const [search, setSearch] = useState('');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

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
        return <Compass className="w-4 h-4 text-[#0078d4]" />;
      case SHORTCUT_CATEGORIES.INVOICE:
        return <FileText className="w-4 h-4 text-emerald-500" />;
      default:
        return <FolderKanban className="w-4 h-4 text-[#0078d4]" />;
    }
  };

  const categories = [
    SHORTCUT_CATEGORIES.NAVIGATION,
    SHORTCUT_CATEGORIES.INVOICE,
    SHORTCUT_CATEGORIES.DOCUMENT
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-[#161b22] rounded-2xl border border-slate-300 dark:border-[#30363d] shadow-2xl max-w-2xl w-full max-h-[88vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-[#30363d] flex items-center justify-between gap-3 bg-slate-50/70 dark:bg-[#0d1117]/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#0078d4]/5 dark:bg-[#0078d4]/20/60 text-[#0078d4] dark:text-[#4cc2ff] border border-[#0078d4]/30 dark:border-[#005fa3]">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100">
                Keyboard Shortcuts Guide
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Speed up your billing workflows with direct hotkeys
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-3 px-4 sm:px-5 border-b border-slate-200 dark:border-[#30363d] bg-white dark:bg-[#161b22] shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search shortcut name, action, or key..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-[#30363d] bg-slate-50/70 dark:bg-[#0d1117] text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#0078d4] focus:ring-2 focus:ring-[#0078d4]/20"
              autoFocus
            />
          </div>
        </div>

        {/* Shortcuts List Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
          {categories.map((cat) => {
            const items = filteredShortcuts.filter(s => s.category === cat);
            if (items.length === 0) return null;

            return (
              <div key={cat} className="space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider pb-1 border-b border-slate-100 dark:border-[#30363d]">
                  {getCategoryIcon(cat)}
                  <span>{CATEGORY_LABELS[cat]}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-xl border border-slate-200/80 dark:border-[#30363d] bg-slate-50/40 dark:bg-[#0d1117]/40 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                          {item.label}
                        </div>
                        <div className="text-[10.5px] text-slate-500 dark:text-slate-400 truncate">
                          {item.description}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {item.keys.map((k, idx) => (
                          <React.Fragment key={idx}>
                            <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-[#161b22] border border-slate-300 dark:border-[#30363d] text-[10px] font-bold font-mono text-slate-800 dark:text-slate-200 shadow-2xs">
                              {k}
                            </kbd>
                            {idx < item.keys.length - 1 && (
                              <span className="text-[9px] text-slate-400 font-bold">+</span>
                            )}
                          </React.Fragment>
                        ))}

                        {item.altKeys && (
                          <>
                            <span className="text-[10px] text-slate-400 mx-0.5">/</span>
                            {item.altKeys.map((k, idx) => (
                              <React.Fragment key={idx}>
                                <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-[#161b22] border border-slate-300 dark:border-[#30363d] text-[10px] font-bold font-mono text-slate-800 dark:text-slate-200 shadow-2xs">
                                  {k}
                                </kbd>
                                {idx < item.altKeys.length - 1 && (
                                  <span className="text-[9px] text-slate-400 font-bold">+</span>
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
            <div className="text-center py-8 text-xs text-slate-400">
              No shortcuts found matching &quot;{search}&quot;
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 px-5 border-t border-slate-200 dark:border-[#30363d] bg-slate-50/70 dark:bg-[#0d1117]/60 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 shrink-0">
          <span>Press <kbd className="px-1 py-0.5 rounded bg-white dark:bg-[#161b22] border border-slate-300 dark:border-[#30363d] font-mono text-[10px] font-bold">Esc</kbd> or <kbd className="px-1 py-0.5 rounded bg-white dark:bg-[#161b22] border border-slate-300 dark:border-[#30363d] font-mono text-[10px] font-bold">F1</kbd> to close</span>
          <span className="font-semibold text-[#0078d4] dark:text-[#4cc2ff]">Windows Non-Conflicting</span>
        </div>
      </div>
    </div>
  );
}
