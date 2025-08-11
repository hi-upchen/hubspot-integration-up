-- Migration: Support multiple app installations per portal
-- Changes hubspot_installations table to allow one installation per (hub_id, app_type) combination
-- This enables a portal to install both date-formatter AND url-shortener independently

-- Step 1: First run the add-app-type migration if not already done
-- ALTER TABLE hubspot_installations ADD COLUMN app_type VARCHAR(50) DEFAULT 'date-formatter' NOT NULL;

-- Step 2: Remove the old unique constraint on hub_id (if it exists)
-- This allows multiple records per hub_id (but unique per hub_id + app_type combination)
ALTER TABLE hubspot_installations DROP CONSTRAINT IF EXISTS hubspot_installations_hub_id_key;

-- Step 3: Add composite unique constraint for (hub_id, app_type)
-- This ensures one installation record per app per portal
ALTER TABLE hubspot_installations 
ADD CONSTRAINT uk_hubspot_installations_hub_id_app_type 
UNIQUE (hub_id, app_type);

-- Step 4: Update indexes for performance
-- Drop old single-column index if it exists
DROP INDEX IF EXISTS idx_hubspot_installations_hub_id;

-- Create composite index for efficient lookups
CREATE INDEX idx_hubspot_installations_hub_id_app_type ON hubspot_installations(hub_id, app_type);

-- Step 5: Add additional useful indexes
CREATE INDEX idx_hubspot_installations_app_type ON hubspot_installations(app_type);
CREATE INDEX idx_hubspot_installations_expires_at ON hubspot_installations(expires_at) WHERE expires_at IS NOT NULL;

-- Step 6: Update RLS policies if needed
-- You may need to update Row Level Security policies to account for app_type

-- Verification queries (run after migration):
-- SELECT hub_id, app_type, COUNT(*) FROM hubspot_installations GROUP BY hub_id, app_type;
-- SELECT app_type, COUNT(*) as installations FROM hubspot_installations GROUP BY app_type;

-- Example expected result:
-- hub_id    | app_type       | count
-- 12345678  | date-formatter | 1
-- 12345678  | url-shortener  | 1
-- 87654321  | date-formatter | 1