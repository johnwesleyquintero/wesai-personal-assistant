import React, { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FaCode, FaEye, FaDownload, FaCopy, FaCheck, FaRotateRight } from 'react-icons/fa6';
import { ReactPreviewRenderer } from './ReactPreviewRenderer.tsx';
import { markdownComponents } from './MarkdownCodeRenderer.tsx';
import type { ChatMessage } from '../types.ts';
import { getDownloadNameFromCode } from '../utils/stringUtils';

interface ChatMessageItemProps {
  msg: ChatMessage;
  copiedMessageId: string | null;
  onTogglePreview: (messageId: string) => void;
  onCopyChatMessage: (content: string, messageId: string) => void;
  onRetryChat?: () => void;
  isLastUserMessage?: boolean;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = memo(
  ({
    msg,
    copiedMessageId,
    onTogglePreview,
    onCopyChatMessage,
    onRetryChat,
    isLastUserMessage,
  }) => {
    const isUser = msg.role === 'user';

    return (
      <div
        className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} group animate-in fade-in slide-in-from-bottom-2`}
      >
        <div className={`flex items-center gap-2 mb-1 px-1`}>
          <span
            className={`text-[10px] font-bold uppercase tracking-widest ${
              isUser ? 'text-blue-600 dark:text-blue-400' : 'text-purple-600 dark:text-purple-400'
            }`}
          >
            {isUser ? 'You' : 'Wesai'}
          </span>
          <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
            {msg.timestamp
              ? new Date(msg.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : ''}
          </span>
        </div>

        <div
          className={`relative max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl transition-all duration-200 ${
            isUser
              ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-500/20 rounded-tr-none'
              : 'bg-app-secondary text-app-text shadow-sm border border-app-border rounded-tl-none hover:shadow-md'
          }`}
        >
          {/* Action Buttons for User Messages */}
          {isUser && isLastUserMessage && onRetryChat && (
            <div className="absolute top-2 right-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={onRetryChat}
                title="Retry response"
                className="p-2 bg-app-tertiary/90 backdrop-blur-sm text-app-muted hover:text-app-accent rounded-xl shadow-sm border border-app-border transition-all active:scale-95"
              >
                <FaRotateRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {msg.role === 'model' && msg.componentCode && (
            <div className="flex items-center gap-1.5 mb-3 p-1.5 bg-app-tertiary/50 rounded-2xl border border-app-border w-fit ml-auto">
              <button
                onClick={() => onTogglePreview(msg.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 text-[11px] font-black rounded-xl transition-all active:scale-95 ${
                  !msg.showPreview
                    ? 'bg-app-main text-app-accent shadow-sm border border-app-border'
                    : 'text-app-muted hover:text-app-text hover:bg-app-main/50'
                }`}
              >
                <FaCode className="w-3.5 h-3.5" />
                CODE
              </button>
              <button
                onClick={() => onTogglePreview(msg.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 text-[11px] font-black rounded-xl transition-all active:scale-95 ${
                  msg.showPreview
                    ? 'bg-app-main text-app-accent shadow-sm border border-app-border'
                    : 'text-app-muted hover:text-app-text hover:bg-app-main/50'
                }`}
              >
                <FaEye className="w-3.5 h-3.5" />
                PREVIEW
              </button>
            </div>
          )}

          {msg.imageContent && (
            <div className="mb-3 overflow-hidden rounded-xl border border-black/5 dark:border-white/5 shadow-inner">
              <img
                src={msg.imageContent}
                alt="Uploaded content"
                className="max-h-80 w-auto object-contain bg-black/5 dark:bg-white/5"
              />
            </div>
          )}

          {msg.showPreview && msg.componentCode ? (
            <div className="rounded-xl overflow-hidden border border-app-border bg-app-main shadow-inner">
              <ReactPreviewRenderer code={msg.componentCode} />
            </div>
          ) : (
            <div
              className={`prose prose-sm sm:prose-base max-w-none 
                        ${
                          isUser
                            ? 'prose-invert text-white'
                            : 'text-app-text dark:text-gray-100 dark:prose-invert'
                        }
                        prose-p:leading-relaxed prose-pre:bg-app-tertiary prose-pre:text-app-text
                        prose-headings:text-app-text dark:prose-headings:text-white
                        prose-strong:text-app-text dark:prose-strong:text-white
                        prose-code:text-app-accent dark:prose-code:text-app-accent
                        `}
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                {msg.content || ''}
              </ReactMarkdown>
            </div>
          )}

          {/* Action Buttons for Model Messages */}
          {!isUser && msg.content.trim() && (
            <div className="absolute bottom-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              {msg.componentCode && (
                <button
                  onClick={() => {
                    const name = getDownloadNameFromCode(msg.componentCode as string, msg.id);
                    const blob = new Blob([msg.componentCode as string], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = name;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  }}
                  title="Download TSX"
                  className="p-2.5 bg-app-tertiary/90 backdrop-blur-sm text-app-muted hover:text-app-accent rounded-xl shadow-sm border border-app-border transition-all active:scale-95"
                >
                  <FaDownload className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={() =>
                  onCopyChatMessage(
                    msg.showPreview && msg.componentCode ? msg.componentCode : msg.content,
                    msg.id,
                  )
                }
                className={`p-2.5 backdrop-blur-sm rounded-xl shadow-sm border transition-all active:scale-95 ${
                  copiedMessageId === msg.id
                    ? 'bg-green-500 text-white border-green-400'
                    : 'bg-app-tertiary/90 text-app-muted hover:text-app-accent border-app-border'
                }`}
                title={copiedMessageId === msg.id ? 'Copied!' : 'Copy to clipboard'}
              >
                {copiedMessageId === msg.id ? (
                  <FaCheck className="w-3.5 h-3.5" />
                ) : (
                  <FaCopy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  },
);

ChatMessageItem.displayName = 'ChatMessageItem';
