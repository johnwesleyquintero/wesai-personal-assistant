# Services Overview

This directory contains various services used throughout the WesAI application. Each service is designed to encapsulate specific functionalities, often related to external API interactions or complex business logic, to promote modularity and reusability.

## `geminiService.ts`

This service is responsible for handling interactions with the Google Gemini API. It abstracts away the complexities of API calls, ensuring that Gemini-related functionalities are centralized and easily manageable.

**Key Responsibilities:**

- Making requests to the Gemini API for generative AI tasks.
- Handling API responses and potential errors.
- Providing methods for different types of Gemini model interactions (e.g., text generation, chat, image understanding).

**Usage Example:**

```typescript
import { getGeminiResponse } from './geminiService';

async function processUserQuery(query: string) {
  try {
    const response = await getGeminiResponse(query);
    console.log('Gemini Response:', response);
  } catch (error) {
    console.error('Error getting Gemini response:', error);
  }
}
```

## `instructionService.ts`

This service manages the application's instructions or prompts that guide the behavior of AI models or other system components. It provides a structured way to store, retrieve, and potentially modify these instructions.

**Key Responsibilities:**

- Storing and managing various sets of instructions.
- Retrieving specific instructions based on context or type.
- Potentially validating or transforming instructions.

**Usage Example:**

```typescript
import { getInstructions } from './instructionService';

const systemInstructions = getInstructions('system_prompt');
console.log('System Instructions:', systemInstructions);
```
