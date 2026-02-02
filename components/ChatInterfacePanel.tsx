import React, { useState, useRef, useEffect, memo, useCallback, useMemo } from 'react';
import {
  FaPaperPlane,
  FaMagnifyingGlass,
  FaPlus,
  FaXmark,
  FaPaperclip,
  FaClockRotateLeft,
  FaDownload,
  FaFloppyDisk,
  FaWandMagicSparkles,
  FaCopy,
} from 'react-icons/fa6';
import { useChatLogic } from '../hooks/useChatLogic.ts';
import { useIsMobile } from '../hooks/useMediaQuery.ts';
import { ChatMessageItem } from './ChatMessageItem.tsx';
import { SavedSessionsList } from './SavedSessionsList.tsx';
import { toast } from '../utils/toast.ts';
import type { ChatMessage } from '../types.ts';

const MAX_IMAGE_SIZE = 4 * 1024 * 1024; // 4MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];

const TextSkeleton = ({ lines = 3 }: { lines?: number }) => (
  <div className="space-y-2 animate-pulse w-full">
    {Array.from({ length: lines }).map((_, i) => (
      <div
        key={i}
        className="h-3 bg-app-tertiary rounded-full"
        style={{ width: i === lines - 1 ? '60%' : '100%' }}
      />
    ))}
  </div>
);

