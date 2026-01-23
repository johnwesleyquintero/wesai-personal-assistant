import { useAppStore } from '../../store';

export const useChatLogic = () => {
  const chatMessages = useAppStore((state) => state.chatMessages);
  const chatInput = useAppStore((state) => state.chatInput);
  const chatImage = useAppStore((state) => state.chatImage);
  const activeChatSession = useAppStore((state) => state.activeChatSession);
  const copiedMessageId = useAppStore((state) => state.copiedMessageId);
  const chatError = useAppStore((state) => state.chatError);
  const isLoading = useAppStore((state) => state.isLoading);
  const handleChatInputChange = useAppStore((state) => state.handleChatInputChange);
  const handleClearChatInput = useAppStore((state) => state.handleClearChatInput);
  const handleChatSubmit = useAppStore((state) => state.handleChatSubmit);
  const setChatImage = useAppStore((state) => state.setChatImage);
  const handleNewChat = useAppStore((state) => state.handleNewChat);
  const handleRetryChat = useAppStore((state) => state.handleRetryChat);
  const handleCopyChatMessage = useAppStore((state) => state.handleCopyChatMessage);
  const handleTogglePreview = useAppStore((state) => state.handleTogglePreview);
  const sendOnEnter = useAppStore((state) => state.sendOnEnter);
  const savedChatSessions = useAppStore((state) => state.savedChatSessions);
  const initializeSavedChatSessions = useAppStore((state) => state.initializeSavedChatSessions);
  const saveChatSession = useAppStore((state) => state.saveChatSession);
  const loadSavedChatSession = useAppStore((state) => state.loadSavedChatSession);
  const deleteSavedChatSession = useAppStore((state) => state.deleteSavedChatSession);
  const renameSavedChatSession = useAppStore((state) => state.renameSavedChatSession);
  const duplicateSavedChatSession = useAppStore((state) => state.duplicateSavedChatSession);
  const savedSessionsSort = useAppStore((state) => state.savedSessionsSort);
  const setSavedSessionsSort = useAppStore((state) => state.setSavedSessionsSort);

  return {
    chatMessages,
    chatInput,
    chatImage,
    activeChatSession,
    copiedMessageId,
    chatError,
    isLoading,
    handleChatInputChange,
    handleClearChatInput,
    handleChatSubmit,
    setChatImage,
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
    duplicateSavedChatSession,
    savedSessionsSort,
    setSavedSessionsSort,
  };
};
