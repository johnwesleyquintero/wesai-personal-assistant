import { create } from 'zustand';
import { Chat } from '@google/genai';
import { ActiveTab, ApiKeySource, Theme, ChatMessage, AspectRatio, SavedChatSession } from './types.ts';
import {
  reviewCodeWithGemini,
  refactorCodeWithGeminiStream,
  getReactComponentPreview,
  generateCodeWithGemini,
  generateContentWithGemini,
  generateImageWithGemini,
  initializeGeminiClient,
  clearGeminiClient,
  startChatSession,
  sendMessageToChatStream,
} from './services/geminiService.ts';
import { getActiveInstructionProfile } from './services/instructionService.ts';
import { getEnvVariable } from './utils/env.ts'; // Import the new utility

export const LS_KEY_API = 'geminiApiKey';
export const LS_KEY_LOGGED_IN = 'isWesAiUserLoggedIn';
export const LS_KEY_STREAM_NOTES = 'showStreamFinishNotes';
export const LS_KEY_SEND_ON_ENTER = 'sendOnEnter';
export const LS_KEY_SAVED_CHATS = 'savedChatSessions'; // New local storage key
export const LS_KEY_SAVED_CHATS_SORT = 'savedChatSessionsSort';

interface AppState {
  // Global state
  code: string;
  feedback: string;
  isLoading: boolean;
  error: string | null;
  activeApiKey: string | null;
  apiKeySource: ApiKeySource;
  isLoggedIn: boolean;
  activeTab: ActiveTab;
  theme: Theme;
  showStreamFinishNotes: boolean;
  sendOnEnter: boolean;

  // Chat specific state
  chatMessages: ChatMessage[];
  chatInput: string;
  activeChatSession: Chat | null;
  copiedMessageId: string | null;
  chatError: string | null;
  savedChatSessions: SavedChatSession[]; // New state for saved chat sessions
  activeSavedChatSessionId: string | null; // ID of the currently loaded saved chat
  savedSessionsSort: 'newest' | 'oldest' | 'name_asc' | 'name_desc';

  // Image generation specific state
  imagePrompt: string;
  generatedImageData: string | null;
  imageError: string | null; // New error state for image generation

  // Actions
  setCode: (code: string) => void;
  setFeedback: (feedback: string) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setActiveApiKey: (key: string | null) => void;
  setApiKeySource: (source: ApiKeySource) => void;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
  setActiveTab: (tab: ActiveTab) => void;
  setTheme: (theme: Theme) => void;
  setChatMessages: (messages: ChatMessage[]) => void;
  setChatInput: (input: string) => void;
  setActiveChatSession: (session: Chat | null) => void;
  setCopiedMessageId: (id: string | null) => void;
  setChatError: (error: string | null) => void;
  setImagePrompt: (prompt: string) => void;
  setGeneratedImageData: (data: string | null) => void;
  setImageError: (error: string | null) => void; // New action for image error
  toggleTheme: () => void;
  setShowStreamFinishNotes: (show: boolean) => void;
  setSendOnEnter: (send: boolean) => void;
  initializeActiveApiKey: () => void;
  handleSaveApiKey: (key: string) => void;
  handleRemoveApiKey: () => void;
  handleLoginSuccess: () => void;
  handleLogout: () => void;
  handleCodeChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleClearCodeInput: () => void;
  handleImagePromptChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleClearImagePrompt: () => void;
  handleChatInputChange: (value: string) => void;
  handleClearChatInput: () => void;
  handleTabChange: (tab: ActiveTab) => Promise<void>;
  handleSubmitCodeInteraction: () => Promise<void>;
  handleImageGenerationSubmit: (aspectRatio: AspectRatio, negativePrompt: string) => Promise<void>;
  extractComponentCode: (markdownContent: string) => string | null;
  handleChatSubmit: () => Promise<void>;
  handleNewChat: () => void;
  handleRetryChat: () => Promise<void>;
  handleCopyChatMessage: (content: string, messageId: string) => void;
  handleTogglePreview: (messageId: string) => void;
  initializeChatSession: (systemInstruction?: string, savedChatId?: string) => Promise<void>; // Modified to accept system instruction and saved chat ID
  initializeSavedChatSessions: () => void; // New action to load saved chat sessions
  saveChatSession: (sessionName: string, messagesToSave: ChatMessage[]) => void;
  loadSavedChatSession: (sessionId: string) => void;
  deleteSavedChatSession: (sessionId: string) => void;
  renameSavedChatSession: (sessionId: string, newName: string) => void;
  setActiveSavedChatSessionId: (sessionId: string | null) => void;
  duplicateSavedChatSession: (sessionId: string, newName?: string) => void;
  setSavedSessionsSort: (sort: 'newest' | 'oldest' | 'name_asc' | 'name_desc') => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  code: '',
  feedback: '',
  isLoading: false,
  error: null,
  activeApiKey: null,
  apiKeySource: 'none',
  isLoggedIn: false,
  activeTab: 'chat',
  theme: (() => {
    const storedTheme = localStorage.getItem('theme') as Theme | null;
    if (storedTheme) return storedTheme;
    return window.matchMedia?.('(prefers-color-scheme: dark)')?.matches ? 'dark' : 'light';
  })(),
  showStreamFinishNotes: (() => {
    const v = localStorage.getItem(LS_KEY_STREAM_NOTES);
    return v === null ? true : v === 'true';
  })(),
  sendOnEnter: (() => {
    const v = localStorage.getItem(LS_KEY_SEND_ON_ENTER);
    return v === null ? true : v === 'true';
  })(),

