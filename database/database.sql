-- Create the flowers table
CREATE TABLE IF NOT EXISTS flowers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    image_url TEXT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    recommendations TEXT,
    health_status VARCHAR(100), -- e.g., 'healthy', 'diseased', 'needs_attention', 'unknown'
    confidence_score DECIMAL(5,4), -- AI confidence score (0.0000 to 1.0000)
    health_notes TEXT, -- Additional health observations and recommendations
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Add the health_notes column if it doesn't exist (for existing tables)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'flowers' AND column_name = 'health_notes'
    ) THEN
        ALTER TABLE flowers ADD COLUMN health_notes TEXT;
    END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE flowers ENABLE ROW LEVEL SECURITY;

-- Create policies for the flowers table
-- Policy 1: Users can insert their own flowers
CREATE POLICY "Users can insert their own flowers" ON flowers
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy 2: Users can view their own flowers
CREATE POLICY "Users can view their own flowers" ON flowers
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy 3: Users can update their own flowers
CREATE POLICY "Users can update their own flowers" ON flowers
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy 4: Users can delete their own flowers
CREATE POLICY "Users can delete their own flowers" ON flowers
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS flowers_user_id_idx ON flowers(user_id);
CREATE INDEX IF NOT EXISTS flowers_created_at_idx ON flowers(created_at);
CREATE INDEX IF NOT EXISTS flowers_health_status_idx ON flowers(health_status);

-- Create function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at on row updates
CREATE TRIGGER update_flowers_updated_at 
    BEFORE UPDATE ON flowers 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();