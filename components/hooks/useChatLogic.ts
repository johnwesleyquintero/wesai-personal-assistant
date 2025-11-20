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
  };
};
