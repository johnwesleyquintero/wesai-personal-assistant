import type { GenerateContentResponse, Chat } from '@google/genai';
import { GoogleGenAI, Modality } from '@google/genai';
import { getActiveInstructionProfile } from './instructionService';
import type { AspectRatio } from '../types'; // Assuming AspectRatio is defined in types.ts

let ai: GoogleGenAI | null = null;

// --- UPDATED MODEL CONSTANTS (2025) ---
const MODEL_NAME_TEXT = 'gemini-2.5-flash'; // Main free-tier text model
const MODEL_NAME_IMAGE_GENERATION = 'imagen-4.0-generate-001'; // Imagen for advanced image generation
const MODEL_NAME_IMAGE_FLASH = 'gemini-2.5-flash-image'; // Flash for 1:1 image generation/editing
const MODEL_NAME_FALLBACK = 'gemini-2.5-flash-lite'; // Cheaper fallback

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
  safetyRatings?: unknown;
}

const getAiInstance = (): GoogleGenAI => {
  if (!ai) {
    throw new Error(
      "Gemini API client is not initialized. Please set your API key in the application settings. If using a Vite development environment, ensure VITE_GEMINI_API_KEY is set in your .env file and the app is served via 'npm run dev' or similar Vite command.",
    );
  }
  return ai;
};

const createPrompt = (basePrompt: string): string => {
  const activeProfile = getActiveInstructionProfile();
  return activeProfile
    ? `Instructions: ${activeProfile.instructions}\n\nUser Request: ${basePrompt}`
    : basePrompt;
};

