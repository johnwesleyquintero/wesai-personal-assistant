import React, { useRef, useEffect, memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { LoadingSpinner } from './LoadingSpinner.tsx';
import { ReactPreviewRenderer } from './ReactPreviewRenderer.tsx';
import { ChatMessage } from '../types.ts';
import { ErrorMessage } from './ErrorMessage.tsx';

interface ChatInterfacePanelProps {
  chatMessages: ChatMessage[];
  chatInput: string;
  onChatInputChange: (value: string) => void;
  onClearChatInput: () => void; // New prop for clearing chat input
  onChatSubmit: () => void;
  isLoading: boolean;
  isApiKeyConfigured: boolean;
  isChatSessionActive: boolean;
  onCopyChatMessage: (content: string, messageId: string) => void;
  onTogglePreview: (messageId: string) => void;
  copiedMessageId: string | null;
  error: string | null;
  onNewChat: () => void; // Add new chat prop
  onRetryChat: () => void; // New prop for retrying chat with fallback
  sendOnEnter: boolean;
}

export const ChatInterfacePanel: React.FC<ChatInterfacePanelProps> = ({
  chatMessages,
  chatInput,
  onChatInputChange,
  onClearChatInput,
  onChatSubmit,
  isLoading,
  isApiKeyConfigured,
  isChatSessionActive,
  onCopyChatMessage,
  onTogglePreview,
  copiedMessageId,
  error,
  onNewChat,
  onRetryChat,
  sendOnEnter,
}) => {
  const chatMessagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [chatMessages]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (chatInput.trim()) {
      // Ensure not submitting empty messages from Enter key
      onChatSubmit();
    }
  };

  const getInputPlaceholder = (): string => {
    if (isLoading) return 'WesAI is thinking...';
    if (!isApiKeyConfigured) return 'API Key not configured. Cannot chat.';
    if (!isChatSessionActive) return 'Chat session not active...';
    return "How can I help you today?...";
  };

  const getButtonText = (): string => {
    if (isLoading) return 'Sending...';
    return 'Send';
  };

  return (
    <div className="flex flex-col h-[60vh] bg-gray-50 dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden">
      <div className="flex justify-between items-center p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Chat</h3>
        <button
          onClick={onNewChat}
          className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading} // Disable button while loading
        >
          New Chat
        </button>
      </div>
      <ErrorMessage message={error} onRetry={onRetryChat} isChatError />
      <div className="flex-grow p-4 space-y-4 overflow-y-auto">
        {chatMessages.map((msg) => (
          <ChatMessageItem
            key={msg.id}
            msg={msg}
            copiedMessageId={copiedMessageId}
            onTogglePreview={onTogglePreview}
            onCopyChatMessage={onCopyChatMessage}
          />
        ))}
        <div ref={chatMessagesEndRef} />
      </div>
      <form
        onSubmit={handleSubmit}
        className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800"
      >
        <div className="flex items-center space-x-2 relative">
          <textarea
            value={chatInput}
            onChange={(e) => onChatInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (sendOnEnter && e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (!isLoading && isApiKeyConfigured && isChatSessionActive && chatInput.trim()) {
                  onChatSubmit();
                }
              }
            }}
            placeholder={getInputPlaceholder()}
            disabled={isLoading || !isApiKeyConfigured || !isChatSessionActive}
            className="flex-grow p-2.5 pr-6 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 text-sm resize-none min-h-[44px] max-h-32 overflow-y-auto"
            aria-label="Chat input"
          />
          {chatInput && !isLoading && (
            <button
              type="button" // Important: type="button" to prevent form submission
              onClick={onClearChatInput}
              title="Clear chat input"
              aria-label="Clear chat input field"
              className="absolute right-16 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading || !isApiKeyConfigured || !isChatSessionActive || !chatInput.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg shadow-md transition duration-150 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed flex items-center whitespace-nowrap"
          >
            {isLoading && <LoadingSpinner />}
            {getButtonText()}
          </button>
        </div>
      </form>
    </div>
  );
};

interface ChatMessageItemProps {
  msg: ChatMessage;
  copiedMessageId: string | null;
  onTogglePreview: (messageId: string) => void;
  onCopyChatMessage: (content: string, messageId: string) => void;
}

