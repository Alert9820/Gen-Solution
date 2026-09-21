import React, { useState } from 'react';

interface GenNeoAgentAvatarProps {
  className?: string;
  sizeClassName?: string;
  withStatusDot?: boolean;
  statusPosition?: 'bottom-right' | 'top-right';
  statusColor?: string;
  alt?: string;
}

/**
 * GenNeo Autonomous Agent Avatar Component
 * Features the signature 3D felt/clay blue robot avatar with antenna, side ears,
 * friendly cartoon eyes, and warm smile as provided in the brand asset.
 */
export const GenNeoAgentAvatar: React.FC<GenNeoAgentAvatarProps> = ({
  className = '',
  sizeClassName = 'w-6 h-6',
  withStatusDot = false,
  statusPosition = 'top-right',
  statusColor = 'bg-emerald-400',
  alt = 'GenNeo AI Autonomous Agent Avatar'
}) => {
  const [hasError, setHasError] = useState(false);

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      {!hasError ? (
        <img
          src="/genneo-agent-avatar.webp"
          srcSet="/genneo-agent-avatar-64.png 64w, /genneo-agent-avatar.png 512w"
          sizes="(max-width: 64px) 64px, 512px"
          alt={alt}
          className={`${sizeClassName} object-contain rounded-md drop-shadow-2xs select-none`}
          onError={() => setHasError(true)}
          referrerPolicy="no-referrer"
          loading="eager"
        />
      ) : (
        /* Crisp inline SVG vector fallback */
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 256 256"
          className={`${sizeClassName} object-contain`}
          aria-hidden="true"
        >
          <defs>
            <radialGradient id="fbHeadLight" cx="38%" cy="32%" r="70%">
              <stop offset="0%" stopColor="#629DF8" />
              <stop offset="35%" stopColor="#3C7CE6" />
              <stop offset="70%" stopColor="#2764D0" />
              <stop offset="100%" stopColor="#1848A8" />
            </radialGradient>
            <radialGradient id="fbBallLight" cx="35%" cy="30%" r="65%">
              <stop offset="0%" stopColor="#78ADFC" />
              <stop offset="40%" stopColor="#3B7DE8" />
              <stop offset="100%" stopColor="#163F96" />
            </radialGradient>
          </defs>
          <rect x="18" y="116" width="28" height="46" rx="14" fill="#2E6BC9" />
          <rect x="210" y="116" width="28" height="46" rx="14" fill="#2E6BC9" />
          <rect x="122" y="32" width="12" height="34" rx="6" fill="#1F232B" />
          <circle cx="128" cy="28" r="18" fill="url(#fbBallLight)" />
          <circle cx="122" cy="22" r="5" fill="#FFFFFF" opacity="0.45" />
          <rect x="34" y="56" width="188" height="172" rx="50" fill="url(#fbHeadLight)" />
          <circle cx="92" cy="150" r="23" fill="#FFFFFF" />
          <circle cx="94" cy="150" r="14.5" fill="#161A20" />
          <circle cx="90" cy="145.5" r="4.5" fill="#FFFFFF" />
          <circle cx="164" cy="150" r="23" fill="#FFFFFF" />
          <circle cx="162" cy="150" r="14.5" fill="#161A20" />
          <circle cx="158" cy="145.5" r="4.5" fill="#FFFFFF" />
          <path d="M 109 184 Q 128 200 147 184" fill="#161A20" stroke="#161A20" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}

      {/* Online indicator ping */}
      {withStatusDot && (
        <span
          className={`absolute flex h-2.5 w-2.5 ${
            statusPosition === 'top-right'
              ? '-top-0.5 -right-0.5'
              : '-bottom-0.5 -right-0.5'
          }`}
        >
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${statusColor} opacity-75`} />
          <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${statusColor} ring-2 ring-white`} />
        </span>
      )}
    </div>
  );
};
