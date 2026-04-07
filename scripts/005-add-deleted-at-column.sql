-- Add deleted_at column to track when ideas were moved to trash
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Create index for deleted_at queries
CREATE INDEX IF NOT EXISTS idx_ideas_deleted_at ON ideas(deleted_at);
