import React from 'react';
interface IconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}
export const RegenerateIcon: React.FC<IconProps> = ({ className, ...props }) => (
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
      d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 11.667 0m0 0h-4.992m4.992 0-3.181-3.183a8.25 8.25 0 0 0-11.667 0"
    />
  </svg>
);
