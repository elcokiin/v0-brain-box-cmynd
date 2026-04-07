-- Expand all varchar columns to TEXT for flexibility
ALTER TABLE ideas ALTER COLUMN background_color TYPE TEXT;
ALTER TABLE ideas ALTER COLUMN status TYPE TEXT;
ALTER TABLE ideas ALTER COLUMN source TYPE TEXT;
