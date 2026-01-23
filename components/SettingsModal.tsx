import React, { useState, memo } from 'react';
import type { ApiKeySource } from '../types.ts';
import { useAppStore } from '../store.ts';
import {
  FaXmark,
  FaTriangleExclamation,
  FaCheck,
  FaTrash,
  FaArrowRightFromBracket,
  FaGear,
  FaCircleInfo,
} from 'react-icons/fa6';

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
    const [activeTab, setActiveTab] = useState<ModalTab>('settings');
    const [showConfirmRemove, setShowConfirmRemove] = useState<boolean>(false);

    const showStreamFinishNotes = useAppStore((state) => state.showStreamFinishNotes);
    const setShowStreamFinishNotes = useAppStore((state) => state.setShowStreamFinishNotes);
    const sendOnEnter = useAppStore((state) => state.sendOnEnter);
    const setSendOnEnter = useAppStore((state) => state.setSendOnEnter);
    const addToast = useAppStore((state) => state.addToast);

    if (!isOpen) {
      return null;
    }

    const handleSave = () => {
      if (apiKeyInput.trim()) {
        onSaveKey(apiKeyInput);
        addToast('Settings saved successfully', 'success');
        onClose();
      }
    };

    const handleRemove = () => {
      setShowConfirmRemove(true);
    };

    const handleConfirmRemove = () => {
      onRemoveKey();
      addToast('API Key removed', 'info');
      setShowConfirmRemove(false);
    };

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm dark:bg-gray-900/80 animate-in fade-in duration-300"
        onClick={onClose}
      >
        <div
          className="relative w-full max-w-2xl rounded-2xl bg-white p-0 shadow-2xl dark:bg-gray-900 flex flex-col overflow-hidden animate-in zoom-in-95 duration-300"
          style={{ maxHeight: '85vh' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <FaGear className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                Application Settings
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Close settings modal"
            >
              <FaXmark className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex px-6 border-b border-gray-100 dark:border-gray-800">
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-all relative ${
                activeTab === 'settings'
                  ? 'text-purple-600 dark:text-purple-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              <FaGear className="w-4 h-4" />
              Settings
              {activeTab === 'settings' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500 rounded-full" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('helpCenter')}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-all relative ${
                activeTab === 'helpCenter'
                  ? 'text-purple-600 dark:text-purple-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              <FaCircleInfo className="w-4 h-4" />
              Help Center
              {activeTab === 'helpCenter' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500 rounded-full" />
              )}
            </button>
          </div>

          {/* Content */}
          <div className="flex-grow overflow-y-auto p-8 custom-scrollbar">
            {activeTab === 'settings' && (
              <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-300">
                {/* Gemini API Key Section */}
                <section className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                        Gemini API Key
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Required for generating content and AI interactions.
                      </p>
                    </div>
                    {isKeySet && (
                      <span
                        className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${
                          currentKeySource === 'env'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400'
                        }`}
                      >
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${currentKeySource === 'env' ? 'bg-green-500' : 'bg-blue-500'}`}
                        />
                        {currentKeySource === 'env' ? 'Environment' : 'Browser Storage'}
                      </span>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="relative flex-grow">
                        <input
                          type="password"
                          id="apiKeyInput"
                          value={apiKeyInput}
                          onChange={(e) => setApiKeyInput(e.target.value)}
                          placeholder={
                            isKeySet ? '••••••••••••••••••••••••' : 'Enter your Gemini API Key'
                          }
                          className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                        />
                      </div>
                      <button
                        onClick={handleSave}
                        disabled={!apiKeyInput.trim()}
                        className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-500/20"
                      >
                        <FaCheck className="w-4 h-4" />
                        Save
                      </button>
                      {isKeySet && !showConfirmRemove && (
                        <button
                          onClick={handleRemove}
                          className="inline-flex items-center justify-center gap-2 bg-white dark:bg-gray-800 text-red-500 hover:text-red-600 border border-red-100 dark:border-red-900/30 font-bold py-3 px-6 rounded-xl transition-all"
                        >
                          <FaTrash className="w-4 h-4" />
                          Remove
                        </button>
                      )}
                    </div>

                    {showConfirmRemove && (
                      <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl animate-in fade-in slide-in-from-top-2">
                        <div className="flex items-center gap-3">
                          <FaTriangleExclamation className="text-red-500 w-5 h-5" />
                          <p className="text-sm font-medium text-red-700 dark:text-red-400">
                            Are you sure you want to remove the API key?
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setShowConfirmRemove(false)}
                            className="text-xs font-bold px-3 py-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleConfirmRemove}
                            className="text-xs font-bold px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                          >
                            Confirm
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </section>

                {/* Chat Behavior Section */}
                <section className="space-y-6">
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                      Chat Preferences
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Customize how you interact with the AI.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div
                      className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                        showStreamFinishNotes
                          ? 'bg-purple-50/50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-800/50'
                          : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700'
                      }`}
                      onClick={() => setShowStreamFinishNotes(!showStreamFinishNotes)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="font-bold text-gray-800 dark:text-gray-100">Stream Notes</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Show &quot;stream finished&quot; labels
                          </p>
                        </div>
                        <div
                          className={`w-10 h-6 rounded-full relative transition-colors ${showStreamFinishNotes ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'}`}
                        >
                          <div
                            className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${showStreamFinishNotes ? 'left-5' : 'left-1'}`}
                          />
                        </div>
                      </div>
                    </div>

                    <div
                      className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                        sendOnEnter
                          ? 'bg-purple-50/50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-800/50'
                          : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700'
                      }`}
                      onClick={() => setSendOnEnter(!sendOnEnter)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="font-bold text-gray-800 dark:text-gray-100">Quick Send</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Send message on Enter key
                          </p>
                        </div>
                        <div
                          className={`w-10 h-6 rounded-full relative transition-colors ${sendOnEnter ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'}`}
                        >
                          <div
                            className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${sendOnEnter ? 'left-5' : 'left-1'}`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Account Section */}
                <section className="pt-4 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                        Session Management
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Sign out of your current session.
                      </p>
                    </div>
                    {onLogout && (
                      <button
                        onClick={onLogout}
                        className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold py-2.5 px-5 rounded-xl transition-all"
                      >
                        <FaArrowRightFromBracket className="w-4 h-4" />
                        Logout
                      </button>
                    )}
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'helpCenter' && (
              <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
                <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                  <h3 className="text-lg font-bold text-blue-800 dark:text-blue-300 mb-2">
                    How to get an API Key?
                  </h3>
                  <p className="text-blue-700 dark:text-blue-400 text-sm leading-relaxed">
                    To use WesAI, you need a Gemini API key. You can get one for free from the
                    Google AI Studio.
                  </p>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-4 text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Go to Google AI Studio
                    <FaArrowRightFromBracket className="w-3 h-3 rotate-[-45deg]" />
                  </a>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                    <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-1">
                      Local Storage
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                      Your API key is stored securely in your browser&apos;s local storage and is
                      never sent to our servers.
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                    <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-1">
                      Privacy First
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                      All interactions are direct between your browser and the Gemini API.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Status */}
        </div>
      </div>
    );
  },
);
