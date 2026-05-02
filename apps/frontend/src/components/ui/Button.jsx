import { clsx } from 'clsx';

const variants = {
  primary: 'bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500',
  cta: 'bg-cta-600 hover:bg-cta-700 text-white focus:ring-cta-500 shadow-md ring-1 ring-black/10 dark:ring-white/15',
  secondary:
    'bg-gray-200 hover:bg-gray-300 text-gray-800 focus:ring-gray-400 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-gray-100 dark:focus:ring-slate-500',
  danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
  outline:
    'border-2 border-primary-600 text-primary-600 hover:bg-primary-50 focus:ring-primary-500 dark:border-primary-400 dark:text-primary-300 dark:hover:bg-primary-950/40 dark:focus:ring-primary-400',
  ghost:
    'text-gray-600 hover:bg-gray-100 focus:ring-gray-400 dark:text-gray-300 dark:hover:bg-slate-800 dark:focus:ring-slate-600',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={clsx(
        'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  );
}

export default Button;
