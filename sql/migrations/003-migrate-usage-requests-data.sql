-- Data Migration: Move data from usage_requests to date_formatter_usage
-- Migration 003: Migrate existing data with type conversion and standardization

-- Migrate data from usage_requests to standardized date_formatter_usage table
-- Note: This uses ON CONFLICT DO NOTHING to handle potential duplicate migrations
INSERT INTO date_formatter_usage (
  portal_id,
  request_timestamp,
  source_date,
  source_format,
  target_format,
  custom_target_format,
  formatted_date,
  success,
  error_message,
  response_time_ms,
  created_at
)
SELECT 
  portal_id::INTEGER,                                    -- Convert bigint to integer
  request_timestamp::TIMESTAMPTZ,                        -- Ensure timezone awareness
  source_date,
  source_format,
  target_format,
  custom_target_format,
  formatted_date,
  success,
  error_message,
  NULL as response_time_ms,                              -- New field, default NULL
  request_timestamp::TIMESTAMPTZ as created_at           -- Use request_timestamp as created_at
FROM usage_requests
ON CONFLICT DO NOTHING;

-- Verification queries (run manually to check migration success)
-- SELECT 'usage_requests' as table_name, COUNT(*) as row_count FROM usage_requests
-- UNION ALL
-- SELECT 'date_formatter_usage' as table_name, COUNT(*) as row_count FROM date_formatter_usage;

-- After successful verification, the old table can be dropped:
-- Note: Uncomment these lines only after verifying data migration is successful
-- DROP TABLE IF EXISTS usage_requests;
-- DROP SEQUENCE IF EXISTS usage_requests_id_seq;

-- Add migration log entry
INSERT INTO migration_log (migration_name, executed_at) 
VALUES ('003-migrate-usage-requests-data', NOW())
ON CONFLICT DO NOTHING;