  chatMessages: [],
  chatInput: '',
  activeChatSession: null,
  copiedMessageId: null,
  chatError: null,
  savedChatSessions: [], // Initialize with empty array
  activeSavedChatSessionId: null, // Initialize as null
  savedSessionsSort: (() => {
    const v = localStorage.getItem(LS_KEY_SAVED_CHATS_SORT);
    return v === 'oldest' || v === 'name_asc' || v === 'name_desc' ? (v as any) : 'newest';
  })(),

  imagePrompt: '',
  generatedImageData: null,
  imageError: null, // Initial state for image error

  // Actions
  setCode: (code: string) => set({ code }),
  setFeedback: (feedback: string) => set({ feedback }),
  setIsLoading: (isLoading: boolean) => set({ isLoading }),
  setError: (error: string | null) => set({ error }),
  setActiveApiKey: (key: string | null) => set({ activeApiKey: key }),
  setApiKeySource: (source: ApiKeySource) => set({ apiKeySource: source }),
  setIsLoggedIn: (isLoggedIn: boolean) => set({ isLoggedIn }),
  setActiveTab: (tab: ActiveTab) => set({ activeTab: tab }),
  setTheme: (theme: Theme) => set({ theme }),
  setChatMessages: (messages: ChatMessage[]) => set({ chatMessages: messages }),
  setChatInput: (input: string) => set({ chatInput: input }),
  setActiveChatSession: (session: Chat | null) => set({ activeChatSession: session }),
  setCopiedMessageId: (id: string | null) => set({ copiedMessageId: id }),
  setChatError: (error: string | null) => set({ chatError: error }),
  setImagePrompt: (prompt: string) => set({ imagePrompt: prompt }),
  setGeneratedImageData: (data: string | null) => set({ generatedImageData: data }),
  setImageError: (error: string | null) => set({ imageError: error }), // Action to set image error
  toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
  setShowStreamFinishNotes: (show: boolean) => {
    localStorage.setItem(LS_KEY_STREAM_NOTES, String(show));
    set({ showStreamFinishNotes: show });
  },
  setSendOnEnter: (send: boolean) => {
    localStorage.setItem(LS_KEY_SEND_ON_ENTER, String(send));
    set({ sendOnEnter: send });
  },

  initializeSavedChatSessions: () => {
    try {
      const storedSessions = localStorage.getItem(LS_KEY_SAVED_CHATS);
      if (storedSessions) {
        const parsedSessions: SavedChatSession[] = JSON.parse(storedSessions);
        set({ savedChatSessions: parsedSessions });
      } else {
        set({ savedChatSessions: [] });
      }
    } catch (err) {
      console.error('Failed to parse saved chat sessions from local storage:', err);
      set({ savedChatSessions: [], chatError: 'Error loading saved chat sessions.' });
    }
  },

  saveChatSession: (sessionName: string, messagesToSave: ChatMessage[]) => {
    const newSession: SavedChatSession = {
      id: `saved-${Date.now()}`,
      name: sessionName,
      timestamp: Date.now(),
      messages: messagesToSave,
    };

    set((state) => {
      const updatedSessions = [...state.savedChatSessions, newSession];
      localStorage.setItem(LS_KEY_SAVED_CHATS, JSON.stringify(updatedSessions));
      return { savedChatSessions: updatedSessions };
    });
  },

