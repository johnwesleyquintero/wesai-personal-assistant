import { GoogleGenAI, GenerateContentResponse, Chat } from '@google/genai';
import { getActiveInstructionProfile } from './instructionService'; // New import

let ai: GoogleGenAI | null = null;
const MODEL_NAME_TEXT = 'gemini-2.5-flash-preview-05-20';
const MODEL_NAME_IMAGE = 'imagen-3.0-generate-002';
const MODEL_NAME_FALLBACK = 'gemini-1.5-flash-latest'; // Define fallback model

export const initializeGeminiClient = (apiKey: string): void => {
  try {
    ai = new GoogleGenAI({ apiKey });
  } catch (error) {
    console.error('Failed to initialize GoogleGenAI:', error);
    ai = null;
    throw new Error('Failed to initialize Gemini client. Check API key format or SDK issue.');
  }
};

export const clearGeminiClient = (): void => {
  ai = null;
};

interface RefactorStreamingPart {
  type: 'chunk' | 'error' | 'finish_reason';
  data?: string;
  message?: string;
  reason?: string;
  safetyRatings?: any;
}

const getAiInstance = (): GoogleGenAI => {
  if (!ai) {
    const envApiKey =
      typeof import.meta.env !== 'undefined' ? import.meta.env.VITE_GEMINI_API_KEY : undefined;
    if (envApiKey && envApiKey.trim() !== '') {
      console.warn(
        'Attempting to initialize Gemini client from environment variable as it was not previously initialized.',
      );
      try {
        initializeGeminiClient(envApiKey);
      } catch (initError) {
        console.error(
          'Failed to initialize Gemini client from env var during getAiInstance:',
          initError,
        );
      }
    }

    if (!ai) {
      throw new Error(
        "Gemini API client is not initialized. Please set your API key in the application settings. If using a Vite development environment, ensure VITE_GEMINI_API_KEY is set in your .env file and the app is served via 'npm run dev' or similar Vite command.",
      );
    }
  }
  return ai;
};

const createPrompt = (basePrompt: string): string => {
  const activeProfile = getActiveInstructionProfile();
  return activeProfile
    ? `Instructions: ${activeProfile.instructions}\n\nUser Request: ${basePrompt}`
    : basePrompt;
};

const handleApiError = (error: any, context: string): Error => {
  console.error(`Error calling Gemini API for ${context}:`, error);
  if (error.response?.status === 429) {
    return new Error('Rate limit exceeded. Please try again later.');
  } else if (
    error.message.includes('API key not valid') ||
    error.message.includes('invalid api key') ||
    error.message.includes('API key is not valid')
  ) {
    return new Error('Invalid API key. Please check your API key.');
  } else if (error instanceof Error) {
    return new Error(`Gemini API request for ${context} failed: ${error.message}`);
  }
  return new Error(
    `An unknown error occurred while communicating with the Gemini API for ${context}.`,
  );
};

export const reviewCodeWithGemini = async (code: string): Promise<string> => {
  const currentAi = getAiInstance();
  const basePrompt = `
You are an expert AI code reviewer with a strong understanding of TypeScript and React.
Please provide a detailed review of the following code.
Focus on:
- Potential bugs and logical errors.
- Clarity, readability, and maintainability.
- Performance optimizations and potential bottlenecks (especially React-specific ones like re-renders, memoization, and hook usage).
- Adherence to best practices and language-specific conventions (particularly for TypeScript and React, including component structure, state management, and prop typing).
- Security vulnerabilities.

Format your feedback clearly and concisely using Markdown. Use bullet points or numbered lists for specific suggestions.
If suggesting code changes, try to show small, illustrative snippets.
If the code appears to be TypeScript or React, pay special attention to common patterns, best practices, and potential issues specific to those technologies.
Do not repeat the provided code in your review unless it's part of a specific suggestion.

The code to review is:
\`\`\`typescript
${code}
\`\`\`
`;

  try {
    const fullPrompt = createPrompt(basePrompt);

    const response: GenerateContentResponse = await currentAi.models.generateContent({
      model: MODEL_NAME_TEXT,
      contents: fullPrompt,
    });

    const text = response.text;
    if (!text || text.trim() === '') {
      throw new Error('Received an empty review from the API.');
    }
    return text;
  } catch (error) {
    throw handleApiError(error, 'review');
  }
};

