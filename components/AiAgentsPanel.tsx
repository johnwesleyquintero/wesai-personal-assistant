import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAppStore } from '../store';
import type { CustomInstructionProfile } from '../types';
import {
  FaRobot,
  FaTrash,
  FaPen,
  FaXmark,
  FaCommentDots,
  FaPlus,
  FaCheck,
  FaUserGear,
  FaKeyboard,
  FaCircleInfo,
} from 'react-icons/fa6';

export const AiAgentsPanel: React.FC = React.memo(() => {
  const profiles = useAppStore((state) => state.instructionProfiles);
  const initializeInstructionProfiles = useAppStore((state) => state.initializeInstructionProfiles);
  const handleSaveInstructionProfile = useAppStore((state) => state.handleSaveInstructionProfile);
  const handleDeleteInstructionProfile = useAppStore(
    (state) => state.handleDeleteInstructionProfile,
  );
  const handleSetActiveInstructionProfile = useAppStore(
    (state) => state.handleSetActiveInstructionProfile,
  );

  const [selectedProfile, setSelectedProfile] = useState<CustomInstructionProfile | null>(null);
  const [profileName, setProfileName] = useState('');
  const [instructions, setInstructions] = useState('');

  useEffect(() => {
    initializeInstructionProfiles();
  }, [initializeInstructionProfiles]);

  const handleSaveProfile = () => {
    if (!profileName || !instructions) {
      alert('Agent Name and Markdown Instructions cannot be empty.');
      return;
    }

    const newProfile: CustomInstructionProfile = selectedProfile
      ? { ...selectedProfile, name: profileName, instructions: instructions }
      : { id: uuidv4(), name: profileName, instructions: instructions, isActive: false };

    handleSaveInstructionProfile(newProfile);
    resetForm();
  };

  const handleDeleteProfile = (id: string) => {
    if (window.confirm('Are you sure you want to delete this AI Agent?')) {
      handleDeleteInstructionProfile(id);
      if (selectedProfile?.id === id) {
        resetForm();
      }
    }
  };

  const handleSelectProfile = (profile: CustomInstructionProfile) => {
    setSelectedProfile(profile);
    setProfileName(profile.name);
    setInstructions(profile.instructions);
  };

  const handleSetActive = (id: string) => {
    handleSetActiveInstructionProfile(id);
  };

  const resetForm = () => {
    setSelectedProfile(null);
    setProfileName('');
    setInstructions('');
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 p-6 max-w-[1600px] mx-auto h-[calc(100vh-250px)] min-h-[600px] animate-in fade-in duration-500">
      {/* Left Column: Agent Builder */}
      <div className="flex-grow flex flex-col min-w-0">
        <div className="flex flex-col h-full bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden transition-all duration-300">
          <header className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/30">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-xl shadow-lg shadow-purple-500/20">
                <FaUserGear className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
                  {selectedProfile ? 'Edit AI Agent' : 'Build New AI Agent'}
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">
                  Define persona & custom instructions
                </p>
              </div>
            </div>
            {selectedProfile && (
              <button
                onClick={resetForm}
                className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
              >
                <FaXmark className="w-4 h-4" /> CANCEL
              </button>
            )}
          </header>

          <div className="flex-grow overflow-auto p-6 custom-scrollbar">
            <div className="space-y-6 max-w-4xl">
              <div className="group">
                <label
                  htmlFor="profileName"
                  className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide"
                >
                  <FaRobot className="w-4 h-4 text-purple-500" />
                  Agent Name
                </label>
                <input
                  type="text"
                  id="profileName"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="e.g., Senior Frontend Architect"
                  className="w-full px-5 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-lg font-medium focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-sm hover:border-purple-300 dark:hover:border-purple-700"
                />
              </div>

              <div className="group flex flex-col flex-grow">
                <div className="flex items-center justify-between mb-2">
                  <label
                    htmlFor="instructions"
                    className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide"
                  >
                    <FaKeyboard className="w-4 h-4 text-indigo-500" />
                    System Instructions
                  </label>
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">
                    <FaCircleInfo className="w-3 h-3 text-gray-400" />
                    <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-tighter">
                      Markdown Supported
                    </span>
                  </div>
                </div>
                <textarea
                  id="instructions"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="# Role Definition\nDescribe the agent's persona...\n\n# Capabilities\nList specific tasks..."
                  className="w-full flex-grow min-h-[300px] px-5 py-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm leading-relaxed focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-sm hover:border-purple-300 dark:hover:border-purple-700 custom-scrollbar resize-none"
                />
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/20">
            <button
              onClick={handleSaveProfile}
              disabled={!profileName.trim() || !instructions.trim()}
              className="w-full flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-lg rounded-xl shadow-xl shadow-purple-500/20 transition-all transform active:scale-[0.98] disabled:opacity-40 disabled:grayscale disabled:cursor-not-allowed"
            >
              {selectedProfile ? <FaPen className="w-5 h-5" /> : <FaPlus className="w-5 h-5" />}
              {selectedProfile ? 'Update AI Agent' : 'Deploy New AI Agent'}
            </button>
          </div>
        </div>
      </div>

      {/* Right Column: Existing Agents */}
      <div className="lg:w-96 flex-shrink-0 flex flex-col">
        <div className="flex flex-col h-full bg-gray-50/50 dark:bg-gray-900/50 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <header className="px-6 py-5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                <FaCommentDots className="w-5 h-5" />
              </div>
              Your Agents
            </h3>
            <span className="px-2.5 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-[10px] font-black text-gray-500 dark:text-gray-400">
              {profiles.length} TOTAL
            </span>
          </header>

          <div className="flex-grow overflow-auto p-4 space-y-4 custom-scrollbar">
            {profiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center p-6 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
                <div className="p-4 bg-white dark:bg-gray-800 rounded-full text-gray-300 dark:text-gray-700 mb-4 shadow-sm">
                  <FaRobot className="w-10 h-10" />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                  No agents built yet.
                  <br />
                  Create your first one to get started.
                </p>
              </div>
            ) : (
              profiles.map((profile, index) => (
                <div
                  key={profile.id}
                  style={{ animationDelay: `${index * 50}ms` }}
                  className={`group relative p-5 rounded-2xl border transition-all duration-300 animate-in fade-in slide-in-from-right-4 ${
                    profile.isActive
                      ? 'bg-white dark:bg-gray-800 border-purple-500 shadow-xl shadow-purple-500/10 ring-1 ring-purple-500/50'
                      : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-800 hover:border-purple-300 dark:hover:border-purple-700 shadow-sm hover:shadow-md'
                  }`}
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-grow">
                        <h4
                          className={`font-bold text-lg truncate ${profile.isActive ? 'text-purple-600 dark:text-purple-400' : 'text-gray-900 dark:text-white'}`}
                        >
                          {profile.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          {profile.isActive ? (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black bg-purple-600 text-white uppercase tracking-wider">
                              <FaCheck className="w-2.5 h-2.5" /> ACTIVE
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              INACTIVE
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleSelectProfile(profile)}
                          className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                          title="Edit Agent"
                        >
                          <FaPen className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProfile(profile.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                          title="Delete Agent"
                        >
                          <FaTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {!profile.isActive && (
                      <button
                        onClick={() => handleSetActive(profile.id)}
                        className="w-full py-2 px-4 text-xs font-black text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800/50 rounded-xl hover:bg-purple-600 hover:text-white dark:hover:bg-purple-600 transition-all uppercase tracking-widest"
                      >
                        Activate Agent
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
});
