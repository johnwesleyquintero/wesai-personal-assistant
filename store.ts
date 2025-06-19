import { create } from 'zustand';
import { Chat } from '@google/genai';
import { ActiveTab, ApiKeySource, Theme, ChatMessage } from './types.ts';
import {
  reviewCodeWithGemini,
  refactorCodeWithGeminiStream,
  getReactComponentPreview,
  generateCodeWithGemini,
  generateContentWithGemini,
  generateImageWithImagen,
  initializeGeminiClient,
  clearGeminiClient,
  startChatSession,
  sendMessageToChatStream,
} from './services/geminiService.ts';
import { getActiveInstructionProfile } from './services/instructionService.ts';

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

  // Chat specific state
  chatMessages: ChatMessage[];
  chatInput: string;
  activeChatSession: Chat | null;
  copiedMessageId: string | null;
  chatError: string | null;

  // Image generation specific state
  imagePrompt: string;
  generatedImageData: string | null;

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
  toggleTheme: () => void;
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
  handleImageGenerationSubmit: () => Promise<void>;
  extractComponentCode: (markdownContent: string) => string | null;
  handleChatSubmit: () => Promise<void>;
  handleNewChat: () => void;
  handleRetryChat: () => Promise<void>;
  handleCopyChatMessage: (content: string, messageId: string) => void;
  handleTogglePreview: (messageId: string) => void;
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

  chatMessages: [],
  chatInput: '',
  activeChatSession: null,
  copiedMessageId: null,
  chatError: null,

  imagePrompt: '',
  generatedImageData: null,

  // Actions
  setCode: (code) => set({ code }),
  setFeedback: (feedback) => set({ feedback }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setActiveApiKey: (key) => set({ activeApiKey: key }),
  setApiKeySource: (source) => set({ apiKeySource: source }),
  setIsLoggedIn: (isLoggedIn) => set({ isLoggedIn }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setTheme: (theme) => set({ theme }),
  setChatMessages: (messages) => set({ chatMessages: messages }),
  setChatInput: (input) => set({ chatInput: input }),
  setActiveChatSession: (session) => set({ activeChatSession: session }),
  setCopiedMessageId: (id) => set({ copiedMessageId: id }),
  setChatError: (error) => set({ chatError: error }),
  setImagePrompt: (prompt) => set({ imagePrompt: prompt }),
  setGeneratedImageData: (data) => set({ generatedImageData: data }),
  toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),

  initializeActiveApiKey: () => {
    const storedKey = localStorage.getItem('geminiApiKey');
    const envApiKey =
      typeof import.meta.env !== 'undefined' ? import.meta.env.VITE_GEMINI_API_KEY : undefined;

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
  },

  handleSaveApiKey: (key: string) => {
    if (key.trim()) {
      localStorage.setItem('geminiApiKey', key);
      set({ activeApiKey: key, apiKeySource: 'ui', error: null, chatError: null });
      initializeGeminiClient(key);
    }
  },

  handleRemoveApiKey: () => {
    localStorage.removeItem('geminiApiKey');
    set({
      feedback: '',
      generatedImageData: null,
      error: null,
      chatError: null,
      chatMessages: [],
      activeChatSession: null,
    });
    get().initializeActiveApiKey();
  },

  handleLoginSuccess: () => {
    localStorage.setItem('isWesAiUserLoggedIn', 'true');
    set({ isLoggedIn: true });
    get().initializeActiveApiKey();
  },

  handleLogout: () => {
    localStorage.removeItem('isWesAiUserLoggedIn');
    localStorage.removeItem('geminiApiKey');
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
    });
    get().initializeActiveApiKey();
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

  handleTabChange: async (tab: ActiveTab) => {
    set({ activeTab: tab, feedback: '', error: null, chatError: null, generatedImageData: null });

    if (tab !== 'image') {
      set({ imagePrompt: '' });
    }
    if (
      tab !== 'review' &&
      tab !== 'refactor' &&
      tab !== 'preview' &&
      tab !== 'generate' &&
      tab !== 'content' &&
      tab !== 'custom-instructions'
    ) {
      set({ code: '' });
    }

    if (tab === 'chat') {
      const { activeChatSession, activeApiKey } = get();
      if (!activeChatSession && !!activeApiKey) {
        set({ isLoading: true, chatError: null });
        try {
          const activeProfile = getActiveInstructionProfile();
          const defaultSystemInstruction = 'Hey there! 👋 How can I help you today?';
          const systemInstruction = activeProfile
            ? activeProfile.instructions
            : defaultSystemInstruction;

          const session = await startChatSession(systemInstruction);
          set({ activeChatSession: session });
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
          set({ chatError: `Failed to start chat session: ${errorMessage}` });
          console.error(err);
        } finally {
          set({ isLoading: false });
        }
      } else if (!activeApiKey) {
        set({ chatError: 'API Key is not configured. Please set your API key to use chat.' });
      }
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
            set((state) => ({ feedback: state.feedback + (part.data || '') }));
          } else if (part.type === 'error' && part.message) {
            set({ error: `Refactoring error: ${part.message}` });
            break;
          } else if (part.type === 'finish_reason') {
            console.log('Refactoring stream finished:', part.reason, part.safetyRatings);
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

  handleImageGenerationSubmit: async () => {
    const { imagePrompt } = get();
    if (!imagePrompt.trim()) {
      set({ error: 'Please enter a description for the image.' });
      return;
    }
    set({ isLoading: true, generatedImageData: null, error: null });

    try {
      const imageData = await generateImageWithImagen(imagePrompt);
      set({ generatedImageData: imageData });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An unknown error occurred during image generation.';
      set({ error: `Image Generation Error: ${errorMessage}` });
      console.error('Image generation error:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  extractComponentCode: (markdownContent: string): string | null => {
    const codeBlockRegex = /```(?:tsx|jsx)\s*\n([\s\S]+?)\n```/;
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

    set((state) => ({
      chatMessages: [
        ...state.chatMessages,
        { id: userMessageId, role: 'user', content: chatInput },
      ],
    }));
    const currentInput = chatInput;
    set({ chatInput: '', isLoading: true, chatError: null });

    set((state) => ({
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
          set((state) => ({
            chatMessages: state.chatMessages.map((msg) =>
              msg.id === modelMessageId
                ? { ...msg, content: currentModelContent, componentCode: componentCode }
                : msg,
            ),
          }));
        }
        if (finishReason) {
          console.log('Chat stream finished:', finishReason, safetyRatings);
          const finalComponentCode = extractCode(currentModelContent);
          if (finishReason !== 'STOP' && finishReason !== 'MAX_TOKENS') {
            set((state) => ({
              chatMessages: state.chatMessages.map((msg) =>
                msg.id === modelMessageId
                  ? {
                      ...msg,
                      content: msg.content + `\n\n*(Stream finished: ${finishReason})*`,
                      componentCode: finalComponentCode,
                    }
                  : msg,
              ),
            }));
            if (finishReason === 'SAFETY') {
              set({ chatError: 'The response was blocked due to safety settings.' });
            }
          } else {
            set((state) => ({
              chatMessages: state.chatMessages.map((msg) =>
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
      set((state) => ({
        chatMessages: state.chatMessages.map((msg) =>
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
    set({ chatMessages: [], activeChatSession: null, chatError: null });
  },

  handleRetryChat: async () => {
    const { chatMessages, activeChatSession, extractComponentCode: extractCode } = get();
    const lastUserMessage = chatMessages.findLast((msg) => msg.role === 'user');

    if (!lastUserMessage) {
      set({ chatError: 'No previous message to retry.' });
      return;
    }

    set((state) => ({
      chatMessages: state.chatMessages.filter(
        (msg) => msg.id !== state.chatMessages[state.chatMessages.length - 1]?.id,
      ),
    }));

    set({ isLoading: true, chatError: null });

    const modelMessageId = `model-${Date.now() + 1}`;
    set((state) => ({
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
          set((state) => ({
            chatMessages: state.chatMessages.map((msg) =>
              msg.id === modelMessageId
                ? { ...msg, content: currentModelContent, componentCode: componentCode }
                : msg,
            ),
          }));
        }
        if (finishReason) {
          console.log('Chat stream finished (retry):', finishReason, safetyRatings);
          const finalComponentCode = extractCode(currentModelContent);
          if (finishReason !== 'STOP' && finishReason !== 'MAX_TOKENS') {
            set((state) => ({
              chatMessages: state.chatMessages.map((msg) =>
                msg.id === modelMessageId
                  ? {
                      ...msg,
                      content: msg.content + `\n\n*(Stream finished: ${finishReason})*`,
                      componentCode: finalComponentCode,
                    }
                  : msg,
              ),
            }));
            if (finishReason === 'SAFETY') {
              set({ chatError: 'The response was blocked due to safety settings during retry.' });
            }
          } else {
            set((state) => ({
              chatMessages: state.chatMessages.map((msg) =>
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
      set((state) => ({
        chatMessages: state.chatMessages.map((msg) =>
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
