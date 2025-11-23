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
    sendOnEnter,
    savedChatSessions,
    initializeSavedChatSessions,
    saveChatSession,
    loadSavedChatSession,
    deleteSavedChatSession,
    renameSavedChatSession,
  } = useAppStore();

  

  

  

  

  

  

  


  return {
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
    sendOnEnter,
    savedChatSessions,
    initializeSavedChatSessions,
    saveChatSession,
    loadSavedChatSession,
    deleteSavedChatSession,
    renameSavedChatSession,
  };
};
