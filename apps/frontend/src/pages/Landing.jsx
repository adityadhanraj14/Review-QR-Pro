import { Link } from 'react-router-dom';
import { QrCode, Sparkles, BarChart3 } from 'lucide-react';
import { brand } from '../theme/brand.js';
import { ctaLinkClasses } from '../styles/ctaLink.js';

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 dark:bg-black">
      <section className="relative flex flex-col items-center justify-center min-h-[48vh] sm:min-h-[52vh] px-4 pb-24 sm:pb-28 overflow-hidden">
        <div
          className="absolute inset-0 bg-gradient-to-br from-violet-900 via-primary-900 to-slate-950 dark:from-violet-950 dark:via-slate-950 dark:to-black"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_0%,rgba(167,139,250,0.45),transparent_55%)] dark:bg-[radial-gradient(ellipse_90%_55%_at_50%_0%,rgba(139,92,246,0.35),transparent_50%)]"
          aria-hidden="true"
        />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-950 to-transparent dark:from-black dark:to-transparent pointer-events-none" aria-hidden="true" />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight drop-shadow-sm">
            {brand.logoText}
            <span className="text-violet-200 dark:text-primary-300">{brand.logoAccent}</span>
          </h1>
          <p className="mt-5 text-lg sm:text-xl text-violet-100/95 max-w-2xl mx-auto leading-relaxed">
            {brand.tagline}
          </p>
          <div className="mt-10 flex justify-center">
            <Link to="/login" className={ctaLinkClasses}>
              Dashboard login
            </Link>
          </div>
        </div>
      </section>

      <section className="relative z-20 flex-1 -mt-16 sm:-mt-20 px-3 sm:px-4 pb-24">
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-slate-950 to-transparent dark:from-black dark:to-transparent pointer-events-none" aria-hidden="true" />
        <div className="relative mx-auto max-w-5xl rounded-[1.75rem] sm:rounded-[2rem] border border-white/10 bg-white/95 shadow-2xl shadow-black/25 backdrop-blur-md dark:border-slate-600/60 dark:bg-slate-900/95 dark:shadow-black/50 px-5 py-10 sm:px-10 sm:py-12">
          <div className="grid sm:grid-cols-3 gap-6 sm:gap-8 text-left">
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-6 dark:border-slate-700 dark:bg-slate-800/50">
              <QrCode className="h-8 w-8 text-primary-600 dark:text-primary-400 mb-3" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">QR in seconds</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 leading-relaxed">
                One link per venue. Customers land on a frictionless review flow.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-6 dark:border-slate-700 dark:bg-slate-800/50">
              <Sparkles className="h-8 w-8 text-primary-600 dark:text-primary-400 mb-3" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">AI suggestions</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 leading-relaxed">
                4–5 star guests get natural copy ideas, then jump to Google.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-6 dark:border-slate-700 dark:bg-slate-800/50 sm:col-span-1">
              <BarChart3 className="h-8 w-8 text-primary-600 dark:text-primary-400 mb-3" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Analytics</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 leading-relaxed">
                Scans, ratings, redirects, and private feedback for low scores.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
