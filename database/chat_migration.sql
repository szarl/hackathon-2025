-- Create the chat_messages table for storing chat history per flower
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    flower_id UUID NOT NULL REFERENCES flowers(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    audio_url TEXT, -- For storing voice messages
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for the chat_messages table
-- Policy 1: Users can insert their own chat messages
CREATE POLICY "Users can insert their own chat messages" ON chat_messages
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy 2: Users can view their own chat messages
CREATE POLICY "Users can view their own chat messages" ON chat_messages
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy 3: Users can update their own chat messages
CREATE POLICY "Users can update their own chat messages" ON chat_messages
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy 4: Users can delete their own chat messages
CREATE POLICY "Users can delete their own chat messages" ON chat_messages
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS chat_messages_flower_id_idx ON chat_messages(flower_id);
CREATE INDEX IF NOT EXISTS chat_messages_user_id_idx ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS chat_messages_created_at_idx ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS chat_messages_flower_user_idx ON chat_messages(flower_id, user_id);

-- Create trigger to automatically update updated_at on row updates
CREATE TRIGGER update_chat_messages_updated_at 
    BEFORE UPDATE ON chat_messages 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
