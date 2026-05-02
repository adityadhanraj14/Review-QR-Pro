import { Link, NavLink, useNavigate } from 'react-router-dom';
import { LogOut, Moon, Sun } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/useTheme.js';
import { brand } from '../../theme/brand.js';
import { Button } from '../ui/Button.jsx';

/**
 * @param {{ homeTo?: string; navLinks?: { to: string; label: string; end?: boolean }[] }} props
 */
export function Header({ homeTo = '/admin/overview', navLinks }) {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const showDashboardChrome = Boolean(navLinks?.length);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const pillClass = ({ isActive }) =>
    [
      'shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium whitespace-nowrap transition-colors',
      isActive
        ? 'bg-primary-100 text-primary-900 ring-1 ring-primary-200/80 dark:bg-primary-900/50 dark:text-primary-100 dark:ring-primary-600/60'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-slate-800 dark:hover:text-gray-100',
    ].join(' ');

  return (
    <header className="bg-white border-b border-gray-200/90 sticky top-0 z-50 shadow-sm/50 dark:bg-slate-900 dark:border-slate-700/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-0 sm:h-auto">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:h-16 sm:py-0">
          <div className="flex flex-col gap-3 min-w-0 sm:flex-row sm:items-center sm:gap-6">
            <Link to={homeTo} className="text-xl font-bold text-primary-700 shrink-0 dark:text-primary-300">
              {brand.logoText}
              <span className="text-primary-950 font-semibold dark:text-primary-100">{brand.logoAccent}</span>
            </Link>
            {navLinks && navLinks.length > 0 && (
              <nav className="flex gap-1 overflow-x-auto pb-0.5 -mx-1 px-1 sm:pb-0">
                {navLinks.map(({ to, label, end }) => (
                  <NavLink key={to} to={to} end={end} className={pillClass}>
                    {label}
                  </NavLink>
                ))}
              </nav>
            )}
          </div>
          <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 shrink-0">
            <span className="text-sm text-gray-600 truncate sm:max-w-[14rem] dark:text-gray-400">
              {user?.name} · <span className="capitalize">{user?.role}</span>
            </span>
            <div className="flex items-center gap-1 shrink-0">
              {showDashboardChrome && (
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  onClick={toggle}
                  className="!px-2"
                  aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                  title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
                >
                  {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={handleLogout} className="!px-2" aria-label="Log out">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
