-- Add downloads column to sermons table
ALTER TABLE sermons ADD COLUMN IF NOT EXISTS downloads INTEGER DEFAULT 0;