export async function* refactorCodeWithGeminiStream(
  code: string,
): AsyncIterable<RefactorStreamingPart> {
  const currentAi = getAiInstance();
  const basePrompt = `
You are an expert AI code refactoring assistant, particularly skilled in TypeScript and React.
Given the following TypeScript/React code, please refactor it to improve its quality, readability, performance, and maintainability, adhering to modern TypeScript and React best practices.

Your response MUST be structured as follows:

1.  Start with a concise summary of the key improvements and changes you made. This summary MUST be in Markdown format and begin with the heading:
    ## Refactoring Summary:
    [Your summary content here]

2.  After the summary, provide the complete refactored source code. This code MUST be enclosed in a single TypeScript Markdown code block, and it should be preceded by the heading:
    ## Refactored Code:
    \`\`\`typescript
    // Your refactored code here
    \`\`\`

Please ensure there is no other text, explanation, or formatting outside this specified structure. For example, do not add any text after the final code block's closing backticks.

The code to refactor is:
\`\`\`typescript
${code}
\`\`\`
`;

  try {
    const fullPrompt = createPrompt(basePrompt);

    const stream = await currentAi.models.generateContentStream({
      model: MODEL_NAME_TEXT,
      contents: fullPrompt,
    });

    for await (const chunk of stream) {
      const chunkText = chunk.text;
      const finishReason = chunk.candidates?.[0]?.finishReason;
      const safetyRatings = chunk.candidates?.[0]?.safetyRatings;

      if (chunkText) {
        yield { type: 'chunk', data: chunkText };
      }

      if (finishReason && finishReason !== 'STOP' && finishReason !== 'MAX_TOKENS') {
        yield { type: 'finish_reason', reason: finishReason, safetyRatings };
        return;
      }
    }
  } catch (error) {
    yield { type: 'error', message: handleApiError(error, 'refactor stream').message };
  }
}

export const getReactComponentPreview = async (code: string): Promise<string> => {
  const currentAi = getAiInstance();
  const basePrompt = `
You are an expert AI assistant specializing in analyzing React and TypeScript components.
Given the following React/TypeScript component code, provide a textual description of what the component likely does, its visual structure, its expected props, any internal state, and its basic behavior and interactivity.

Focus on:
- **Purpose:** What is the main goal or function of this component?
- **Visual Structure:** Describe what it would roughly look like on a page (e.g., "a form with two input fields and a submit button," "a card displaying user information").
- **Props:** List its primary props, their likely types (if discernible), and their purpose.
- **State:** Describe any internal state variables it manages and how they affect the component.
- **Interactivity:** Explain how a user might interact with this component and what happens as a result (e.g., "Clicking the 'Add to Cart' button likely dispatches an action or calls a prop function.").

Format your response as clear, concise Markdown. Use headings and bullet points for readability.

The component code is:
\`\`\`typescript
${code}
\`\`\`
`;

  try {
    const fullPrompt = createPrompt(basePrompt);

    const response: GenerateContentResponse = await currentAi.models.generateContent({
      model: MODEL_NAME_TEXT,
      contents: fullPrompt,
    });

    const text = response.text;
    if (!text || text.trim() === '') {
      throw new Error('Received an empty preview from the API.');
    }
    return text;
  } catch (error) {
    throw handleApiError(error, 'component preview');
  }
};

export const generateCodeWithGemini = async (description: string): Promise<string> => {
  const currentAi = getAiInstance();
  const basePrompt = `
You are an expert AI code generation assistant.
Please generate code based on the following description.
Focus on creating clean, efficient, and correct code.
If the description implies TypeScript or React, please use appropriate syntax and best practices.
Provide *only* the generated code, preferably within a single Markdown code block.
If a brief explanation is absolutely necessary before the code, keep it very short. Do not add explanations after the code block.

Description:
"${description}"

Generated Code:
`;

  try {
    const fullPrompt = createPrompt(basePrompt);

    const response: GenerateContentResponse = await currentAi.models.generateContent({
      model: MODEL_NAME_TEXT,
      contents: fullPrompt,
    });

    const text = response.text;
    if (!text || text.trim() === '') {
      throw new Error('Received empty generated code from the API.');
    }
    return text;
  } catch (error) {
    throw handleApiError(error, 'code generation');
  }
};

