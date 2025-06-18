export type ActiveTab =
  | 'review'
  | 'refactor'
  | 'preview'
  | 'generate'
  | 'chat'
  | 'documentation'
  | 'content'
  | 'image'
  | 'custom-instructions';
export type ApiKeySource = 'ui' | 'env' | 'none';
export type Theme = 'light' | 'dark';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  componentCode?: string | null; // Extracted React component code string, if any
  showPreview?: boolean; // Toggles between code view and preview view for this message
}

export interface CustomInstructionProfile {
  id: string; // Unique identifier
  name: string;
  instructions: string;
  isActive: boolean; // Only one can be true at a time
}
