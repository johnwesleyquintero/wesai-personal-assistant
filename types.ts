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

export interface SavedChatSession {
  id: string;
  name: string;
  timestamp: number; // Unix timestamp for when the session was saved
  messages: ChatMessage[];
  customInstructionProfileId?: string | null; // Optional: Link to a CustomInstructionProfile by ID
}

export interface CustomInstructionProfile {
  id: string; // Unique identifier
  name: string;
  instructions: string;
  isActive: boolean; // Only one can be true at a time
}

export type AspectRatio = '1:1' | '16:9' | '4:3' | '3:2' | '2:3' | '9:16' | '3:4';
