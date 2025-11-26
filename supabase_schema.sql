-- Supabase Database Schema Setup for WesAI Personal Assistant
-- This script configures your Supabase project to match the codebase

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create chat_sessions table with JSONB for messages storage
-- This matches your ChatMessage[] type in the frontend
CREATE TABLE IF NOT EXISTS public.chat_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    messages JSONB NOT NULL DEFAULT '[]'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON public.chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_created_at ON public.chat_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_created ON public.chat_sessions(user_id, created_at DESC);

-- Create updated_at trigger to automatically update the timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_chat_sessions_updated_at 
    BEFORE UPDATE ON public.chat_sessions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own chat sessions
CREATE POLICY "Users can view own chat sessions" ON public.chat_sessions
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can only insert their own chat sessions
CREATE POLICY "Users can insert own chat sessions" ON public.chat_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only update their own chat sessions
CREATE POLICY "Users can update own chat sessions" ON public.chat_sessions
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can only delete their own chat sessions
CREATE POLICY "Users can delete own chat sessions" ON public.chat_sessions
    FOR DELETE USING (auth.uid() = user_id);

-- Create a function to validate ChatMessage structure
CREATE OR REPLACE FUNCTION validate_chat_messages(messages JSONB)
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if it's an array
    IF NOT jsonb_typeof(messages) = 'array' THEN
        RETURN FALSE;
    END IF;
    
    -- Validate each message has required fields
    IF EXISTS (
        SELECT 1 FROM jsonb_array_elements(messages) msg
        WHERE NOT (
            msg ? 'id' AND 
            msg ? 'role' AND 
            msg ? 'content' AND
            (msg->>'role' = 'user' OR msg->>'role' = 'model')
        )
    ) THEN
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Add constraint to validate messages structure
ALTER TABLE public.chat_sessions 
ADD CONSTRAINT valid_chat_messages 
CHECK (validate_chat_messages(messages));

-- Create a function to get chat sessions with proper ordering
CREATE OR REPLACE FUNCTION get_user_chat_sessions(user_uuid UUID)
RETURNS TABLE (
    id UUID,
    name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE,
    messages JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT cs.id, cs.name, cs.created_at, cs.messages
    FROM public.chat_sessions cs
    WHERE cs.user_id = user_uuid
    ORDER BY cs.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT ALL ON public.chat_sessions TO authenticated;
GRANT SELECT ON public.chat_sessions TO anon;

-- Create a trigger to ensure messages are always valid JSON before insert/update
CREATE OR REPLACE FUNCTION ensure_valid_messages()
RETURNS TRIGGER AS $$
BEGIN
    -- Ensure messages is always an array, even if empty
    IF NEW.messages IS NULL THEN
        NEW.messages = '[]'::jsonb;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ensure_valid_messages_trigger
    BEFORE INSERT OR UPDATE ON public.chat_sessions
    FOR EACH ROW
    EXECUTE FUNCTION ensure_valid_messages();

-- Insert sample data for testing (optional - remove in production)
-- This is just to verify the setup works
/*
INSERT INTO public.chat_sessions (user_id, name, messages) 
VALUES (
    '00000000-0000-0000-0000-000000000000', -- Replace with actual user ID for testing
    'Sample Chat Session',
    '[
        {
            "id": "1",
            "role": "user",
            "content": "Hello, how are you?",
            "componentCode": null,
            "showPreview": false
        },
        {
            "id": "2", 
            "role": "model",
            "content": "I\'m doing well, thank you! How can I assist you today?",
            "componentCode": null,
            "showPreview": false
        }
    ]'::jsonb
);
*/

-- Add comment documentation
COMMENT ON TABLE public.chat_sessions IS 'Stores user chat sessions with messages in JSONB format';
COMMENT ON COLUMN public.chat_sessions.id IS 'Unique identifier for the chat session';
COMMENT ON COLUMN public.chat_sessions.user_id IS 'Reference to the authenticated user';
COMMENT ON COLUMN public.chat_sessions.name IS 'Display name for the chat session';
COMMENT ON COLUMN public.chat_sessions.created_at IS 'Timestamp when the session was created';
COMMENT ON COLUMN public.chat_sessions.messages IS 'Array of ChatMessage objects stored as JSONB';
COMMENT ON COLUMN public.chat_sessions.updated_at IS 'Timestamp when the session was last updated';

-- Verify the setup
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'chat_sessions' 
AND table_schema = 'public'
ORDER BY ordinal_position;