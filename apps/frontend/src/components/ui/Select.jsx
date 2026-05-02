import { clsx } from 'clsx';

export function Select({ label, error, className = '', children, ...props }) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
      )}
      <select
        className={clsx(
          'input bg-white dark:bg-slate-900',
          error ? 'border-red-500 focus:ring-red-500' : 'focus:ring-primary-500',
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}

export default Select;
