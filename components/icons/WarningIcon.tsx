import React from 'react';
interface IconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}
export const WarningIcon: React.FC<IconProps> = ({ className, ...props }) => (
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
      d="M12 9v3.75m-9.303 3.376c-.866 1.5.305 3.254 1.907 3.254h12.162c1.602 0 2.773-1.754 1.907-3.254L13.28 2.19a1.943 1.943 0 0 0-3.56 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
    />
  </svg>
);
