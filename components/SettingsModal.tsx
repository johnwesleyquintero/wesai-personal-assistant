import React, { useState, memo } from 'react';
import { FaGithub } from 'react-icons/fa';
import { ThemeToggleButton } from './ThemeToggleButton';
import { ApiKeySource, Theme } from '../types.ts';
import { useAppStore } from '../store.ts';
import CustomInstructionsPanel from './CustomInstructionsPanel';

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

type ModalTab = 'settings' | 'helpCenter' | 'customInstructions';

export const SettingsModal: React.FC<SettingsModalProps> = memo(({
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
  const [activeTab, setActiveTab] = useState<ModalTab>('settings');
  const [showConfirmRemove, setShowConfirmRemove] = useState<boolean>(false);

  const { showStreamFinishNotes, setShowStreamFinishNotes, sendOnEnter, setSendOnEnter } = useAppStore();

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
    setShowConfirmRemove(true);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-gray-900/75"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl dark:bg-gray-900 flex flex-col"
        style={{ maxHeight: '80vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 z-10"
          aria-label="Close settings modal"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-6 w-6"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'settings'
                ? 'border-b-2 border-purple-500 text-purple-600 dark:text-purple-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            Settings
          </button>
          <button
            onClick={() => setActiveTab('helpCenter')}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'helpCenter'
                ? 'border-b-2 border-purple-500 text-purple-600 dark:text-purple-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            Help Center
          </button>
          <button
            onClick={() => setActiveTab('customInstructions')}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'customInstructions'
                ? 'border-b-2 border-purple-500 text-purple-600 dark:text-purple-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            Custom Instructions
          </button>
        </div>

        <div className="overflow-y-auto">
          {activeTab === 'settings' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div className="flex items-center">
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mr-2">
                    Manage Gemini API Key
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
                  {onLogout && (
                    <button
                      onClick={onLogout}
                      className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-3 rounded-lg shadow-md text-sm"
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
                      className="flex-grow p-2.5 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border rounded-lg"
                    />
                    <button
                      onClick={handleSave}
                      disabled={!apiKeyInput.trim()}
                      className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-4 rounded-lg disabled:opacity-60"
                    >
                      Save Key
                    </button>
                    {isKeySet && (
                      <button
                        onClick={handleRemove}
                        className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 px-4 rounded-lg"
                      >
                        Remove Key
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Chat Stream Notes
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      id="toggleStreamNotes"
                      type="checkbox"
                      checked={showStreamFinishNotes}
                      onChange={(e) => setShowStreamFinishNotes(e.target.checked)}
                      className="h-4 w-4"
                    />
                    <label htmlFor="toggleStreamNotes" className="text-sm text-gray-700 dark:text-gray-300">
                      Show "stream finished" annotations in chat
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Chat Input Behavior
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      id="toggleSendOnEnter"
                      type="checkbox"
                      checked={sendOnEnter}
                      onChange={(e) => setSendOnEnter(e.target.checked)}
                      className="h-4 w-4"
                    />
                    <label htmlFor="toggleSendOnEnter" className="text-sm text-gray-700 dark:text-gray-300">
                      Send on Enter (use Shift+Enter for newline)
                    </label>
                  </div>
                </div>

                {showSavedMessage && (
                  <p className="text-sm text-green-500 dark:text-green-400">
                    API Key saved successfully! Closing modal...
                  </p>
                )}

                {!isKeySet && currentKeySource === 'none' && (
                  <p className="text-sm text-yellow-600 dark:text-yellow-400">
                    No API key is currently active. Please enter and save your key.
                  </p>
                )}

                {currentKeySource === 'env' && isKeySet && (
                  <p className="text-sm text-green-600 dark:text-green-400">
                    An environment variable API key is active. You can override it here.
                  </p>
                )}
              </div>
            </div>
          )}
          {activeTab === 'helpCenter' && (
            <div className="p-4 text-gray-700 dark:text-gray-300">
              <h3 className="text-xl font-semibold mb-4">Help Center</h3>
              <p className="mb-2">
                Welcome to WesAI Personal Assistant! This application helps you interact with Google Gemini for various tasks.
              </p>
              <h4 className="text-lg font-semibold mt-4 mb-2">Key Features:</h4>
              <ul className="list-disc list-inside space-y-1">
                <li><span className="font-bold">Chat:</span> Engage in conversational AI to get answers, brainstorm ideas, and more.</li>
                <li><span className="font-bold">Generate Content:</span> Utilize AI to create various forms of textual content.</li>
                <li><span className="font-bold">Image Generation:</span> Generate images from text prompts.</li>
                <li><span className="font-bold">Code Interaction (Review/Refactor):</span> Submit code snippets for review, refactoring suggestions, or to generate code based on your requirements.</li>
                <li><span className="font-bold">Custom Instructions:</span> Personalize AI behavior with custom instructions for a tailored experience.</li>
              </ul>
              <h4 className="text-lg font-semibold mt-4 mb-2">How to Use:</h4>
              <ul className="list-disc list-inside space-y-1">
                <li><span className="font-bold">API Key:</span> Ensure your Gemini API key is set in the Settings tab to access AI functionalities. You can use an environment variable or save it directly in the UI.</li>
                <li><span className="font-bold">Tabs:</span> Navigate between different functionalities (Chat, Generate Content, Image Generation) using the tabs at the top.</li>
                <li><span className="font-bold">Settings:</span> Access general settings, manage your API key, and configure chat behavior.</li>
              </ul>
              <p className="mt-4">If you encounter any issues, please refer to the Change Log for recent updates or contact support for further assistance.</p>
            </div>
          )}
          {activeTab === 'customInstructions' && <CustomInstructionsPanel />}
        </div>

        {showConfirmRemove && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Remove API Key?</h4>
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                This clears the saved key and session content, and features will be disabled if no environment key is active.
              </p>
              <div className="mt-4 flex justify-end space-x-2">
                <button
                  onClick={() => setShowConfirmRemove(false)}
                  className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => { onRemoveKey(); setApiKeyInput(''); setShowConfirmRemove(false); }}
                  className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
