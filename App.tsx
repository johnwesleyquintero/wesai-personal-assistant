import React, { useState, useCallback, useEffect } from 'react';
import type { Theme } from './types';
import { Header } from './components/Header.tsx';
import { LoginPage } from './LoginPage.tsx';
import { Footer } from './components/Footer.tsx';
import { useAppStore, LS_KEY_LOGGED_IN } from './store.ts';
import { useTheme } from './components/hooks/useTheme.ts';
import { useChatLogic } from './components/hooks/useChatLogic.ts';
import { useCodeInteractionLogic } from './components/hooks/useCodeInteractionLogic.ts';

// Import new components
import { SettingsModal } from './components/SettingsModal.tsx';
import { ResourcesModal, type ResourceType } from './components/ResourcesModal.tsx';
import { CodeInteractionPanel } from './components/CodeInteractionPanel.tsx';
import { ChatInterfacePanel } from './components/ChatInterfacePanel.tsx';
import { AiAgentsPanel } from './components/AiAgentsPanel.tsx';
import { ToastContainer } from './components/Toast.tsx';

const App: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [resourcesModal, setResourcesModal] = useState<{ isOpen: boolean; type: ResourceType }>({
    isOpen: false,
    type: 'getting-started',
  });

  const handleOpenSettingsModal = useCallback(() => setIsSettingsModalOpen(true), []);
  const handleCloseSettingsModal = useCallback(() => setIsSettingsModalOpen(false), []);

  const handleOpenResourcesModal = useCallback((type: ResourceType) => {
    setResourcesModal({ isOpen: true, type });
  }, []);

  const handleCloseResourcesModal = useCallback(() => {
    setResourcesModal((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const {
    apiKeySource,
    isLoggedIn,
    activeTab,
    initializeActiveApiKey,
    handleSaveApiKey,
    handleRemoveApiKey,
    handleLoginSuccess,
    handleLogout,
    handleTabChange,
    setIsLoggedIn,
  } = useAppStore();

  const {
    code,
    feedback,
    isLoading,
    error,
    activeApiKey,
    codeInteractionActive,
    handleCodeChange,
    handleClearCodeInput,
    handleSubmitCodeInteraction,
    setError,
  } = useCodeInteractionLogic();

  const {
    chatMessages,
    chatInput,
    chatImage,
    activeChatSession,
    copiedMessageId,
    chatError,
    handleChatInputChange,
    handleClearChatInput,
    handleChatSubmit,
    setChatImage,
    handleNewChat,
    handleRetryChat,
    handleCopyChatMessage,
    handleTogglePreview,
    sendOnEnter,
    savedChatSessions,
    initializeSavedChatSessions,
    saveChatSession,
    loadSavedChatSession,
    deleteSavedChatSession,
    renameSavedChatSession,
    duplicateSavedChatSession,
    savedSessionsSort,
    setSavedSessionsSort,
  } = useChatLogic();

  useEffect(() => {
    const loggedInStatus = localStorage.getItem(LS_KEY_LOGGED_IN);
    if (loggedInStatus === 'true') {
      setIsLoggedIn(true);
      initializeActiveApiKey();
    } else {
      setIsLoggedIn(false);
    }
  }, [initializeActiveApiKey, setIsLoggedIn]);

  const isApiKeyConfigured = !!activeApiKey;

  if (!isLoggedIn) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-[#0B0F1A] transition-colors duration-300">
      <Header
        toggleTheme={toggleTheme}
        currentTheme={theme as Theme}
        onSettingsClick={handleOpenSettingsModal}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        tabs={[
          { id: 'chat', label: 'Chat Assistant' },
          { id: 'content', label: 'Code Studio' },
          { id: 'ai-agents', label: 'AI Agents' },
        ]}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={handleCloseSettingsModal}
        onSaveKey={handleSaveApiKey}
        onRemoveKey={handleRemoveApiKey}
        isKeySet={isApiKeyConfigured}
        currentKeySource={apiKeySource}
        onLogout={handleLogout}
      />

      <ResourcesModal
        isOpen={resourcesModal.isOpen}
        onClose={handleCloseResourcesModal}
        type={resourcesModal.type}
      />

      <div className="flex-grow flex flex-col">
        <main className="flex-grow w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="h-full animate-in fade-in slide-in-from-bottom-4 duration-700">
            {codeInteractionActive && (
              <CodeInteractionPanel
                activeTab={activeTab as 'review' | 'refactor' | 'preview' | 'generate' | 'content'}
                code={code}
                onCodeChange={handleCodeChange}
                onClearInput={handleClearCodeInput}
                onSubmit={handleSubmitCodeInteraction}
                isLoading={isLoading}
                isApiKeyConfigured={isApiKeyConfigured}
                feedback={feedback}
                error={error}
                setError={setError}
              />
            )}

            {activeTab === 'ai-agents' && <AiAgentsPanel />}

            {activeTab === 'chat' && (
              <ChatInterfacePanel
                chatMessages={chatMessages}
                chatInput={chatInput}
                chatImage={chatImage}
                onChatImageChange={setChatImage}
                onChatInputChange={handleChatInputChange}
                onClearChatInput={handleClearChatInput}
                onChatSubmit={handleChatSubmit}
                isLoading={isLoading}
                isApiKeyConfigured={isApiKeyConfigured}
                isChatSessionActive={!!activeChatSession}
                onCopyChatMessage={handleCopyChatMessage}
                onTogglePreview={handleTogglePreview}
                copiedMessageId={copiedMessageId}
                error={chatError}
                onNewChat={handleNewChat}
                onRetryChat={handleRetryChat}
                sendOnEnter={sendOnEnter}
                savedChatSessions={savedChatSessions}
                onInitializeSavedChatSessions={initializeSavedChatSessions}
                onSaveChatSession={saveChatSession}
                onLoadSavedChatSession={loadSavedChatSession}
                onDeleteSavedChatSession={deleteSavedChatSession}
                onRenameSavedChatSession={renameSavedChatSession}
                onDuplicateSavedChatSession={duplicateSavedChatSession}
                savedSessionsSort={savedSessionsSort}
                onSetSavedSessionsSort={setSavedSessionsSort}
              />
            )}
          </div>
        </main>
      </div>
      <Footer onTabChange={handleTabChange} onOpenResources={handleOpenResourcesModal} />
      <ToastContainer />
    </div>
  );
};

export default App;
