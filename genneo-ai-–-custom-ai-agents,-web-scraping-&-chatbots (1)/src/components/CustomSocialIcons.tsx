import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number;
  strokeWidth?: number;
}

/**
 * WhatsApp Outline Icon
 * Matches the user-provided outline WhatsApp emblem:
 * Circular speech bubble with bottom-left pointer tail and outlined handset receiver inside.
 */
export const WhatsAppIcon: React.FC<IconProps> = ({
  className = 'w-5 h-5',
  size,
  strokeWidth = 1.9,
  ...props
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
      {...props}
    >
      {/* Outer speech bubble with curved tail at lower-left */}
      <path d="M12 2.75C6.9 2.75 2.75 6.9 2.75 12c0 1.8.5 3.5 1.4 5L3 21.25l4.35-1.15c1.4.8 3.05 1.25 4.65 1.25 5.1 0 9.25-4.15 9.25-9.25S17.1 2.75 12 2.75z" />
      {/* Outlined telephone handset receiver */}
      <path d="M8.5 9c-.2 0-.4.1-.6.3l-.6.6c-.3.3-.4.8-.2 1.2.6 1.4 1.5 2.7 2.7 3.9 1.2 1.2 2.5 2.1 3.9 2.7.4.2.9.1 1.2-.2l.6-.6c.3-.3.3-.8 0-1.1l-1.3-1.3c-.3-.3-.8-.3-1.1 0l-.4.4c-.2.2-.5.2-.7.1-.6-.3-1.3-.9-1.8-1.5-.6-.5-1.2-1.2-1.5-1.8-.1-.2-.1-.5.1-.7l.4-.4c.3-.3.3-.8 0-1.1L9.6 9.3c-.3-.2-.7-.3-1.1-.3z" />
    </svg>
  );
};

/**
 * LinkedIn Outline Icon
 * Matches the user-provided outline LinkedIn emblem:
 * Rounded square frame enclosing the modern typographic "in" glyph.
 */
export const LinkedInIcon: React.FC<IconProps> = ({
  className = 'w-5 h-5',
  size,
  strokeWidth = 1.9,
  ...props
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
      {...props}
    >
      {/* Outer rounded square boundary */}
      <rect x="2.5" y="2.5" width="19" height="19" rx="4.5" />
      {/* 'i' dot */}
      <circle cx="7.2" cy="7.2" r="1.15" fill="currentColor" stroke="none" />
      {/* 'i' vertical stem */}
      <line x1="7.2" y1="10.2" x2="7.2" y2="16.8" strokeWidth={strokeWidth * 1.15} />
      {/* 'n' vertical stem and arched shoulder */}
      <line x1="11.2" y1="10.2" x2="11.2" y2="16.8" strokeWidth={strokeWidth * 1.15} />
      <path
        d="M11.2 13c.45-1.7 1.6-2.8 3.3-2.8 1.8 0 2.8 1.1 2.8 3v3.8"
        strokeWidth={strokeWidth * 1.15}
      />
    </svg>
  );
};

/**
 * Mail / Email Outline Icon
 * Matches the user-provided outline envelope emblem:
 * Rectangular envelope with crisp downward V flap fold.
 */
export const MailIcon: React.FC<IconProps> = ({
  className = 'w-5 h-5',
  size,
  strokeWidth = 1.9,
  ...props
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
      {...props}
    >
      {/* Envelope outer border */}
      <rect x="2.5" y="4.5" width="19" height="15" rx="1.5" />
      {/* V-shaped flap fold line */}
      <polyline points="3 5.5 12 13 21 5.5" />
    </svg>
  );
};
