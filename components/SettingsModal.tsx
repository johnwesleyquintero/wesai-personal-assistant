import React, { useState } from 'react';
import { FaGithub } from 'react-icons/fa';
import { ThemeToggleButton } from './ThemeToggleButton';
import { ApiKeySource, Theme } from '../types.ts';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveKey: (key: string) => void;
  onRemoveKey: () => void;
  isKeySet: boolean;
  currentKeySource: ApiKeySource;
  onLogout: () => void;
  theme: Theme;
  toggleTheme: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onSaveKey,
  onRemoveKey,
  isKeySet,
  currentKeySource,
  onLogout,
  theme,
  toggleTheme,
}) => {
  const [apiKeyInput, setApiKeyInput] = useState<string>('');
  const [showSavedMessage, setShowSavedMessage] = useState<boolean>(false);

  if (!isOpen) {
    return null;
  }

  const handleSave = () => {
    if (apiKeyInput.trim()) {
      onSaveKey(apiKeyInput);
      setShowSavedMessage(true);
      setTimeout(() => {
        setShowSavedMessage(false);
        onClose();
      }, 2000);
    }
  };

  const handleRemove = () => {
    const confirmationMessage =
      'Are you sure you want to remove the API key? This will clear the currently saved key and any generated content (reviews, refactors, images, chat history) from this session. The application will then attempt to use an environment variable key if available. If no key is active, features will be disabled.';
    if (window.confirm(confirmationMessage)) {
      onRemoveKey();
      setApiKeyInput('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
      <div
        className="relative w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl dark:bg-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
          aria-label="Close settings modal"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-6 w-6"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div className="flex items-center">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mr-2">
                Settings
              </h2>
              {isKeySet && (
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    currentKeySource === 'env'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'
                  }`}
                >
                  {currentKeySource === 'env' ? 'ENVIRONMENT KEY ACTIVE' : 'UI KEY ACTIVE'}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <a
                href="https://github.com/johnwesleyquintero/wesai"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub Repository"
                className="text-purple-500 hover:text-purple-700 text-2xl"
              >
                <FaGithub />
              </a>
              <ThemeToggleButton currentTheme={theme} toggleTheme={toggleTheme} />
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-3 rounded-lg shadow-md text-sm transition duration-150 ease-in-out whitespace-nowrap"
                >
                  Logout
                </button>
              )}
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <label
                htmlFor="apiKeyInput"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Enter your Gemini API Key:
              </label>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <input
                  type="password"
                  id="apiKeyInput"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder={isKeySet ? 'Enter new key to override' : 'Your Gemini API Key'}
                  className="flex-grow p-2.5 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 font-mono text-sm"
                />
                <button
                  onClick={handleSave}
                  disabled={!apiKeyInput.trim()}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-4 rounded-lg shadow-md transition duration-150 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  Save Key
                </button>
                {isKeySet && (
                  <button
                    onClick={handleRemove}
                    className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 px-4 rounded-lg shadow-md transition duration-150 ease-in-out whitespace-nowrap"
                  >
                    Remove Key
                  </button>
                )}
              </div>
            </div>

            {showSavedMessage && (
              <p className="text-sm text-green-500 dark:text-green-400">
                API Key saved successfully! Closing modal...
              </p>
            )}

            {!isKeySet && currentKeySource === 'none' && (
              <p className="text-sm text-yellow-600 dark:text-yellow-400">
                No API key is currently active. Please enter and save your key to use the application.
              </p>
            )}

            {currentKeySource === 'env' && isKeySet && (
              <p className="text-sm text-green-600 dark:text-green-400">
                An API key from an environment variable is currently active. You can override it by
                saving a new key here.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
