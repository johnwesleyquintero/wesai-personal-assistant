/**
 * Utility functions for Gemini API interactions
 */

/**
 * Parses a base64 data URL into its mimeType and raw base64 data parts.
 * If the input is not a data URL, it assumes it's raw base64 data and defaults to image/jpeg.
 */
export const parseBase64 = (base64String: string): { mimeType: string; data: string } => {
  const match = base64String.match(/^data:(image\/[a-zA-Z]+);base64,(.+)$/);
  if (match) {
    return { mimeType: match[1], data: match[2] };
  }
  return { mimeType: 'image/jpeg', data: base64String }; // Fallback
};
