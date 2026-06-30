'use client';

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  size?: number;
  maxStars?: number;
  interactive?: boolean;
}

export function StarRating({ value, onChange, size = 24, maxStars = 5, interactive = false }: StarRatingProps) {
  const stars = Array.from({ length: maxStars }, (_, i) => i + 1);

  return (
    <div className="flex items-center gap-0.5">
      {stars.map((star) => {
        const filled = value >= star;
        const halfFilled = !filled && value >= star - 0.5;

        return (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange?.(star)}
            onMouseEnter={() => interactive && onChange?.(star)}
            className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
            style={{ width: size, height: size }}
            aria-label={`${star} star${star > 1 ? 's' : ''}`}
          >
            <svg
              viewBox="0 0 24 24"
              fill={filled ? '#16a34a' : halfFilled ? 'url(#halfGradient)' : '#e4e4e7'}
              stroke={filled || halfFilled ? '#16a34a' : '#a1a1aa'}
              strokeWidth="1.5"
              width={size}
              height={size}
            >
              {halfFilled && (
                <defs>
                  <linearGradient id="halfGradient">
                    <stop offset="50%" stopColor="#16a34a" />
                    <stop offset="50%" stopColor="#e4e4e7" />
                  </linearGradient>
                </defs>
              )}
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
              />
            </svg>
          </button>
        );
      })}
    </div>
  );
}
