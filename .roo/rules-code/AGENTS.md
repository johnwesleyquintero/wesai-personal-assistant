# Code Style Rules

This project uses standard ESLint and Prettier configurations. There are no additional project-specific code style rules beyond these tools.

# Custom Utilities or Patterns

## Environment Variables

Environment variables are managed centrally through [`utils/env.ts`](utils/env.ts), providing a single source of truth for configuration.

## API Service Interaction

Interactions with the Gemini API (and potentially other external services) are encapsulated within `services/*` files, specifically following patterns established in [`services/geminiService.ts`](services/geminiService.ts).

# Non-Obvious Coding Rules

## Custom Hooks

The `components/hooks/` directory contains custom React hooks (e.g., [`useChatLogic.ts`](components/hooks/useChatLogic.ts), [`useCodeInteractionLogic.ts`](components/hooks/useCodeInteractionLogic.ts), [`useImageGenerationLogic.ts`](components/hooks/useImageGenerationLogic.ts), [`useTheme.ts`](components/hooks/useTheme.ts)) that encapsulate significant logic related to their respective features. These hooks are not merely state managers but often contain business logic and side effects.
