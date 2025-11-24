import React from 'react';
interface IconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}
export const CopyIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.03 1.125 0 1.131.094 1.976 1.057 1.976 2.192V7.5m-8.25 4.5a3 3 0 0 1-3-3V7.5a3 3 0 0 1 3-3h1.5a3 3 0 0 1 3 3v.75m0 0h1.5m-1.5 0a3 3 0 0 0 3 3h1.5a3 3 0 0 0 3-3V7.5a3 3 0 0 0-3-3h-1.5m-1.5 4.5a3 3 0 0 0-3 3v3.75a3 3 0 0 0 3 3h1.5a3 3 0 0 0 3-3V12a3 3 0 0 0-3-3h-1.5Z"
    />
  </svg>
);
