import { useState } from 'react';
import { Star } from 'lucide-react';
import { clsx } from 'clsx';

export function StarRatingRow({ onSelect, disabled = false }) {
  const [hover, setHover] = useState(null);

  const effective = hover;

  return (
    <div
      className="flex justify-center gap-1 sm:gap-2"
      role="radiogroup"
      aria-label="Rate your experience from 1 to 5 stars"
    >
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = effective != null ? n <= effective : false;
        return (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={false}
            aria-label={`${n} star${n > 1 ? 's' : ''}`}
            disabled={disabled}
            onMouseEnter={() => !disabled && setHover(n)}
            onMouseLeave={() => setHover(null)}
            onFocus={() => !disabled && setHover(n)}
            onBlur={() => setHover(null)}
            onClick={() => {
              setHover(null);
              onSelect(n);
            }}
            className={clsx(
              'p-1.5 rounded-xl transition-transform focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900',
              disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110 active:scale-95'
            )}
          >
            <Star
              className={clsx(
                'h-11 w-11 sm:h-14 sm:w-14 transition-colors',
                filled ? 'fill-amber-400 text-amber-400' : 'fill-gray-100 text-gray-300 dark:fill-slate-800 dark:text-slate-500'
              )}
              strokeWidth={filled ? 0 : 1.5}
            />
          </button>
        );
      })}
    </div>
  );
}
