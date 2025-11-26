import React from 'react';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export const WesAILogo: React.FC<LogoProps> = ({ size = 'medium', className = '' }) => {
  const sizes = {
    small: { width: 80, height: 24, fontSize: 16 },
    medium: { width: 120, height: 32, fontSize: 20 },
    large: { width: 160, height: 48, fontSize: 28 },
  };

  const { width, height, fontSize } = sizes[size];

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 120 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="50%" stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#DC2626" />
        </linearGradient>
        <linearGradient id="logo-gradient-dark" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="50%" stopColor="#A78BFA" />
          <stop offset="100%" stopColor="#F472B6" />
        </linearGradient>
        <filter id="logo-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow
            dx="0"
            dy="1"
            stdDeviation="1"
            floodColor="rgba(0,0,0,0.1)"
            floodOpacity="0.3"
          />
        </filter>
        <filter id="logo-shadow-dark" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow
            dx="0"
            dy="1"
            stdDeviation="1"
            floodColor="rgba(255,255,255,0.1)"
            floodOpacity="0.2"
          />
        </filter>
      </defs>

      {/* AI Brain Icon */}
      <path
        d="M15 8C15 6.89543 15.8954 6 17 6H23C24.1046 6 25 6.89543 25 8V12C25 13.1046 24.1046 14 23 14H17C15.8954 14 15 13.1046 15 12V8Z"
        fill="url(#logo-gradient)"
        filter="url(#logo-shadow)"
        className="dark:fill-[url(#logo-gradient-dark)] dark:filter-[url(#logo-shadow-dark)]"
        opacity="0.9"
      />

      {/* Neural Network Nodes */}
      <circle
        cx="12"
        cy="20"
        r="2"
        fill="url(#logo-gradient)"
        filter="url(#logo-shadow)"
        className="dark:fill-[url(#logo-gradient-dark)] dark:filter-[url(#logo-shadow-dark)]"
        opacity="0.7"
      />
      <circle
        cx="20"
        cy="20"
        r="3"
        fill="url(#logo-gradient)"
        filter="url(#logo-shadow)"
        className="dark:fill-[url(#logo-gradient-dark)] dark:filter-[url(#logo-shadow-dark)]"
      />
      <circle
        cx="28"
        cy="20"
        r="2"
        fill="url(#logo-gradient)"
        filter="url(#logo-shadow)"
        className="dark:fill-[url(#logo-gradient-dark)] dark:filter-[url(#logo-shadow-dark)]"
        opacity="0.7"
      />

      {/* Connecting Lines */}
      <path
        d="M14 20H18M22 20H26"
        stroke="url(#logo-gradient)"
        filter="url(#logo-shadow)"
        className="dark:stroke-[url(#logo-gradient-dark)] dark:filter-[url(#logo-shadow-dark)]"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.8"
      />

      {/* Text: WesAI */}
      <text
        x="35"
        y="25"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize={fontSize}
        fontWeight="700"
        fill="url(#logo-gradient)"
        filter="url(#logo-shadow)"
        className="dark:fill-[url(#logo-gradient-dark)] dark:filter-[url(#logo-shadow-dark)]"
        style={{ textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}
      >
        WesAI
      </text>
    </svg>
  );
};

export default WesAILogo;
