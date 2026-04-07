-- Create ideas table for BrainBox
CREATE TABLE IF NOT EXISTS ideas (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  source VARCHAR(50) NOT NULL DEFAULT 'web',
  status VARCHAR(20) NOT NULL DEFAULT 'inbox',
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries on status
CREATE INDEX IF NOT EXISTS idx_ideas_status ON ideas(status);

-- Create index for faster queries on created_at
CREATE INDEX IF NOT EXISTS idx_ideas_created_at ON ideas(created_at DESC);
