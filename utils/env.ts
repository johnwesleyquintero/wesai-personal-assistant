// utils/env.ts
/**
 * Safely accesses environment variables.
 * Falls back to an empty string if the variable is not defined or if import.meta.env is not available.
 * @param key The name of the environment variable (e.g., 'VITE_GEMINI_API_KEY').
 * @returns The value of the environment variable, or an empty string if not found.
 */
export const getEnvVariable = (key: string): string => {
  if (typeof import.meta.env !== 'undefined' && import.meta.env[key]) {
    return String(import.meta.env[key]);
  }
  return '';
};
