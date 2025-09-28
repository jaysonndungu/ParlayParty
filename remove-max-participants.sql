-- Remove max_participants column from parties table
-- Run this in your Supabase SQL Editor

-- Drop the max_participants column if it exists
ALTER TABLE parties DROP COLUMN IF EXISTS max_participants;

-- Force refresh of schema cache
NOTIFY pgrst, 'reload schema';

-- Verify the column has been removed
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'parties' 
ORDER BY ordinal_position;
