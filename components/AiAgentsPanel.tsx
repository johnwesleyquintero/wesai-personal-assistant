import React, { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  getProfiles,
  saveProfile,
  deleteProfile,
  setActiveProfile,
  getActiveInstructionProfile,
} from '../services/instructionService';
import type { CustomInstructionProfile } from '../types';
import { FaRobot, FaTrash, FaEdit, FaTimes, FaCommentDots } from 'react-icons/fa';

const AiAgentsPanel: React.FC = () => {
  const [profiles, setProfiles] = useState<CustomInstructionProfile[]>(() => getProfiles());
  const [selectedProfile, setSelectedProfile] = useState<CustomInstructionProfile | null>(null);
  const [profileName, setProfileName] = useState('');
  const [instructions, setInstructions] = useState('');
  const [activeProfileId, setActiveProfileId] = useState<string | null>(
    () => getActiveInstructionProfile()?.id || null,
  );

  const loadProfiles = useCallback(() => {
    setProfiles(getProfiles());
  }, []);

  const handleSaveProfile = () => {
    if (!profileName || !instructions) {
      alert('Agent Name and Markdown Instructions cannot be empty.');
      return;
    }

    const newProfile: CustomInstructionProfile = selectedProfile
      ? { ...selectedProfile, name: profileName, instructions: instructions }
      : { id: uuidv4(), name: profileName, instructions: instructions, isActive: false };

    saveProfile(newProfile);
    loadProfiles();
    resetForm();
  };

  const handleDeleteProfile = (id: string) => {
    if (window.confirm('Are you sure you want to delete this AI Agent?')) {
      deleteProfile(id);
      loadProfiles();
      if (selectedProfile?.id === id) {
        resetForm();
      }
      if (activeProfileId === id) {
        setActiveProfileId(null);
        setActiveProfile('');
      }
    }
  };

  const handleSelectProfile = (profile: CustomInstructionProfile) => {
    setSelectedProfile(profile);
    setProfileName(profile.name);
    setInstructions(profile.instructions);
  };

  const handleSetActive = (id: string) => {
    setActiveProfile(id);
    setActiveProfileId(id);
    loadProfiles();
  };

  const resetForm = () => {
    setSelectedProfile(null);
    setProfileName('');
    setInstructions('');
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4 max-w-7xl mx-auto">
      {/* Left Column: Agent Builder */}
      <div className="flex-grow space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <header className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <FaRobot className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </span>
              {selectedProfile ? 'Edit AI Agent' : 'Build New AI Agent'}
            </h2>
            {selectedProfile && (
              <button
                onClick={resetForm}
                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 flex items-center gap-1"
              >
                <FaTimes className="w-4 h-4" /> Cancel Edit
              </button>
            )}
          </header>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="profileName"
                className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1"
              >
                Agent Name
              </label>
              <input
                type="text"
                id="profileName"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                placeholder="e.g., Senior Frontend Engineer"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label
                  htmlFor="instructions"
                  className="block text-sm font-semibold text-gray-700 dark:text-gray-300"
                >
                  System Instructions (Markdown)
                </label>
                <span className="text-xs text-gray-500 dark:text-gray-400">Markdown supported</span>
              </div>
              <textarea
                id="instructions"
                rows={12}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="# Role Definition\nDescribe the agent's persona...\n\n# Capabilities\nList specific tasks..."
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>

            <button
              onClick={handleSaveProfile}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold rounded-lg shadow-lg shadow-purple-500/20 transition-all transform hover:scale-[1.01] active:scale-[0.99]"
            >
              {selectedProfile ? 'Update AI Agent' : 'Create AI Agent'}
            </button>
          </div>
        </div>
      </div>

      {/* Right Column: Existing Agents */}
      <div className="lg:w-80 flex-shrink-0 space-y-6">
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 p-6 h-full">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-md text-blue-600 dark:text-blue-400">
              <FaCommentDots className="w-5 h-5" />
            </span>
            Active Agents
          </h3>

          {profiles.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                No agents built yet. Create your first one to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {profiles.map((profile) => (
                <div
                  key={profile.id}
                  className={`group p-4 rounded-xl border transition-all ${
                    profile.isActive
                      ? 'bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800 ring-1 ring-purple-500/50'
                      : 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700'
                  }`}
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0">
                        <h4 className="font-bold text-gray-900 dark:text-white truncate">
                          {profile.name}
                        </h4>
                        {profile.isActive && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 uppercase tracking-wider mt-1">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleSelectProfile(profile)}
                          className="p-1.5 text-gray-400 hover:text-blue-500 dark:text-gray-500 dark:hover:text-blue-400 transition-colors"
                          title="Edit Agent"
                        >
                          <FaEdit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProfile(profile.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors"
                          title="Delete Agent"
                        >
                          <FaTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {!profile.isActive && (
                      <button
                        onClick={() => handleSetActive(profile.id)}
                        className="w-full py-1.5 px-3 text-xs font-semibold text-purple-600 dark:text-purple-400 bg-purple-100/50 dark:bg-purple-900/30 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors"
                      >
                        Set as Active
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AiAgentsPanel;
