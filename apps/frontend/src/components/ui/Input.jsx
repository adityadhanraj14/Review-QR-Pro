import { forwardRef, useState } from 'react';
import { clsx } from 'clsx';
import { Eye, EyeOff } from 'lucide-react';

export const Input = forwardRef(
  (
    {
      label,
      error,
      type = 'text',
      className = '',
      showPasswordToggle,
      ...props
    },
    ref
  ) => {
    const [passwordVisible, setPasswordVisible] = useState(false);
    const isPassword = type === 'password';
    const showToggle = isPassword && showPasswordToggle !== false;
    const inputType = showToggle && passwordVisible ? 'text' : type;

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
        )}
        <div className="relative">
          <input
            ref={ref}
            type={inputType}
            className={clsx(
              'input',
              error ? 'border-red-500 focus:ring-red-500' : 'focus:ring-primary-500',
              showToggle && 'pr-10',
              className
            )}
            {...props}
          />
          {showToggle && (
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:hover:text-gray-200 dark:hover:bg-slate-700 dark:focus:ring-primary-400"
              onClick={() => setPasswordVisible((v) => !v)}
              aria-label={passwordVisible ? 'Hide password' : 'Show password'}
              tabIndex={-1}
            >
              {passwordVisible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          )}
        </div>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