// --- IMPROVED ERROR HANDLING ---
const handleApiError = (error: unknown, context: string): Error => {
  console.error(`[Gemini Service] Error in ${context}:`, error);
  const e = error as
    | { message?: string; status?: number; response?: { status?: number } }
    | Error
    | string
    | unknown;
  const message =
    typeof e === 'object' &&
    e &&
    'message' in e &&
    typeof (e as { message?: string }).message === 'string'
      ? (e as { message?: string }).message?.toLowerCase() // Safely call toLowerCase()
      : '';
  const status =
    typeof e === 'object' && e && 'status' in e
      ? (e as { status?: number }).status
      : typeof (e as { response?: { status?: number } }).response === 'object'
        ? (e as { response?: { status?: number } }).response?.status
        : undefined;
  const rawErrorText = (() => {
    try {
      return JSON.stringify(error).toLowerCase();
    } catch {
      return '';
    }
  })();

  // 1. Rate Limiting (429) & Server Overload (503)
  if (status === 429 || status === 503) {
    // Check for specific "limit: 0" quota error for image generation
    if (
      rawErrorText.includes('quota exceeded') &&
      rawErrorText.includes('limit: 0') &&
      (context.includes('image') || context.includes('imagen'))
    ) {
      return new Error(
        'Image generation/editing is not available on the free tier. Please enable billing for your Google Cloud project to use this feature.',
        { cause: error },
      );
    }
    return new Error('System is currently busy or rate-limited. Please try again shortly.', {
      cause: error,
    });
  }

  // 2. Authentication / API Key Issues
  if (
    status === 403 ||
    (message && message.includes('api key not valid')) ||
    (message && message.includes('invalid api key'))
  ) {
    return new Error('Authentication failed. Please check your API key configuration.', {
      cause: error,
    });
  }

  // 3. Model Not Found (Fixes your 404 issue)
  if (
    status === 404 ||
    (message && message.includes('not found')) ||
    (message && message.includes('unsupported model'))
  ) {
    return new Error(
      'The configured AI model is unavailable or deprecated. Please check model constants.',
      { cause: error },
    );
  }

  // 4. Safety/Content Policy Violations
  if (message && (message.includes('safety') || message.includes('blocked'))) {
    return new Error('The request was blocked due to safety settings.', { cause: error });
  }

  // 5. Generic Fallback
  return new Error(
    `Gemini API request for ${context} failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    { cause: error },
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

/**
 * Handles image generation using the powerful Imagen model, which supports aspect ratios.
 * Throws a specific error for billing issues.
 */
async function generateWithImagen(
  ai: GoogleGenAI,
  prompt: string,
  aspectRatio: AspectRatio,
  negativePrompt?: string,
): Promise<string> {
  try {
    const response = await ai.models.generateImages({
      model: MODEL_NAME_IMAGE_GENERATION,
      prompt: prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: aspectRatio,
        negativePrompt: negativePrompt,
      },
    });

    const generatedImage = response.generatedImages?.[0];
    if (generatedImage?.image?.imageBytes) {
      const base64ImageBytes = generatedImage.image.imageBytes;
      return `data:image/jpeg;base64,${base64ImageBytes}`;
    } else {
      throw new Error('Gemini API (Imagen) did not return an image.');
    }
  } catch (error) {
    throw handleApiError(error, 'image generation (Imagen)');
  }
}

/**
 * Handles image generation using the accessible Flash model for 1:1 images.
 */
async function generateWithFlash(
  ai: GoogleGenAI,
  prompt: string,
  negativePrompt?: string,
): Promise<string> {
  try {
    const finalPrompt = negativePrompt
      ? `${prompt}\n\n---\nNegative Prompt: Do not include the following elements: ${negativePrompt}`
      : prompt;

    const response = await ai.models.generateContent({
      model: MODEL_NAME_IMAGE_FLASH,
      contents: {
        parts: [{ text: finalPrompt }],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts ?? []) {
      if (part.inlineData?.data) {
        // Safely access .data
        const base64ImageBytes = part.inlineData.data;
        const mimeType = part.inlineData.mimeType || 'image/jpeg';
        return `data:${mimeType};base64,${base64ImageBytes}`;
      }
    }

    throw new Error('Gemini API (Flash) did not return an image.');
  } catch (error) {
    throw handleApiError(error, 'image generation (Flash)');
  }
}

/**
 * Generates an image using the Google Gemini API.
 * It intelligently switches between models: `gemini-2.5-flash-image` for standard 1:1 images
 * and `imagen-4.0` for requests with specific aspect ratios.
 * @param prompt The text prompt to generate an image from.
 * @param aspectRatio The desired aspect ratio for the image.
 * @param negativePrompt An optional prompt of what to avoid in the image.
 * @returns A promise that resolves to a data URL of the generated image.
 */
export async function generateImageWithGemini(
  prompt: string,
  aspectRatio: AspectRatio,
  negativePrompt?: string,
): Promise<string> {
  const currentAi = getAiInstance(); // Get the initialized AI instance
  const fullPrompt = createPrompt(prompt);

  // If a specific aspect ratio is requested, use the powerful Imagen model.
  // Otherwise, use the more accessible Flash model for standard 1:1 generation.
  if (aspectRatio !== '1:1') {
    return generateWithImagen(currentAi, fullPrompt, aspectRatio, negativePrompt);
  } else {
    return generateWithFlash(currentAi, fullPrompt, negativePrompt);
  }
}

/**
 * Converts a data URL to a base64 string and its MIME type.
 * @param dataUrl The data URL string.
 * @returns An object with the base64 data and MIME type, or null if parsing fails.
 */
function parseDataUrl(dataUrl: string): { data: string; mimeType: string } | null {
  const match = dataUrl.match(/^data:(.+);base64,(.+)$/);
  if (!match) return null;
  return { mimeType: match[1], data: match[2] };
}

/**
 * Edits an image using the Google Gemini API (gemini-2.5-flash-image model).
 * @param originalImageSrc The data URL of the original image.
 * @param editPrompt The text prompt describing the desired edit.
 * @returns A promise that resolves to a data URL of the edited image.
 */
export async function editImageWithGemini(
  originalImageSrc: string,
  editPrompt: string,
): Promise<string> {
  const imageParts = parseDataUrl(originalImageSrc);
  if (!imageParts) {
    throw new Error('Invalid image source format. Must be a data URL.');
  }

  try {
    const currentAi = getAiInstance(); // Get the initialized AI instance

    const response = await currentAi.models.generateContent({
      model: MODEL_NAME_IMAGE_FLASH,
      contents: {
        parts: [
          {
            inlineData: {
              data: imageParts.data,
              mimeType: imageParts.mimeType,
            },
          },
          {
            text: createPrompt(editPrompt),
          },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts ?? []) {
      if (part.inlineData) {
        const base64ImageBytes = part.inlineData.data;
        const mimeType = part.inlineData.mimeType || 'image/jpeg';
        return `data:${mimeType};base64,${base64ImageBytes}`;
      }
    }

    throw new Error('Gemini API did not return an edited image.');
  } catch (error) {
    throw handleApiError(error, 'image editing');
  }
}

// --- Chat Functions ---

export const startChatSession = async (
  initialSystemInstruction: string = '',
  history: { role: 'user' | 'model'; parts: { text: string }[] }[] = [],
): Promise<Chat> => {
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
      history: history, // Pass the history to the chat session
    });
    return chatSession;
  } catch (error) {
    throw handleApiError(error, 'start chat session');
  }
};

const retryWithFallbackModel = async (
  message: string,
  originalError: unknown,
): Promise<AsyncIterable<GenerateContentResponse>> => {
  console.warn(
    `Attempting with fallback model due to: ${
      (originalError as Error)?.message ?? String(originalError)
    }`,
  );
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
    throw handleApiError(
      fallbackError,
      `fallback chat attempt after ${(originalError as Error)?.message ?? String(originalError)}`,
    );
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
  } catch (error: unknown) {
    // Check for both response status and raw status
    const status =
      (error as { status?: number }).status ||
      (error as { response?: { status?: number } }).response?.status;

    // Retry on Rate Limit (429) or Service Overload (503) if we haven't already
    if ((status === 429 || status === 503) && !useFallback) {
      return await retryWithFallbackModel(message, error);
    }
    throw handleApiError(error, 'send message to chat stream');
  }
};
