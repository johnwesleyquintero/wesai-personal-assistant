import { useAppStore } from '../../store';
import { ActiveTab } from '../../types';
import { useCallback, useMemo } from 'react';

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

  const memoizedHandleCodeChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    handleCodeChange(e);
  }, [handleCodeChange]);

  const memoizedHandleClearCodeInput = useCallback(() => {
    handleClearCodeInput();
  }, [handleClearCodeInput]);

  const memoizedHandleSubmitCodeInteraction = useCallback(() => {
    handleSubmitCodeInteraction();
  }, [handleSubmitCodeInteraction]);

  return {
    code,
    feedback,
    isLoading,
    error,
    activeApiKey,
    activeTab,
    codeInteractionActive,
    handleCodeChange: memoizedHandleCodeChange,
    handleClearCodeInput: memoizedHandleClearCodeInput,
    handleSubmitCodeInteraction: memoizedHandleSubmitCodeInteraction,
    setError,
  };
};
