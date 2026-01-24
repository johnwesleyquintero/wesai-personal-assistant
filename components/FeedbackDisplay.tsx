import React from 'react';
import { useCopyToClipboard } from '../hooks/useCopyToClipboard';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FaCheck, FaClipboard } from 'react-icons/fa6';
import { useAppStore } from '../store';
import { markdownComponents } from './MarkdownCodeRenderer';

interface FeedbackDisplayProps {
  feedback: string;
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
                        : 'bg-app-main hover:bg-app-tertiary text-app-muted hover:text-app-text border-app-border'
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
                      prose-headings:text-app-text
                      prose-p:text-app-text
                      prose-li:text-app-text
                      prose-strong:text-app-text font-bold
                      prose-code:text-app-accent
                      prose-code:bg-app-tertiary
                      prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
                      prose-pre:bg-app-tertiary
                      prose-pre:p-4 prose-pre:rounded-xl prose-pre:border
                      prose-pre:border-app-border
                      prose-pre:text-app-text"
      >
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
          {feedback || ''}
        </ReactMarkdown>
      </div>
    </div>
  );
};
