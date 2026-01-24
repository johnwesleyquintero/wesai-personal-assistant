import React, { useRef, useEffect, memo, useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { LoadingSpinner } from './LoadingSpinner.tsx';
import { ReactPreviewRenderer } from './ReactPreviewRenderer.tsx';
import { ErrorMessage } from './ErrorMessage.tsx';
import { useAppStore } from '../store.ts';
import { markdownComponents } from './MarkdownCodeRenderer.tsx';
import { TextSkeleton } from './Skeleton.tsx';
import type { ChatMessage } from '../types.ts';
import {
  FaMagnifyingGlass,
  FaPaperclip,
  FaPaperPlane,
  FaPlus,
  FaFloppyDisk,
  FaClockRotateLeft,
  FaDownload,
  FaCopy,
  FaCheck,
  FaXmark,
  FaFileExport,
  FaCode,
  FaEye,
  FaWandMagicSparkles,
  FaCircleInfo,
  FaTrash,
} from 'react-icons/fa6';

import { useChatLogic } from './hooks/useChatLogic.ts';
import { useIsMobile } from './hooks/useMediaQuery.ts';

export const ChatInterfacePanel: React.FC = memo(() => {
  const isMobile = useIsMobile();
  const {
    chatMessages,
    chatInput,
    handleChatInputChange: onChatInputChange,
    handleClearChatInput: onClearChatInput,
    handleChatSubmit: onChatSubmit,
    chatImage,
    setChatImage: onChatImageChange,
    isLoading,
    activeChatSession,
    handleCopyChatMessage: onCopyChatMessage,
    handleTogglePreview: onTogglePreview,
    copiedMessageId,
    chatError: error,
    handleNewChat: onNewChat,
    handleRetryChat: onRetryChat,
    sendOnEnter,
    savedChatSessions,
    initializeSavedChatSessions: onInitializeSavedChatSessions,
    saveChatSession: onSaveChatSession,
    loadSavedChatSession: onLoadSavedChatSession,
    deleteSavedChatSession: onDeleteSavedChatSession,
    renameSavedChatSession: onRenameSavedChatSession,
    duplicateSavedChatSession: onDuplicateSavedChatSession,
    savedSessionsSort,
    setSavedSessionsSort: onSetSavedSessionsSort,
  } = useChatLogic();

  const isApiKeyConfigured = !!useAppStore((state) => state.activeApiKey);
  const isChatSessionActive = !!activeChatSession;

  const chatMessagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addToast = useAppStore((state) => state.addToast);
  const [isSavedContextsOpen, setIsSavedContextsOpen] = useState(false);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [renameMap, setRenameMap] = useState<Record<string, string>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<'markdown' | 'json' | 'txt'>('markdown');

  const scrollToBottom = () => {
    chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [chatMessages]);

  // Filter messages based on search term
  const filteredMessages = useMemo(() => {
    if (!searchTerm.trim()) return chatMessages;

    const searchLower = searchTerm.toLowerCase().trim();
    return chatMessages.filter(
      (msg) =>
        msg.content.toLowerCase().includes(searchLower) ||
        (msg.role === 'user' && 'user'.includes(searchLower)) ||
        (msg.role === 'model' && 'assistant wesai'.includes(searchLower)),
    );
  }, [chatMessages, searchTerm]);

  // Export functionality
  const handleExportChat = () => {
    const messagesToExport = searchTerm.trim() ? filteredMessages : chatMessages;
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `wesai-chat-${timestamp}`;

    let content = '';
    let mimeType = 'text/plain';

    switch (exportFormat) {
      case 'markdown':
        content = messagesToExport
          .map((msg) => {
            const role = msg.role === 'user' ? '👤 User' : '🤖 WesAI';
            return `### ${role}\n${msg.content}\n\n---\n\n`;
          })
          .join('');
        mimeType = 'text/markdown';
        break;

      case 'json':
        content = JSON.stringify(
          {
            exportDate: new Date().toISOString(),
            messageCount: messagesToExport.length,
            searchTerm: searchTerm.trim() || null,
            messages: messagesToExport,
          },
          null,
          2,
        );
        mimeType = 'application/json';
        break;

      case 'txt':
        content = messagesToExport
          .map((msg) => {
            const role = msg.role === 'user' ? '[USER]' : '[WESAI]';
            return `${role}\n${msg.content}\n\n`;
          })
          .join('');
        break;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.${exportFormat}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setIsExportDialogOpen(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChatImageChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const blob = items[i].getAsFile();
        if (blob) {
          const reader = new FileReader();
          reader.onloadend = () => {
            onChatImageChange(reader.result as string);
          };
          reader.readAsDataURL(blob);
        }
      }
    }
  };

  useEffect(() => {
    if (isSavedContextsOpen) {
      onInitializeSavedChatSessions();
    }
  }, [isSavedContextsOpen, onInitializeSavedChatSessions]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (chatInput.trim() || chatImage) {
      // Ensure not submitting empty messages from Enter key
      onChatSubmit();
    }
  };

  const getInputPlaceholder = (): string => {
    if (isLoading) return 'WesAI is thinking...';
    if (!isApiKeyConfigured) return 'API Key not configured. Cannot chat.';
    if (!isChatSessionActive) return 'Chat session not active...';
    return 'How can I help you today?...';
  };

  const handleClearChatInput = () => {
    onClearChatInput();
    addToast('Chat input cleared', 'info', 2000);
  };

  return (
    <div
      className={`flex flex-col ${isMobile ? 'h-[85vh]' : 'h-[75vh]'} bg-app-main rounded-2xl shadow-2xl border border-app-border overflow-hidden transition-all duration-300`}
    >
      {/* Header */}
      <header className="flex justify-between items-center px-4 sm:px-6 py-4 border-b border-app-border bg-app-main/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex flex-col">
            <h3 className="text-lg sm:text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-app-accent dark:to-indigo-400 tracking-tight">
              {isMobile ? 'Wesai' : 'Wesai Chat'}
            </h3>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[9px] sm:text-[10px] uppercase tracking-wider font-black text-app-muted">
                {isLoading ? 'Processing...' : 'Active'}
              </span>
            </div>
          </div>

          {/* Search Toggle */}
          <div className="relative">
            <button
              onClick={() => setIsSearchExpanded(!isSearchExpanded)}
              className={`p-2 sm:p-2.5 rounded-xl transition-all duration-200 ${
                isSearchExpanded
                  ? 'bg-app-accent-soft text-app-accent shadow-inner'
                  : 'text-app-muted hover:text-app-text hover:bg-app-tertiary'
              }`}
              title="Search messages"
            >
              <FaMagnifyingGlass className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            {isSearchExpanded && (
              <div
                className={`absolute top-full left-0 mt-3 ${isMobile ? 'w-[calc(100vw-4rem)]' : 'w-80'} bg-app-secondary rounded-2xl shadow-2xl border border-app-border p-3 sm:p-4 z-20 animate-in fade-in slide-in-from-top-2`}
              >
                <div className="relative">
                  <FaMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-app-muted w-3.5 h-3.5" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search messages..."
                    className="w-full pl-9 pr-4 py-2 bg-app-main border border-app-border rounded-xl text-sm focus:ring-2 focus:ring-app-accent focus:border-transparent transition-all outline-none"
                    autoFocus
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          {!isMobile && (
            <>
              <button
                onClick={() => setIsExportDialogOpen(true)}
                className="p-2.5 text-app-muted hover:text-orange-500 hover:bg-orange-500/10 rounded-xl transition-all active:scale-95"
                disabled={isLoading || chatMessages.length === 0}
                title="Export conversation"
              >
                <FaFileExport className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsSavedContextsOpen(true)}
                className="p-2.5 text-app-muted hover:text-app-accent hover:bg-app-accent-soft rounded-xl transition-all active:scale-95"
                disabled={isLoading}
                title="Saved Contexts"
              >
                <FaClockRotateLeft className="w-4 h-4" />
              </button>
            </>
          )}

          {isMobile && (
            <button
              onClick={() => setIsSavedContextsOpen(true)}
              className="p-2 text-app-muted hover:text-app-accent hover:bg-app-accent-soft rounded-xl transition-all active:scale-95"
              disabled={isLoading}
            >
              <FaClockRotateLeft className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => setIsSaveDialogOpen(true)}
            className="p-2 sm:p-2.5 text-app-muted hover:text-green-500 hover:bg-green-500/10 rounded-xl transition-all active:scale-95"
            disabled={isLoading}
            title="Save current chat"
          >
            <FaFloppyDisk className="w-4 h-4" />
          </button>

          <div className="h-5 sm:h-6 w-px bg-app-border mx-0.5 sm:mx-1" />

          <button
            onClick={onNewChat}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-app-accent hover:opacity-90 text-white text-xs sm:text-sm font-black rounded-xl shadow-lg shadow-app-accent/30 transition-all active:scale-95 disabled:opacity-50 uppercase tracking-widest"
            disabled={isLoading}
          >
            <FaPlus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span className="hidden xs:inline">New</span>
          </button>
        </div>
      </header>

      <ErrorMessage message={error} onRetry={onRetryChat} isChatError />

      {/* Messages Area */}
      <div className="flex-grow p-6 space-y-6 overflow-y-auto custom-scrollbar">
        {chatMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12 animate-in fade-in zoom-in-95 duration-700">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-app-accent/10 blur-3xl rounded-full scale-150" />
              <div className="relative p-10 rounded-[2.5rem] bg-app-secondary shadow-2xl border border-app-border transform transition-transform hover:scale-105 duration-500">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-6 rounded-3xl shadow-lg shadow-blue-500/20">
                  <FaPaperPlane className="w-10 h-10 text-white" />
                </div>
              </div>
            </div>
            <h3 className="text-3xl font-black text-app-text mb-4 tracking-tight">
              Start a conversation
            </h3>
            <p className="text-app-muted max-w-sm mx-auto text-base leading-relaxed mb-10">
              Ask me anything about code, design, or business. I&apos;m here to help you build
              faster.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg w-full px-4">
              {[
                { title: 'Refactor this function', icon: <FaCode className="w-4 h-4" /> },
                { title: 'Review my React code', icon: <FaEye className="w-4 h-4" /> },
                {
                  title: 'Optimize performance',
                  icon: <FaWandMagicSparkles className="w-4 h-4" />,
                },
                { title: 'Explain this concept', icon: <FaCircleInfo className="w-4 h-4" /> },
              ].map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => onChatInputChange(suggestion.title)}
                  className="flex items-center gap-3 p-4 bg-app-secondary border border-app-border rounded-2xl text-left hover:border-app-accent hover:bg-app-accent-soft transition-all group"
                >
                  <div className="p-2 rounded-lg bg-app-tertiary text-app-muted group-hover:text-app-accent transition-colors">
                    {suggestion.icon}
                  </div>
                  <span className="text-sm font-bold text-app-text/80 group-hover:text-app-text">
                    {suggestion.title}
                  </span>
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
          filteredMessages.map((msg) => (
            <ChatMessageItem
              key={msg.id}
              msg={msg}
              copiedMessageId={copiedMessageId}
              onTogglePreview={onTogglePreview}
              onCopyChatMessage={onCopyChatMessage}
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

              <button
                type="submit"
                disabled={
                  isLoading ||
                  !isApiKeyConfigured ||
                  !isChatSessionActive ||
                  (!chatInput.trim() && !chatImage)
                }
                className={`${isMobile ? 'p-2.5' : 'p-3'} rounded-xl transition-all flex items-center justify-center ${
                  (!chatInput.trim() && !chatImage) || isLoading
                    ? 'bg-app-tertiary text-app-muted'
                    : 'bg-app-accent text-white shadow-lg shadow-app-accent/30 hover:opacity-90 active:scale-95'
                }`}
              >
                {isLoading ? (
                  <LoadingSpinner />
                ) : (
                  <FaPaperPlane className={`${isMobile ? 'w-3.5 h-3.5' : 'w-4 h-4'}`} />
                )}
              </button>
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
              <div className="flex flex-col sm:flex-row items-center gap-3">
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

              <div className="max-h-[50vh] overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                {savedChatSessions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="p-4 bg-app-tertiary rounded-full mb-4">
                      <FaFloppyDisk className="w-8 h-8 text-app-muted/30" />
                    </div>
                    <p className="text-app-muted font-bold uppercase tracking-widest text-sm">
                      No saved contexts yet.
                    </p>
                  </div>
                ) : (
                  [...savedChatSessions]
                    .sort((a, b) => {
                      const an = a.name.toLowerCase();
                      const bn = b.name.toLowerCase();
                      if (savedSessionsSort === 'newest') return b.timestamp - a.timestamp;
                      if (savedSessionsSort === 'oldest') return a.timestamp - b.timestamp;
                      if (savedSessionsSort === 'name_asc') return an.localeCompare(bn);
                      return bn.localeCompare(an);
                    })
                    .filter((s) => s.name.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((s) => {
                      const allText = s.messages.map((m) => m.content || '').join(' ');
                      const totalChars = allText.length;
                      const snippet = allText.slice(0, 140);
                      const showEllipsis = totalChars > 140;
                      const messageCount = s.messages.length;
                      const lastAuthor =
                        s.messages.length > 0 ? s.messages[s.messages.length - 1].role : 'N/A';
                      return (
                        <div
                          key={s.id}
                          className="group/item flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl bg-app-secondary border border-app-border hover:border-app-accent/50 hover:bg-app-accent-soft/30 transition-all gap-4"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="text-lg font-bold text-app-text truncate group-hover/item:text-app-accent transition-colors">
                              {renameMap[s.id] !== undefined ? (
                                <input
                                  type="text"
                                  value={renameMap[s.id]}
                                  onChange={(e) =>
                                    setRenameMap((m) => ({ ...m, [s.id]: e.target.value }))
                                  }
                                  className="w-full p-2 bg-app-main border border-app-accent rounded-lg text-sm focus:ring-2 focus:ring-app-accent outline-none"
                                  autoFocus
                                />
                              ) : (
                                s.name
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] font-black bg-app-tertiary text-app-muted px-2 py-0.5 rounded uppercase tracking-tighter">
                                {new Date(s.timestamp).toLocaleDateString()}
                              </span>
                              <span className="text-[10px] font-black bg-blue-500/10 text-blue-600 px-2 py-0.5 rounded uppercase tracking-tighter">
                                {messageCount} msgs
                              </span>
                              <span className="text-[10px] font-black bg-purple-500/10 text-purple-600 px-2 py-0.5 rounded uppercase tracking-tighter">
                                {lastAuthor === 'user' ? '👤 User' : '🤖 AI'}
                              </span>
                            </div>
                            {snippet && (
                              <p className="mt-2 text-xs text-app-muted line-clamp-2 italic">
                                &quot;{snippet}
                                {showEllipsis ? '…' : ''}&quot;
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-2 w-full sm:w-auto">
                            {renameMap[s.id] !== undefined ? (
                              <>
                                <button
                                  onClick={() => {
                                    const v = (renameMap[s.id] || '').trim();
                                    if (v) {
                                      onRenameSavedChatSession(s.id, v);
                                      setRenameMap((m) => {
                                        const { [s.id]: _, ...rest } = m;
                                        return rest;
                                      });
                                    }
                                  }}
                                  className="flex-grow sm:flex-none px-3 py-2 text-xs font-bold rounded-xl bg-green-600 hover:bg-green-700 text-white transition-all shadow-md shadow-green-500/10"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() =>
                                    setRenameMap((m) => {
                                      const { [s.id]: _, ...rest } = m;
                                      return rest;
                                    })
                                  }
                                  className="flex-grow sm:flex-none px-3 py-2 text-xs font-bold rounded-xl bg-app-tertiary text-app-text hover:bg-app-border transition-all"
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => onLoadSavedChatSession(s.id)}
                                  className="flex-grow sm:flex-none px-4 py-2 text-xs font-black rounded-xl bg-app-accent hover:opacity-90 text-white transition-all shadow-md shadow-app-accent/20 active:scale-95"
                                >
                                  LOAD
                                </button>
                                <button
                                  onClick={() => onDuplicateSavedChatSession(s.id)}
                                  className="p-2 text-app-muted hover:text-blue-600 hover:bg-blue-500/10 rounded-xl transition-all"
                                  title="Duplicate"
                                >
                                  <FaPlus className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setRenameMap((m) => ({ ...m, [s.id]: s.name }))}
                                  className="p-2 text-app-muted hover:text-purple-600 hover:bg-purple-500/10 rounded-xl transition-all"
                                  title="Rename"
                                >
                                  <FaCopy className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (window.confirm('Delete this context?'))
                                      onDeleteSavedChatSession(s.id);
                                  }}
                                  className="p-2 text-app-muted hover:text-red-600 hover:bg-red-500/10 rounded-xl transition-all"
                                  title="Delete"
                                >
                                  <FaTrash className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

interface ChatMessageItemProps {
  msg: ChatMessage;
  copiedMessageId: string | null;
  onTogglePreview: (messageId: string) => void;
  onCopyChatMessage: (content: string, messageId: string) => void;
}

const ChatMessageItem: React.FC<ChatMessageItemProps> = memo(
  ({ msg, copiedMessageId, onTogglePreview, onCopyChatMessage }) => {
    const isUser = msg.role === 'user';

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
      <div
        className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} group animate-in fade-in slide-in-from-bottom-2`}
      >
        <div className={`flex items-center gap-2 mb-1 px-1`}>
          <span
            className={`text-[10px] font-bold uppercase tracking-widest ${isUser ? 'text-blue-600 dark:text-blue-400' : 'text-purple-600 dark:text-purple-400'}`}
          >
            {isUser ? 'You' : 'Wesai'}
          </span>
          <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        <div
          className={`relative max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl transition-all duration-200 ${
            isUser
              ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-500/20 rounded-tr-none'
              : 'bg-app-secondary text-app-text shadow-sm border border-app-border rounded-tl-none hover:shadow-md'
          }`}
        >
          {msg.role === 'model' && msg.componentCode && (
            <div className="flex items-center gap-1 mb-3 p-1 bg-app-tertiary/50 rounded-xl border border-app-border w-fit ml-auto">
              <button
                onClick={() => onTogglePreview(msg.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all ${
                  !msg.showPreview
                    ? 'bg-app-main text-app-accent shadow-sm'
                    : 'text-app-muted hover:text-app-text hover:bg-app-main/50'
                }`}
              >
                <FaCode className="w-3 h-3" />
                CODE
              </button>
              <button
                onClick={() => onTogglePreview(msg.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all ${
                  msg.showPreview
                    ? 'bg-app-main text-app-accent shadow-sm'
                    : 'text-app-muted hover:text-app-text hover:bg-app-main/50'
                }`}
              >
                <FaEye className="w-3 h-3" />
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
                        ${isUser ? 'prose-invert text-white' : 'text-app-text'}
                        prose-p:leading-relaxed prose-pre:bg-app-tertiary prose-pre:text-app-text
                        `}
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                {msg.content || ''}
              </ReactMarkdown>
            </div>
          )}

          {/* Action Buttons for Model Messages */}
          {!isUser && msg.content.trim() && (
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
                  title="Download TSX"
                  className="p-2 bg-app-main/80 backdrop-blur-sm text-app-muted hover:text-app-accent rounded-lg shadow-sm border border-app-border transition-all"
                >
                  <FaDownload className="w-3 h-3" />
                </button>
              )}
              <button
                onClick={() =>
                  onCopyChatMessage(
                    msg.showPreview && msg.componentCode ? msg.componentCode : msg.content,
                    msg.id,
                  )
                }
                className={`p-2 backdrop-blur-sm rounded-lg shadow-sm border transition-all ${
                  copiedMessageId === msg.id
                    ? 'bg-green-500 text-white border-green-400'
                    : 'bg-app-main/80 text-app-muted hover:text-app-accent border-app-border'
                }`}
                title={copiedMessageId === msg.id ? 'Copied!' : 'Copy to clipboard'}
              >
                {copiedMessageId === msg.id ? (
                  <FaCheck className="w-3 h-3" />
                ) : (
                  <FaCopy className="w-3 h-3" />
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  },
);
