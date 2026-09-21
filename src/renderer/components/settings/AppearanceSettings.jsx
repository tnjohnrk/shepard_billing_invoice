import React from 'react';
import { Sun, Moon, CheckCircle2, Sparkles, Monitor } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export function AppearanceSettings() {
  const { theme, setTheme } = useTheme();

  const themes = [
    {
      id: 'dark',
      name: 'Dark Mode',
      subtitle: 'High contrast business desktop interface',
      icon: Moon,
      colors: ['#0b0f19', '#0f172a', '#0284c7'],
      description: 'Optimized for low-light environments and long billing sessions.'
    },
    {
      id: 'light',
      name: 'Light Mode',
      subtitle: 'Clean, crisp daylight enterprise interface',
      icon: Sun,
      colors: ['#ffffff', '#f8fafc', '#0ea5e9'],
      description: 'Ideal for bright offices and traditional paper-style accounting.'
    }
  ];

  return (
    <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-300 dark:border-slate-700 space-y-6 shadow-none">
      <div>
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-sky-500 dark:text-sky-400" />
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Appearance & Themes</h3>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Customize the visual theme and contrast mode for your billing workspace.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {themes.map((t) => {
          const Icon = t.icon;
          const isSelected = theme === t.id;

          return (
            <div
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between shadow-none ${
                isSelected
                  ? 'border-sky-500 bg-sky-50/60 dark:bg-sky-950/40 dark:border-sky-500'
                  : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 bg-slate-50 dark:bg-slate-800'
              }`}
            >
              {isSelected && (
                <div className="absolute top-4 right-4 flex items-center gap-1 px-2.5 py-1 rounded-full bg-sky-100 dark:bg-sky-900/60 border border-sky-300 dark:border-sky-700 text-[10px] font-bold text-sky-700 dark:text-sky-300">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Active</span>
                </div>
              )}

              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={`p-2.5 rounded-xl ${
                      isSelected
                        ? 'bg-sky-500 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{t.name}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{t.subtitle}</p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  {t.description}
                </p>
              </div>

              {/* Color Swatch Preview */}
              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Palette preview</span>
                <div className="flex items-center gap-1.5">
                  {t.colors.map((c, i) => (
                    <span
                      key={i}
                      className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-600"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-start gap-3 shadow-none">
        <Monitor className="w-4 h-4 text-slate-500 dark:text-slate-400 mt-0.5 shrink-0" />
        <div className="text-xs text-slate-600 dark:text-slate-300">
          <span className="font-semibold text-slate-900 dark:text-slate-100">Instant Preference Saving:</span> Your theme preference is automatically remembered on this computer across application restarts.
        </div>
      </div>
    </div>
  );
}