  loadSavedChatSession: (sessionId: string) => {
    const { savedChatSessions, initializeChatSession } = get();
    const sessionToLoad = savedChatSessions.find((session) => session.id === sessionId);

    if (sessionToLoad) {
      set({
        chatMessages: sessionToLoad.messages,
        activeChatSession: null, // Clear current session to force re-initialization with new context
        activeSavedChatSessionId: sessionId,
      });
      // Re-initialize chat session with the loaded messages
      initializeChatSession(undefined, sessionId);
    } else {
      set({ chatError: 'Saved chat session not found.' });
    }
  },

  deleteSavedChatSession: (sessionId: string) => {
    set((state) => {
      const updatedSessions = state.savedChatSessions.filter((session) => session.id !== sessionId);
      localStorage.setItem(LS_KEY_SAVED_CHATS, JSON.stringify(updatedSessions));
      return {
        savedChatSessions: updatedSessions,
        activeSavedChatSessionId: state.activeSavedChatSessionId === sessionId ? null : state.activeSavedChatSessionId,
      };
    });
  },

  renameSavedChatSession: (sessionId: string, newName: string) => {
    set((state) => {
      const updatedSessions = state.savedChatSessions.map((s) =>
        s.id === sessionId ? { ...s, name: newName } : s,
      );
      localStorage.setItem(LS_KEY_SAVED_CHATS, JSON.stringify(updatedSessions));
      return { savedChatSessions: updatedSessions };
    });
  },

  duplicateSavedChatSession: (sessionId: string, newName?: string) => {
    set((state) => {
      const original = state.savedChatSessions.find((s) => s.id === sessionId);
      if (!original) return {} as any;
      const copy: SavedChatSession = {
        id: `saved-${Date.now()}`,
        name: newName && newName.trim() ? newName.trim() : `Copy of ${original.name}`,
        timestamp: Date.now(),
        messages: [...original.messages],
      };
      const updated = [...state.savedChatSessions, copy];
      localStorage.setItem(LS_KEY_SAVED_CHATS, JSON.stringify(updated));
      return { savedChatSessions: updated };
    });
  },

  setSavedSessionsSort: (sort: 'newest' | 'oldest' | 'name_asc' | 'name_desc') => {
    localStorage.setItem(LS_KEY_SAVED_CHATS_SORT, sort);
    set({ savedSessionsSort: sort });
  },

  setActiveSavedChatSessionId: (sessionId: string | null) => set({ activeSavedChatSessionId: sessionId }),

  initializeActiveApiKey: () => {
    const storedKey = localStorage.getItem(LS_KEY_API);
    const envApiKey = getEnvVariable('VITE_GEMINI_API_KEY');

    if (storedKey) {
      set({ activeApiKey: storedKey, apiKeySource: 'ui' });
      initializeGeminiClient(storedKey);
    } else if (envApiKey && envApiKey.trim() !== '') {
      set({ activeApiKey: envApiKey, apiKeySource: 'env' });
      initializeGeminiClient(envApiKey);
    } else {
      clearGeminiClient();
      set({ activeApiKey: null, apiKeySource: 'none' });
    }
    // Attempt to initialize chat session after API key is processed
    // This handles initial load and API key changes
    if (get().activeApiKey) {
      get().initializeChatSession();
    }
    get().initializeSavedChatSessions(); // Initialize saved sessions here
  },

  handleSaveApiKey: (key: string) => {
    if (key.trim()) {
      localStorage.setItem(LS_KEY_API, key);
      set({ activeApiKey: key, apiKeySource: 'ui', error: null, chatError: null });
      initializeGeminiClient(key);
      get().initializeChatSession(); // Attempt to initialize chat session after API key is saved
      get().initializeSavedChatSessions(); // Also refresh saved sessions
    }
  },

  handleRemoveApiKey: () => {
    localStorage.removeItem(LS_KEY_API);
    set({
      feedback: '',
      generatedImageData: null,
      error: null,
      chatError: null,
      chatMessages: [],
      activeChatSession: null,
      savedChatSessions: [], // Clear saved sessions on API key removal
      activeSavedChatSessionId: null,
    });
    get().initializeActiveApiKey();
    // Chat session should be cleared, no need to re-initialize here
  },

  handleLoginSuccess: () => {
    localStorage.setItem(LS_KEY_LOGGED_IN, 'true');
    set({ isLoggedIn: true });
    get().initializeActiveApiKey();
    get().initializeChatSession(); // Attempt to initialize chat session after login
    get().initializeSavedChatSessions(); // Also refresh saved sessions
  },

