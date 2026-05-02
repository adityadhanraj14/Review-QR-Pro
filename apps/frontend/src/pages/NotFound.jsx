import { Link } from 'react-router-dom';
import { clsx } from 'clsx';
import { ctaLinkClasses } from '../styles/ctaLink.js';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-slate-950 via-violet-950 to-primary-900 dark:from-black dark:via-slate-950 dark:to-violet-950">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white/25 dark:text-white/20">404</h1>
        <p className="mt-4 text-violet-100 dark:text-gray-300">Page not found</p>
        <Link to="/" className={clsx(ctaLinkClasses, 'mt-10')}>
          Home
        </Link>
      </div>
    </div>
  );
}
