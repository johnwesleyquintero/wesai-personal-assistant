import React, { useState, useEffect } from 'react';
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
import { Skeleton, TextSkeleton, CodeBlockSkeleton } from './Skeleton.tsx';
import { ErrorMessage } from './ErrorMessage.tsx';
import { useCodeInteractionLogic } from './hooks/useCodeInteractionLogic.ts';
import { useIsMobile } from './hooks/useMediaQuery.ts';

export const CodeInteractionPanel: React.FC = React.memo(() => {
  const isMobile = useIsMobile();
  const [mobileActiveView, setMobileActiveView] = useState<'input' | 'output'>('input');
  const {
    code,
    feedback,
    isLoading,
    error,
    activeTab,
    handleCodeChange: onCodeChange,
    handleClearCodeInput: onClearInput,
    handleSubmitCodeInteraction: onSubmit,
    setError,
    addToast,
    parsedRefactorFeedback,
    isApiKeyConfigured,
  } = useCodeInteractionLogic();

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

  const getQuickPrompts = (): string[] => {
    switch (activeTab) {
      case 'review':
        return [
          'Review this for performance: const [count, setCount] = useState(0);',
          'Check for security risks in this dangerouslySetInnerHTML usage.',
          'Audit this useEffect for missing dependencies.',
        ];
      case 'refactor':
        return [
          'Convert this class component to functional with hooks.',
          'Simplify these nested ternary operators into a switch.',
          'Refactor this fetch logic into a custom useFetch hook.',
        ];
      case 'preview':
        return [
          'Create a responsive hero section with a purple gradient.',
          'Build a glassmorphism user profile card with Tailwind.',
          'Design a modern navigation bar with a mobile menu.',
        ];
      case 'generate':
        return [
          'Generate a useLocalStorage hook with TypeScript.',
          'Create a Zod schema for a complex User profile object.',
          'Write a generic debounce function in TypeScript.',
        ];
      case 'content':
        return [
          'Write a technical guide on React.memo usage.',
          'Draft a PR description for a new Dark Mode feature.',
          'Create a README snippet for a Vite-based project.',
        ];
      default:
        return [];
    }
  };

  const handleClearInput = () => {
    onClearInput();
    addToast('Input cleared', 'info', 2000);
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

  const renderFeedbackArea = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col h-full bg-app-main rounded-2xl border border-app-border shadow-2xl overflow-hidden animate-in fade-in duration-500">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-app-border bg-app-secondary/50">
            <Skeleton className="w-9 h-9 rounded-lg" />
            <Skeleton className="h-5 w-32" />
          </div>
          <div className="p-6 space-y-8 overflow-y-auto">
            {activeTab === 'refactor' ? (
              <>
                <div className="space-y-4">
                  <Skeleton className="h-4 w-40" />
                  <div className="p-5 rounded-2xl bg-app-accent-soft border border-app-accent/20">
                    <TextSkeleton lines={4} />
                  </div>
                </div>
                <div className="space-y-4">
                  <Skeleton className="h-4 w-40" />
                  <CodeBlockSkeleton />
                </div>
              </>
            ) : (
              <div className="space-y-6">
                <TextSkeleton lines={2} />
                <CodeBlockSkeleton />
                <TextSkeleton lines={3} />
              </div>
            )}
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col h-full bg-app-main rounded-2xl border border-red-500/20 shadow-2xl overflow-hidden">
          <div className="p-8 flex flex-col items-center justify-center text-center h-full">
            <div className="w-16 h-16 bg-red-500/10 text-red-600 dark:text-red-400 rounded-2xl flex items-center justify-center mb-4">
              <FaTriangleExclamation className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-app-text mb-2">Analysis Failed</h3>
            <p className="text-app-muted max-w-xs mb-6">{error}</p>
            <button
              onClick={onSubmit}
              title="Retry analysis"
              className="px-8 py-3 bg-app-accent hover:opacity-90 text-white rounded-xl font-bold text-sm shadow-lg shadow-app-accent/20 transition-all active:scale-95"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    if (!feedback) return null;

    const feedbackTitle = getFeedbackTitle();

    return (
      <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-500 overflow-hidden bg-app-main rounded-2xl border border-app-border shadow-2xl">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-app-border bg-app-secondary/50 flex-shrink-0">
          <div className={`p-2 rounded-lg bg-gradient-to-br ${getTabColor()} text-white shadow-md`}>
            {getTabIcon()}
          </div>
          <h2 className="text-sm font-bold text-app-text leading-tight uppercase tracking-wider">
            {feedbackTitle}
          </h2>
        </div>

        <div className="flex-grow overflow-y-auto p-5 custom-scrollbar bg-app-main/50">
          {activeTab === 'refactor' ? (
            <div className="space-y-6">
              {parsedRefactorFeedback.summary && (
                <div className="bg-app-accent-soft rounded-2xl border border-app-accent/10 p-5 transition-all hover:shadow-md">
                  <div className="flex items-center gap-2 mb-3 text-app-accent font-bold text-sm uppercase tracking-wider">
                    <FaCircleInfo className="w-4 h-4" />
                    Refactoring Summary
                  </div>
                  <FeedbackDisplay feedback={parsedRefactorFeedback.summary} />
                </div>
              )}
              {parsedRefactorFeedback.refactoredCode && (
                <div className="bg-app-tertiary rounded-2xl border border-app-border shadow-sm overflow-hidden transition-all hover:shadow-md">
                  <div className="flex items-center justify-between px-5 py-3 border-b border-app-border bg-app-secondary/30">
                    <div className="flex items-center gap-2 text-app-accent font-bold text-sm uppercase tracking-wider">
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
                <div className="bg-app-tertiary rounded-2xl border border-app-border shadow-sm p-5">
                  <div className="flex items-center gap-2 mb-3 text-amber-500 font-bold text-sm uppercase tracking-wider">
                    <FaTriangleExclamation className="w-4 h-4" />
                    Unstructured Output
                  </div>
                  <FeedbackDisplay feedback={feedback} />
                </div>
              )}
            </div>
          ) : (
            <div className="bg-app-tertiary rounded-2xl border border-app-border shadow-sm p-5 transition-all hover:shadow-md">
              <FeedbackDisplay feedback={feedback} />
            </div>
          )}
        </div>
      </div>
    );
  };

  // Auto-switch to output view on mobile when feedback or error arrives
  useEffect(() => {
    if (isMobile && (feedback || error)) {
      // Use setTimeout to avoid synchronous setState in effect
      const timer = setTimeout(() => {
        setMobileActiveView('output');
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [feedback, error, isMobile]);

  // Reset to input view on mobile when code is cleared
  useEffect(() => {
    if (isMobile && !code && !feedback && !error) {
      // Use setTimeout to avoid synchronous setState in effect
      const timer = setTimeout(() => {
        setMobileActiveView('input');
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [code, feedback, error, isMobile]);

  return (
    <div className="flex flex-col h-[calc(100vh-280px)] min-h-[500px] overflow-hidden">
      {/* Mobile Tab Switcher */}
      {isMobile && (
        <div className="flex p-1 bg-app-tertiary/50 rounded-xl mb-4 border border-app-border shrink-0">
          <button
            onClick={() => setMobileActiveView('input')}
            className={`flex-1 py-2.5 text-xs font-black uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-2 ${
              mobileActiveView === 'input'
                ? 'bg-app-main text-app-accent shadow-sm'
                : 'text-app-muted'
            }`}
          >
            <FaCode className="w-3.5 h-3.5" />
            Input
          </button>
          <button
            onClick={() => setMobileActiveView('output')}
            className={`flex-1 py-2.5 text-xs font-black uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-2 ${
              mobileActiveView === 'output'
                ? 'bg-app-main text-app-accent shadow-sm'
                : 'text-app-muted'
            }`}
          >
            <FaTerminal className="w-3.5 h-3.5" />
            Output
            {(feedback || error || isLoading) && (
              <span className="w-2 h-2 rounded-full bg-app-accent animate-pulse" />
            )}
          </button>
        </div>
      )}

      <div
        className={`grid grid-cols-1 ${isMobile ? '' : 'lg:grid-cols-2'} gap-6 flex-grow overflow-hidden`}
      >
        {/* Input Column */}
        {(!isMobile || mobileActiveView === 'input') && (
          <div className="flex flex-col h-full overflow-hidden animate-in fade-in slide-in-from-left-4 duration-300">
            <div className="flex flex-col flex-grow bg-app-main rounded-2xl border border-app-border shadow-2xl overflow-hidden transition-all duration-300">
              <div className="px-5 py-4 border-b border-app-border flex items-center justify-between bg-app-secondary/50 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg bg-gradient-to-br ${getTabColor()} text-white shadow-md`}
                  >
                    {getTabIcon()}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-app-text leading-tight uppercase tracking-wider">
                      {activeTab}
                    </h3>
                    <p className="text-[10px] text-app-muted font-medium uppercase tracking-tight">
                      {getInputLabel()}
                    </p>
                  </div>
                </div>
                {code && !isLoading && (
                  <button
                    onClick={handleClearInput}
                    className="p-2 text-app-muted hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all active:scale-90"
                    title="Clear Input"
                  >
                    <FaEraser className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="flex-grow p-4 relative flex flex-col overflow-hidden bg-app-main/50">
                <CodeInput
                  value={code}
                  onChange={onCodeChange}
                  onClearInput={handleClearInput}
                  onSubmit={handleSubmitClick}
                  disabled={isLoading || !isApiKeyConfigured}
                  placeholder={getInputPlaceholder()}
                />
                {!code && (
                  <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-500">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-app-muted mb-3 px-1">
                      Try a quick prompt
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {getQuickPrompts().map((prompt, idx) => (
                        <button
                          key={idx}
                          onClick={() => onCodeChange(prompt)}
                          className="text-xs px-4 py-2 rounded-xl bg-app-tertiary text-app-muted border border-app-border hover:border-app-accent/30 hover:bg-app-accent-soft hover:text-app-accent transition-all text-left font-medium active:scale-95 shadow-sm"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-app-border bg-app-secondary/20 flex-shrink-0">
                <button
                  onClick={handleSubmitClick}
                  disabled={isLoading || !isApiKeyConfigured || !code.trim()}
                  className={`w-full flex items-center justify-center gap-2 bg-gradient-to-r ${getTabColor()} hover:opacity-90 text-white font-black py-4 px-6 rounded-xl shadow-lg shadow-app-accent/10 transition-all transform active:scale-[0.98] disabled:opacity-40 disabled:grayscale disabled:cursor-not-allowed uppercase tracking-widest text-sm`}
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
        )}

        {/* Output Column */}
        {(!isMobile || mobileActiveView === 'output') && (
          <div className="flex flex-col h-full overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
            {isLoading || feedback || error ? (
              <div className="h-full overflow-hidden">{renderFeedbackArea()}</div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full bg-app-secondary/20 rounded-2xl border-2 border-dashed border-app-border p-10 text-center group transition-all duration-500 hover:border-app-accent/30 hover:bg-app-accent-soft">
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-app-accent/20 blur-3xl rounded-full scale-150 group-hover:scale-110 transition-transform duration-700" />
                  <div className="relative p-10 rounded-[2.5rem] bg-app-tertiary text-app-muted/30 shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 border border-app-border">
                    <FaTerminal className="w-16 h-16 group-hover:text-app-accent transition-colors" />
                  </div>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-app-text mb-4 tracking-tighter uppercase">
                  Ready for action?
                </h3>
                <p className="text-app-muted max-w-xs mx-auto text-xs sm:text-sm leading-relaxed mb-10 font-medium">
                  Enter your code on the left or choose a mode to get started with our
                  high-performance AI engine.
                </p>

                <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                  <div className="p-3 sm:p-4 rounded-2xl bg-app-tertiary/50 border border-app-border text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-app-muted/60 shadow-sm">
                    Fast Processing
                  </div>
                  <div className="p-3 sm:p-4 rounded-2xl bg-app-tertiary/50 border border-app-border text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-app-muted/60 shadow-sm">
                    Smart Refactoring
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
});
