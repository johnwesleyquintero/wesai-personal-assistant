import { useCallback } from 'react';
import { useAppStore } from '../../store';

export const useChatLogic = () => {
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
  } = useAppStore();

  const memoizedHandleChatInputChange = useCallback((value: string) => {
    handleChatInputChange(value);
  }, [handleChatInputChange]);

  const memoizedHandleClearChatInput = useCallback(() => {
    handleClearChatInput();
  }, [handleClearChatInput]);

  const memoizedHandleChatSubmit = useCallback(() => {
    handleChatSubmit();
  }, [handleChatSubmit]);

  const memoizedHandleNewChat = useCallback(() => {
    handleNewChat();
  }, [handleNewChat]);

  const memoizedHandleRetryChat = useCallback(() => {
    handleRetryChat();
  }, [handleRetryChat]);

  const memoizedHandleCopyChatMessage = useCallback((content: string, messageId: string) => {
    handleCopyChatMessage(content, messageId);
  }, [handleCopyChatMessage]);

  const memoizedHandleTogglePreview = useCallback((messageId: string) => {
    handleTogglePreview(messageId);
  }, [handleTogglePreview]);


  return {
    chatMessages,
    chatInput,
    activeChatSession,
    copiedMessageId,
    chatError,
    handleChatInputChange: memoizedHandleChatInputChange,
    handleClearChatInput: memoizedHandleClearChatInput,
    handleChatSubmit: memoizedHandleChatSubmit,
    handleNewChat: memoizedHandleNewChat,
    handleRetryChat: memoizedHandleRetryChat,
    handleCopyChatMessage: memoizedHandleCopyChatMessage,
    handleTogglePreview: memoizedHandleTogglePreview,
  };
};