  handleLogout: () => {
    localStorage.removeItem(LS_KEY_LOGGED_IN);
    localStorage.removeItem(LS_KEY_API);
    set({
      isLoggedIn: false,
      feedback: '',
      generatedImageData: null,
      error: null,
      chatError: null,
      chatMessages: [],
      chatInput: '',
      activeChatSession: null,
      code: '',
      imagePrompt: '',
      savedChatSessions: [], // Clear saved sessions on logout
      activeSavedChatSessionId: null,
    });
    get().initializeActiveApiKey();
    // No chat session to initialize after logout
  },

  handleCodeChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    set({ code: event.target.value });
  },

  handleClearCodeInput: () => {
    set({ code: '' });
  },

  handleImagePromptChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    set({ imagePrompt: event.target.value });
  },

  handleClearImagePrompt: () => {
    set({ imagePrompt: '' });
  },

  handleChatInputChange: (value: string) => {
    set({ chatInput: value });
  },

  handleClearChatInput: () => {
    set({ chatInput: '' });
  },

  initializeChatSession: async (systemInstructionOverride?: string, savedChatId?: string) => {
    const { activeChatSession, activeApiKey, savedChatSessions } = get();
    if (!activeApiKey) {
      set({ chatError: 'API Key is not configured. Please set your API key to use chat.' });
      return;
    }

    // If an existing session is active AND we're not loading a new saved chat, don't re-initialize
    if (activeChatSession && !savedChatId) {
      return;
    }

    set({ isLoading: true, chatError: null });
    try {
      const activeProfile = getActiveInstructionProfile();
      let effectiveSystemInstruction = systemInstructionOverride || (activeProfile ? activeProfile.instructions : 'Hey there! 👋 How can I help you today?');
      let initialChatMessages: ChatMessage[] = [];

      if (savedChatId) {
        const savedSession = savedChatSessions.find(s => s.id === savedChatId);
        if (savedSession) {
          initialChatMessages = savedSession.messages;
          set({ chatMessages: initialChatMessages }); // Update chatMessages state with loaded messages
        }
      }

      // Prepare history for the new session, including system instruction and initial messages
      const history: { role: 'user' | 'model'; parts: { text: string }[] }[] = [
        { role: 'user', parts: [{ text: effectiveSystemInstruction }] },
        { role: 'model', parts: [{ text: 'Okay, I am ready!' }] },
        ...initialChatMessages.map((msg) => ({
          role: msg.role === 'user' ? ('user' as const) : ('model' as const),
          parts: [{ text: msg.content }],
        })),
      ];
      
      const session = await startChatSession(effectiveSystemInstruction, history);
      set({ activeChatSession: session, chatMessages: initialChatMessages }); // Set chat messages from loaded session

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      set({ chatError: `Failed to start chat session: ${errorMessage}` });
      console.error(err);
    } finally {
      set({ isLoading: false });
    }
  },

  handleTabChange: async (tab: ActiveTab) => {
    set((state) => {
      const newState: Partial<AppState> = {
        activeTab: tab,
        feedback: '',
        error: null,
        chatError: null,
        generatedImageData: null,
      };

      // Clear image prompt only if leaving the image tab
      if (state.activeTab === 'image' && tab !== 'image') {
        newState.imagePrompt = '';
      }

      // Clear code input if switching to a non-code-related tab from a code-related tab
      const codeRelatedTabs: ActiveTab[] = ['review', 'refactor', 'preview', 'generate', 'content', 'custom-instructions'];
      const wasCodeRelated = codeRelatedTabs.includes(state.activeTab);
      const isNowCodeRelated = codeRelatedTabs.includes(tab);

      if (wasCodeRelated && !isNowCodeRelated) {
        newState.code = '';
      }

      return newState;
    });

    if (tab === 'chat') {
      get().initializeChatSession(); // Use the new action
    }
  },

  handleSubmitCodeInteraction: async () => {
    set({ isLoading: true, feedback: '', error: null });
    const { activeTab, code } = get();

    try {
      if (activeTab === 'review') {
        const result = await reviewCodeWithGemini(code);
        set({ feedback: result });
      } else if (activeTab === 'refactor') {
        let fullRefactorText = `## Refactoring Summary:\n\n`;
        set({ feedback: fullRefactorText });
        for await (const part of refactorCodeWithGeminiStream(code)) {
          if (part.type === 'chunk' && part.data) {
            set((state: AppState) => ({ feedback: state.feedback + (part.data || '') }));
          } else if (part.type === 'error' && part.message) {
            set({ error: `Refactoring error: ${part.message}` });
            break;
          } else if (part.type === 'finish_reason') {
            console.warn('Refactoring stream finished:', part.reason, part.safetyRatings);
            if (part.reason === 'SAFETY' || part.reason === 'OTHER') {
              set({
                error: `Refactoring was stopped. Reason: ${part.reason}. Please check the content or try again.`,
              });
            }
            break;
          }
        }
      } else if (activeTab === 'preview') {
        const result = await getReactComponentPreview(code);
        set({ feedback: result });
      } else if (activeTab === 'generate') {
        const result = await generateCodeWithGemini(code);
        set({ feedback: result });
      } else if (activeTab === 'content') {
        const result = await generateContentWithGemini(code);
        set({ feedback: result });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      set({ error: `Error during ${activeTab}: ${errorMessage}` });
      console.error(`Error in ${activeTab}:`, err);
    } finally {
      set({ isLoading: false });
    }
  },

  handleImageGenerationSubmit: async (aspectRatio: AspectRatio, negativePrompt: string) => {
    const { imagePrompt } = get();
    if (!imagePrompt.trim()) {
      set({ imageError: 'Please enter a description for the image.' }); // Use imageError
      return;
    }
    set({ isLoading: true, generatedImageData: null, imageError: null }); // Use imageError

    try {
      const imageData = await generateImageWithGemini(imagePrompt, aspectRatio, negativePrompt);
      set({ generatedImageData: imageData });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An unknown error occurred during image generation.';
      set({ imageError: `Image Generation Error: ${errorMessage}` }); // Use imageError
      console.error('Image generation error:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  extractComponentCode: (markdownContent: string): string | null => {
    const codeBlockRegex = /```(?:tsx|jsx|ts|typescript)?\s*\n([\s\S]+?)\n```/;
    const match = markdownContent.match(codeBlockRegex);
    if (match && match[1] && match[1].trim() !== '') {
      return match[1];
    }
    return null;
  },

  handleChatSubmit: async () => {
    const { chatInput, activeChatSession, extractComponentCode: extractCode } = get();
    const userMessageId = `user-${Date.now()}`;
    const modelMessageId = `model-${Date.now() + 1}`;

    set((state: AppState) => ({
      chatMessages: [
        ...state.chatMessages,
        { id: userMessageId, role: 'user', content: chatInput },
      ],
    }));
    const currentInput = chatInput;
    set({ chatInput: '', isLoading: true, chatError: null });

    set((state: AppState) => ({
      chatMessages: [
        ...state.chatMessages,
        { id: modelMessageId, role: 'model', content: '', componentCode: null, showPreview: false },
      ],
    }));

    try {
      if (!activeChatSession) throw new Error('Chat session not active.');
      const stream = await sendMessageToChatStream(activeChatSession, currentInput);
      let currentModelContent = '';
      for await (const chunk of stream) {
        const chunkText = chunk.text;
        const finishReason = chunk.candidates?.[0]?.finishReason;
        const safetyRatings = chunk.candidates?.[0]?.safetyRatings;

        if (chunkText) {
          currentModelContent += chunkText;
          const componentCode = extractCode(currentModelContent);
          set((state: AppState) => ({
            chatMessages: state.chatMessages.map((msg: ChatMessage) =>
              msg.id === modelMessageId
                ? { ...msg, content: currentModelContent, componentCode: componentCode }
                : msg,
            ),
          }));
        }
        if (finishReason) {
          console.warn('Chat stream finished:', finishReason, safetyRatings);
          const finalComponentCode = extractCode(currentModelContent);
          if (finishReason !== 'STOP' && finishReason !== 'MAX_TOKENS') {
            set((state: AppState) => ({
              chatMessages: state.chatMessages.map((msg: ChatMessage) =>
                msg.id === modelMessageId
                  ? {
                      ...msg,
                      content:
                        get().showStreamFinishNotes
                          ? msg.content + `\n\n*(Stream finished: ${finishReason})*`
                          : msg.content,
                      componentCode: finalComponentCode,
                    }
                  : msg,
              ),
            }));
            if (finishReason === 'SAFETY') {
              set({ chatError: 'The response was blocked due to safety settings.' });
            }
          } else {
            set((state: AppState) => ({
              chatMessages: state.chatMessages.map((msg: ChatMessage) =>
                msg.id === modelMessageId ? { ...msg, componentCode: finalComponentCode } : msg,
              ),
            }));
          }
          break;
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      set({ chatError: `Chat error: ${errorMessage}` });
      console.error('Chat submit error:', err);
      set((state: AppState) => ({
        chatMessages: state.chatMessages.map((msg: ChatMessage) =>
          msg.id === modelMessageId
            ? { ...msg, content: `*(Error: ${errorMessage})*`, componentCode: null }
            : msg,
        ),
      }));
    } finally {
      set({ isLoading: false });
    }
  },

  handleNewChat: () => {
    set({ chatMessages: [], activeChatSession: null, chatError: null, activeSavedChatSessionId: null });
    get().initializeChatSession(); // Initialize new session immediately
  },

  handleRetryChat: async () => {
    const { chatMessages, activeChatSession, extractComponentCode: extractCode } = get();
    const lastUserMessage = chatMessages.findLast((msg) => msg.role === 'user');

    if (!lastUserMessage) {
      set({ chatError: 'No previous message to retry.' });
      return;
    }

    set((state: AppState) => ({
      chatMessages: state.chatMessages.filter(
        (msg: ChatMessage) => msg.id !== state.chatMessages[state.chatMessages.length - 1]?.id,
      ),
    }));

    set({ isLoading: true, chatError: null });

    const modelMessageId = `model-${Date.now() + 1}`;
    set((state: AppState) => ({
      chatMessages: [
        ...state.chatMessages,
        { id: modelMessageId, role: 'model', content: '', componentCode: null, showPreview: false },
      ],
    }));

    try {
      if (!activeChatSession) throw new Error('Chat session not active for retry.');
      const stream = await sendMessageToChatStream(
        activeChatSession,
        lastUserMessage.content,
        true,
      );
      let currentModelContent = '';
      for await (const chunk of stream) {
        const chunkText = chunk.text;
        const finishReason = chunk.candidates?.[0]?.finishReason;
        const safetyRatings = chunk.candidates?.[0]?.safetyRatings;

        if (chunkText) {
          currentModelContent += chunkText;
          const componentCode = extractCode(currentModelContent);
          set((state: AppState) => ({
            chatMessages: state.chatMessages.map((msg: ChatMessage) =>
              msg.id === modelMessageId
                ? { ...msg, content: currentModelContent, componentCode: componentCode }
                : msg,
            ),
          }));
        }
        if (finishReason) {
          console.warn('Chat stream finished (retry):', finishReason, safetyRatings);
          const finalComponentCode = extractCode(currentModelContent);
          if (finishReason !== 'STOP' && finishReason !== 'MAX_TOKENS') {
            set((state: AppState) => ({
              chatMessages: state.chatMessages.map((msg: ChatMessage) =>
                msg.id === modelMessageId
                  ? {
                      ...msg,
                      content:
                        get().showStreamFinishNotes
                          ? msg.content + `\n\n*(Stream finished: ${finishReason})*`
                          : msg.content,
                      componentCode: finalComponentCode,
                    }
                  : msg,
              ),
            }));
            if (finishReason === 'SAFETY') {
              set({ chatError: 'The response was blocked due to safety settings during retry.' });
            }
          } else {
            set((state: AppState) => ({
              chatMessages: state.chatMessages.map((msg: ChatMessage) =>
                msg.id === modelMessageId ? { ...msg, componentCode: finalComponentCode } : msg,
              ),
            }));
          }
          break;
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      set({ chatError: `Retry chat error: ${errorMessage}` });
      console.error('Retry chat submit error:', err);
      set((state: AppState) => ({
        chatMessages: state.chatMessages.map((msg: ChatMessage) =>
          msg.id === modelMessageId
            ? { ...msg, content: `*(Error: ${errorMessage})*`, componentCode: null }
            : msg,
        ),
      }));
    } finally {
      set({ isLoading: false });
    }
  },

  handleCopyChatMessage: (content: string, messageId: string) => {
    navigator.clipboard
      .writeText(content)
      .then(() => {
        set({ copiedMessageId: messageId });
        setTimeout(() => set({ copiedMessageId: null }), 2000);
      })
      .catch((err) => {
        console.error('Failed to copy chat message: ', err);
        set({ chatError: 'Failed to copy message to clipboard.' });
      });
  },

  handleTogglePreview: (messageId: string) => {
    set((state) => ({
      chatMessages: state.chatMessages.map((msg) =>
        msg.id === messageId ? { ...msg, showPreview: !msg.showPreview } : msg,
      ),
    }));
  },
}));
