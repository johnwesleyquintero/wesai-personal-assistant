# Architectural Rules

## State Management

- The application utilizes a Zustand store (defined in [`store.ts`](store.ts)) as a centralized, lightweight state manager. This is the primary mechanism for global state.

## Business Logic Encapsulation

- Significant business logic is encapsulated within custom React hooks located in `components/hooks/` (e.g., [`useChatLogic.ts`](components/hooks/useChatLogic.ts), [`useCodeInteractionLogic.ts`](components/hooks/useCodeInteractionLogic.ts)). These hooks are not merely for UI-related state but contain core application functionalities.

## Service Layer

- The `services/` directory contains various service layers. Notably, [`services/geminiService.ts`](services/geminiService.ts) is designed as a singleton for managing interactions with the Gemini API, ensuring a single point of control and consistent configuration.
