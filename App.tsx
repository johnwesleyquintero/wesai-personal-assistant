import React, { useState, useCallback, useEffect, useMemo, lazy, Suspense } from 'react';
import type { Theme } from './types';
import { Header } from './components/Header.tsx';
import { LoginPage } from './LoginPage.tsx';
import { Footer } from './components/Footer.tsx';
import { useAppStore, LS_KEY_LOGGED_IN } from './store.ts';
import { useTheme } from './hooks/useTheme.ts';

// Import new components with lazy loading
import { SettingsModal } from './components/SettingsModal.tsx';
import { ResourcesModal, type ResourceType } from './components/ResourcesModal.tsx';
import { Toaster } from 'sonner';
import { LoadingSpinner } from './components/LoadingSpinner.tsx';

const CodeInteractionPanel = lazy(() =>
  import('./components/CodeInteractionPanel.tsx').then((m) => ({
    default: m.CodeInteractionPanel,
  })),
);
const ChatInterfacePanel = lazy(() =>
  import('./components/ChatInterfacePanel.tsx').then((m) => ({ default: m.ChatInterfacePanel })),
);
const AiAgentsPanel = lazy(() =>
  import('./components/AiAgentsPanel.tsx').then((m) => ({ default: m.AiAgentsPanel })),
);

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

  const apiKeySource = useAppStore((state) => state.apiKeySource);
  const isLoggedIn = useAppStore((state) => state.isLoggedIn);
  const activeTab = useAppStore((state) => state.activeTab);
  const initializeActiveApiKey = useAppStore((state) => state.initializeActiveApiKey);
  const handleSaveApiKey = useAppStore((state) => state.handleSaveApiKey);
  const handleRemoveApiKey = useAppStore((state) => state.handleRemoveApiKey);
  const handleLoginSuccess = useAppStore((state) => state.handleLoginSuccess);
  const handleLogout = useAppStore((state) => state.handleLogout);
  const handleTabChange = useAppStore((state) => state.handleTabChange);
  const setIsLoggedIn = useAppStore((state) => state.setIsLoggedIn);

  const codeInteractionActive = useMemo(() => {
    return (
      activeTab === 'review' ||
      activeTab === 'refactor' ||
      activeTab === 'preview' ||
      activeTab === 'generate' ||
      activeTab === 'content'
    );
  }, [activeTab]);

  useEffect(() => {
    const loggedInStatus = localStorage.getItem(LS_KEY_LOGGED_IN);
    if (loggedInStatus === 'true') {
      setIsLoggedIn(true);
      initializeActiveApiKey();
    } else {
      setIsLoggedIn(false);
    }
  }, [initializeActiveApiKey, setIsLoggedIn]);

  const activeApiKey = useAppStore((state) => state.activeApiKey);
  const isApiKeyConfigured = !!activeApiKey;

  if (!isLoggedIn) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-app-secondary transition-colors duration-300">
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
            <Suspense
              fallback={
                <div className="h-full flex items-center justify-center">
                  <LoadingSpinner />
                </div>
              }
            >
              {codeInteractionActive && <CodeInteractionPanel />}

              {activeTab === 'ai-agents' && <AiAgentsPanel />}

              {activeTab === 'chat' && <ChatInterfacePanel />}
            </Suspense>
          </div>
        </main>
      </div>
      <Footer onTabChange={handleTabChange} onOpenResources={handleOpenResourcesModal} />
      <Toaster
        theme={theme as 'light' | 'dark' | 'system'}
        position="top-right"
        expand={false}
        richColors
        closeButton
      />
    </div>
  );
};

export default App;