export const ChatInterfacePanel: React.FC = memo(() => {
  const {
    chatMessages,
    chatInput,
    chatImage,
    activeChatSession,
    activeApiKey,
    activeSavedChatSessionId,
    copiedMessageId,
    isLoading,
    handleChatInputChange: onChatInputChange,
    handleClearChatInput: onClearChatInput,
    handleChatSubmit: onChatSubmit,
    setChatImage: onChatImageChange,
    handleNewChat: onClearChat,
    handleCopyChatMessage: onCopyChatMessage,
    handleTogglePreview: onTogglePreview,
    handleRetryChat: onRetryChat,
    stopGeneration,
    sendOnEnter,
    savedChatSessions,
    saveChatSession: onSaveChatSession,
    loadSavedChatSession: onLoadSavedChatSession,
    deleteSavedChatSession: onDeleteSavedChatSession,
    renameSavedChatSession: onRenameSavedChatSession,
    duplicateSavedChatSession: onDuplicateSavedChatSession,
    savedSessionsSort,
    setSavedSessionsSort: onSetSavedSessionsSort,
  } = useChatLogic();

  const isApiKeyConfigured = !!activeApiKey;
  const isChatSessionActive = !!activeChatSession;

  const [isSavedContextsOpen, setIsSavedContextsOpen] = useState(false);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<'markdown' | 'json' | 'txt'>('markdown');
  const [saveName, setSaveName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isConversationCopied, setIsConversationCopied] = useState(false);

  const [showScrollBottom, setShowScrollBottom] = useState(false);

  const isMobile = useIsMobile();
  const chatMessagesEndRef = useRef<HTMLDivElement>(null);
  const messagesAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    chatMessagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

  const handleScroll = useCallback(() => {
    if (!messagesAreaRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = messagesAreaRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShowScrollBottom(!isAtBottom);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isLoading, scrollToBottom]);

  // Find the last user message ID to pass to ChatMessageItem
  const lastUserMessageId = useMemo(() => {
    const userMessages = chatMessages.filter((m) => m.role === 'user');
    return userMessages.length > 0 ? userMessages[userMessages.length - 1].id : null;
  }, [chatMessages]);

  const validateImage = (file: File): boolean => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast.error(
        'Invalid image type',
        `Supported types: ${ALLOWED_IMAGE_TYPES.map((t) => t.split('/')[1]).join(', ')}`,
      );
      return false;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      toast.error('Image too large', 'Maximum size is 4MB');
      return false;
    }
    return true;
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validateImage(file)) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChatImageChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
    // Reset input value so same file can be selected again
    e.target.value = '';
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const blob = items[i].getAsFile();
        if (blob && validateImage(blob)) {
          const reader = new FileReader();
          reader.onloadend = () => {
            onChatImageChange(reader.result as string);
          };
          reader.readAsDataURL(blob);
        }
      }
    }
  };

  const handleCopyConversation = () => {
    if (chatMessages.length === 0) return;

    const content = chatMessages
      .map((m: ChatMessage) => {
        const role = m.role === 'user' ? '### User' : '### Wesai';
        const timestamp = m.timestamp ? `\n*${new Date(m.timestamp).toLocaleString()}*\n` : '';
        let body = m.content;
        if (m.componentCode) {
          body += `\n\n\`\`\`tsx\n${m.componentCode}\n\`\`\``;
        }
        return `${role}${timestamp}\n\n${body}\n\n---\n`;
      })
      .join('\n');

    navigator.clipboard.writeText(content);
    setIsConversationCopied(true);
    setTimeout(() => setIsConversationCopied(false), 2000);
  };

  const handleExportChat = () => {
    let content = '';
    const messagesToExport = searchTerm.trim()
      ? chatMessages.filter(
          (m: ChatMessage) =>
            m.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (m.componentCode && m.componentCode.toLowerCase().includes(searchTerm.toLowerCase())),
        )
      : chatMessages;

    if (exportFormat === 'json') {
      content = JSON.stringify(messagesToExport, null, 2);
    } else if (exportFormat === 'markdown') {
      content = messagesToExport
        .map((m: ChatMessage) => {
          const role = m.role === 'user' ? '### User' : '### Wesai';
          const timestamp = m.timestamp ? `\n*${new Date(m.timestamp).toLocaleString()}*\n` : '';
          let body = m.content;
          if (m.componentCode) {
            body += `\n\n\`\`\`tsx\n${m.componentCode}\n\`\`\``;
          }
          return `${role}${timestamp}\n\n${body}\n\n---\n`;
        })
        .join('\n');
    } else {
      content = messagesToExport
        .map((m: ChatMessage) => {
          const role = m.role === 'user' ? 'USER' : 'WESAI';
          return `[${role}]: ${m.content}${m.componentCode ? '\n\n[CODE]:\n' + m.componentCode : ''}`;
        })
        .join('\n\n');
    }

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wesai-chat-export-${new Date().toISOString().slice(0, 10)}.${exportFormat}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setIsExportDialogOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !isLoading &&
      isApiKeyConfigured &&
      isChatSessionActive &&
      (chatInput.trim() || chatImage)
    ) {
      onChatSubmit();
    }
  };

  const handleClearChatInput = () => {
    onClearChatInput();
  };

  const filteredMessages = useMemo(() => {
    if (!searchTerm.trim()) return chatMessages;
    return chatMessages.filter(
      (m: ChatMessage) =>
        m.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.componentCode && m.componentCode.toLowerCase().includes(searchTerm.toLowerCase())),
    );
  }, [chatMessages, searchTerm]);

  const getInputPlaceholder = () => {
    if (!isApiKeyConfigured) return 'Please configure your Gemini API Key in Settings...';
    if (!isChatSessionActive) return 'Select or create a chat session to begin...';
    return isMobile ? 'Message Wesai...' : 'Type your message here (Shift+Enter for new line)...';
  };

  return (
    <div className="flex flex-col h-full bg-app-main overflow-hidden relative border-l border-app-border shadow-2xl">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-app-main border-b border-app-border z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-app-accent to-purple-600 text-white shadow-lg shadow-app-accent/20">
            <FaWandMagicSparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-black text-app-text tracking-tight uppercase">
              Chat Studio
            </h2>
            <div className="flex items-center gap-1.5">
              <span
                className={`w-1.5 h-1.5 rounded-full ${isApiKeyConfigured ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}
              />
              <span className="text-[10px] font-bold text-app-muted uppercase tracking-widest">
                {isApiKeyConfigured ? 'AI Ready' : 'API Key Missing'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <div className="relative group mr-2 hidden sm:block">
            <FaMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-app-muted w-3 h-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search chat..."
              className="pl-8 pr-3 py-1.5 bg-app-tertiary border border-app-border rounded-lg text-xs focus:ring-2 focus:ring-app-accent focus:border-transparent transition-all outline-none w-32 focus:w-48"
            />
          </div>

          <button
            onClick={() => setIsSavedContextsOpen(true)}
            className="p-2 text-app-muted hover:text-app-accent hover:bg-app-tertiary rounded-xl transition-all relative group"
            title="Saved Sessions"
          >
            <FaClockRotateLeft className="w-4 h-4" />
            {savedChatSessions.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-app-accent rounded-full border-2 border-app-main" />
            )}
          </button>

          <button
            onClick={handleCopyConversation}
            className={`p-2 transition-all rounded-xl relative ${
              isConversationCopied
                ? 'text-green-500 bg-green-500/10'
                : 'text-app-muted hover:text-app-accent hover:bg-app-tertiary'
            }`}
            title="Copy conversation as Markdown"
            disabled={chatMessages.length === 0}
          >
            {isConversationCopied ? <FaPlus className="w-4 h-4" /> : <FaCopy className="w-4 h-4" />}
            {isConversationCopied && (
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-app-tertiary border border-app-border rounded text-[10px] font-bold text-app-text whitespace-nowrap animate-in fade-in zoom-in-95 duration-200">
                COPIED!
              </span>
            )}
          </button>

          <button
            onClick={() => setIsExportDialogOpen(true)}
            className="p-2 text-app-muted hover:text-orange-500 hover:bg-app-tertiary rounded-xl transition-all"
            title="Export Chat"
            disabled={chatMessages.length === 0}
          >
            <FaDownload className="w-4 h-4" />
          </button>

          <div className="w-px h-4 bg-app-border mx-1" />

          <button
            onClick={() => setIsSaveDialogOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-green-600/10 text-green-600 hover:bg-green-600 hover:text-white rounded-xl text-xs font-bold transition-all border border-green-600/20 active:scale-95"
            disabled={chatMessages.length === 0}
          >
            <FaFloppyDisk className="w-3 h-3" />
            <span className="hidden sm:inline">SAVE</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm('Clear current chat? This cannot be undone.')) {
                onClearChat();
              }
            }}
            className="flex items-center gap-2 px-3 py-1.5 bg-red-600/10 text-red-600 hover:bg-red-600 hover:text-white rounded-xl text-xs font-bold transition-all border border-red-600/20 active:scale-95"
          >
            <FaPlus className="w-3 h-3 rotate-45" />
            <span className="hidden sm:inline">CLEAR</span>
          </button>
        </div>
      </header>

      {/* Messages Area */}
      <div
        ref={messagesAreaRef}
        onScroll={handleScroll}
        className="flex-grow overflow-y-auto p-4 space-y-6 custom-scrollbar bg-app-main/50 relative"
      >
        {chatMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center max-w-sm mx-auto animate-in fade-in zoom-in-95 duration-700">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-app-accent/20 blur-3xl rounded-full" />
              <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-app-accent to-purple-600 flex items-center justify-center shadow-2xl shadow-app-accent/30 rotate-3 hover:rotate-0 transition-transform duration-500">
                <FaWandMagicSparkles className="w-10 h-10 text-white" />
              </div>
            </div>
            <h3 className="text-xl font-black text-app-text tracking-tight uppercase mb-3">
              Wesai Assistant
            </h3>
            <p className="text-sm text-app-muted leading-relaxed font-medium">
              Your AI-powered development partner. Start a conversation or upload an image to begin
              building something amazing.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-2">
              {[
                { label: 'Build a React button', hint: 'Build a modern React button component' },
                {
                  label: 'Explain recursion',
                  hint: 'Explain the concept of recursion with examples',
                },
                {
                  label: 'Create a login form',
                  hint: 'Create a responsive login form with Tailwind CSS',
                },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => onChatInputChange(item.hint)}
                  className="px-4 py-2 bg-app-tertiary hover:bg-app-border text-app-text text-xs font-bold rounded-xl transition-all border border-app-border hover:border-app-accent/30 active:scale-95"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        ) : searchTerm.trim() && filteredMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="p-4 bg-app-tertiary rounded-full mb-4">
              <FaMagnifyingGlass className="w-8 h-8 text-app-muted/50" />
            </div>
            <p className="text-app-muted font-medium">
              No messages found matching &quot;{searchTerm}&quot;
            </p>
            <button
              onClick={() => setSearchTerm('')}
              className="mt-4 text-app-accent hover:opacity-80 font-bold text-sm"
            >
              Clear search filter
            </button>
          </div>
        ) : (
          filteredMessages.map((msg: ChatMessage) => (
            <ChatMessageItem
              key={msg.id}
              msg={msg}
              copiedMessageId={copiedMessageId}
              onTogglePreview={onTogglePreview}
              onCopyChatMessage={onCopyChatMessage}
              onRetryChat={onRetryChat}
              isLastUserMessage={msg.id === lastUserMessageId}
            />
          ))
        )}

        {isLoading && (
          <div className="flex flex-col items-start group animate-in fade-in slide-in-from-bottom-2 mb-6">
            <div className="flex items-center gap-2 mb-1 px-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-app-accent">
                Wesai
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-app-accent animate-pulse" />
            </div>
            <div className="bg-app-secondary p-5 rounded-2xl rounded-tl-none shadow-sm border border-app-border w-full max-w-[80%]">
              <TextSkeleton lines={3} />
            </div>
          </div>
        )}

        {showScrollBottom && (
          <button
            onClick={() => scrollToBottom()}
            className="fixed bottom-32 right-8 p-3 bg-app-accent text-white rounded-full shadow-2xl shadow-app-accent/40 hover:scale-110 active:scale-95 transition-all z-20 animate-in fade-in zoom-in"
            title="Scroll to bottom"
          >
            <FaPlus className="w-4 h-4 rotate-180" />
          </button>
        )}

        <div ref={chatMessagesEndRef} />
      </div>

      {/* Input Area */}
      <footer className={`${isMobile ? 'p-2' : 'p-4'} bg-app-main border-t border-app-border`}>
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto relative">
          {chatImage && (
            <div
              className={`absolute bottom-full ${isMobile ? 'mb-2' : 'mb-4'} left-0 animate-in slide-in-from-bottom-2 fade-in`}
            >
              <div className="relative p-1 bg-app-secondary rounded-2xl shadow-2xl border border-app-border group">
                <img
                  src={chatImage}
                  alt="Selected"
                  className={`${isMobile ? 'h-16' : 'h-24'} w-auto rounded-xl object-cover`}
                />
                <button
                  type="button"
                  onClick={() => onChatImageChange(null)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 shadow-xl transition-transform hover:scale-110"
                  title="Remove image"
                >
                  <FaXmark className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          <div
            className={`flex items-end ${isMobile ? 'gap-1.5 p-1.5' : 'gap-3 p-2'} bg-app-tertiary/50 rounded-2xl border border-app-border focus-within:ring-2 focus-within:ring-app-accent/20 focus-within:border-app-accent transition-all`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`${isMobile ? 'p-2' : 'p-3'} text-app-muted hover:text-app-accent hover:bg-app-main rounded-xl transition-all`}
              title="Attach image"
              disabled={isLoading || !isApiKeyConfigured || !isChatSessionActive}
            >
              <FaPaperclip className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
            </button>

            <textarea
              value={chatInput}
              onChange={(e) => onChatInputChange(e.target.value)}
              onPaste={handlePaste}
              onKeyDown={(e) => {
                if (sendOnEnter && e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (
                    !isLoading &&
                    isApiKeyConfigured &&
                    isChatSessionActive &&
                    (chatInput.trim() || chatImage)
                  ) {
                    onChatSubmit();
                  }
                }
              }}
              placeholder={getInputPlaceholder()}
              disabled={isLoading || !isApiKeyConfigured || !isChatSessionActive}
              className={`flex-grow ${isMobile ? 'py-2 text-xs' : 'py-3 text-sm'} bg-transparent text-app-text border-none focus:ring-0 resize-none min-h-[40px] max-h-40 overflow-y-auto custom-scrollbar`}
              aria-label="Chat input"
            />

            <div className={`flex items-center ${isMobile ? 'gap-1' : 'gap-2'} pr-1 pb-1`}>
              {chatInput && !isLoading && !isMobile && (
                <div className="hidden sm:block pointer-events-none opacity-40 mr-1">
                  <kbd className="px-1.5 py-0.5 text-[10px] font-sans font-semibold text-app-muted bg-app-main border border-app-border rounded shadow-sm">
                    {sendOnEnter ? 'Enter' : 'Cmd+Enter'}
                  </kbd>
                </div>
              )}
              {chatInput && !isLoading && (
                <button
                  type="button"
                  onClick={handleClearChatInput}
                  title="Clear input"
                  className={`${isMobile ? 'p-1.5' : 'p-2'} text-app-muted hover:text-app-text rounded-lg hover:bg-app-main transition-all`}
                >
                  <FaXmark className={`${isMobile ? 'w-3.5 h-3.5' : 'w-4 h-4'}`} />
                </button>
              )}

              {isLoading ? (
                <button
                  type="button"
                  onClick={stopGeneration}
                  className={`${isMobile ? 'p-2.5' : 'p-3'} bg-red-500 text-white rounded-xl shadow-lg shadow-red-500/30 hover:bg-red-600 transition-all animate-pulse active:scale-95 flex items-center justify-center`}
                  title="Stop generation"
                >
                  <FaXmark className={`${isMobile ? 'w-3.5 h-3.5' : 'w-4 h-4'}`} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={
                    !isApiKeyConfigured || !isChatSessionActive || (!chatInput.trim() && !chatImage)
                  }
                  className={`${isMobile ? 'p-2.5' : 'p-3'} rounded-xl transition-all flex items-center justify-center ${
                    !chatInput.trim() && !chatImage
                      ? 'bg-app-tertiary text-app-muted'
                      : 'bg-app-accent text-white shadow-lg shadow-app-accent/30 hover:opacity-90 active:scale-95'
                  }`}
                >
                  <FaPaperPlane className={`${isMobile ? 'w-3.5 h-3.5' : 'w-4 h-4'}`} />
                </button>
              )}
            </div>
          </div>
          <p className="mt-2 text-[10px] text-center text-app-muted font-medium uppercase tracking-widest">
            {sendOnEnter
              ? 'Press Enter to send, Shift+Enter for new line'
              : 'Click the plane to send your message'}
          </p>
        </form>
      </footer>

      {isSaveDialogOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-app-main rounded-2xl shadow-2xl p-6 w-full max-w-md border border-app-border animate-in zoom-in-95 duration-200">
            <h4 className="text-xl font-bold text-app-text">Name this context</h4>
            <input
              type="text"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              className="mt-4 w-full p-3 bg-app-secondary text-app-text border border-app-border rounded-xl focus:ring-2 focus:ring-app-accent focus:border-transparent transition-all outline-none"
              placeholder="e.g. Project Atlas Planning"
              autoFocus
            />
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsSaveDialogOpen(false);
                  setSaveName('');
                }}
                className="px-4 py-2 rounded-xl bg-app-tertiary text-app-text hover:bg-app-border transition-all font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (saveName.trim()) {
                    onSaveChatSession(saveName.trim(), chatMessages);
                    setIsSaveDialogOpen(false);
                    setSaveName('');
                  }
                }}
                className="px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold shadow-lg shadow-green-500/20 transition-all active:scale-95 disabled:opacity-50"
                disabled={!saveName.trim()}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Dialog */}
      {isExportDialogOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-app-main rounded-2xl shadow-2xl p-8 w-full max-w-md border border-app-border animate-in zoom-in-95 duration-200">
            <h4 className="text-2xl font-black text-app-text mb-6 tracking-tight">
              Export Conversation
            </h4>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-app-muted uppercase tracking-widest mb-3">
                  Export Format
                </label>
                <div className="space-y-3">
                  {[
                    { id: 'markdown', label: 'Markdown', desc: 'Formatted for readability' },
                    { id: 'json', label: 'JSON', desc: 'Structured data for developers' },
                    { id: 'txt', label: 'Plain Text', desc: 'Simple text format' },
                  ].map((format) => (
                    <label
                      key={format.id}
                      className={`flex items-start gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer group ${
                        exportFormat === format.id
                          ? 'border-app-accent bg-app-accent-soft'
                          : 'border-app-border hover:border-app-accent/30 hover:bg-app-tertiary/50'
                      }`}
                    >
                      <input
                        type="radio"
                        value={format.id}
                        checked={exportFormat === format.id}
                        onChange={(e) =>
                          setExportFormat(e.target.value as 'markdown' | 'json' | 'txt')
                        }
                        className="mt-1 w-4 h-4 text-app-accent focus:ring-app-accent bg-app-main border-app-border"
                      />
                      <div className="flex flex-col">
                        <span className="font-bold text-app-text">{format.label}</span>
                        <span className="text-xs text-app-muted">{format.desc}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {searchTerm.trim() && (
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center gap-3">
                  <div className="p-2 bg-blue-500 rounded-lg text-white">
                    <FaWandMagicSparkles className="w-4 h-4" />
                  </div>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    Exporting {filteredMessages.length} filtered results
                  </p>
                </div>
              )}

              <div className="text-center">
                <p className="text-[11px] font-bold text-app-muted uppercase tracking-widest">
                  {chatMessages.length} total messages in this session
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={() => {
                  setIsExportDialogOpen(false);
                  setExportFormat('markdown');
                }}
                className="px-6 py-3 rounded-xl bg-app-tertiary text-app-text hover:bg-app-border transition-all font-bold text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleExportChat}
                className="px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-lg shadow-orange-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <FaDownload className="w-4 h-4" />
                Export {exportFormat.toUpperCase()}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Saved Contexts Modal/Drawer */}
      {isSavedContextsOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className={`${isMobile ? 'w-full h-full' : 'w-full max-w-2xl max-h-[80vh]'} bg-app-main ${isMobile ? '' : 'rounded-3xl'} shadow-2xl border border-app-border flex flex-col overflow-hidden animate-in zoom-in-95 duration-200`}
          >
            <div className="p-4 sm:p-6 border-b border-app-border flex justify-between items-center bg-app-secondary/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-app-accent-soft text-app-accent rounded-xl">
                  <FaClockRotateLeft className="w-5 h-5" />
                </div>
                <h3 className="text-lg sm:text-xl font-black text-app-text tracking-tight uppercase">
                  Saved Sessions
                </h3>
              </div>
              <button
                onClick={() => setIsSavedContextsOpen(false)}
                className="p-2 text-app-muted hover:text-app-text hover:bg-app-tertiary rounded-xl transition-all active:scale-95"
              >
                <FaXmark className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-grow overflow-y-auto p-4 sm:p-6 custom-scrollbar">
              <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
                <div className="relative flex-grow w-full">
                  <FaMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-app-muted w-4 h-4" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search sessions by name..."
                    className="w-full pl-12 pr-4 py-3 bg-app-secondary border border-app-border rounded-xl text-sm focus:ring-2 focus:ring-app-accent focus:border-transparent transition-all outline-none"
                  />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <label className="text-xs font-bold text-app-muted uppercase tracking-widest whitespace-nowrap">
                    Sort By:
                  </label>
                  <select
                    value={savedSessionsSort}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      onSetSavedSessionsSort(
                        e.target.value as 'newest' | 'oldest' | 'name_asc' | 'name_desc',
                      )
                    }
                    className="w-full sm:w-auto p-3 bg-app-secondary text-app-text border border-app-border rounded-xl text-sm focus:ring-2 focus:ring-app-accent outline-none cursor-pointer"
                  >
                    <option value="newest">Recently Created</option>
                    <option value="recently_used">Recently Used</option>
                    <option value="oldest">Oldest</option>
                    <option value="name_asc">Name (A→Z)</option>
                    <option value="name_desc">Name (Z→A)</option>
                  </select>
                </div>
              </div>

              <div className="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                <SavedSessionsList
                  savedChatSessions={savedChatSessions}
                  activeSavedChatSessionId={activeSavedChatSessionId}
                  onLoadSavedChatSession={onLoadSavedChatSession}
                  onDeleteSavedChatSession={onDeleteSavedChatSession}
                  onRenameSavedChatSession={onRenameSavedChatSession}
                  onDuplicateSavedChatSession={onDuplicateSavedChatSession}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

ChatInterfacePanel.displayName = 'ChatInterfacePanel';
