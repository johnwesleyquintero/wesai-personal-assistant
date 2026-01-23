import React, { useRef, useEffect, memo, useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { LoadingSpinner } from './LoadingSpinner.tsx';
import { ReactPreviewRenderer } from './ReactPreviewRenderer.tsx';
import { ErrorMessage } from './ErrorMessage.tsx';
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
} from 'react-icons/fa6';

interface ChatInterfacePanelProps {
  chatMessages: ChatMessage[];
  chatInput: string;
  onChatInputChange: (value: string) => void;
  onClearChatInput: () => void; // New prop for clearing chat input
  onChatSubmit: () => void;
  chatImage: string | null;
  onChatImageChange: (image: string | null) => void;
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
  savedChatSessions: { id: string; name: string; timestamp: number; messages: ChatMessage[] }[];
  onInitializeSavedChatSessions: () => void;
  onSaveChatSession: (sessionName: string, messagesToSave: ChatMessage[]) => void;
  onLoadSavedChatSession: (sessionId: string) => void;
  onDeleteSavedChatSession: (sessionId: string) => void;
  onRenameSavedChatSession: (sessionId: string, newName: string) => void;
  onDuplicateSavedChatSession: (sessionId: string, newName?: string) => void;
  savedSessionsSort: 'newest' | 'oldest' | 'name_asc' | 'name_desc';
  onSetSavedSessionsSort: (sort: 'newest' | 'oldest' | 'name_asc' | 'name_desc') => void;
}

