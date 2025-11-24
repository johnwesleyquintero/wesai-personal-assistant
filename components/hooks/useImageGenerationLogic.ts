import { useAppStore } from '../../store';
import { useCallback } from 'react';
import { AspectRatio } from '../../types';

export const useImageGenerationLogic = () => {
  const {
    imagePrompt,
    generatedImageData,
    isLoading,
    activeApiKey,
    imageError,
    handleImagePromptChange,
    handleClearImagePrompt,
    handleImageGenerationSubmit,
    setImageError,
  } = useAppStore();

  const memoizedHandleImagePromptChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      handleImagePromptChange(e);
    },
    [handleImagePromptChange],
  );

  const memoizedHandleClearImagePrompt = useCallback(() => {
    handleClearImagePrompt();
  }, [handleClearImagePrompt]);

  const memoizedHandleImageGenerationSubmit = useCallback(
    (aspectRatio: AspectRatio, negativePrompt: string) => {
      handleImageGenerationSubmit(aspectRatio, negativePrompt);
    },
    [handleImageGenerationSubmit],
  );

  return {
    imagePrompt,
    generatedImageData,
    isLoading,
    isApiKeyConfigured: !!activeApiKey,
    imageError,
    setImageError,
    onPromptChange: memoizedHandleImagePromptChange,
    onClearPrompt: memoizedHandleClearImagePrompt,
    onSubmit: memoizedHandleImageGenerationSubmit,
  };
};
