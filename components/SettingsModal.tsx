import React, { useState, memo } from 'react';
import type { ApiKeySource } from '../types.ts';
import { useAppStore } from '../store.ts';
import { toast } from '../utils/toast';
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

    if (!isOpen) {
      return null;
    }

    const handleSave = () => {
      if (apiKeyInput.trim()) {
        onSaveKey(apiKeyInput);
        toast.success('Settings saved successfully');
        onClose();
      }
    };

    const handleRemove = () => {
      setShowConfirmRemove(true);
    };

    const handleConfirmRemove = () => {
      onRemoveKey();
      toast.info('API Key removed');
      setShowConfirmRemove(false);
    };

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm dark:bg-app-main/80 animate-in fade-in duration-300"
        onClick={onClose}
      >
        <div
          className="relative w-full max-w-2xl rounded-2xl bg-app-main p-0 shadow-2xl border border-app-border flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 max-h-[85vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-app-border bg-app-secondary/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-app-accent-soft rounded-lg">
                <FaGear className="w-5 h-5 text-app-accent" />
              </div>
              <h2 className="text-xl font-bold text-app-text">Application Settings</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-app-muted hover:text-app-text transition-colors rounded-full hover:bg-app-tertiary active:scale-95"
              aria-label="Close settings modal"
            >
              <FaXmark className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex px-6 border-b border-app-border">
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-all relative active:scale-95 ${
                activeTab === 'settings' ? 'text-app-accent' : 'text-app-muted hover:text-app-text'
              }`}
            >
              <FaGear className="w-4 h-4" />
              Settings
              {activeTab === 'settings' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-app-accent rounded-full" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('helpCenter')}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-all relative active:scale-95 ${
                activeTab === 'helpCenter'
                  ? 'text-app-accent'
                  : 'text-app-muted hover:text-app-text'
              }`}
            >
              <FaCircleInfo className="w-4 h-4" />
              Help Center
              {activeTab === 'helpCenter' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-app-accent rounded-full" />
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
                      <h3 className="text-lg font-bold text-app-text">Gemini API Key</h3>
                      <p className="text-sm text-app-muted">
                        Required for generating content and AI interactions.
                      </p>
                    </div>
                    {isKeySet && (
                      <span
                        className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${
                          currentKeySource === 'env'
                            ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                            : 'bg-app-accent-soft text-app-accent'
                        }`}
                      >
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${currentKeySource === 'env' ? 'bg-green-500' : 'bg-app-accent'}`}
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
                          className="w-full p-3 bg-app-tertiary border border-app-border rounded-xl text-app-text focus:ring-2 focus:ring-app-accent/20 focus:border-app-accent outline-none transition-all shadow-sm"
                        />
                      </div>
                      <button
                        onClick={handleSave}
                        disabled={!apiKeyInput.trim()}
                        className="inline-flex items-center justify-center gap-2 bg-app-accent hover:opacity-90 text-white font-bold py-3 px-6 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-app-accent/20 active:scale-95"
                      >
                        <FaCheck className="w-4 h-4" />
                        Save
                      </button>
                      {isKeySet && !showConfirmRemove && (
                        <button
                          onClick={handleRemove}
                          className="inline-flex items-center justify-center gap-2 bg-app-main text-red-600 dark:text-red-400 hover:bg-red-500/10 border border-red-500/20 font-bold py-3 px-6 rounded-xl transition-all active:scale-95"
                        >
                          <FaTrash className="w-4 h-4" />
                          Remove
                        </button>
                      )}
                    </div>

                    {showConfirmRemove && (
                      <div className="flex items-center justify-between p-4 bg-red-500/10 border border-red-500/20 rounded-xl animate-in fade-in slide-in-from-top-2">
                        <div className="flex items-center gap-3">
                          <FaTriangleExclamation className="text-red-600 dark:text-red-400 w-5 h-5" />
                          <p className="text-sm font-medium text-red-600 dark:text-red-400">
                            Are you sure you want to remove the API key?
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setShowConfirmRemove(false)}
                            className="text-xs font-bold px-3 py-1.5 text-app-muted hover:text-app-text transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleConfirmRemove}
                            className="text-xs font-bold px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all active:scale-95"
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
                    <h3 className="text-lg font-bold text-app-text">Chat Preferences</h3>
                    <p className="text-sm text-app-muted">
                      Customize how you interact with the AI.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div
                      className={`p-4 rounded-2xl border transition-all cursor-pointer active:scale-95 ${
                        showStreamFinishNotes
                          ? 'bg-app-accent-soft border-app-accent/50'
                          : 'bg-app-main border-app-border hover:border-app-accent/30'
                      }`}
                      onClick={() => setShowStreamFinishNotes(!showStreamFinishNotes)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="font-bold text-app-text">Stream Notes</p>
                          <p className="text-xs text-app-muted">
                            Show &quot;stream finished&quot; labels
                          </p>
                        </div>
                        <div
                          className={`w-10 h-6 rounded-full relative transition-colors ${showStreamFinishNotes ? 'bg-app-accent' : 'bg-app-tertiary'}`}
                        >
                          <div
                            className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${showStreamFinishNotes ? 'left-5' : 'left-1'}`}
                          />
                        </div>
                      </div>
                    </div>

                    <div
                      className={`p-4 rounded-2xl border transition-all cursor-pointer active:scale-95 ${
                        sendOnEnter
                          ? 'bg-app-accent-soft border-app-accent/50'
                          : 'bg-app-main border-app-border hover:border-app-accent/30'
                      }`}
                      onClick={() => setSendOnEnter(!sendOnEnter)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="font-bold text-app-text">Quick Send</p>
                          <p className="text-xs text-app-muted">Send message on Enter key</p>
                        </div>
                        <div
                          className={`w-10 h-6 rounded-full relative transition-colors ${sendOnEnter ? 'bg-app-accent' : 'bg-app-tertiary'}`}
                        >
                          <div
                            className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${sendOnEnter ? 'left-5' : 'left-1'}`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Account Section */}
                <section className="pt-4 border-t border-app-border">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold text-app-text">Session Management</h3>
                      <p className="text-sm text-app-muted">Sign out of your current session.</p>
                    </div>
                    {onLogout && (
                      <button
                        onClick={onLogout}
                        className="inline-flex items-center gap-2 bg-app-tertiary hover:bg-app-tertiary/80 text-app-text font-bold py-2.5 px-5 rounded-xl transition-all active:scale-95"
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
                <div className="p-6 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                  <h3 className="text-lg font-bold text-blue-600 dark:text-blue-400 mb-2">
                    How to get an API Key?
                  </h3>
                  <p className="text-blue-600/80 dark:text-blue-400/80 text-sm leading-relaxed">
                    To use WesAI, you need a Gemini API key. You can get one for free from the
                    Google AI Studio.
                  </p>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-4 text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline active:scale-95 transition-all"
                  >
                    Go to Google AI Studio
                    <FaArrowRightFromBracket className="w-3 h-3 rotate-[-45deg]" />
                  </a>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-app-secondary rounded-2xl border border-app-border">
                    <h4 className="font-bold text-app-text mb-1">Local Storage</h4>
                    <p className="text-xs text-app-muted leading-relaxed">
                      Your API key is stored securely in your browser&apos;s local storage and is
                      never sent to our servers.
                    </p>
                  </div>
                  <div className="p-4 bg-app-secondary rounded-2xl border border-app-border">
                    <h4 className="font-bold text-app-text mb-1">Privacy First</h4>
                    <p className="text-xs text-app-muted leading-relaxed">
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
