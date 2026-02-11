-- Add missing comment column to ratings table
ALTER TABLE ratings ADD COLUMN IF NOT EXISTS comment TEXT DEFAULT '';