const ChatMessageItem: React.FC<ChatMessageItemProps> = memo(
  ({ msg, copiedMessageId, onTogglePreview, onCopyChatMessage }) => {
    const getDownloadName = (code: string, fallbackId: string) => {
      const s = code;
      const m1 = s.match(/export\s+default\s+function\s+([A-Za-z_][A-Za-z0-9_]*)/);
      if (m1) return `${m1[1]}.tsx`;
      const m2 = s.match(/export\s+default\s+([A-Za-z_][A-Za-z0-9_]*)/);
      if (m2) return `${m2[1]}.tsx`;
      const m3 = s.match(/function\s+([A-Za-z_][A-Za-z0-9_]*)/);
      if (m3 && s.includes(`export default ${m3[1]}`)) return `${m3[1]}.tsx`;
      const m4 = s.match(/const\s+([A-Za-z_][A-Za-z0-9_]*)\s*=\s*\(/);
      if (m4 && s.includes(`export default ${m4[1]}`)) return `${m4[1]}.tsx`;
      return `component-${fallbackId}.tsx`;
    };
    return (
      <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
        <div
          className={`max-w-xl lg:max-w-2xl p-3 rounded-xl shadow fade-in ${
            msg.role === 'user'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-100 relative group'
          }`}
        >
          {msg.role === 'model' && msg.componentCode && (
            <div className="mb-2 flex items-center space-x-2 justify-end pr-8">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-300">View:</span>
              <button
                onClick={() => onTogglePreview(msg.id)}
                disabled={!msg.showPreview}
                className={`px-2 py-0.5 text-xs rounded ${
                  !msg.showPreview
                    ? 'bg-blue-500 text-white font-semibold ring-1 ring-blue-600 dark:ring-blue-400'
                    : 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-400 dark:hover:bg-gray-500'
                } disabled:opacity-70 disabled:cursor-default`}
                aria-pressed={!msg.showPreview}
              >
                Code
              </button>
              <button
                onClick={() => onTogglePreview(msg.id)}
                disabled={msg.showPreview}
                className={`px-2 py-0.5 text-xs rounded ${
                  msg.showPreview
                    ? 'bg-blue-500 text-white font-semibold ring-1 ring-blue-600 dark:ring-blue-400'
                    : 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-400 dark:hover:bg-gray-500'
                } disabled:opacity-70 disabled:cursor-default`}
                aria-pressed={!!msg.showPreview}
              >
                Preview
              </button>
            </div>
          )}

          {msg.showPreview && msg.componentCode ? (
            <ReactPreviewRenderer code={msg.componentCode} />
          ) : (
            <div
              className={`prose prose-sm sm:prose-base max-w-none 
                        ${msg.role === 'user' ? 'prose-invert-user-bubble' : 'dark:prose-invert'}
                        prose-p:my-2 prose-li:my-1
                        ${msg.role === 'model' ? 'pr-6 pt-1' : ''}
                        `}
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content || ''}</ReactMarkdown>
            </div>
          )}
          {msg.role === 'model' && msg.content.trim() && (
            <>
            <button
              onClick={() =>
                onCopyChatMessage(
                  msg.showPreview && msg.componentCode ? msg.componentCode : msg.content,
                  msg.id,
                )
              }
              title={
                copiedMessageId === msg.id
                  ? 'Copied!'
                  : msg.showPreview && msg.componentCode
                    ? 'Copy Component Code'
                    : 'Copy Markdown'
              }
              aria-label={
                copiedMessageId === msg.id
                  ? 'Content copied to clipboard'
                  : msg.showPreview && msg.componentCode
                    ? 'Copy component source code to clipboard'
                    : 'Copy Markdown to clipboard'
              }
              className={`absolute top-1.5 right-1.5 p-1 rounded-md transition-all duration-150 ease-in-out 
                        opacity-60 focus:opacity-100 hover:opacity-100
                        ${
                          copiedMessageId === msg.id
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-400 dark:hover:bg-gray-500'
                        }`}
            >
              {copiedMessageId === msg.id ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-3.5 h-3.5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-3.5 h-3.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184"
                  />
                </svg>
              )}
              <span className="sr-only">
                {copiedMessageId === msg.id
                  ? 'Copied!'
                  : msg.showPreview && msg.componentCode
                    ? 'Copy Code'
                    : 'Copy Markdown'}
              </span>
            </button>
            {msg.componentCode && (
              <button
                onClick={() => {
                  const name = getDownloadName(msg.componentCode as string, msg.id);
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
                title="Download Component"
                aria-label="Download component code as TSX file"
                className="absolute top-1.5 right-9 p-1 rounded-md transition-all duration-150 ease-in-out opacity-60 group-hover:opacity-100 focus:opacity-100 hover:opacity-100 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-400 dark:hover:bg-gray-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                  <path d="M12 16l4-5h-3V4h-2v7H8l4 5zm8 3H4v-2h16v2z" />
                </svg>
              </button>
            )}
            </>
        )}
        </div>
      </div>
    );
  },
);
