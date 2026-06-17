-- Add output_data column to rd_briefs to store AI-generated narrative/recommendation
ALTER TABLE rd_briefs ADD COLUMN IF NOT EXISTS output_data jsonb;
