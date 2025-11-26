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
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="50%" stopColor="#A78BFA" />
          <stop offset="100%" stopColor="#EC4899" />
        </linearGradient>
        <linearGradient id="logo-gradient-dark" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="50%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#DB2777" />
        </linearGradient>
      </defs>

      {/* AI Brain Icon */}
      <path
        d="M15 8C15 6.89543 15.8954 6 17 6H23C24.1046 6 25 6.89543 25 8V12C25 13.1046 24.1046 14 23 14H17C15.8954 14 15 13.1046 15 12V8Z"
        fill="url(#logo-gradient)"
        opacity="0.8"
      />

      {/* Neural Network Nodes */}
      <circle cx="12" cy="20" r="2" fill="url(#logo-gradient)" opacity="0.6" />
      <circle cx="20" cy="20" r="3" fill="url(#logo-gradient)" />
      <circle cx="28" cy="20" r="2" fill="url(#logo-gradient)" opacity="0.6" />

      {/* Connecting Lines */}
      <path
        d="M14 20H18M22 20H26"
        stroke="url(#logo-gradient)"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.7"
      />

      {/* Text: WesAI */}
      <text
        x="35"
        y="25"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize={fontSize}
        fontWeight="700"
        fill="url(#logo-gradient)"
        className="dark:fill-[url(#logo-gradient-dark)]"
      >
        WesAI
      </text>
    </svg>
  );
};

export default WesAILogo;
