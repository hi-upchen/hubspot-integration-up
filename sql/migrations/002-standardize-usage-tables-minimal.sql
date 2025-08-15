-- Standardize usage tables with minimal indexing for bulk insert performance
-- Migration 002: Create standardized table structure with consistent naming

-- 1. Create standardized date_formatter_usage table
CREATE TABLE IF NOT EXISTS date_formatter_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portal_id INTEGER NOT NULL,
  request_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source_date VARCHAR(255),
  source_format VARCHAR(50),
  target_format VARCHAR(50),
  custom_target_format VARCHAR(255),
  formatted_date VARCHAR(255),
  success BOOLEAN NOT NULL DEFAULT true,
  error_message TEXT,
  response_time_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Update url_shortener_usage table for consistency
ALTER TABLE url_shortener_usage 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Rename timestamp column to request_timestamp for consistency
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'url_shortener_usage' 
             AND column_name = 'timestamp') THEN
    ALTER TABLE url_shortener_usage 
    RENAME COLUMN timestamp TO request_timestamp;
  END IF;
END $$;

-- 3. Create MINIMAL indexes for optimal bulk insert performance
-- Primary composite index for aggregation queries (portal_id + timestamp)
CREATE INDEX IF NOT EXISTS idx_date_formatter_usage_portal_timestamp 
ON date_formatter_usage (portal_id, request_timestamp DESC);

-- Update url_shortener_usage indexes (drop existing, create minimal)
DROP INDEX IF EXISTS idx_url_shortener_usage_portal_timestamp;
CREATE INDEX idx_url_shortener_usage_portal_timestamp 
ON url_shortener_usage (portal_id, request_timestamp DESC);

-- Note: No additional indexes on success, created_at to optimize for bulk inserts
-- The aggregation queries will use the portal_id + request_timestamp composite index efficiently

-- Add table comments for documentation
COMMENT ON TABLE date_formatter_usage IS 'Standardized usage tracking for date formatting operations with minimal indexing for bulk inserts';
COMMENT ON TABLE url_shortener_usage IS 'Standardized usage tracking for URL shortening operations with minimal indexing for bulk inserts';