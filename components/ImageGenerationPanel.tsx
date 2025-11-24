import React, { useState } from 'react';
import { LoadingSpinner } from './LoadingSpinner.tsx';
import type { AspectRatio } from '../types.ts'; // Import AspectRatio type
import { ErrorMessage } from './ErrorMessage.tsx';

interface ImageGenerationPanelProps {
  prompt: string;
  onPromptChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onClearPrompt: () => void;
  onSubmit: (aspectRatio: AspectRatio, negativePrompt: string) => void; // Updated onSubmit signature
  isLoading: boolean;
  isApiKeyConfigured: boolean;
  imageData: string | null;
  error: string | null;
  setError: (error: string | null) => void;
}

export const ImageGenerationPanel: React.FC<ImageGenerationPanelProps> = React.memo(
  ({
    prompt,
    onPromptChange,
    onClearPrompt,
    onSubmit,
    isLoading,
    isApiKeyConfigured,
    imageData,
    error,
    setError,
  }) => {
    const [downloadName, setDownloadName] = useState('generated-image.jpg');
    const [isCopied, setIsCopied] = useState(false);
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1'); // Default aspect ratio
    const [negativePrompt, setNegativePrompt] = useState<string>(''); // New state for negative prompt

    const isInteractive = !isLoading && isApiKeyConfigured;

    const handleCopyImage = async () => {
      if (!imageData) return;
      try {
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
        setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
      } catch (err) {
        console.error('Failed to copy image: ', err);
        setError('Failed to copy image to clipboard.');
      }
    };

    const handleDownload = () => {
      if (!imageData) return;
      const link = document.createElement('a');
      link.href = imageData; // imageData is already a data URL
      link.download =
        downloadName.endsWith('.jpg') || downloadName.endsWith('.jpeg')
          ? downloadName
          : `${downloadName}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    const generateDownloadFileName = (basePrompt: string): string => {
      const sanitizedPrompt = basePrompt
        .substring(0, 50) // Limit length for filename
        .replace(/[^a-z0-9\s-]/gi, '') // Remove invalid chars, allow spaces and hyphens
        .trim()
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .toLowerCase();
      return `${sanitizedPrompt || 'generated_image'}.jpg`;
    };

    const handleSubmitClick = () => {
      if (!isApiKeyConfigured) {
        setError(
          'Gemini API key is not configured. Please set it in the API Key Management section.',
        );
        return;
      }
      if (!prompt.trim()) {
        setError('Please enter a description for the image.');
        return;
      }
      setError(null);
      setDownloadName(generateDownloadFileName(prompt));
      onSubmit(aspectRatio, negativePrompt);
    };

    return (
      <div className="space-y-6">
        <div className="relative">
          <label
            htmlFor="imagePromptInput"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Describe the image you want to create:
          </label>
          <textarea
            id="imagePromptInput"
            value={prompt}
            onChange={onPromptChange}
            disabled={!isInteractive}
            rows={3}
            className="w-full p-4 pr-10 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 font-mono text-sm transition-colors duration-150 ease-in-out disabled:opacity-70 disabled:cursor-not-allowed"
            placeholder="e.g., 'A hyperrealistic portrait of a majestic lion in a snowy forest', 'A vibrant abstract painting with geometric shapes and bold colors', 'A cute robot waving hello'"
            aria-label="Image generation prompt input"
          />
          {prompt && !isLoading && (
            <button
              onClick={onClearPrompt}
              title="Clear prompt"
              aria-label="Clear image prompt"
              className="absolute top-8 right-2 p-1.5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="flex-1">
            <label
              htmlFor="aspectRatioSelect"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Aspect Ratio:
            </label>
            <select
              id="aspectRatioSelect"
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
              disabled={!isInteractive}
              className="w-full p-2.5 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 font-mono text-sm transition-colors duration-150 ease-in-out disabled:opacity-70 disabled:cursor-not-allowed"
              aria-label="Select image aspect ratio"
            >
              <option value="1:1">1:1 (Square)</option>
              <option value="16:9">16:9 (Landscape)</option>
              <option value="4:3">4:3 (Landscape)</option>
              <option value="3:2">3:2 (Landscape)</option>
              <option value="2:3">2:3 (Portrait)</option>
              <option value="9:16">9:16 (Portrait)</option>
              <option value="3:4">3:4 (Portrait)</option>
            </select>
          </div>
          <div className="flex-1">
            <label
              htmlFor="negativePromptInput"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Negative Prompt (Optional):
            </label>
            <input
              type="text"
              id="negativePromptInput"
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
              disabled={!isInteractive}
              className="w-full p-2.5 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 font-mono text-sm transition-colors duration-150 ease-in-out disabled:opacity-70 disabled:cursor-not-allowed"
              placeholder="e.g., 'text, blurry, dark, dull colors'"
              aria-label="Negative prompt input"
            />
          </div>
        </div>

        <button
          onClick={handleSubmitClick}
          disabled={isLoading || !isApiKeyConfigured || !prompt.trim()}
          className="w-full flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 px-4 rounded-lg shadow-md transition duration-150 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed"
          aria-label={isLoading ? 'Generating image, please wait' : 'Generate image'}
        >
          {isLoading && <LoadingSpinner />}
          {isLoading ? 'Generating Image...' : 'Generate Image'}
        </button>

        <ErrorMessage message={error} />

        {isLoading && !imageData && (
          <div
            className="mt-6 flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-gray-800/30 rounded-lg shadow-md"
            aria-live="polite"
          >
            <LoadingSpinner />
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              Your image is being created by Imagen, please wait...
            </p>
          </div>
        )}

        {imageData && !isLoading && (
          <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-200">
              Generated Image:
            </h2>
            <div className="flex flex-col items-center">
              <img
                src={imageData}
                alt={prompt || 'Generated image'}
                className="max-w-full h-auto rounded-md shadow-md border border-gray-300 dark:border-gray-600 mb-4"
                style={{ maxHeight: '60vh' }}
              />
              <div className="flex flex-col sm:flex-row items-center justify-between w-full mt-4">
                <div className="flex-grow mb-2 sm:mb-0 sm:mr-2">
                  <input
                    type="text"
                    value={downloadName}
                    onChange={(e) => setDownloadName(e.target.value)}
                    placeholder="image_name.jpg"
                    className="p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-gray-100 text-sm w-full"
                    aria-label="Download file name"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleCopyImage}
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-150 ease-in-out flex items-center justify-center whitespace-nowrap"
                    title="Copy image to clipboard"
                    aria-label="Copy image to clipboard"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5 mr-2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.03 1.125 0 1.131.094 1.976 1.057 1.976 2.192V7.5m-8.25 4.5a3 3 0 0 1-3-3V7.5a3 3 0 0 1 3-3h1.5a3 3 0 0 1 3 3v.75m0 0h1.5m-1.5 0a3 3 0 0 0 3 3h1.5a3 3 0 0 0 3-3V7.5a3 3 0 0 0-3-3h-1.5m-1.5 4.5a3 3 0 0 0-3 3v3.75a3 3 0 0 0 3 3h1.5a3 3 0 0 0 3-3V12a3 3 0 0 0-3-3h-1.5Z"
                      />
                    </svg>
                    {isCopied ? 'Copied!' : 'Copy'}
                  </button>
                  <button
                    onClick={handleSubmitClick}
                    disabled={!isInteractive}
                    className="w-full sm:w-auto bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-150 ease-in-out flex items-center justify-center whitespace-nowrap disabled:opacity-60"
                    title="Regenerate image with the same prompt"
                    aria-label="Regenerate image"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5 mr-2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 11.667 0m0 0h-4.992m4.992 0-3.181-3.183a8.25 8.25 0 0 0-11.667 0"
                      />
                    </svg>
                    Regenerate
                  </button>
                  <button
                    onClick={handleDownload}
                    className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-150 ease-in-out flex items-center justify-center whitespace-nowrap"
                    title="Download image"
                    aria-label="Download image"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5 mr-2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
                      />
                    </svg>
                    Download
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  },
);
