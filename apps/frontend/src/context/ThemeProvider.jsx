import { useCallback, useLayoutEffect, useState } from 'react';
import { THEME_STORAGE_KEY } from '../constants/theme.js';
import { ThemeContext } from './themeContext.js';

function readStoredTheme() {
  if (typeof window === 'undefined') return 'light';
  return localStorage.getItem(THEME_STORAGE_KEY) === 'dark' ? 'dark' : 'light';
}

function applyDomTheme(mode) {
  const root = document.documentElement;
  if (mode === 'dark') root.classList.add('dark');
  else root.classList.remove('dark');
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(readStoredTheme);

  useLayoutEffect(() => {
    applyDomTheme(theme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  const toggle = useCallback(() => {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  }, []);

  const value = { theme, setTheme, toggle };
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
