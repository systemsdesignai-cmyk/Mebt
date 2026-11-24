import React from 'react';

interface MebtLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showWordmark?: boolean;
  stacked?: boolean;
  className?: string;
}

export const MebtLogo: React.FC<MebtLogoProps> = ({
  size = 'md',
  showWordmark = true,
  stacked = false,
  className = '',
}) => {
  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-20 h-20',
  };

  return (
    <div
      className={`inline-flex ${
        stacked ? 'flex-col items-center text-center gap-2' : 'items-center gap-2.5'
      } shrink-0 ${className}`}
    >
      <svg
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${iconSizes[size]} shrink-0`}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="mebtShieldGrad" x1="18" y1="12" x2="102" y2="108" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#075DEB" />
            <stop offset="100%" stopColor="#09234F" />
          </linearGradient>
          <linearGradient id="mebtPathLight" x1="28" y1="92" x2="86" y2="70" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0A6CFF" />
            <stop offset="100%" stopColor="#075DEB" />
          </linearGradient>
        </defs>
        {/* Welcoming abstract shield */}
        <path
          d="M60 10L99 27C101.8 28.2 103.5 31 103.5 34V56C103.5 79.8 86.7 99.3 63.3 107.4C61.2 108.1 58.8 108.1 56.7 107.4C33.3 99.3 16.5 79.8 16.5 56V34C16.5 31 18.2 28.2 21 27L60 10Z"
          stroke="url(#mebtShieldGrad)"
          strokeWidth="7"
          strokeLinejoin="round"
          fill="#FFFFFF"
        />
        {/* Three golden amber sunrise rays */}
        <ellipse cx="60" cy="30" rx="3.4" ry="7.4" fill="#FFB300" />
        <ellipse cx="46.5" cy="34.5" rx="3" ry="6.4" transform="rotate(-38 46.5 34.5)" fill="#FFB300" />
        <ellipse cx="73.5" cy="34.5" rx="3" ry="6.4" transform="rotate(38 73.5 34.5)" fill="#FFB300" />
        {/* Rounded Ethiopic m-inspired emblem */}
        <path
          d="M35.5 74.5V56C35.5 47.4 41.9 41.8 49.8 41.8C54.5 41.8 58.2 44 60 47.4C61.8 44 65.5 41.8 70.2 41.8C78.1 41.8 84.5 47.4 84.5 56V71.8H73.2V56.4C73.2 53.1 71.2 51.1 68.3 51.1C65.5 51.1 63.5 53.1 63.5 56.4V72.8H56.5V56.4C56.5 53.1 54.5 51.1 51.7 51.1C48.8 51.1 46.8 53.1 46.8 56.4V74.5H35.5Z"
          fill="#09234F"
        />
        {/* Upward curving pathway sweep */}
        <path
          d="M30 86.2C46.5 78 64.5 74.8 85 74.2C67.5 79.4 52.3 86.5 42 97.2C36.8 94.1 33 90.4 30 86.2Z"
          fill="url(#mebtPathLight)"
        />
        <path
          d="M54.8 104.2C64 91 77.8 80.2 97.2 74.8C91 89.8 77.5 101 59.5 106.5C57.8 106 56.2 105.1 54.8 104.2Z"
          fill="#09234F"
        />
      </svg>

      {showWordmark && (
        <div className={stacked ? 'flex flex-col items-center' : 'flex items-baseline gap-1.5'}>
          <span
            className={`font-heading font-extrabold tracking-tight text-[#09234F] dark:text-[#F1F5FF] whitespace-nowrap ${
              size === 'lg' ? 'text-3xl tracking-wide' : size === 'md' ? 'text-lg' : 'text-base'
            }`}
          >
            MEBT
          </span>
          {stacked ? (
            <div className="flex items-center gap-2 text-[#09234F] dark:text-[#F1F5FF] font-semibold text-base">
              <span className="h-[1.5px] w-6 bg-[#09234F]/60 dark:bg-[#F1F5FF]/50" aria-hidden="true" />
              <span>መብት</span>
              <span className="h-[1.5px] w-6 bg-[#09234F]/60 dark:bg-[#F1F5FF]/50" aria-hidden="true" />
            </div>
          ) : (
            <span className="text-sm font-semibold text-[#075DEB] dark:text-[#6AA6FF] whitespace-nowrap">መብት</span>
          )}
        </div>
      )}
    </div>
  );
};
