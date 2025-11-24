# Ask Rules

## Code Organization
- The `services/` directory, while containing API interaction logic (e.g., [`services/geminiService.ts`](services/geminiService.ts)), also houses `instructionService.ts` and `knowledgeBaseService.ts`, which manage application-specific instructions and knowledge. These are not external API calls but internal service layers.
- The `components/hooks/` directory is not just for simple state management; it encapsulates significant business logic and side effects through custom React hooks like [`useChatLogic.ts`](components/hooks/useChatLogic.ts), [`useCodeInteractionLogic.ts`](components/hooks/useCodeInteractionLogic.ts), and [`useImageGenerationLogic.ts`](components/hooks/useImageGenerationLogic.ts).