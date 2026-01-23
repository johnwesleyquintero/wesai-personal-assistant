import React from 'react';
import {
  FaTerminal,
  FaCode,
  FaEye,
  FaWandMagicSparkles,
  FaFileLines,
  FaEraser,
  FaPlay,
  FaCircleInfo,
  FaTriangleExclamation,
} from 'react-icons/fa6';
import { CodeInput } from './CodeInput.tsx';
import { FeedbackDisplay } from './FeedbackDisplay.tsx';
import { LoadingSpinner } from './LoadingSpinner.tsx';
import { ErrorMessage } from './ErrorMessage.tsx';

interface CodeInteractionPanelProps {
  activeTab: 'review' | 'refactor' | 'preview' | 'generate' | 'content';
  code: string; // Used for code input or content description
  onCodeChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onClearInput: () => void; // New prop for clearing input
  onSubmit: () => void;
  isLoading: boolean;
  isApiKeyConfigured: boolean;
  feedback: string;
  error: string | null;
  setError: (error: string | null) => void;
}

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

export const CodeInteractionPanel: React.FC<CodeInteractionPanelProps> = React.memo(
  ({
    activeTab,
    code,
    onCodeChange,
    onClearInput,
    onSubmit,
    isLoading,
    isApiKeyConfigured,
    feedback,
    error,
    setError,
  }) => {
    const [parsedRefactorFeedback, setParsedRefactorFeedback] = React.useState<{
      summary: string | null;
      refactoredCode: string | null;
    }>({ summary: null, refactoredCode: null });

    // Effect to parse feedback when it changes, but only for the refactor tab
    React.useEffect(() => {
      if (feedback && activeTab === 'refactor') {
        setParsedRefactorFeedback(parseRefactorFeedback(feedback));
      } else {
        // Clear parsed feedback if tab changes or feedback is cleared
        setParsedRefactorFeedback({ summary: null, refactoredCode: null });
      }
    }, [feedback, activeTab]);

    const getActionVerb = React.useCallback((): string => {
      if (activeTab === 'review') return 'review';
      if (activeTab === 'refactor') return 'refactor';
      if (activeTab === 'preview') return 'get a preview for';
      if (activeTab === 'generate') return 'generate code based on';
      if (activeTab === 'content') return 'create';
      return 'process';
    }, [activeTab]);

    const getTabIcon = () => {
      switch (activeTab) {
        case 'review':
          return <FaEye className="w-5 h-5" />;
        case 'refactor':
          return <FaCode className="w-5 h-5" />;
        case 'preview':
          return <FaPlay className="w-5 h-5" />;
        case 'generate':
          return <FaWandMagicSparkles className="w-5 h-5" />;
        case 'content':
          return <FaFileLines className="w-5 h-5" />;
        default:
          return <FaTerminal className="w-5 h-5" />;
      }
    };

    const getTabColor = () => {
      switch (activeTab) {
        case 'review':
          return 'from-amber-500 to-orange-600';
        case 'refactor':
          return 'from-emerald-500 to-teal-600';
        case 'preview':
          return 'from-blue-500 to-indigo-600';
        case 'generate':
          return 'from-purple-500 to-pink-600';
        case 'content':
          return 'from-cyan-500 to-blue-600';
        default:
          return 'from-blue-600 to-indigo-700';
      }
    };

    const getButtonText = (): string => {
      if (isLoading) {
        if (activeTab === 'review') return 'Reviewing...';
        if (activeTab === 'refactor') return 'Refactoring...';
        if (activeTab === 'preview') return 'Generating Preview...';
        if (activeTab === 'generate') return 'Generating Code...';
        if (activeTab === 'content') return 'Creating...';
      } else {
        if (activeTab === 'review') return 'Review Code';
        if (activeTab === 'refactor') return 'Refactor Code';
        if (activeTab === 'preview') return 'Get Component Preview';
        if (activeTab === 'generate') return 'Generate Code';
        if (activeTab === 'content') return 'Create Content';
      }
      return 'Submit';
    };

    const getFeedbackTitle = (): string => {
      if (activeTab === 'review') return 'Review Feedback';
      if (activeTab === 'refactor') return 'Refactoring Result';
      if (activeTab === 'preview') return 'Component Preview';
      if (activeTab === 'generate') return 'Generated Code';
      if (activeTab === 'content') return 'Generated Content';
      return 'Result';
    };

    const getLoadingMessage = (): string => {
      if (activeTab === 'review')
        return 'Analyzing code for best practices and potential issues...';
      if (activeTab === 'refactor') return 'Optimizing and restructuring your code...';
      if (activeTab === 'preview') return 'Building visual representation and description...';
      if (activeTab === 'generate') return 'Crafting your requested code snippet...';
      if (activeTab === 'content') return 'Composing your requested content...';
      return 'Processing, please wait...';
    };

    const getInputPlaceholder = (): string => {
      if (activeTab === 'generate')
        return "Describe the code you want to generate (e.g., 'a React component that fetches and displays a list of users')...";
      if (activeTab === 'content')
        return "Describe the content you want to create (e.g., 'a short blog post about AI ethics')...";
      return 'Paste your code here...';
    };

    const getInputLabel = (): string => {
      if (activeTab === 'generate') return `Describe the code to ${getActionVerb()}`;
      if (activeTab === 'content') return `Describe the content to ${getActionVerb()}`;
      return `Enter React/TypeScript code to ${getActionVerb()}`;
    };

    const handleSubmitClick = React.useCallback(() => {
      if (!isApiKeyConfigured) {
        setError(
          'Gemini API key is not configured. Please set it in the API Key Management section.',
        );
        return;
      }
      if (activeTab !== 'generate' && activeTab !== 'content' && !code.trim()) {
        setError(`Please enter some code to ${getActionVerb()}.`);
        return;
      }
      if ((activeTab === 'generate' || activeTab === 'content') && !code.trim()) {
        setError(`Please enter a description to ${getActionVerb()}.`);
        return;
      }
      setError(null);
      onSubmit();
    }, [activeTab, code, isApiKeyConfigured, setError, onSubmit, getActionVerb]);

    // Helper function to render the feedback section
    const renderFeedback = () => {
      if (!feedback || isLoading) return null;

      const feedbackTitle = getFeedbackTitle();

      return (
        <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-500 overflow-hidden bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 flex-shrink-0">
            <div
              className={`p-2 rounded-lg bg-gradient-to-br ${getTabColor()} text-white shadow-md`}
            >
              {getTabIcon()}
            </div>
            <h2 className="text-sm font-bold text-gray-900 dark:text-white leading-tight uppercase tracking-wider">
              {feedbackTitle}
            </h2>
          </div>

          <div className="flex-grow overflow-y-auto p-5 custom-scrollbar">
            {activeTab === 'refactor' ? (
              <div className="space-y-6">
                {parsedRefactorFeedback.summary && (
                  <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100/50 dark:border-blue-900/20 p-5 transition-all hover:shadow-md">
                    <div className="flex items-center gap-2 mb-3 text-blue-700 dark:text-blue-300 font-bold text-sm uppercase tracking-wider">
                      <FaCircleInfo className="w-4 h-4" />
                      Refactoring Summary
                    </div>
                    <FeedbackDisplay feedback={parsedRefactorFeedback.summary} />
                  </div>
                )}
                {parsedRefactorFeedback.refactoredCode && (
                  <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden transition-all hover:shadow-md">
                    <div className="flex items-center justify-between px-5 py-3 border-b border-gray-50 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                      <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-sm uppercase tracking-wider">
                        <FaCode className="w-4 h-4" />
                        Refactored Code
                      </div>
                    </div>
                    <div className="p-4">
                      <FeedbackDisplay
                        feedback={`\`\`\`typescript\n${parsedRefactorFeedback.refactoredCode}\n\`\`\``}
                      />
                    </div>
                  </div>
                )}
                {!parsedRefactorFeedback.summary && !parsedRefactorFeedback.refactoredCode && (
                  <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
                    <div className="flex items-center gap-2 mb-3 text-amber-600 dark:text-amber-400 font-bold text-sm uppercase tracking-wider">
                      <FaTriangleExclamation className="w-4 h-4" />
                      Unstructured Output
                    </div>
                    <FeedbackDisplay feedback={feedback} />
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 transition-all hover:shadow-md">
                <FeedbackDisplay feedback={feedback} />
              </div>
            )}
          </div>
        </div>
      );
    };

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-280px)] min-h-[500px] overflow-hidden">
        {/* Input Column */}
        <div className="flex flex-col h-full overflow-hidden">
          <div className="flex flex-col flex-grow bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl overflow-hidden transition-all duration-300">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/30 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg bg-gradient-to-br ${getTabColor()} text-white shadow-md`}
                >
                  {getTabIcon()}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-tight uppercase tracking-wider">
                    {activeTab}
                  </h3>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                    {getInputLabel()}
                  </p>
                </div>
              </div>
              {code && !isLoading && (
                <button
                  onClick={onClearInput}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                  title="Clear Input"
                >
                  <FaEraser className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex-grow p-4 relative flex flex-col overflow-hidden">
              <CodeInput
                value={code}
                onChange={onCodeChange}
                onClearInput={onClearInput}
                disabled={isLoading || !isApiKeyConfigured}
                placeholder={getInputPlaceholder()}
              />
            </div>

            <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/20 flex-shrink-0">
              <button
                onClick={handleSubmitClick}
                disabled={isLoading || !isApiKeyConfigured || !code.trim()}
                className={`w-full flex items-center justify-center gap-2 bg-gradient-to-r ${getTabColor()} hover:opacity-90 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg transition-all transform active:scale-[0.98] disabled:opacity-40 disabled:grayscale disabled:cursor-not-allowed`}
              >
                {isLoading ? (
                  <div className="flex items-center gap-3">
                    <LoadingSpinner />
                    <span>Processing...</span>
                  </div>
                ) : (
                  <>
                    <FaPlay className="w-4 h-4" />
                    <span>{getButtonText()}</span>
                  </>
                )}
              </button>

              <ErrorMessage message={error} />
            </div>
          </div>
        </div>

        {/* Output Column */}
        <div className="flex flex-col h-full overflow-hidden">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full bg-gray-50/50 dark:bg-gray-900/30 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800 p-10 text-center animate-pulse">
              <div
                className={`p-6 rounded-full bg-gradient-to-br ${getTabColor()} text-white mb-6 shadow-2xl shadow-blue-500/20`}
              >
                <LoadingSpinner />
              </div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                Generating Magic...
              </h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
                {getLoadingMessage()}
              </p>
            </div>
          ) : feedback ? (
            <div className="h-full overflow-hidden">{renderFeedback()}</div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full bg-gray-50/50 dark:bg-gray-900/30 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800 p-10 text-center group transition-colors hover:border-blue-300 dark:hover:border-blue-900/50">
              <div className="p-6 rounded-full bg-white dark:bg-gray-800 text-gray-300 dark:text-gray-700 mb-6 shadow-sm group-hover:scale-110 transition-transform duration-500">
                <FaTerminal className="w-12 h-12" />
              </div>
              <h3 className="text-xl font-bold text-gray-400 dark:text-gray-600 mb-2">
                Waiting for input
              </h3>
              <p className="text-gray-400 dark:text-gray-500 max-w-xs mx-auto text-sm">
                Enter your code or description on the left to see the AI magic happen here.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  },
);
