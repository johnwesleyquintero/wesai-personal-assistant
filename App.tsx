import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header.tsx';
import { LoginPage } from './LoginPage.tsx';
import { useAppStore } from './store.ts';
import { useTheme } from './components/hooks/useTheme.ts';
import { useChatLogic } from './components/hooks/useChatLogic.ts';
import { useCodeInteractionLogic } from './components/hooks/useCodeInteractionLogic.ts';
import { useImageGenerationLogic } from './components/hooks/useImageGenerationLogic.ts';

// Import new components
import { SettingsModal } from './components/SettingsModal.tsx';
import { TabNavigation } from './components/TabNavigation.tsx';
import { CodeInteractionPanel } from './components/CodeInteractionPanel.tsx';
import { ChatInterfacePanel } from './components/ChatInterfacePanel.tsx';
import { DocumentationViewerPanel } from './components/DocumentationViewerPanel.tsx';
import { ImageGenerationPanel } from './components/ImageGenerationPanel.tsx';

const App: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const handleOpenSettingsModal = useCallback(() => setIsSettingsModalOpen(true), []);
  const handleCloseSettingsModal = useCallback(() => setIsSettingsModalOpen(false), []);

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
    activeChatSession,
    copiedMessageId,
    chatError,
    handleChatInputChange,
    handleClearChatInput,
    handleChatSubmit,
    handleNewChat,
    handleRetryChat,
    handleCopyChatMessage,
    handleTogglePreview,
  } = useChatLogic();

  const {
    imagePrompt,
    generatedImageData,
    onPromptChange: handleImagePromptChange,
    onClearPrompt: handleClearImagePrompt,
    onSubmit: handleImageGenerationSubmit,
  } = useImageGenerationLogic();


  useEffect(() => {
    const loggedInStatus = localStorage.getItem('isWesAiUserLoggedIn');
    if (loggedInStatus === 'true') {
      setIsLoggedIn(true);
      initializeActiveApiKey();
    } else {
      setIsLoggedIn(false);
    }
  }, [initializeActiveApiKey]);

  const isApiKeyConfigured = !!activeApiKey;

  if (!isLoggedIn) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} currentTheme={theme} />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center px-4 pt-0 sm:px-6">
      <div className="w-full sm:max-w-5xl">
        <Header
          title="WesAI Personal Assistant"
          toggleTheme={toggleTheme}
          currentTheme={theme}
          onSettingsClick={handleOpenSettingsModal}
        />

        <SettingsModal
          isOpen={isSettingsModalOpen}
          onClose={handleCloseSettingsModal}
          onSaveKey={handleSaveApiKey}
          onRemoveKey={handleRemoveApiKey}
          isKeySet={isApiKeyConfigured}
          currentKeySource={apiKeySource}
          onLogout={handleLogout}
          theme={theme}
          toggleTheme={toggleTheme}
        />

        <TabNavigation
          activeTab={activeTab}
          onTabChange={handleTabChange}
          tabs={[
            { id: 'chat', label: 'Chat' },
            { id: 'content', label: 'Generate Content' },
            { id: 'image', label: 'Image Generation' },
          ]}
        />

        <main className="space-y-6">
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

          {activeTab === 'image' && (
            <ImageGenerationPanel
              prompt={imagePrompt}
              onPromptChange={handleImagePromptChange}
              onClearPrompt={handleClearImagePrompt}
              onSubmit={handleImageGenerationSubmit}
              isLoading={isLoading}
              isApiKeyConfigured={isApiKeyConfigured}
              imageData={generatedImageData}
              error={error}
              setError={setError}
            />
          )}

          {activeTab === 'chat' && (
            <ChatInterfacePanel
              chatMessages={chatMessages}
              chatInput={chatInput}
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
            />
          )}
        </main>
        <footer className="text-center mt-12 py-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            WesAI Personal Assistant | Powered by Google Gemini
          </p>
        </footer>
      </div>
    </div>
  );
};

export default App;
