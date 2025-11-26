import { create } from 'zustand';
import type { Chat } from '@google/genai';
import type {
  ActiveTab,
  ApiKeySource,
  Theme,
  ChatMessage,
  AspectRatio,
  SavedChatSession,
  TablesInsert,
  TablesUpdate,
} from './types.ts';
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
import { getEnvVariable } from './utils/env.ts';
import { generateKnowledgeContext } from './services/knowledgeBaseService.ts';
import { signOut, initializeSupabaseClient, getSupabaseClient } from './services/supabaseService';

export const LS_KEY_API = 'geminiApiKey';
export const LS_KEY_STREAM_NOTES = 'showStreamFinishNotes';
export const LS_KEY_SEND_ON_ENTER = 'sendOnEnter';
export const LS_KEY_SAVED_CHATS = 'savedChatSessions';
export const LS_KEY_SAVED_CHATS_SORT = 'savedChatSessionsSort';
export const LS_KEY_LOGGED_IN = 'isLoggedIn';

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
  savedChatSessions: SavedChatSession[];
  activeSavedChatSessionId: string | null;
  savedSessionsSort: 'newest' | 'oldest' | 'name_asc' | 'name_desc';

  // Image generation specific state
  imagePrompt: string;
  generatedImageData: string | null;
  imageError: string | null;

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
  setImageError: (error: string | null) => void;
  setShowStreamFinishNotes: (show: boolean) => void;
  setSendOnEnter: (send: boolean) => void;
  initializeActiveApiKey: () => Promise<void>;
  handleSaveApiKey: (key: string) => void;
  handleRemoveApiKey: () => void;
  handleLoginSuccess: () => void;
  handleLogout: () => Promise<void>;
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
  initializeChatSession: (systemInstruction?: string, savedChatId?: string) => Promise<void>;
  initializeSavedChatSessions: () => Promise<void>;
  saveChatSession: (
    sessionName: string,
    messagesToSave: ChatMessage[],
    sessionId?: string,
  ) => Promise<void>;
  loadSavedChatSession: (sessionId: string) => void;
  deleteSavedChatSession: (sessionId: string) => Promise<void>;
  renameSavedChatSession: (sessionId: string, newName: string) => Promise<void>;
  setActiveSavedChatSessionId: (sessionId: string | null) => void;
  duplicateSavedChatSession: (sessionId: string, newName?: string) => Promise<void>;
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
  savedChatSessions: [],
  activeSavedChatSessionId: null,
  savedSessionsSort: (() => {
    const v = localStorage.getItem(LS_KEY_SAVED_CHATS_SORT);
    const isValidSort = (value: string | null): value is AppState['savedSessionsSort'] => {
      return ['newest', 'oldest', 'name_asc', 'name_desc'].includes(value || '');
    };
    return isValidSort(v) ? v : 'newest';
  })(),

  imagePrompt: '',
  generatedImageData: null,
  imageError: null,

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
  setImageError: (error: string | null) => set({ imageError: error }),
  setShowStreamFinishNotes: (show: boolean) => {
    localStorage.setItem(LS_KEY_STREAM_NOTES, String(show));
    set({ showStreamFinishNotes: show });
  },
  setSendOnEnter: (send: boolean) => {
    localStorage.setItem(LS_KEY_SEND_ON_ENTER, String(send));
    set({ sendOnEnter: send });
  },

  initializeSavedChatSessions: async () => {
    const { isLoggedIn } = get();
    if (!isLoggedIn) {
      set({ savedChatSessions: [] });
      return;
    }

    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('id, name, created_at, messages')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const parsedSessions: SavedChatSession[] = data.map((session) => ({
        id: session.id,
        name: session.name,
        timestamp: new Date(session.created_at).getTime(),
        messages: Array.isArray(session.messages) ? (session.messages as ChatMessage[]) : [],
      }));
      set({ savedChatSessions: parsedSessions });
    } catch (err) {
      console.error('Failed to load saved chat sessions from Supabase:', err);
      set({ savedChatSessions: [], chatError: 'Error loading saved chat sessions.' });
    }
  },

  saveChatSession: async (
    sessionName: string,
    messagesToSave: ChatMessage[],
    sessionId?: string,
  ) => {
    const { isLoggedIn } = get();
    if (!isLoggedIn) {
      console.warn('Cannot save chat session: user not logged in.');
      set({ chatError: 'Login required to save chat sessions.' });
      return;
    }

    try {
      const supabase = getSupabaseClient();
      const { data: userSessionData, error: userSessionError } = await supabase.auth.getSession();

      if (userSessionError) throw userSessionError;
      if (!userSessionData.session?.user.id) throw new Error('User not authenticated.');
      const userId = userSessionData.session.user.id;

      const newSessionData: TablesInsert<'chat_sessions'> = {
        user_id: userId,
        name: sessionName,
        messages: messagesToSave,
      };

      if (sessionId) {
        // Update existing session
        const { error } = await supabase
          .from('chat_sessions')
          .update(newSessionData)
          .eq('id', sessionId);
        if (error) throw error;
      } else {
        // Insert new session
        const { data, error } = await supabase
          .from('chat_sessions')
          .insert(newSessionData)
          .select('id, name, created_at, messages');
        if (error) throw error;
        sessionId = data?.[0].id; // Get the ID of the newly inserted session
      }

      // Refresh local state
      get().initializeSavedChatSessions();
    } catch (err) {
      console.error('Failed to save chat session to Supabase:', err);
      set({ chatError: 'Error saving chat session.' });
    }
  },

  loadSavedChatSession: (sessionId: string) => {
    const { savedChatSessions, initializeChatSession } = get();
    const sessionToLoad = savedChatSessions.find((session) => session.id === sessionId);

    if (sessionToLoad) {
      set({
        chatMessages: sessionToLoad.messages,
        activeChatSession: null,
        activeSavedChatSessionId: sessionId,
      });
      initializeChatSession(undefined, sessionId);
    } else {
      set({ chatError: 'Saved chat session not found.' });
    }
  },

  deleteSavedChatSession: async (sessionId: string) => {
    const { isLoggedIn } = get();
    if (!isLoggedIn) {
      console.warn('Cannot delete chat session: user not logged in.');
      set({ chatError: 'Login required to delete chat sessions.' });
      return;
    }

    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.from('chat_sessions').delete().eq('id', sessionId);
      if (error) throw error;

      // Refresh local state
      get().initializeSavedChatSessions();
      set((state) => ({
        activeSavedChatSessionId:
          state.activeSavedChatSessionId === sessionId ? null : state.activeSavedChatSessionId,
      }));
    } catch (err) {
      console.error('Failed to delete chat session from Supabase:', err);
      set({ chatError: 'Error deleting chat session.' });
    }
  },

  renameSavedChatSession: async (sessionId: string, newName: string) => {
    const { isLoggedIn } = get();
    if (!isLoggedIn) {
      console.warn('Cannot rename chat session: user not logged in.');
      set({ chatError: 'Login required to rename chat sessions.' });
      return;
    }

    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase
        .from('chat_sessions')
        .update({ name: newName } as TablesUpdate<'chat_sessions'>)
        .eq('id', sessionId);
      if (error) throw error;

      // Refresh local state
      get().initializeSavedChatSessions();
    } catch (err) {
      console.error('Failed to rename chat session in Supabase:', err);
      set({ chatError: 'Error renaming chat session.' });
    }
  },

  duplicateSavedChatSession: async (sessionId: string, newName?: string) => {
    const { isLoggedIn } = get();
    if (!isLoggedIn) {
      console.warn('Cannot duplicate chat session: user not logged in.');
      set({ chatError: 'Login required to duplicate chat sessions.' });
      return;
    }

    try {
      const supabase = getSupabaseClient();
      const { data: originalSession, error: fetchError } = await supabase
        .from('chat_sessions')
        .select('name, messages')
        .eq('id', sessionId)
        .single();

      if (fetchError) throw fetchError;
      if (!originalSession) throw new Error('Original session not found.');

      const { data: userSessionData, error: userSessionError } = await supabase.auth.getSession();
      if (userSessionError) throw userSessionError;
      if (!userSessionData.session?.user.id) throw new Error('User not authenticated.');
      const userId = userSessionData.session.user.id;

      const copyData: TablesInsert<'chat_sessions'> = {
        user_id: userId,
        name: newName && newName.trim() ? newName.trim() : `Copy of ${originalSession.name}`,
        messages: originalSession.messages,
      };

      const { error: insertError } = await supabase.from('chat_sessions').insert(copyData);
      if (insertError) throw insertError;

      // Refresh local state
      get().initializeSavedChatSessions();
    } catch (err) {
      console.error('Failed to duplicate chat session in Supabase:', err);
      set({ chatError: 'Error duplicating chat session.' });
    }
  },

  setSavedSessionsSort: (sort: 'newest' | 'oldest' | 'name_asc' | 'name_desc') => {
    localStorage.setItem(LS_KEY_SAVED_CHATS_SORT, sort);
    set({ savedSessionsSort: sort });
  },

  setActiveSavedChatSessionId: (sessionId: string | null) =>
    set({ activeSavedChatSessionId: sessionId }),

  initializeActiveApiKey: async () => {
    initializeSupabaseClient();
    const { data: sessionData, error: sessionError } = await getSupabaseClient().auth.getSession();

    if (sessionError) {
      console.error('Error getting Supabase session:', sessionError.message);
      set({ isLoggedIn: false, error: 'Failed to check login status.' });
    } else if (sessionData.session) {
      set({ isLoggedIn: true });
    } else {
      set({ isLoggedIn: false });
    }

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

    if (get().activeApiKey) {
      get().initializeChatSession();
    }
    // Always attempt to initialize saved sessions, even if not logged in,
    // as the function itself handles the isLoggedIn check now.
    get().initializeSavedChatSessions();
  },

  handleSaveApiKey: (key: string) => {
    if (key.trim()) {
      localStorage.setItem(LS_KEY_API, key);
      set({ activeApiKey: key, apiKeySource: 'ui', error: null, chatError: null });
      initializeGeminiClient(key);
      get().initializeChatSession();
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
      savedChatSessions: [],
      activeSavedChatSessionId: null,
      isLoggedIn: false, // Ensure isLoggedIn is false after API key removal if it implies logout
    });
    clearGeminiClient();
    get().initializeActiveApiKey(); // Re-initialize to handle env API key if present
  },

  handleLoginSuccess: () => {
    // Supabase auth state listener in LoginPage handles setting isLoggedIn
    // This action now primarily ensures other parts of the app state are correctly initialized
    // after a successful login (handled by LoginPage.tsx redirect/callback).
    get().initializeActiveApiKey(); // This will also set isLoggedIn based on Supabase session
    get().initializeChatSession();
    get().initializeSavedChatSessions();
  },

  handleLogout: async () => {
    try {
      await signOut();
      // After signOut, Supabase's onAuthStateChange will trigger a re-render of LoginPage,
      // which will then set isLoggedIn to false via initializeActiveApiKey indirectly.
      // We still clear API key and chat state locally for immediate UI update and safety.
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
        savedChatSessions: [],
        activeSavedChatSessionId: null,
      });
      clearGeminiClient(); // Clear Gemini client on logout
      get().initializeActiveApiKey(); // Re-initialize to ensure clean state
    } catch (err) {
      console.error('Error during logout:', err);
      set({ error: 'Logout failed.' });
    }
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
    const { activeChatSession, activeApiKey, savedChatSessions, activeSavedChatSessionId } = get();
    if (!activeApiKey) {
      set({ chatError: 'API Key is not configured. Please set your API key to use chat.' });
      return;
    }

    if (activeChatSession && !savedChatId) {
      return;
    }

    set({ isLoading: true, chatError: null });
    try {
      const activeProfile = getActiveInstructionProfile();
      const effectiveSystemInstruction =
        systemInstructionOverride ||
        (activeProfile ? activeProfile.instructions : 'Hey there! 👋 How can I help you today?');
      let initialChatMessages: ChatMessage[] = [];

      if (savedChatId) {
        const savedSession = savedChatSessions.find((s) => s.id === savedChatId);
        if (savedSession) {
          initialChatMessages = savedSession.messages;
          set({ chatMessages: initialChatMessages });
        }
      }

      let knowledgeContext = '';
      if (!activeSavedChatSessionId || (activeSavedChatSessionId && savedChatId)) {
        knowledgeContext = generateKnowledgeContext(savedChatSessions);
      }

      const history: { role: 'user' | 'model'; parts: { text: string }[] }[] = [
        { role: 'user', parts: [{ text: effectiveSystemInstruction }] },
        { role: 'model', parts: [{ text: 'Okay, I am ready!' }] },
      ];

      if (knowledgeContext) {
        history.push({ role: 'user', parts: [{ text: knowledgeContext }] });
        history.push({ role: 'model', parts: [{ text: 'Acknowledged previous knowledge.' }] });
      }

      history.push(
        ...initialChatMessages.map((msg) => ({
          role: msg.role === 'user' ? ('user' as const) : ('model' as const),
          parts: [{ text: msg.content }],
        })),
      );

      const session = await startChatSession(effectiveSystemInstruction, history);
      set({ activeChatSession: session, chatMessages: initialChatMessages });
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

      if (state.activeTab === 'image' && tab !== 'image') {
        newState.imagePrompt = '';
      }

      const codeRelatedTabs: ActiveTab[] = [
        'review',
        'refactor',
        'preview',
        'generate',
        'content',
        'custom-instructions',
      ];
      const wasCodeRelated = codeRelatedTabs.includes(state.activeTab);
      const isNowCodeRelated = codeRelatedTabs.includes(tab);

      if (wasCodeRelated && !isNowCodeRelated) {
        newState.code = '';
      }

      return newState;
    });

    if (tab === 'chat') {
      get().initializeChatSession();
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
        const fullRefactorText = `## Refactoring Summary:\n\n`;
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
      set({ imageError: 'Please enter a description for the image.' });
      return;
    }
    set({ isLoading: true, generatedImageData: null, imageError: null });

    try {
      const imageData = await generateImageWithGemini(imagePrompt, aspectRatio, negativePrompt);
      set({ generatedImageData: imageData });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An unknown error occurred during image generation.';
      set({ imageError: `Image Generation Error: ${errorMessage}` });
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
                      content: get().showStreamFinishNotes
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
    set({
      chatMessages: [],
      activeChatSession: null,
      chatError: null,
      activeSavedChatSessionId: null,
    });
    get().initializeChatSession();
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
                      content: get().showStreamFinishNotes
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
