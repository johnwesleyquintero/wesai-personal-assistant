import { CustomInstructionProfile } from '../types';

const STORAGE_KEY = 'customInstructionProfiles';

// Helper function to get profiles from localStorage
function getStoredProfiles(): CustomInstructionProfile[] {
  try {
    const profilesJson = localStorage.getItem(STORAGE_KEY);
    return profilesJson ? JSON.parse(profilesJson) : [];
  } catch (error) {
    console.error('Error reading profiles from localStorage:', error);
    return [];
  }
}

// Helper function to save profiles to localStorage
function saveStoredProfiles(profiles: CustomInstructionProfile[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
  } catch (error) {
    console.error('Error saving profiles to localStorage:', error);
  }
}

export function saveProfile(profile: CustomInstructionProfile): void {
  const profiles = getStoredProfiles();
  const existingIndex = profiles.findIndex((p) => p.id === profile.id);

  if (existingIndex > -1) {
    // Update existing profile
    profiles[existingIndex] = profile;
  } else {
    // Add new profile
    profiles.push(profile);
  }

  saveStoredProfiles(profiles);
}

export function getProfiles(): CustomInstructionProfile[] {
  return getStoredProfiles();
}

export function deleteProfile(id: string): void {
  let profiles = getStoredProfiles();
  profiles = profiles.filter((profile) => profile.id !== id);
  saveStoredProfiles(profiles);
}

export function setActiveProfile(id: string): void {
  let profiles = getStoredProfiles();
  profiles = profiles.map((profile) => ({
    ...profile,
    isActive: profile.id === id,
  }));
  saveStoredProfiles(profiles);
}

export function getActiveInstructionProfile(): CustomInstructionProfile | null {
  const profiles = getStoredProfiles();
  return profiles.find((profile) => profile.isActive) || null;
}
