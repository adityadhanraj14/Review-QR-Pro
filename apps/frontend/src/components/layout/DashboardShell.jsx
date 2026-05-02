import { Outlet } from 'react-router-dom';
import { Header } from './Header.jsx';

const ADMIN_LINKS = [
  { to: '/admin/overview', label: 'Overview', end: true },
  { to: '/admin/owners', label: 'Owners' },
  { to: '/admin/businesses', label: 'Businesses' },
  { to: '/admin/feedback', label: 'Feedback' },
];

const OWNER_LINKS = [{ to: '/owner', label: 'Venues', end: true }];

/**
 * @param {{ variant: 'admin' | 'owner' }} props
 */
export function DashboardShell({ variant }) {
  const navLinks = variant === 'admin' ? ADMIN_LINKS : OWNER_LINKS;
  const homeTo = variant === 'admin' ? '/admin/overview' : '/owner';

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100/90 via-gray-50 to-violet-50/30 flex flex-col dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <Header homeTo={homeTo} navLinks={navLinks} />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
        <div className="max-w-7xl mx-auto w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
