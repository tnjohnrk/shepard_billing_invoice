import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext({
  theme: 'dark',
  setTheme: () => {},
  toggleTheme: () => {}
});

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    try {
      return localStorage.getItem('shepherd_app_theme') || 'dark';
    } catch {
      return 'dark';
    }
  });

  const applyTheme = (newTheme) => {
    const root = document.documentElement;
    const body = document.body;
    if (newTheme === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
      body.classList.add('light');
      body.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    } else {
      root.classList.add('dark');
      root.classList.remove('light');
      body.classList.add('dark');
      body.classList.remove('light');
      root.setAttribute('data-theme', 'dark');
    }
  };

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const setTheme = (newTheme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('shepherd_app_theme', newTheme);
    } catch (e) {
      console.error('Failed to save theme in localStorage:', e);
    }
    applyTheme(newTheme);
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
