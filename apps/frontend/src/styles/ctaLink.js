import { clsx } from 'clsx';

/** Shared styles for `<Link>` that must look like the green CTA (anchors cannot wrap `<button>`). */
export const ctaLinkClasses = clsx(
  'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200',
  'bg-cta-600 text-white hover:bg-cta-700 active:bg-cta-800',
  'shadow-lg shadow-cta-900/25 ring-1 ring-black/10 dark:ring-white/15',
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-cta-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
  'px-8 py-3.5 text-lg'
);
