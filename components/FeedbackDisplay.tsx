import React from 'react';
import { useCopyToClipboard } from '../hooks/useCopyToClipboard';
import type { Components } from 'react-markdown';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FaCheck, FaClipboard } from 'react-icons/fa6';
import { useAppStore } from '../store';
import { PreWithCopyButton } from './PreWithCopyButton';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

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
  const addToast = useAppStore((state) => state.addToast);

  const handleCopy = () => {
    copyToClipboard(feedback || '');
    addToast('Feedback copied to clipboard', 'success');
  };

  return (
    <div className="relative group">
      <button
        onClick={handleCopy}
        title={isCopied ? 'Copied!' : 'Copy feedback'}
        aria-label={isCopied ? 'Feedback copied to clipboard' : 'Copy feedback to clipboard'}
        className={`absolute top-0 right-0 p-2.5 rounded-xl transition-all duration-200 ease-in-out z-10 opacity-0 group-hover:opacity-100 shadow-lg border
                    ${
                      isCopied
                        ? 'bg-green-500 text-white border-green-400 opacity-100'
                        : 'bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600'
                    }`}
      >
        {isCopied ? (
          <div className="flex items-center gap-2 px-1">
            <FaCheck className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Copied</span>
          </div>
        ) : (
          <FaClipboard className="w-4 h-4" />
        )}
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
                      prose-pre:bg-slate-50 dark:prose-pre:bg-gray-900/50
                      prose-pre:p-4 prose-pre:rounded-xl prose-pre:border
                      prose-pre:border-gray-100 dark:prose-pre:border-gray-800
                      prose-pre:text-slate-800 dark:prose-pre:text-slate-200"
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={
            {
              pre: PreWithCopyButton,
              code: ({ _node, inline, className, children, ...rest }: CustomCodeRendererProps) => {
                const match = /language-(\w+)/.exec(className || '');
                if (!inline && match) {
                  return (
                    <SyntaxHighlighter
                      style={oneDark}
                      language={match[1]}
                      PreTag="div"
                      customStyle={{
                        margin: 0,
                        padding: '1.25rem',
                        background: 'transparent',
                        fontSize: '0.85rem',
                        lineHeight: '1.6',
                      }}
                      {...rest}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
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
