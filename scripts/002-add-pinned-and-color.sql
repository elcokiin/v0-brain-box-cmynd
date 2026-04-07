-- Add pinned column for pinning ideas to top
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS pinned BOOLEAN DEFAULT FALSE;

-- Add background_color column for card customization
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS background_color VARCHAR(20) DEFAULT NULL;

-- Create index for faster queries on pinned status
CREATE INDEX IF NOT EXISTS idx_ideas_pinned ON ideas(pinned DESC);