export const ChatInterfacePanel: React.FC<ChatInterfacePanelProps> = memo(
  ({
    chatMessages,
    chatInput,
    onChatInputChange,
    onClearChatInput,
    onChatSubmit,
    chatImage,
    onChatImageChange,
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
    savedChatSessions,
    onInitializeSavedChatSessions,
    onSaveChatSession,
    onLoadSavedChatSession,
    onDeleteSavedChatSession,
    onRenameSavedChatSession,
    onDuplicateSavedChatSession,
    savedSessionsSort,
    onSetSavedSessionsSort,
  }) => {
    const chatMessagesEndRef = useRef<HTMLDivElement | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
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

    return (
      <div className="flex flex-col h-[70vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden transition-all duration-300">
        {/* Header */}
        <header className="flex justify-between items-center px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                Wesai Chat
              </h3>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400">
                  {isLoading ? 'Processing...' : 'Active Session'}
                </span>
              </div>
            </div>

            {/* Search Toggle */}
            <div className="relative ml-2">
              <button
                onClick={() => setIsSearchExpanded(!isSearchExpanded)}
                className={`p-2 rounded-xl transition-all duration-200 ${
                  isSearchExpanded
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                }`}
                title="Search conversation"
              >
                <FaMagnifyingGlass className="w-4 h-4" />
              </button>

              {isSearchExpanded && (
                <div className="absolute top-full left-0 mt-3 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 p-4 z-20 animate-in fade-in slide-in-from-top-2">
                  <div className="relative">
                    <FaMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search messages..."
                      className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                      autoFocus
                    />
                  </div>
                  {searchTerm && (
                    <div className="mt-2 text-[11px] font-medium text-gray-500 dark:text-gray-400 px-1">
                      Showing {filteredMessages.length} of {chatMessages.length} results
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsExportDialogOpen(true)}
              className="p-2 text-gray-500 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-xl transition-all group"
              disabled={isLoading || chatMessages.length === 0}
              title="Export conversation"
            >
              <FaFileExport className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsSavedContextsOpen(true)}
              className="p-2 text-gray-500 hover:text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-xl transition-all"
              disabled={isLoading}
              title="Saved Contexts"
            >
              <FaClockRotateLeft className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsSaveDialogOpen(true)}
              className="p-2 text-gray-500 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-xl transition-all"
              disabled={isLoading}
              title="Save current chat"
            >
              <FaFloppyDisk className="w-4 h-4" />
            </button>

            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1" />

            <button
              onClick={onNewChat}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all active:scale-95 disabled:opacity-50"
              disabled={isLoading}
            >
              <FaPlus className="w-3 h-3" />
              <span className="hidden sm:inline">New Chat</span>
            </button>
          </div>
        </header>

        <ErrorMessage message={error} onRetry={onRetryChat} isChatError />

        {/* Messages Area */}
        <div className="flex-grow p-6 space-y-6 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-800 scrollbar-track-transparent">
          {searchTerm.trim() && filteredMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-full mb-4">
                <FaMagnifyingGlass className="w-8 h-8 text-gray-300 dark:text-gray-600" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 font-medium">
                No messages found matching &quot;{searchTerm}&quot;
              </p>
              <button
                onClick={() => setSearchTerm('')}
                className="mt-4 text-blue-600 hover:text-blue-700 dark:text-blue-400 font-bold text-sm"
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
          <div ref={chatMessagesEndRef} />
        </div>

        {/* Input Area */}
        <footer className="p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto relative">
            {chatImage && (
              <div className="absolute bottom-full mb-4 left-0 animate-in slide-in-from-bottom-2 fade-in">
                <div className="relative p-1 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 group">
                  <img
                    src={chatImage}
                    alt="Selected"
                    className="h-24 w-auto rounded-xl object-cover"
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

            <div className="flex items-end gap-3 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
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
                className="p-3 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-gray-700 rounded-xl transition-all"
                title="Attach image"
                disabled={isLoading || !isApiKeyConfigured || !isChatSessionActive}
              >
                <FaPaperclip className="w-5 h-5" />
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
                className="flex-grow py-3 bg-transparent text-gray-900 dark:text-gray-100 border-none focus:ring-0 text-sm resize-none min-h-[44px] max-h-40 overflow-y-auto"
                aria-label="Chat input"
              />

              <div className="flex items-center gap-2 pr-1 pb-1">
                {chatInput && !isLoading && (
                  <button
                    type="button"
                    onClick={onClearChatInput}
                    title="Clear input"
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-white dark:hover:bg-gray-700 transition-all"
                  >
                    <FaXmark className="w-4 h-4" />
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
                  className={`p-3 rounded-xl transition-all flex items-center justify-center ${
                    (!chatInput.trim() && !chatImage) || isLoading
                      ? 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                      : 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700 active:scale-95'
                  }`}
                >
                  {isLoading ? <LoadingSpinner /> : <FaPaperPlane className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <p className="mt-2 text-[10px] text-center text-gray-400 dark:text-gray-500 font-medium uppercase tracking-widest">
              {sendOnEnter
                ? 'Press Enter to send, Shift+Enter for new line'
                : 'Click the plane to send your message'}
            </p>
          </form>
        </footer>
        {isSaveDialogOpen && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 w-full max-w-md">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Name this context
              </h4>
              <input
                type="text"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                className="mt-3 w-full p-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded"
                placeholder="e.g. Project Atlas Planning"
              />
              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={() => {
                    setIsSaveDialogOpen(false);
                    setSaveName('');
                  }}
                  className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
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
                  className="px-3 py-1 rounded bg-green-600 hover:bg-green-700 text-white"
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
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Export Conversation
              </h4>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Export Format
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="markdown"
                        checked={exportFormat === 'markdown'}
                        onChange={(e) =>
                          setExportFormat(e.target.value as 'markdown' | 'json' | 'txt')
                        }
                        className="mr-2"
                      />
                      <span className="text-sm">Markdown (formatted for readability)</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="json"
                        checked={exportFormat === 'json'}
                        onChange={(e) =>
                          setExportFormat(e.target.value as 'markdown' | 'json' | 'txt')
                        }
                        className="mr-2"
                      />
                      <span className="text-sm">JSON (structured data)</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="txt"
                        checked={exportFormat === 'txt'}
                        onChange={(e) =>
                          setExportFormat(e.target.value as 'markdown' | 'json' | 'txt')
                        }
                        className="mr-2"
                      />
                      <span className="text-sm">Plain Text (simple format)</span>
                    </label>
                  </div>
                </div>

                {searchTerm.trim() && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      ⚡ Exporting filtered results ({filteredMessages.length} messages)
                    </p>
                  </div>
                )}

                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {chatMessages.length} total messages available for export
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setIsExportDialogOpen(false);
                    setExportFormat('markdown');
                  }}
                  className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExportChat}
                  className="px-4 py-2 rounded bg-orange-600 hover:bg-orange-700 text-white font-medium transition-colors"
                >
                  Export {exportFormat.toUpperCase()}
                </button>
              </div>
            </div>
          </div>
        )}

        {isSavedContextsOpen && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 w-full max-w-2xl">
              <div className="flex justify-between items-center">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Saved Contexts
                </h4>
                <button
                  onClick={() => setIsSavedContextsOpen(false)}
                  className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                >
                  Close
                </button>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <label className="text-xs text-gray-700 dark:text-gray-300">Sort:</label>
                <select
                  value={savedSessionsSort}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    onSetSavedSessionsSort(
                      e.target.value as 'newest' | 'oldest' | 'name_asc' | 'name_desc',
                    )
                  }
                  className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded"
                >
                  <option value="newest">Recently Created</option>
                  <option value="recently_used">Recently Used</option>
                  <option value="oldest">Oldest</option>
                  <option value="name_asc">Name (A→Z)</option>
                  <option value="name_desc">Name (Z→A)</option>
                </select>
              </div>
              <div className="mt-3">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name..."
                  className="w-full p-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded"
                />
              </div>
              <div className="mt-3 max-h-[50vh] overflow-y-auto space-y-2">
                {savedChatSessions.length === 0 ? (
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    No saved contexts yet.
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
                          className="flex items-center justify-between p-3 rounded bg-gray-100 dark:bg-gray-700"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                              {renameMap[s.id] !== undefined ? (
                                <input
                                  type="text"
                                  value={renameMap[s.id]}
                                  onChange={(e) =>
                                    setRenameMap((m) => ({ ...m, [s.id]: e.target.value }))
                                  }
                                  className="w-full p-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded"
                                />
                              ) : (
                                s.name
                              )}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-300">
                              {new Date(s.timestamp).toLocaleString()} • {messageCount} msgs • Last:{' '}
                              {lastAuthor}
                            </div>
                            {snippet && (
                              <div className="mt-1 text-xs text-gray-700 dark:text-gray-200 line-clamp-2">
                                {snippet}
                                {showEllipsis ? '…' : ''}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 ml-3">
                            <button
                              onClick={() => onLoadSavedChatSession(s.id)}
                              className="px-2 py-1 text-xs rounded bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              Load
                            </button>
                            <button
                              onClick={() => onDuplicateSavedChatSession(s.id)}
                              className="px-2 py-1 text-xs rounded bg-indigo-600 hover:bg-indigo-700 text-white"
                            >
                              Duplicate
                            </button>
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
                                  className="px-2 py-1 text-xs rounded bg-green-600 hover:bg-green-700 text-white"
                                >
                                  Save Name
                                </button>
                                <button
                                  onClick={() =>
                                    setRenameMap((m) => {
                                      const { [s.id]: _, ...rest } = m;
                                      return rest;
                                    })
                                  }
                                  className="px-2 py-1 text-xs rounded bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200"
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => setRenameMap((m) => ({ ...m, [s.id]: s.name }))}
                                className="px-2 py-1 text-xs rounded bg-purple-600 hover:bg-purple-700 text-white"
                              >
                                Rename
                              </button>
                            )}
                            <button
                              onClick={() => {
                                if (window.confirm('Delete this context?'))
                                  onDeleteSavedChatSession(s.id);
                              }}
                              className="px-2 py-1 text-xs rounded bg-red-600 hover:bg-red-700 text-white"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  },
);

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
              : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 shadow-sm border border-gray-100 dark:border-gray-700 rounded-tl-none hover:shadow-md'
          }`}
        >
          {msg.role === 'model' && msg.componentCode && (
            <div className="flex items-center gap-1 mb-3 p-1 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700 w-fit ml-auto">
              <button
                onClick={() => onTogglePreview(msg.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all ${
                  !msg.showPreview
                    ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                <FaCode className="w-3 h-3" />
                CODE
              </button>
              <button
                onClick={() => onTogglePreview(msg.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all ${
                  msg.showPreview
                    ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
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
            <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-inner">
              <ReactPreviewRenderer code={msg.componentCode} />
            </div>
          ) : (
            <div
              className={`prose prose-sm sm:prose-base max-w-none 
                        ${isUser ? 'prose-invert text-white' : 'dark:prose-invert text-gray-800 dark:text-gray-100'}
                        prose-p:leading-relaxed prose-pre:bg-gray-900 prose-pre:text-gray-100
                        `}
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content || ''}</ReactMarkdown>
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
                  className="p-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 transition-all"
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
                    : 'bg-white/80 dark:bg-gray-900/80 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 border-gray-100 dark:border-gray-700'
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
