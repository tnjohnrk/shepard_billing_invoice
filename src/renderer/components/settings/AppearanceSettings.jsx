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
    <div className="p-5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-5 shadow-xs">
      <div>
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-500" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Appearance & Themes</h3>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
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
              className={`relative p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between shadow-xs ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/30 dark:border-indigo-500 ring-1 ring-indigo-500/20'
                  : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40'
              }`}
            >
              {isSelected && (
                <div className="absolute top-3.5 right-3.5 flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-100/80 dark:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-700 text-[10px] font-bold text-indigo-700 dark:text-indigo-300">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Active</span>
                </div>
              )}

              <div>
                <div className="flex items-center gap-2.5 mb-2.5">
                  <div
                    className={`p-2 rounded-lg ${
                      isSelected
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{t.name}</h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">{t.subtitle}</p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  {t.description}
                </p>
              </div>

              {/* Color Swatch Preview */}
              <div className="mt-3.5 pt-2.5 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Palette preview</span>
                <div className="flex items-center gap-1.5">
                  {t.colors.map((c, i) => (
                    <span
                      key={i}
                      className="w-3.5 h-3.5 rounded-full border border-slate-200 dark:border-slate-700 shadow-xs"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-3.5 rounded-xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex items-start gap-2.5 shadow-xs">
        <Monitor className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
        <div className="text-xs text-slate-600 dark:text-slate-400">
          <span className="font-semibold text-slate-800 dark:text-slate-200">Instant Preference Saving:</span> Your theme preference is automatically remembered on this computer across application restarts.
        </div>
      </div>
    </div>
  );
}
