/**
 * Utility functions for string and code parsing.
 */

/**
 * Parses a suggested filename from a React/TypeScript code block.
 * Looks for default exports or function/const names.
 */
export const getDownloadNameFromCode = (code: string, fallbackId: string): string => {
  const s = code;
  const m1 = s.match(/export\s+default\s+function\s+([A-Za-z_][A-Za-z0-9_]*)/);
  if (m1) return `${m1[1]}.tsx`;
  const m2 = s.match(/export\s+default\s+([A-Za-z_][A-Za-z0-9_]*)/);
  if (m2) return `${m2[1]}.tsx`;
  const m3 = s.match(/function\s+([A-Za-z_][A-Za-z0-9_]*)/);
  if (m3 && s.includes(`export default ${m3[1]}`)) return `${m3[1]}.tsx`;
  const m4 = s.match(/const\s+([A-Za-z_][A-Za-z0-9_]*)\s*=\s*\(/);
  if (m4 && s.includes(`export default ${m4[1]}`)) return `${m4[1]}.tsx`;
  return `component-${fallbackId}.tsx`;
};

/**
 * Truncates text with ellipsis if it exceeds the maximum length.
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};
