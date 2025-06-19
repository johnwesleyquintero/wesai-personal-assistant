import React, { useEffect } from 'react';
import { Header } from './components/Header.tsx';
import { LoginPage } from './LoginPage.tsx';
import { useAppStore } from './store.ts';

// Import new components
import { ApiKeySection } from './components/ApiKeySection.tsx';
import { TabNavigation } from './components/TabNavigation.tsx';
import { CodeInteractionPanel } from './components/CodeInteractionPanel.tsx';
import { ChatInterfacePanel } from './components/ChatInterfacePanel.tsx';
import { DocumentationViewerPanel } from './components/DocumentationViewerPanel.tsx';
import { ImageGenerationPanel } from './components/ImageGenerationPanel.tsx';
import CustomInstructionsPanel from './components/CustomInstructionsPanel.tsx';

const App: React.FC = () => {
  const {
    code,
    feedback,
    isLoading,
    error,
    activeApiKey,
    apiKeySource,
    isLoggedIn,
    activeTab,
    theme,
    chatMessages,
    chatInput,
    activeChatSession,
    copiedMessageId,
    chatError,
    imagePrompt,
    generatedImageData,
    toggleTheme,
    initializeActiveApiKey,
    handleSaveApiKey,
    handleRemoveApiKey,
    handleLoginSuccess,
    handleLogout,
    handleCodeChange,
    handleClearCodeInput,
    handleImagePromptChange,
    handleClearImagePrompt,
    handleChatInputChange,
    handleClearChatInput,
    handleTabChange,
    handleSubmitCodeInteraction,
    handleImageGenerationSubmit,
    handleChatSubmit,
    handleNewChat,
    handleRetryChat,
    handleCopyChatMessage,
    handleTogglePreview,
    setError,
    // setCode,
    // setFeedback,
    // setIsLoading,
    // setActiveApiKey,
    // setApiKeySource,
    // setIsLoggedIn,
    // setActiveTab,
    // setTheme,
    // setChatMessages,
    // setChatInput,
    // setActiveChatSession,
    // setCopiedMessageId,
    // setChatError,
    // setImagePrompt,
    // setGeneratedImageData,
  } = useAppStore();

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const loggedInStatus = localStorage.getItem('isWesAiUserLoggedIn');
    if (loggedInStatus === 'true') {
      useAppStore.getState().setIsLoggedIn(true);
      initializeActiveApiKey();
    } else {
      useAppStore.getState().setIsLoggedIn(false);
    }
  }, [initializeActiveApiKey]);

  const isApiKeyConfigured = !!activeApiKey;

  if (!isLoggedIn) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} currentTheme={theme} />;
  }

  const codeInteractionActive =
    activeTab === 'review' ||
    activeTab === 'refactor' ||
    activeTab === 'preview' ||
    activeTab === 'generate' ||
    activeTab === 'content';

  return (
    <div className="min-h-screen flex flex-col items-center px-4 pt-0 sm:px-6">
      <div className="w-full sm:max-w-5xl">
        <Header title="WesAI Personal Assistant" toggleTheme={toggleTheme} currentTheme={theme} />

        <ApiKeySection
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
            { id: 'custom-instructions', label: 'Custom Instructions' },
            { id: 'documentation', label: 'Documentation' },
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

          {activeTab === 'custom-instructions' && <CustomInstructionsPanel />}

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

          {activeTab === 'documentation' && <DocumentationViewerPanel />}
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
