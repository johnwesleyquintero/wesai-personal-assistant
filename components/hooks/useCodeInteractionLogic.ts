import { useAppStore } from '../../store';
import { useMemo } from 'react';

// Helper function to parse refactor feedback based on expected markdown structure
const parseRefactorFeedback = (
  feedback: string,
): { summary: string | null; refactoredCode: string | null } => {
  // Regex to find the summary section between "## Refactoring Summary:\n" and the next heading or end of string
  const summaryMatch = feedback.match(
    /## Refactoring Summary:\n([\s\S]*?)(?=\n## Refactored Code:|$)/,
  );
  // Regex to find the code block section after "## Refactored Code:\n"
  const codeMatch = feedback.match(
    /## Refactored Code:\n```(?:typescript|tsx|javascript|js|jsx)\n([\s\S]*?)\n```/,
  );

  const summary = summaryMatch ? summaryMatch[1].trim() : null;
  const refactoredCode = codeMatch ? codeMatch[1].trim() : null;

  return { summary, refactoredCode };
};

export const useCodeInteractionLogic = () => {
  const code = useAppStore((state) => state.code);
  const feedback = useAppStore((state) => state.feedback);
  const isLoading = useAppStore((state) => state.isLoading);
  const error = useAppStore((state) => state.error);
  const activeApiKey = useAppStore((state) => state.activeApiKey);
  const activeTab = useAppStore((state) => state.activeTab);
  const handleCodeChange = useAppStore((state) => state.handleCodeChange);
  const handleClearCodeInput = useAppStore((state) => state.handleClearCodeInput);
  const handleSubmitCodeInteraction = useAppStore((state) => state.handleSubmitCodeInteraction);
  const setError = useAppStore((state) => state.setError);
  const addToast = useAppStore((state) => state.addToast);

  // Memoize parsed feedback when it changes, but only for the refactor tab
  const parsedRefactorFeedback = useMemo(() => {
    if (feedback && activeTab === 'refactor') {
      return parseRefactorFeedback(feedback);
    }
    return { summary: null, refactoredCode: null };
  }, [feedback, activeTab]);

  const codeInteractionActive = useMemo(() => {
    return (
      activeTab === 'review' ||
      activeTab === 'refactor' ||
      activeTab === 'preview' ||
      activeTab === 'generate' ||
      activeTab === 'content'
    );
  }, [activeTab]);

  const isApiKeyConfigured = !!activeApiKey;

  return {
    code,
    feedback,
    isLoading,
    error,
    activeTab,
    codeInteractionActive,
    handleCodeChange,
    handleClearCodeInput,
    handleSubmitCodeInteraction,
    setError,
    addToast,
    parsedRefactorFeedback,
    isApiKeyConfigured,
  };
};
