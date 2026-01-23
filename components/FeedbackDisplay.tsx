import React from 'react';
import { useCopyToClipboard } from '../hooks/useCopyToClipboard';
import type { Components } from 'react-markdown';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FaCheck, FaClipboard } from 'react-icons/fa6';

interface FeedbackDisplayProps {
  feedback: string;
}

interface CustomCodeRendererProps {
  node?: unknown;
  inline?: boolean;
  className?: string;
  children: React.ReactNode;
  [key: string]: unknown;
}

export const FeedbackDisplay: React.FC<FeedbackDisplayProps> = ({ feedback }) => {
  const { isCopied, copyToClipboard } = useCopyToClipboard(2000);

  return (
    <div className="bg-gray-50 dark:bg-gray-700 p-4 md:p-6 rounded-lg shadow-inner relative">
      <button
        onClick={() => copyToClipboard(feedback || '')}
        title={isCopied ? 'Copied!' : 'Copy feedback'}
        aria-label={isCopied ? 'Feedback copied to clipboard' : 'Copy feedback to clipboard'}
        className={`absolute top-3 right-3 p-2 rounded-md transition-colors duration-150 ease-in-out
                    ${
                      isCopied
                        ? 'bg-green-500 hover:bg-green-600 text-white dark:bg-green-600 dark:hover:bg-green-700'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-600 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-gray-300 dark:hover:text-gray-100'
                    }`}
      >
        {isCopied ? <FaCheck className="w-5 h-5" /> : <FaClipboard className="w-5 h-5" />}
        <span className="sr-only">{isCopied ? 'Copied!' : 'Copy'}</span>
      </button>
      <div
        className="prose prose-sm sm:prose-base max-w-none dark:prose-invert
                      prose-headings:text-slate-800 dark:prose-headings:text-slate-200
                      prose-p:text-slate-700 dark:prose-p:text-slate-300
                      prose-li:text-slate-700 dark:prose-li:text-slate-300
                      prose-strong:text-slate-900 dark:prose-strong:text-slate-100
                      prose-code:text-pink-600 dark:prose-code:text-pink-400
                      prose-code:bg-slate-100 dark:prose-code:bg-slate-700
                      prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
                      prose-pre:bg-slate-200 dark:prose-pre:bg-gray-800
                      prose-pre:p-4 prose-pre:rounded-md
                      prose-pre:text-slate-800 dark:prose-pre:text-slate-200"
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={
            {
              code: ({ _node, inline, className, children, ...rest }: CustomCodeRendererProps) => {
                if (!inline) {
                  return (
                    <code className={`${className || ''} break-words`} {...rest}>
                      {children}
                    </code>
                  );
                }
                return (
                  <code className={className} {...rest}>
                    {children}
                  </code>
                );
              },
            } as Components
          }
        >
          {feedback || ''}
        </ReactMarkdown>
      </div>
    </div>
  );
};
