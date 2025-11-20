import { useAppStore } from '../../store';
import { useCallback } from 'react';

export const useImageGenerationLogic = () => {
  const {
    imagePrompt,
    generatedImageData,
    isLoading,
    activeApiKey,
    error,
    handleImagePromptChange,
    handleClearImagePrompt,
    handleImageGenerationSubmit,
    setError,
  } = useAppStore();

  const memoizedHandleImagePromptChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    handleImagePromptChange(e);
  }, [handleImagePromptChange]);

  const memoizedHandleClearImagePrompt = useCallback(() => {
    handleClearImagePrompt();
  }, [handleClearImagePrompt]);

  const memoizedHandleImageGenerationSubmit = useCallback((aspectRatio: any, negativePrompt: string) => {
    handleImageGenerationSubmit(aspectRatio, negativePrompt);
  }, [handleImageGenerationSubmit]);

  return {
    imagePrompt,
    generatedImageData,
    isLoading,
    isApiKeyConfigured: !!activeApiKey,
    error,
    setError,
    onPromptChange: memoizedHandleImagePromptChange,
    onClearPrompt: memoizedHandleClearImagePrompt,
    onSubmit: memoizedHandleImageGenerationSubmit,
  };
};
