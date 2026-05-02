import { Moon, Sun } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useTheme } from '../../context/useTheme.js';

export function ThemeToggleFab() {
  const { pathname } = useLocation();
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';

  if (pathname.startsWith('/admin') || pathname.startsWith('/owner')) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="fixed bottom-6 right-4 z-[100] flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-white text-violet-700 shadow-lg transition hover:bg-violet-50 sm:bottom-8 sm:right-8 dark:border-slate-600 dark:bg-slate-800 dark:text-amber-300 dark:hover:bg-slate-700"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
    >
      {isDark ? <Sun className="h-5 w-5" strokeWidth={2} /> : <Moon className="h-5 w-5" strokeWidth={2} />}
    </button>
  );
}
