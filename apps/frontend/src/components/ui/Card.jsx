import { clsx } from 'clsx';

export function Card({ children, className = '', ...props }) {
  return (
    <div
      className={clsx(
        'bg-white rounded-2xl shadow-md border border-gray-200/80 p-6 dark:bg-slate-900 dark:border-slate-700/90 dark:shadow-lg dark:shadow-black/25',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }) {
  return <div className={clsx('mb-4', className)}>{children}</div>;
}

export function CardTitle({ children, className = '' }) {
  return <h3 className={clsx('text-lg font-semibold text-gray-900 dark:text-gray-50', className)}>{children}</h3>;
}

export function CardDescription({ children, className = '' }) {
  return <p className={clsx('text-sm text-gray-500 mt-1 dark:text-gray-400', className)}>{children}</p>;
}

export function CardContent({ children, className = '' }) {
  return <div className={clsx(className)}>{children}</div>;
}

export default Card;
