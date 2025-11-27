import { useState, useCallback } from 'react';

interface UseCopyToClipboardReturn {
  isCopied: boolean;
  copyToClipboard: (text: string) => Promise<void>;
  resetCopyState: () => void;
}

export const useCopyToClipboard = (resetDelay: number = 2000): UseCopyToClipboardReturn => {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = useCallback(
    async (text: string) => {
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(text);
        } else {
          // Fallback for older browsers or non-secure contexts
          const textArea = document.createElement('textarea');
          textArea.value = text;
          textArea.style.position = 'fixed';
          textArea.style.left = '-999999px';
          textArea.style.top = '-999999px';
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();

          try {
            document.execCommand('copy');
          } finally {
            textArea.remove();
          }
        }

        setIsCopied(true);

        // Reset the copied state after the specified delay
        setTimeout(() => {
          setIsCopied(false);
        }, resetDelay);
      } catch (error) {
        console.error('Failed to copy to clipboard:', error);
        // Don't set isCopied to true if copy fails
      }
    },
    [resetDelay],
  );

  const resetCopyState = useCallback(() => {
    setIsCopied(false);
  }, []);

  return {
    isCopied,
    copyToClipboard,
    resetCopyState,
  };
};
