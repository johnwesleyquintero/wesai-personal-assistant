import { useState, useCallback } from 'react';

interface UseCopyImageToClipboardReturn {
  isCopied: boolean;
  copyImageToClipboard: (imageData: string) => Promise<void>;
  resetCopyState: () => void;
}

export const useCopyImageToClipboard = (
  resetDelay: number = 2000,
): UseCopyImageToClipboardReturn => {
  const [isCopied, setIsCopied] = useState(false);

  const copyImageToClipboard = useCallback(
    async (imageData: string) => {
      try {
        if (!imageData) return;

        // Decode base64 image data to a Blob
        const byteCharacters = atob(imageData.split(',')[1]); // Remove "data:image/jpeg;base64," prefix if present
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'image/jpeg' }); // Ensure correct MIME type

        await navigator.clipboard.write([
          new ClipboardItem({
            [blob.type]: blob,
          }),
        ]);

        setIsCopied(true);

        // Reset the copied state after the specified delay
        setTimeout(() => {
          setIsCopied(false);
        }, resetDelay);
      } catch (error) {
        console.error('Failed to copy image to clipboard:', error);
        // Don't set isCopied to true if copy fails
        throw error; // Re-throw so caller can handle the error
      }
    },
    [resetDelay],
  );

  const resetCopyState = useCallback(() => {
    setIsCopied(false);
  }, []);

  return {
    isCopied,
    copyImageToClipboard,
    resetCopyState,
  };
};
