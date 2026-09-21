import React, { useState } from 'react';

interface GenNeoBrandLogoProps {
  className?: string;
  variant?: 'full' | 'mark';
  theme?: 'dark' | 'light';
  heightClassName?: string;
  alt?: string;
}

/**
 * Official GenNeo Brand Logo Component
 * Recreates the exact black & white geometric emblem featuring the nested 'G' and 'Neo'
 * inside the dark circle with 'en' forming GenNeo as provided in the brand asset.
 */
export const GenNeoBrandLogo: React.FC<GenNeoBrandLogoProps> = ({
  className = '',
  variant = 'full',
  theme = 'dark',
  heightClassName = 'h-8',
  alt = 'GenNeo Official Logo'
}) => {
  const [hasError, setHasError] = useState(false);

  const imgSrc = variant === 'mark'
    ? '/genneo-brand-mark.svg'
    : (theme === 'light' ? '/genneo-brand-logo-light.svg' : '/genneo-brand-logo.svg');

  return (
    <div className={`inline-flex items-center shrink-0 ${className}`}>
      {!hasError ? (
        <img
          src={imgSrc}
          alt={alt}
          className={`${heightClassName} w-auto object-contain select-none`}
          onError={() => setHasError(true)}
          referrerPolicy="no-referrer"
          loading="eager"
        />
      ) : (
        /* Crisp inline SVG vector fallback */
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox={variant === 'mark' ? '0 0 220 220' : '0 0 540 240'}
          className={`${heightClassName} w-auto`}
          aria-hidden="true"
        >
          <circle cx="105" cy="105" r="98" fill="#162422" />
          <circle cx="118" cy="112" r="68" fill="#FFFFFF" />
          <path
            d="M 148 76 C 120 68, 92 86, 96 116 C 100 138, 120 152, 142 148 C 152 146, 158 138, 160 126 L 125 126 L 125 106 L 178 106 C 179 128, 170 162, 138 168 C 104 174, 76 150, 74 116 C 72 82, 102 54, 144 58 C 158 60, 170 66, 178 74 L 158 88 Z"
            fill="#162422"
          />
          <text x="136" y="166" fontSize="22" fontWeight="800" fill="#162422" textAnchor="middle">Neo</text>
          {variant === 'full' && (
            <text x="228" y="168" fontSize="138" fontWeight="800" fill={theme === 'light' ? '#FFFFFF' : '#162422'}>
              en
            </text>
          )}
        </svg>
      )}
    </div>
  );
};
