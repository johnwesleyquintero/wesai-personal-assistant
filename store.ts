import { create } from 'zustand';
import type { Chat } from '@google/genai';
import type {
  ActiveTab,
  ApiKeySource,
  ChatMessage,
  SavedChatSession,
  CustomInstructionProfile,
} from './types.ts';
import {
  reviewCodeWithGemini,
  refactorCodeWithGeminiStream,
  getReactComponentPreview,
  generateCodeWithGemini,
  generateContentWithGemini,
  initializeGeminiClient,
  clearGeminiClient,
  startChatSession,
  sendMessageToChatStream,
} from './services/geminiService.ts';
import {
  getActiveInstructionProfile,
  getProfiles,
  saveProfile,
  deleteProfile,
  setActiveProfile,
} from './services/instructionService.ts';
import { getEnvVariable } from './utils/env.ts';
import { generateKnowledgeContext } from './services/knowledgeBaseService.ts';
import { updateChatMessageById } from './utils/storeUtils';

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
  showStreamFinishNotes: boolean;
  sendOnEnter: boolean;

  // Chat specific state
  chatMessages: ChatMessage[];
  chatInput: string;
  chatImage: string | null; // Added: Current image to send
  activeChatSession: Chat | null;
  copiedMessageId: string | null;
  abortController: AbortController | null;
  chatError: string | null;
  savedChatSessions: SavedChatSession[];
  activeSavedChatSessionId: string | null;
  savedSessionsSort: 'newest' | 'oldest' | 'name_asc' | 'name_desc';

  // AI Agents state
  instructionProfiles: CustomInstructionProfile[];
  activeInstructionProfileId: string | null;

  // Actions
  setCode: (code: string) => void;
  setFeedback: (feedback: string) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setActiveApiKey: (key: string | null) => void;
  setApiKeySource: (source: ApiKeySource) => void;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
  setActiveTab: (tab: ActiveTab) => void;
  setChatMessages: (messages: ChatMessage[]) => void;
  setChatInput: (input: string) => void;
  setChatImage: (image: string | null) => void; // Added
  setActiveChatSession: (session: Chat | null) => void;
  setCopiedMessageId: (id: string | null) => void;
  setChatError: (error: string | null) => void;
  setShowStreamFinishNotes: (show: boolean) => void;
  setSendOnEnter: (send: boolean) => void;
  initializeActiveApiKey: () => void;
  handleSaveApiKey: (key: string) => void;
  handleRemoveApiKey: () => void;
  handleLoginSuccess: () => void;
  handleLogout: () => void;
  handleCodeChange: (value: string) => void;
  handleClearCodeInput: () => void;
  handleChatInputChange: (value: string) => void;
  handleClearChatInput: () => void;
  handleTabChange: (tab: ActiveTab) => void;
  handleSubmitCodeInteraction: () => Promise<void>;
  extractComponentCode: (markdownContent: string) => string | null;
  handleChatSubmit: () => Promise<void>;
  handleNewChat: () => void;
  handleRetryChat: () => Promise<void>;
  handleCopyChatMessage: (content: string, messageId: string) => void;
  stopGeneration: () => void;
  handleTogglePreview: (messageId: string) => void;
  initializeChatSession: (systemInstruction?: string, savedChatId?: string) => Promise<void>;
  initializeSavedChatSessions: () => void;
  saveChatSession: (sessionName: string, messagesToSave: ChatMessage[], sessionId?: string) => void;
  loadSavedChatSession: (sessionId: string) => void;
  deleteSavedChatSession: (sessionId: string) => void;
  renameSavedChatSession: (sessionId: string, newName: string) => void;
  setActiveSavedChatSessionId: (sessionId: string | null) => void;
  duplicateSavedChatSession: (sessionId: string, newName?: string) => void;
  setSavedSessionsSort: (sort: 'newest' | 'oldest' | 'name_asc' | 'name_desc') => void;

  // AI Agents actions
  initializeInstructionProfiles: () => void;
  handleSaveInstructionProfile: (profile: CustomInstructionProfile) => void;
  handleDeleteInstructionProfile: (id: string) => void;
  handleSetActiveInstructionProfile: (id: string) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  code: '',
  feedback: '',
  isLoading: false,
  error: null,
  activeApiKey: null,
  apiKeySource: 'none',
  isLoggedIn: false, // Default to false, will be updated by App.tsx useEffect
  activeTab: 'chat',
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
  chatImage: null, // Initial state
  activeChatSession: null,
  copiedMessageId: null,
  abortController: null,
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

  instructionProfiles: [],
  activeInstructionProfileId: null,

  // Actions
  setCode: (code: string) => set({ code }),
  setFeedback: (feedback: string) => set({ feedback }),
  setIsLoading: (isLoading: boolean) => set({ isLoading }),
  setError: (error: string | null) => set({ error }),
  setActiveApiKey: (key: string | null) => set({ activeApiKey: key }),
  setApiKeySource: (source: ApiKeySource) => set({ apiKeySource: source }),
  setIsLoggedIn: (isLoggedIn: boolean) => set({ isLoggedIn }),
  setActiveTab: (tab: ActiveTab) => set({ activeTab: tab }),
  setChatMessages: (messages: ChatMessage[]) => set({ chatMessages: messages }),
  setChatInput: (input: string) => set({ chatInput: input }),
  setChatImage: (image: string | null) => set({ chatImage: image }), // Added
  setActiveChatSession: (session: Chat | null) => set({ activeChatSession: session }),
  setCopiedMessageId: (id: string | null) => set({ copiedMessageId: id }),
  setChatError: (error: string | null) => set({ chatError: error }),
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
      console.error('Failed to load saved chat sessions from localStorage:', err);
      set({ savedChatSessions: [], chatError: 'Error loading saved chat sessions.' });
    }
  },

  saveChatSession: (sessionName: string, messagesToSave: ChatMessage[], sessionId?: string) => {
    try {
      const { savedChatSessions } = get();
      let updatedSessions: SavedChatSession[];

      if (sessionId) {
        // Update existing session
        updatedSessions = savedChatSessions.map((session) =>
          session.id === sessionId
            ? { ...session, name: sessionName, messages: messagesToSave, timestamp: Date.now() }
            : session,
        );
      } else {
        // Insert new session
        const newSession: SavedChatSession = {
          id: crypto.randomUUID(),
          name: sessionName,
          timestamp: Date.now(),
          messages: messagesToSave,
        };
        updatedSessions = [newSession, ...savedChatSessions];
      }

      localStorage.setItem(LS_KEY_SAVED_CHATS, JSON.stringify(updatedSessions));
      set({ savedChatSessions: updatedSessions });
    } catch (err) {
      console.error('Failed to save chat session to localStorage:', err);
      set({ chatError: 'Error saving chat session.' });
    }
  },

  loadSavedChatSession: (sessionId: string) => {
    const { savedChatSessions, initializeChatSession, isLoading } = get();
    if (isLoading) return;

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

  deleteSavedChatSession: (sessionId: string) => {
    try {
      const { savedChatSessions } = get();
      const updatedSessions = savedChatSessions.filter((session) => session.id !== sessionId);

      localStorage.setItem(LS_KEY_SAVED_CHATS, JSON.stringify(updatedSessions));
      // Refresh local state
      get().initializeSavedChatSessions();
      set((state) => ({
        activeSavedChatSessionId:
          state.activeSavedChatSessionId === sessionId ? null : state.activeSavedChatSessionId,
      }));
    } catch (err) {
      console.error('Failed to delete chat session from localStorage:', err);
      set({ chatError: 'Error deleting chat session.' });
    }
  },

  renameSavedChatSession: (sessionId: string, newName: string) => {
    try {
      const { savedChatSessions } = get();
      const updatedSessions = savedChatSessions.map((session) =>
        session.id === sessionId ? { ...session, name: newName } : session,
      );

      localStorage.setItem(LS_KEY_SAVED_CHATS, JSON.stringify(updatedSessions));
      set({ savedChatSessions: updatedSessions });
    } catch (err) {
      console.error('Failed to rename chat session in localStorage:', err);
      set({ chatError: 'Error renaming chat session.' });
    }
  },

  duplicateSavedChatSession: (sessionId: string, newName?: string) => {
    try {
      const { savedChatSessions } = get();
      const originalSession = savedChatSessions.find((session) => session.id === sessionId);

      if (!originalSession) throw new Error('Original session not found.');

      const newSession: SavedChatSession = {
        id: crypto.randomUUID(),
        name: newName && newName.trim() ? newName.trim() : `Copy of ${originalSession.name}`,
        timestamp: Date.now(),
        messages: [...originalSession.messages],
      };

      const updatedSessions = [newSession, ...savedChatSessions];
      localStorage.setItem(LS_KEY_SAVED_CHATS, JSON.stringify(updatedSessions));
      set({ savedChatSessions: updatedSessions });
    } catch (err) {
      console.error('Failed to duplicate chat session in localStorage:', err);
      set({ chatError: 'Error duplicating chat session.' });
    }
  },

  setSavedSessionsSort: (sort: 'newest' | 'oldest' | 'name_asc' | 'name_desc') => {
    localStorage.setItem(LS_KEY_SAVED_CHATS_SORT, sort);
    set({ savedSessionsSort: sort });
  },

  initializeInstructionProfiles: () => {
    const profiles = getProfiles();
    const activeProfile = getActiveInstructionProfile();
    set({
      instructionProfiles: profiles,
      activeInstructionProfileId: activeProfile?.id || null,
    });
  },

  handleSaveInstructionProfile: (profile: CustomInstructionProfile) => {
    saveProfile(profile);
    get().initializeInstructionProfiles();
  },

  handleDeleteInstructionProfile: (id: string) => {
    deleteProfile(id);
    get().initializeInstructionProfiles();
  },

  handleSetActiveInstructionProfile: (id: string) => {
    setActiveProfile(id);
    get().initializeInstructionProfiles();
  },

  setActiveSavedChatSessionId: (sessionId: string | null) =>
    set({ activeSavedChatSessionId: sessionId }),

  initializeActiveApiKey: () => {
    const { initializeChatSession, initializeSavedChatSessions, isLoading } = get();
    if (isLoading) return;

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
      initializeChatSession();
    }
    initializeSavedChatSessions();
  },

  handleSaveApiKey: (key: string) => {
    const { initializeChatSession, isLoading } = get();
    if (isLoading) return;

    if (key.trim()) {
      localStorage.setItem(LS_KEY_API, key);
      set({ activeApiKey: key, apiKeySource: 'ui', error: null, chatError: null });
      initializeGeminiClient(key);
      initializeChatSession();
    }
  },

  handleRemoveApiKey: () => {
    localStorage.removeItem(LS_KEY_API);
    set({ activeApiKey: null, apiKeySource: 'none', error: null, chatError: null });
    clearGeminiClient();
  },

  handleLoginSuccess: () => {
    const { initializeActiveApiKey, isLoading } = get();
    if (isLoading) return;

    localStorage.setItem(LS_KEY_LOGGED_IN, 'true');
    set({ isLoggedIn: true });
    initializeActiveApiKey();
  },

  handleLogout: () => {
    localStorage.removeItem(LS_KEY_LOGGED_IN);
    set({
      isLoggedIn: false,
      activeApiKey: null,
      apiKeySource: 'none',
      chatMessages: [],
      activeChatSession: null,
      activeSavedChatSessionId: null,
      chatError: null,
    });
    clearGeminiClient();
  },

  handleCodeChange: (value: string) => {
    set({ code: value });
  },

  handleClearCodeInput: () => {
    set({ code: '', feedback: '', error: null });
  },

  handleChatInputChange: (value: string) => {
    set({ chatInput: value });
  },

  handleClearChatInput: () => {
    set({ chatInput: '' });
  },

  initializeChatSession: async (systemInstructionOverride?: string, savedChatId?: string) => {
    const {
      activeChatSession,
      activeApiKey,
      savedChatSessions,
      activeSavedChatSessionId,
      isLoading,
    } = get();
    if (!activeApiKey) {
      set({ chatError: 'API Key is not configured. Please set your API key to use chat.' });
      return;
    }

    if (isLoading || (activeChatSession && !savedChatId)) {
      return;
    }

    const controller = new AbortController();
    set({ isLoading: true, chatError: null, abortController: controller });
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

      if (controller.signal.aborted) return;

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

      if (controller.signal.aborted) return;

      const session = await startChatSession(effectiveSystemInstruction, history);
      if (controller.signal.aborted) return;

      set({ activeChatSession: session, chatMessages: initialChatMessages });
    } catch (err) {
      if (controller.signal.aborted) {
        // console.log('Chat initialization aborted');
      } else {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        set({ chatError: `Failed to start chat session: ${errorMessage}` });
        console.error(err);
      }
    } finally {
      set({ isLoading: false, abortController: null });
    }
  },

  handleTabChange: (tab: ActiveTab) => {
    set({ activeTab: tab });
  },

  handleSubmitCodeInteraction: async () => {
    const { activeTab, code, isLoading } = get();
    if (isLoading || !code.trim()) return;

    const controller = new AbortController();
    set({ isLoading: true, feedback: '', error: null, abortController: controller });

    try {
      if (activeTab === 'review') {
        const result = await reviewCodeWithGemini(code);
        if (controller.signal.aborted) return;
        set({ feedback: result });
      } else if (activeTab === 'refactor') {
        const fullRefactorText = `## Refactoring Summary:\n\n`;
        set({ feedback: fullRefactorText });
        for await (const part of refactorCodeWithGeminiStream(code)) {
          if (controller.signal.aborted) break;
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
        if (controller.signal.aborted) return;
        set({ feedback: result });
      } else if (activeTab === 'generate') {
        const result = await generateCodeWithGemini(code);
        if (controller.signal.aborted) return;
        set({ feedback: result });
      } else if (activeTab === 'content') {
        const result = await generateContentWithGemini(code);
        if (controller.signal.aborted) return;
        set({ feedback: result });
      }
    } catch (err) {
      if (controller.signal.aborted) {
        // console.log('Code interaction aborted');
      } else {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        set({ error: `Error during ${activeTab}: ${errorMessage}` });
        console.error(`Error in ${activeTab}:`, err);
      }
    } finally {
      set({ isLoading: false, abortController: null });
    }
  },

  extractComponentCode: (markdownContent: string): string | null => {
    // 1. First try to find fully closed code blocks
    const closedCodeBlockRegex = /```(\w+)?\s*\n([\s\S]+?)\n```/g;
    const closedMatches = Array.from(markdownContent.matchAll(closedCodeBlockRegex));

    if (closedMatches.length > 0) {
      // Prioritize blocks that have "export default"
      const defaultExportBlock = closedMatches.find((m) => m[2] && m[2].includes('export default'));
      if (defaultExportBlock) return defaultExportBlock[2].trim();

      // Prioritize tsx/jsx blocks
      const tsxJsxBlock = closedMatches.find((m) => {
        const lang = (m[1] || '').toLowerCase();
        return ['tsx', 'jsx', 'ts', 'typescript'].includes(lang);
      });
      if (tsxJsxBlock) return tsxJsxBlock[2].trim();

      // Fallback to the first non-empty block
      for (const match of closedMatches) {
        if (match[2] && match[2].trim() !== '') {
          return match[2].trim();
        }
      }
    }

    // 2. If no closed blocks, try to find an open block (useful for streaming)
    // This matches ```lang followed by content until the end of the string
    const openCodeBlockRegex = /```(\w+)?\s*\n([\s\S]+?)$/;
    const openMatch = markdownContent.match(openCodeBlockRegex);

    if (openMatch) {
      const lang = (openMatch[1] || '').toLowerCase();
      const content = openMatch[2];

      // Only extract if it looks like code we might want to preview
      if (
        ['tsx', 'jsx', 'ts', 'typescript'].includes(lang) ||
        content.includes('export default') ||
        content.includes('import ') ||
        content.includes('<')
      ) {
        return content.trim();
      }
    }

    return null;
  },

  handleChatSubmit: async () => {
    const {
      chatInput,
      chatImage,
      activeChatSession,
      extractComponentCode: extractCode,
      isLoading,
    } = get();
    if (isLoading || (!chatInput.trim() && !chatImage)) return;

    const now = Date.now();
    const userMessageId = `user-${now}`;
    const modelMessageId = `model-${now + 1}`;

    set((state: AppState) => ({
      chatMessages: [
        ...state.chatMessages,
        {
          id: userMessageId,
          role: 'user',
          content: chatInput,
          imageContent: chatImage,
          timestamp: now,
        },
      ],
    }));
    const currentInput = chatInput;
    const currentImage = chatImage;
    const controller = new AbortController();
    set({
      chatInput: '',
      chatImage: null,
      isLoading: true,
      chatError: null,
      abortController: controller,
    });

    set((state: AppState) => ({
      chatMessages: [
        ...state.chatMessages,
        {
          id: modelMessageId,
          role: 'model',
          content: '',
          componentCode: null,
          showPreview: false,
          timestamp: now + 1,
        },
      ],
    }));

    try {
      if (!activeChatSession) throw new Error('Chat session not active.');
      const stream = await sendMessageToChatStream(activeChatSession, currentInput, currentImage);
      let currentModelContent = '';
      for await (const chunk of stream) {
        if (controller.signal.aborted) break;
        const chunkText = chunk.text;
        const finishReason = chunk.candidates?.[0]?.finishReason;
        const safetyRatings = chunk.candidates?.[0]?.safetyRatings;

        if (chunkText) {
          currentModelContent += chunkText;
          const componentCode = extractCode(currentModelContent);
          set((state: AppState) => ({
            chatMessages: updateChatMessageById(state.chatMessages, modelMessageId, {
              content: currentModelContent,
              componentCode: componentCode,
            }),
          }));
        }
        if (finishReason) {
          console.warn('Chat stream finished:', finishReason, safetyRatings);
          const finalComponentCode = extractCode(currentModelContent);
          if (finishReason !== 'STOP' && finishReason !== 'MAX_TOKENS') {
            const currentMsg = get().chatMessages.find((msg) => msg.id === modelMessageId);
            const updatedContent = get().showStreamFinishNotes
              ? (currentMsg?.content || '') + `\n\n*(Stream finished: ${finishReason})*`
              : currentMsg?.content || '';

            set((state: AppState) => ({
              chatMessages: updateChatMessageById(state.chatMessages, modelMessageId, {
                content: updatedContent,
                componentCode: finalComponentCode,
              }),
            }));
            if (finishReason === 'SAFETY') {
              set({ chatError: 'The response was blocked due to safety settings.' });
            }
          } else {
            set((state: AppState) => ({
              chatMessages: updateChatMessageById(state.chatMessages, modelMessageId, {
                componentCode: finalComponentCode,
              }),
            }));
          }
          break;
        }
      }
    } catch (err) {
      if (controller.signal.aborted) {
        // Log locally if needed, but avoid no-console warning if possible or use allowed methods
        // console.log('Chat generation aborted');
      } else {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        set({ chatError: `Chat error: ${errorMessage}` });
        console.error('Chat submit error:', err);
        set((state: AppState) => ({
          chatMessages: updateChatMessageById(state.chatMessages, modelMessageId, {
            content: `*(Error: ${errorMessage})*`,
            componentCode: null,
          }),
        }));
      }
    } finally {
      set({ isLoading: false, abortController: null });
    }
  },

  handleNewChat: () => {
    const { initializeChatSession, isLoading } = get();
    if (isLoading) return;

    set({
      chatMessages: [],
      activeChatSession: null,
      chatError: null,
      activeSavedChatSessionId: null,
    });
    initializeChatSession();
  },

  handleRetryChat: async () => {
    const { chatMessages, activeChatSession, extractComponentCode: extractCode, isLoading } = get();
    if (isLoading) return;

    const lastUserMessage = chatMessages.findLast((msg) => msg.role === 'user');

    if (!lastUserMessage) {
      set({ chatError: 'No previous message to retry.' });
      return;
    }

    // Remove the last model message if it exists
    set((state: AppState) => {
      const lastMsg = state.chatMessages[state.chatMessages.length - 1];
      if (lastMsg && lastMsg.role === 'model') {
        return {
          chatMessages: state.chatMessages.slice(0, -1),
        };
      }
      return state;
    });

    const now = Date.now();
    const modelMessageId = `model-${now}`;
    const controller = new AbortController();

    set({
      isLoading: true,
      chatError: null,
      abortController: controller,
    });

    set((state: AppState) => ({
      chatMessages: [
        ...state.chatMessages,
        {
          id: modelMessageId,
          role: 'model',
          content: '',
          componentCode: null,
          showPreview: false,
          timestamp: now,
        },
      ],
    }));

    try {
      if (!activeChatSession) throw new Error('Chat session not active for retry.');
      const stream = await sendMessageToChatStream(
        activeChatSession,
        lastUserMessage.content,
        lastUserMessage.imageContent, // Pass the original image content if any
        true, // useFallback
      );
      let currentModelContent = '';
      for await (const chunk of stream) {
        if (controller.signal.aborted) break;
        const chunkText = chunk.text;
        const finishReason = chunk.candidates?.[0]?.finishReason;
        const safetyRatings = chunk.candidates?.[0]?.safetyRatings;

        if (chunkText) {
          currentModelContent += chunkText;
          const componentCode = extractCode(currentModelContent);
          set((state: AppState) => ({
            chatMessages: updateChatMessageById(state.chatMessages, modelMessageId, {
              content: currentModelContent,
              componentCode: componentCode,
            }),
          }));
        }
        if (finishReason) {
          console.warn('Chat stream finished (retry):', finishReason, safetyRatings);
          const finalComponentCode = extractCode(currentModelContent);
          if (finishReason !== 'STOP' && finishReason !== 'MAX_TOKENS') {
            const currentMsg = get().chatMessages.find((msg) => msg.id === modelMessageId);
            const updatedContent = get().showStreamFinishNotes
              ? (currentMsg?.content || '') + `\n\n*(Stream finished: ${finishReason})*`
              : currentMsg?.content || '';

            set((state: AppState) => ({
              chatMessages: updateChatMessageById(state.chatMessages, modelMessageId, {
                content: updatedContent,
                componentCode: finalComponentCode,
              }),
            }));
            if (finishReason === 'SAFETY') {
              set({ chatError: 'The response was blocked due to safety settings during retry.' });
            }
          } else {
            set((state: AppState) => ({
              chatMessages: updateChatMessageById(state.chatMessages, modelMessageId, {
                componentCode: finalComponentCode,
              }),
            }));
          }
          break;
        }
      }
    } catch (err) {
      if (controller.signal.aborted) {
        // console.log('Retry chat generation aborted');
      } else {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        set({ chatError: `Retry chat error: ${errorMessage}` });
        console.error('Retry chat submit error:', err);
        set((state: AppState) => ({
          chatMessages: updateChatMessageById(state.chatMessages, modelMessageId, {
            content: `*(Error: ${errorMessage})*`,
            componentCode: null,
          }),
        }));
      }
    } finally {
      set({ isLoading: false, abortController: null });
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

  stopGeneration: () => {
    const { abortController } = get();
    if (abortController) {
      abortController.abort();
      set({ abortController: null, isLoading: false });
    }
  },

  handleTogglePreview: (messageId: string) => {
    const currentMsg = get().chatMessages.find((msg) => msg.id === messageId);
    set((state) => ({
      chatMessages: updateChatMessageById(state.chatMessages, messageId, {
        showPreview: !currentMsg?.showPreview,
      }),
    }));
  },
}));
