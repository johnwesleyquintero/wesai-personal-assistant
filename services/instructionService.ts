import type { CustomInstructionProfile } from '../types';

const STORAGE_KEY = 'customInstructionProfiles';

// Custom error class for localStorage operations
export class LocalStorageError extends Error {
  constructor(
    message: string,
    public originalError?: unknown,
  ) {
    super(message);
    this.name = 'LocalStorageError';
    Object.setPrototypeOf(this, LocalStorageError.prototype);
  }
}

// Helper function to get profiles from localStorage
function getStoredProfiles(): CustomInstructionProfile[] {
  try {
    const profilesJson = localStorage.getItem(STORAGE_KEY);
    return profilesJson ? JSON.parse(profilesJson) : [];
  } catch (error) {
    console.error('Error reading profiles from localStorage:', error);
    throw new LocalStorageError(
      'Failed to read custom instruction profiles from local storage.',
      error,
    );
  }
}

// Helper function to save profiles to localStorage
function saveStoredProfiles(profiles: CustomInstructionProfile[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
  } catch (error) {
    console.error('Error saving profiles to localStorage:', error);
    throw new LocalStorageError(
      'Failed to save custom instruction profiles to local storage.',
      error,
    );
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
