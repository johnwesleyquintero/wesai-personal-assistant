import React, { useState, memo } from 'react';
import type { ApiKeySource } from '../types.ts';
import { useAppStore } from '../store.ts';
import { SVG_ICONS } from '../src/constants';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveKey: (key: string) => void;
  onRemoveKey: () => void;
  isKeySet: boolean;
  currentKeySource: ApiKeySource;
  onLogout: () => void;
}

type ModalTab = 'settings' | 'helpCenter';

export const SettingsModal: React.FC<SettingsModalProps> = memo(
  ({ isOpen, onClose, onSaveKey, onRemoveKey, isKeySet, currentKeySource, onLogout }) => {
    const [apiKeyInput, setApiKeyInput] = useState<string>('');
    const [showSavedMessage, setShowSavedMessage] = useState<boolean>(false);
    const [activeTab, setActiveTab] = useState<ModalTab>('settings');
    const [showConfirmRemove, setShowConfirmRemove] = useState<boolean>(false);

    const { showStreamFinishNotes, setShowStreamFinishNotes, sendOnEnter, setSendOnEnter } =
      useAppStore();

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
            {SVG_ICONS.CLOSE}
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
                      <label
                        htmlFor="toggleStreamNotes"
                        className="text-sm text-gray-700 dark:text-gray-300"
                      >
                        Show &quot;stream finished&quot; annotations in chat
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
                      <label
                        htmlFor="toggleSendOnEnter"
                        className="text-sm text-gray-700 dark:text-gray-300"
                      >
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
                <h3 className="text-xl font-semibold mb-4">WesAI Help Center</h3>
                <p className="mb-2">
                  Welcome to WesAI, the ultimate platform to build, deploy, and optimize your AI
                  agents. Powered by Google Gemini, WesAI empowers you to streamline professional
                  workflows and automate complex tasks with specialized intelligence.
                </p>

                <h4 className="text-lg font-semibold mt-4 mb-2">Core Features:</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    <span className="font-bold">AI Agent Builder:</span> Create and configure custom
                    AI agents with specialized system instructions using Markdown. Tailor your
                    agents for specific roles like strategy, coding, or operations.
                  </li>
                  <li>
                    <span className="font-bold">Workflow Optimization:</span> Leverage your custom
                    agents to automate repetitive tasks and streamline complex professional
                    workflows.
                  </li>
                  <li>
                    <span className="font-bold">Chat Interface:</span> Engage in dynamic
                    conversations with your agents, ask questions, and get actionable insights.
                    Save, rename, and manage multiple chat sessions locally.
                  </li>
                  <li>
                    <span className="font-bold">Code Interaction:</span> Comprehensive code
                    assistance including:
                    <ul className="list-disc list-inside ml-4 mt-1">
                      <li>
                        <span className="font-bold">Review:</span> Analyze code for bugs, security
                        issues, and best practices.
                      </li>
                      <li>
                        <span className="font-bold">Refactor:</span> Improve code structure,
                        readability, and performance.
                      </li>
                      <li>
                        <span className="font-bold">Generate:</span> Create new code from
                        requirements or specifications.
                      </li>
                      <li>
                        <span className="font-bold">Preview:</span> Test and visualize React
                        components in real-time.
                      </li>
                    </ul>
                  </li>
                </ul>

                <h4 className="text-lg font-semibold mt-4 mb-2">Privacy & Security:</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    <span className="font-bold">Local-First Storage:</span> Your agents,
                    conversations, and configurations are stored securely on your device. No cloud
                    database is used.
                  </li>
                  <li>
                    <span className="font-bold">Secure Access:</span> Google-styled authentication
                    protects your local session and API keys.
                  </li>
                </ul>

                <h4 className="text-lg font-semibold mt-4 mb-2">Getting Started:</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    <span className="font-bold">Login:</span> Sign in to enter your private
                    workspace.
                  </li>
                  <li>
                    <span className="font-bold">API Key Setup:</span> Configure your Gemini API key
                    in the <span className="font-bold">Settings</span> tab to activate AI features.
                  </li>
                  <li>
                    <span className="font-bold">Build Your Agent:</span> Use the AI Agent Builder to
                    define your first specialized assistant.
                  </li>
                  <li>
                    <span className="font-bold">Start Chatting:</span> Select an agent and start a
                    conversation to optimize your workflow.
                  </li>
                </ul>

                <h4 className="text-lg font-semibold mt-4 mb-2">Pro Tips:</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    <span className="font-bold">Markdown Instructions:</span> Use rich Markdown in
                    your agent instructions to define complex behaviors and output formats.
                  </li>
                  <li>
                    <span className="font-bold">Session Management:</span> Keep your workspace
                    organized by renaming and duplicating chat sessions for different projects.
                  </li>
                  <li>
                    <span className="font-bold">Code Preview:</span> Use the Preview mode to rapidly
                    prototype React components before integration.
                  </li>
                </ul>
              </div>
            )}
          </div>

          {showConfirmRemove && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Remove API Key?
                </h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                  This clears the saved key and session content, and features will be disabled if no
                  environment key is active.
                </p>
                <div className="mt-4 flex justify-end space-x-2">
                  <button
                    onClick={() => setShowConfirmRemove(false)}
                    className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      onRemoveKey();
                      setApiKeyInput('');
                      setShowConfirmRemove(false);
                    }}
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
  },
);