export const generateContentWithGemini = async (description: string): Promise<string> => {
  const currentAi = getAiInstance();
  const basePrompt = `
You are an expert AI content creation assistant.
Please generate content based on the following description.
Focus on creating clear, engaging, and well-structured text suitable for the described purpose (e.g., blog post, social media update, documentation section, email copy, creative writing, etc.).
Adapt your tone and style to the user's request.
Provide *only* the generated content. Do not add explanations, introductions, or sign-offs unless they are part of the requested content itself.

Description:
"${description}"

Generated Content:
`;

  try {
    const fullPrompt = createPrompt(basePrompt);

    const response: GenerateContentResponse = await currentAi.models.generateContent({
      model: MODEL_NAME_TEXT,
      contents: fullPrompt,
    });

    const text = response.text;
    if (!text || text.trim() === '') {
      throw new Error('Received empty generated content from the API.');
    }
    return text;
  } catch (error) {
    throw handleApiError(error, 'content generation');
  }
};

export const generateImageWithImagen = async (prompt: string): Promise<string> => {
  const currentAi = getAiInstance();
  const fullPrompt = createPrompt(prompt);

  try {
    const response = await currentAi.models.generateImages({
      model: MODEL_NAME_IMAGE,
      prompt: fullPrompt,
      config: { numberOfImages: 1, outputMimeType: 'image/jpeg' },
    });

    if (
      response.generatedImages &&
      response.generatedImages.length > 0 &&
      response.generatedImages[0].image?.imageBytes
    ) {
      return response.generatedImages[0].image.imageBytes;
    } else {
      throw new Error('No image data received from the API or image generation failed.');
    }
  } catch (error) {
    throw handleApiError(error, 'image generation');
  }
};

// --- Chat Functions ---

export const startChatSession = async (initialSystemInstruction: string = ''): Promise<Chat> => {
  const defaultSystemInstruction = `I am WesAI, John Wesley Quintero's AI assistant. I am here to assist you, showcase John's expertise, and interact on his behalf. I embody John Wesley Quintero's professional identity: expert, confident, helpful, and proactive. I always communicate in the first person. I can help with career representation, technical project and coding assistance, data analysis, visualization, reporting, and content and strategic brainstorming.`;
  const currentAi = getAiInstance();
  const activeProfile = getActiveInstructionProfile();
  const systemInstruction = activeProfile
    ? activeProfile.instructions
    : initialSystemInstruction || defaultSystemInstruction;

  try {
    const chatSession: Chat = currentAi.chats.create({
      model: MODEL_NAME_TEXT,
      config: {
        systemInstruction: systemInstruction,
      },
    });
    return chatSession;
  } catch (error) {
    throw handleApiError(error, 'start chat session');
  }
};

const retryWithFallbackModel = async (
  message: string,
  originalError: any,
): Promise<AsyncIterable<GenerateContentResponse>> => {
  console.warn(`Attempting with fallback model due to: ${originalError.message}`);
  try {
    const activeProfile = getActiveInstructionProfile();
    const defaultSystemInstruction = `I am WesAI, John Wesley Quintero's AI assistant. I am here to assist you, showcase John's expertise, and interact on his behalf. I embody John Wesley Quintero's professional identity: expert, confident, helpful, and proactive. I always communicate in the first person. I can help with career representation, technical project and coding assistance, data analysis, visualization, reporting, and content and strategic brainstorming.`;
    const systemInstruction = activeProfile ? activeProfile.instructions : defaultSystemInstruction;

    const fallbackChatSession: Chat = getAiInstance().chats.create({
      model: MODEL_NAME_FALLBACK,
      config: {
        systemInstruction: systemInstruction,
      },
    });

    return await sendMessageToChatStream(fallbackChatSession, message, true);
  } catch (fallbackError) {
    throw handleApiError(fallbackError, `fallback chat attempt after ${originalError.message}`);
  }
};

export const sendMessageToChatStream = async (
  chat: Chat,
  message: string,
  useFallback = false,
): Promise<AsyncIterable<GenerateContentResponse>> => {
  try {
    const stream = await chat.sendMessageStream({ message: message });
    return stream;
  } catch (error: any) {
    if ((error.response?.status === 429 || error.response?.status === 503) && !useFallback) {
      throw await retryWithFallbackModel(message, error);
    }
    throw handleApiError(error, 'send message to chat stream');
  }
};
