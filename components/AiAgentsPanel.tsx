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

import { useIsMobile } from '../hooks/useMediaQuery.ts';

export const AiAgentsPanel: React.FC = React.memo(() => {
  const isMobile = useIsMobile();
  const [mobileActiveView, setMobileActiveView] = useState<'builder' | 'list'>('builder');
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
    <div className="flex flex-col h-[calc(100vh-280px)] min-h-[500px] overflow-hidden max-w-[1600px] mx-auto">
      {/* Mobile Tab Switcher */}
      {isMobile && (
        <div className="flex p-1 bg-app-tertiary/50 rounded-xl mb-4 border border-app-border shrink-0">
          <button
            onClick={() => setMobileActiveView('builder')}
            className={`flex-1 py-2.5 text-xs font-black uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-2 ${
              mobileActiveView === 'builder'
                ? 'bg-app-main text-app-accent shadow-sm'
                : 'text-app-muted'
            }`}
          >
            <FaUserGear className="w-3.5 h-3.5" />
            Builder
          </button>
          <button
            onClick={() => setMobileActiveView('list')}
            className={`flex-1 py-2.5 text-xs font-black uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-2 ${
              mobileActiveView === 'list'
                ? 'bg-app-main text-app-accent shadow-sm'
                : 'text-app-muted'
            }`}
          >
            <FaCommentDots className="w-3.5 h-3.5" />
            Agents
            {profiles.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-md bg-app-accent text-white text-[8px] font-black">
                {profiles.length}
              </span>
            )}
          </button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8 flex-grow overflow-hidden">
        {/* Left Column: Agent Builder */}
        {(!isMobile || mobileActiveView === 'builder') && (
          <div className="flex-grow flex flex-col min-w-0 animate-in fade-in slide-in-from-left-4 duration-300 overflow-hidden">
            <div className="flex flex-col h-full bg-app-main rounded-2xl shadow-2xl border border-app-border overflow-hidden transition-all duration-300">
              <header className="px-6 py-5 border-b border-app-border flex items-center justify-between bg-app-secondary/50">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-app-accent text-white rounded-xl shadow-lg shadow-app-accent/20">
                    <FaUserGear className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-app-text leading-tight">
                      {selectedProfile ? 'Edit AI Agent' : 'Build New AI Agent'}
                    </h2>
                    <p className="text-xs text-app-muted font-medium uppercase tracking-wider">
                      Define persona & custom instructions
                    </p>
                  </div>
                </div>
                {selectedProfile && (
                  <button
                    onClick={resetForm}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-app-muted hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all active:scale-95"
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
                      className="flex items-center gap-2 text-sm font-bold text-app-muted mb-2 uppercase tracking-wide group-focus-within:text-app-accent transition-colors"
                    >
                      <FaRobot className="w-4 h-4 text-app-accent" />
                      Agent Name
                    </label>
                    <input
                      type="text"
                      id="profileName"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      placeholder="e.g., Senior Frontend Architect"
                      className="w-full px-5 py-3 rounded-xl border border-app-border bg-app-main text-app-text text-lg font-medium focus:ring-2 focus:ring-app-accent focus:border-transparent transition-all shadow-sm hover:border-app-accent/50 outline-none"
                    />
                  </div>

                  <div className="group flex flex-col flex-grow">
                    <div className="flex items-center justify-between mb-2">
                      <label
                        htmlFor="instructions"
                        className="flex items-center gap-2 text-sm font-bold text-app-muted uppercase tracking-wide group-focus-within:text-app-accent transition-colors"
                      >
                        <FaKeyboard className="w-4 h-4 text-app-accent" />
                        System Instructions
                      </label>
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-app-tertiary rounded-full">
                        <FaCircleInfo className="w-3 h-3 text-app-muted" />
                        <span className="text-[10px] font-bold text-app-muted uppercase tracking-tighter">
                          Markdown Supported
                        </span>
                      </div>
                    </div>
                    <textarea
                      id="instructions"
                      value={instructions}
                      onChange={(e) => setInstructions(e.target.value)}
                      placeholder="# Role Definition\nDescribe the agent's persona...\n\n# Capabilities\nList specific tasks..."
                      className="w-full flex-grow min-h-[300px] px-5 py-4 rounded-xl border border-app-border bg-app-main text-app-text font-mono text-sm leading-relaxed focus:ring-2 focus:ring-app-accent focus:border-transparent transition-all shadow-sm hover:border-app-accent/50 custom-scrollbar resize-none outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-app-border bg-app-secondary/30">
                <button
                  onClick={handleSaveProfile}
                  disabled={!profileName.trim() || !instructions.trim()}
                  className="w-full flex items-center justify-center gap-3 py-4 bg-app-accent hover:opacity-90 text-white font-bold text-lg rounded-xl shadow-xl shadow-app-accent/20 transition-all active:scale-95 disabled:opacity-40 disabled:grayscale disabled:cursor-not-allowed"
                >
                  {selectedProfile ? <FaPen className="w-5 h-5" /> : <FaPlus className="w-5 h-5" />}
                  {selectedProfile ? 'Update AI Agent' : 'Deploy New AI Agent'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Right Column: Existing Agents */}
        {(!isMobile || mobileActiveView === 'list') && (
          <div className="lg:w-96 flex-shrink-0 flex flex-col animate-in fade-in slide-in-from-right-4 duration-300 overflow-hidden">
            <div className="flex flex-col h-full bg-app-secondary/50 rounded-2xl border border-app-border overflow-hidden">
              <header className="px-6 py-5 border-b border-app-border flex items-center justify-between">
                <h3 className="text-lg font-bold text-app-text flex items-center gap-3">
                  <div className="p-2 bg-app-accent-soft rounded-lg text-app-accent">
                    <FaCommentDots className="w-5 h-5" />
                  </div>
                  Your Agents
                </h3>
                <span className="px-2.5 py-1 bg-app-main border border-app-border rounded-lg text-[10px] font-black text-app-muted">
                  {profiles.length} TOTAL
                </span>
              </header>

              <div className="flex-grow overflow-auto p-4 space-y-4 custom-scrollbar">
                {profiles.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-center p-6 border-2 border-dashed border-app-border rounded-2xl">
                    <div className="p-4 bg-app-main rounded-full text-app-muted mb-4 shadow-sm">
                      <FaRobot className="w-10 h-10" />
                    </div>
                    <p className="text-sm text-app-muted font-medium leading-relaxed">
                      No agents built yet.
                      <br />
                      Create your first one to get started.
                    </p>
                  </div>
                ) : (
                  profiles.map((profile, index) => (
                    <div
                      key={profile.id}
                      onClick={() => handleSelectProfile(profile)}
                      className={`group relative p-5 rounded-2xl border transition-all duration-300 cursor-pointer animate-in fade-in slide-in-from-right-4 [animation-delay:${index * 50}ms] ${
                        profile.isActive
                          ? 'bg-app-main border-app-accent shadow-xl shadow-app-accent/10 ring-1 ring-app-accent/50'
                          : 'bg-app-main border-app-border hover:border-app-accent/50 shadow-sm hover:shadow-md'
                      }`}
                    >
                      <div className="flex flex-col gap-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-grow">
                            <h4
                              className={`font-bold text-lg truncate ${profile.isActive ? 'text-app-accent' : 'text-app-text'}`}
                            >
                              {profile.name}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              {profile.isActive ? (
                                <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black bg-app-accent text-white uppercase tracking-wider">
                                  <FaCheck className="w-2.5 h-2.5" /> ACTIVE
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-app-tertiary text-app-muted uppercase tracking-wider">
                                  INACTIVE
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectProfile(profile);
                                if (isMobile) setMobileActiveView('builder');
                              }}
                              className="p-2 text-app-muted hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-all active:scale-95"
                              title="Edit Agent"
                            >
                              <FaPen className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteProfile(profile.id);
                              }}
                              className="p-2 text-app-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all active:scale-95"
                              title="Delete Agent"
                            >
                              <FaTrash className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {!profile.isActive && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSetActive(profile.id);
                            }}
                            className="w-full py-2.5 px-4 text-xs font-black text-app-accent bg-app-accent-soft border border-app-accent/20 rounded-xl hover:bg-app-accent hover:text-white transition-all uppercase tracking-widest active:scale-95"
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
        )}
      </div>
    </div>
  );
});
