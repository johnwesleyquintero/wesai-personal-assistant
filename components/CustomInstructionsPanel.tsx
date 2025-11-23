import React, { useState, useEffect } from 'react';
import { CustomInstructionProfile } from '../types';
import {
  getProfiles,
  saveProfile,
  deleteProfile,
  setActiveProfile,
  getActiveInstructionProfile,
} from '../services/instructionService';
import { v4 as uuidv4 } from 'uuid'; // Assuming uuid is installed for unique IDs

const CustomInstructionsPanel: React.FC = () => {
  const [profiles, setProfiles] = useState<CustomInstructionProfile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<CustomInstructionProfile | null>(null);
  const [profileName, setProfileName] = useState('');
  const [instructions, setInstructions] = useState('');
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);

  useEffect(() => {
    loadProfiles();
    const active = getActiveInstructionProfile();
    if (active) {
      setActiveProfileId(active.id);
    }
  }, []);

  const loadProfiles = () => {
    setProfiles(getProfiles());
  };

  const handleSaveProfile = () => {
    if (!profileName || !instructions) {
      alert('Profile Name and Instructions cannot be empty.');
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
    if (window.confirm('Are you sure you want to delete this profile?')) {
      deleteProfile(id);
      loadProfiles();
      if (selectedProfile?.id === id) {
        resetForm();
      }
      if (activeProfileId === id) {
        setActiveProfileId(null);
        // Optionally set a default profile or clear active
        setActiveProfile(''); // Clear active profile
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
    loadProfiles(); // Reload to update isActive status in the list
  };

  const resetForm = () => {
    setSelectedProfile(null);
    setProfileName('');
    setInstructions('');
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Custom Instruction Profiles</h2>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">
          {selectedProfile ? 'Edit Profile' : 'Create New Profile'}
        </h3>
        <div className="mb-4">
          <label
            htmlFor="profileName"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Profile Name
          </label>
          <input
            type="text"
            id="profileName"
            value={profileName}
            onChange={(e) => setProfileName(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="instructions"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Instructions
          </label>
          <textarea
            id="instructions"
            rows={6}
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          ></textarea>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={handleSaveProfile}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {selectedProfile ? 'Update Profile' : 'Create Profile'}
          </button>
          {selectedProfile && (
            <button
              onClick={resetForm}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500"
            >
              Cancel Edit
            </button>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Existing Profiles</h3>
        {profiles.length === 0 ? (
          <p>No custom instruction profiles found.</p>
        ) : (
          <ul className="space-y-2">
            {profiles.map((profile) => (
              <li
                key={profile.id}
                className={`flex justify-between items-center p-3 rounded-md ${
                  profile.isActive
                    ? 'bg-green-100 dark:bg-green-800'
                    : 'bg-gray-100 dark:bg-gray-700'
                }`}
              >
                <div>
                  <span className="font-medium">{profile.name}</span>
                  {profile.isActive && (
                    <span className="ml-2 text-xs text-green-700 dark:text-green-300">
                      (Active)
                    </span>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleSelectProfile(profile)}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteProfile(profile.id)}
                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-600"
                  >
                    Delete
                  </button>
                  {!profile.isActive && (
                    <button
                      onClick={() => handleSetActive(profile.id)}
                      className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-600"
                    >
                      Set Active
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default CustomInstructionsPanel;
