import React, { useRef } from 'react';
import { useCopyToClipboard } from '../hooks/useCopyToClipboard';
import { FaCheck, FaClipboard } from 'react-icons/fa6';

export const PreWithCopyButton: React.FC<
  React.HTMLAttributes<HTMLPreElement> & { node?: unknown }
> = ({ children, ...props }) => {
  const { isCopied, copyToClipboard } = useCopyToClipboard(1500);
  const preRef = useRef<HTMLPreElement>(null);
  const existingClassName = props.className || '';

  const onCopy = () => {
    if (preRef.current) {
      const codeElement = preRef.current.querySelector('code');
      if (codeElement && codeElement.innerText) {
        copyToClipboard(codeElement.innerText);
      }
    }
  };

  return (
    <div className="relative group my-4">
      <button
        onClick={onCopy}
        title={isCopied ? 'Copied! Click to copy again' : 'Copy code to clipboard'}
        aria-label={isCopied ? 'Code copied. Click to copy again.' : 'Copy code to clipboard'}
        className={`absolute top-3 right-3 p-2.5 rounded-xl transition-all duration-300 ease-in-out z-10 active:scale-95
                    ${
                      isCopied
                        ? 'bg-green-500 text-white shadow-lg shadow-green-500/20'
                        : 'bg-white/80 dark:bg-gray-800/80 text-gray-600 dark:text-gray-300 backdrop-blur-sm border border-gray-200 dark:border-gray-700 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 hover:bg-white dark:hover:bg-gray-700 shadow-sm'
                    }`}
      >
        {isCopied ? <FaCheck className="w-3.5 h-3.5" /> : <FaClipboard className="w-3.5 h-3.5" />}
        <span className="sr-only">{isCopied ? 'Copied!' : 'Copy code'}</span>
      </button>
      <pre {...props} ref={preRef} className={`${existingClassName} rounded-2xl overflow-hidden`}>
        {children}
      </pre>
    </div>
  );
};
