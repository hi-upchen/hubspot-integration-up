-- Run all standardization migrations in sequence
-- Execute this file to apply all table standardization changes

-- Create migration log table if it doesn't exist
CREATE TABLE IF NOT EXISTS migration_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  migration_name VARCHAR(255) NOT NULL UNIQUE,
  executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  executed_by VARCHAR(100) DEFAULT USER
);

BEGIN;

-- Migration 002: Standardize table structure
\i sql/migrations/002-standardize-usage-tables-minimal.sql

-- Migration 003: Migrate data
\i sql/migrations/003-migrate-usage-requests-data.sql

-- Log the batch migration
INSERT INTO migration_log (migration_name, executed_at) 
VALUES ('batch-standardize-usage-tables', NOW())
ON CONFLICT DO NOTHING;

COMMIT;

-- Verification
SELECT 
  'Migration completed successfully' as status,
  NOW() as completed_at;

-- Show table counts for verification
SELECT 
  'date_formatter_usage' as table_name, 
  COUNT(*) as row_count 
FROM date_formatter_usage
UNION ALL
SELECT 
  'url_shortener_usage' as table_name, 
  COUNT(*) as row_count 
FROM url_shortener_usage
UNION ALL
SELECT 
  'usage_monthly' as table_name, 
  COUNT(*) as row_count 
FROM usage_monthly;

-- Show recent migrations
SELECT * FROM migration_log ORDER BY executed_at DESC LIMIT 5;