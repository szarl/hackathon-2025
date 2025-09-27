-- Create flower_updates table for storing scan results and AI analysis
CREATE TABLE IF NOT EXISTS flower_updates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    flower_id UUID NOT NULL REFERENCES flowers(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    scan_image_url TEXT,
    ai_analysis JSONB,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, completed, failed
    confidence_score DECIMAL(3,2), -- 0.00 to 1.00
    issue_type TEXT, -- e.g., 'light', 'water', 'nutrients', 'pests'
    issue_description TEXT,
    recommendations JSONB, -- Array of recommendation objects
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_flower_updates_flower_id ON flower_updates(flower_id);
CREATE INDEX IF NOT EXISTS idx_flower_updates_user_id ON flower_updates(user_id);
CREATE INDEX IF NOT EXISTS idx_flower_updates_created_at ON flower_updates(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_flower_updates_status ON flower_updates(status);

-- Enable Row Level Security
ALTER TABLE flower_updates ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own flower updates" ON flower_updates
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own flower updates" ON flower_updates
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own flower updates" ON flower_updates
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own flower updates" ON flower_updates
    FOR DELETE USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_flower_updates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER trigger_update_flower_updates_updated_at
    BEFORE UPDATE ON flower_updates
    FOR EACH ROW
    EXECUTE FUNCTION update_flower_updates_updated_at();

-- Add comments for documentation
COMMENT ON TABLE flower_updates IS 'Stores AI analysis results from plant scans';
COMMENT ON COLUMN flower_updates.ai_analysis IS 'Complete AI analysis response as JSON';
COMMENT ON COLUMN flower_updates.confidence_score IS 'AI confidence in the analysis (0.00-1.00)';
COMMENT ON COLUMN flower_updates.issue_type IS 'Primary issue identified (light, water, nutrients, pests, etc.)';
COMMENT ON COLUMN flower_updates.issue_description IS 'Human-readable description of the issue';
COMMENT ON COLUMN flower_updates.recommendations IS 'Array of recommendation objects with action, priority, and timing';
