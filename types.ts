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

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      chat_sessions: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          created_at: string;
          messages: ChatMessage[]; // Changed from Json to ChatMessage[]
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          created_at?: string;
          messages?: ChatMessage[]; // Changed from Json to ChatMessage[]
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          created_at?: string;
          messages?: ChatMessage[]; // Changed from Json to ChatMessage[]
        };
        Relationships: [
          {
            foreignKeyName: 'chat_sessions_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database[Extract<keyof Database, 'public'>];

export type Tables<T extends keyof PublicSchema['Tables']> = PublicSchema['Tables'][T]['Row'];
export type TablesInsert<T extends keyof PublicSchema['Tables']> =
  PublicSchema['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof PublicSchema['Tables']> =
  PublicSchema['Tables'][T]['Update'];

export type Enums<T extends keyof PublicSchema['Enums']> = PublicSchema['Enums'][T];
