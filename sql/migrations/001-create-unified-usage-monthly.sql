-- sql/migrations/001-create-unified-usage-monthly.sql
-- Create unified usage tracking table for all apps
-- This table will be used for NEW aggregations only (no migration from existing tables)
-- 
-- Usage:
-- psql $DATABASE_URL -f sql/migrations/001-create-unified-usage-monthly.sql
--
-- Author: Integration Up
-- Date: 2025-01-28

-- Create unified usage tracking table
CREATE TABLE IF NOT EXISTS usage_monthly (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portal_id INTEGER NOT NULL,
  app_type VARCHAR(50) NOT NULL CHECK (app_type IN ('date-formatter', 'url-shortener')),
  month_start DATE NOT NULL, -- First day of month: 2025-01-01, 2025-02-01
  total_requests INTEGER DEFAULT 0 NOT NULL,
  successful_requests INTEGER DEFAULT 0 NOT NULL,
  failed_requests INTEGER DEFAULT 0 NOT NULL,
  last_request_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}' NOT NULL, -- App-specific fields
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL, -- Manual updates only (no trigger)
  
  -- Constraints
  UNIQUE(portal_id, app_type, month_start),
  CHECK (total_requests >= 0),
  CHECK (successful_requests >= 0),
  CHECK (failed_requests >= 0),
  CHECK (successful_requests + failed_requests <= total_requests)
);

-- Create essential indexes for performance
CREATE INDEX IF NOT EXISTS idx_usage_monthly_portal_app_month 
  ON usage_monthly(portal_id, app_type, month_start DESC);
  
CREATE INDEX IF NOT EXISTS idx_usage_monthly_updated_at 
  ON usage_monthly(updated_at DESC);

-- Enable Row Level Security
ALTER TABLE usage_monthly ENABLE ROW LEVEL SECURITY;

-- Grant permissions to service role
GRANT ALL ON usage_monthly TO service_role;

-- Add helpful comments
COMMENT ON TABLE usage_monthly IS 'Unified monthly usage aggregation for all apps (date-formatter, url-shortener)';
COMMENT ON COLUMN usage_monthly.portal_id IS 'HubSpot portal/account ID';
COMMENT ON COLUMN usage_monthly.app_type IS 'Type of app: date-formatter or url-shortener';
COMMENT ON COLUMN usage_monthly.month_start IS 'First day of the month for aggregation period';
COMMENT ON COLUMN usage_monthly.total_requests IS 'Total number of requests in the month';
COMMENT ON COLUMN usage_monthly.successful_requests IS 'Number of successful requests';
COMMENT ON COLUMN usage_monthly.failed_requests IS 'Number of failed requests';
COMMENT ON COLUMN usage_monthly.last_request_at IS 'Timestamp of the last request in this aggregation';
COMMENT ON COLUMN usage_monthly.metadata IS 'App-specific metadata (e.g., unique_domains_used for url-shortener)';
COMMENT ON COLUMN usage_monthly.created_at IS 'When this record was first created';
COMMENT ON COLUMN usage_monthly.updated_at IS 'When this record was last updated (manual update required)';

-- Verify table creation
SELECT 
  'Table created successfully' as status,
  COUNT(*) as column_count,
  (
    SELECT COUNT(*) 
    FROM pg_indexes 
    WHERE tablename = 'usage_monthly'
  ) as index_count
FROM information_schema.columns
WHERE table_name = 'usage_monthly';