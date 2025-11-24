import { useAppStore } from '../../store';
import { useMemo } from 'react';

export const useCodeInteractionLogic = () => {
  const {
    code,
    feedback,
    isLoading,
    error,
    activeApiKey,
    activeTab,
    handleCodeChange,
    handleClearCodeInput,
    handleSubmitCodeInteraction,
    setError,
  } = useAppStore();

  const codeInteractionActive = useMemo(() => {
    return (
      activeTab === 'review' ||
      activeTab === 'refactor' ||
      activeTab === 'preview' ||
      activeTab === 'generate' ||
      activeTab === 'content'
    );
  }, [activeTab]);

  return {
    code,
    feedback,
    isLoading,
    error,
    activeApiKey,
    activeTab,
    codeInteractionActive,
    handleCodeChange,
    handleClearCodeInput,
    handleSubmitCodeInteraction,
    setError,
  };
};
