-- Migration: Add app_type field to hubspot_installations table
-- This enables tracking which HubSpot app (date-formatter, url-shortener) each installation belongs to
-- Run this migration on both dev and production Supabase databases

-- Step 1: Add app_type column with default value for existing records
ALTER TABLE hubspot_installations 
ADD COLUMN app_type VARCHAR(50) DEFAULT 'date-formatter' NOT NULL;

-- Step 2: Update the column comment for documentation
COMMENT ON COLUMN hubspot_installations.app_type IS 'HubSpot app type: date-formatter, url-shortener, etc.';

-- Step 3: Add check constraint to ensure valid app types
ALTER TABLE hubspot_installations
ADD CONSTRAINT chk_app_type CHECK (app_type IN ('date-formatter', 'url-shortener'));

-- Step 4: Create index for performance (optional but recommended)
CREATE INDEX idx_hubspot_installations_app_type ON hubspot_installations(app_type);

-- Step 5: Update RLS policies if needed (uncomment if you have specific policies)
-- DROP POLICY IF EXISTS "Users can view their own installations" ON hubspot_installations;
-- CREATE POLICY "Users can view their own installations" ON hubspot_installations
--   FOR ALL USING (app_type IN ('date-formatter', 'url-shortener'));

-- Verification queries (run these after migration to verify)
-- SELECT app_type, COUNT(*) FROM hubspot_installations GROUP BY app_type;
-- SELECT * FROM hubspot_installations LIMIT 5;