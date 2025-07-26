-- Usage tracking schema for HubSpot Date Formatter marketplace app
-- Designed for high concurrency and 3-month data retention

-- Portal information table (collected from HubSpot API + user input)
CREATE TABLE portal_info (
  id SERIAL PRIMARY KEY,
  portal_id BIGINT NOT NULL UNIQUE,
  portal_name VARCHAR(255), -- From hub_domain
  user_email VARCHAR(255), -- From user field
  domain VARCHAR(255), -- From hub_domain
  user_name VARCHAR(255), -- User input (optional)
  organization_name VARCHAR(255), -- User input (optional)
  hubspot_user_id BIGINT, -- From user_id field
  hub_id BIGINT, -- From hub_id field
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Monthly usage aggregation table (atomic updates for concurrency)
CREATE TABLE portal_usage_monthly (
  id SERIAL PRIMARY KEY,
  portal_id BIGINT NOT NULL,
  month_year VARCHAR(7) NOT NULL, -- '2025-01'
  request_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  last_request_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(portal_id, month_year)
);

-- Detailed request logs (for analytics and debugging, 3-month retention)
CREATE TABLE usage_requests (
  id SERIAL PRIMARY KEY,
  portal_id BIGINT NOT NULL,
  request_timestamp TIMESTAMP DEFAULT NOW(),
  source_date VARCHAR(255),
  source_format VARCHAR(50),
  target_format VARCHAR(50),
  custom_target_format VARCHAR(255),
  success BOOLEAN NOT NULL,
  error_message TEXT,
  month_year VARCHAR(7) NOT NULL -- For partitioning/indexing
);

-- Indexes for performance
CREATE INDEX idx_portal_usage_monthly_portal_month ON portal_usage_monthly(portal_id, month_year);
CREATE INDEX idx_usage_requests_portal_month ON usage_requests(portal_id, month_year);
CREATE INDEX idx_usage_requests_timestamp ON usage_requests(request_timestamp);
CREATE INDEX idx_portal_info_portal_id ON portal_info(portal_id);

-- Function for atomic usage increment (handles concurrency)
CREATE OR REPLACE FUNCTION increment_portal_usage(
  p_portal_id BIGINT,
  p_month_year VARCHAR(7),
  p_success BOOLEAN
) RETURNS VOID AS $$
BEGIN
  -- Use INSERT ... ON CONFLICT for atomic upsert
  INSERT INTO portal_usage_monthly (
    portal_id, 
    month_year, 
    request_count, 
    success_count, 
    error_count, 
    last_request_at
  ) VALUES (
    p_portal_id,
    p_month_year,
    1,
    CASE WHEN p_success THEN 1 ELSE 0 END,
    CASE WHEN p_success THEN 0 ELSE 1 END,
    NOW()
  )
  ON CONFLICT (portal_id, month_year) 
  DO UPDATE SET
    request_count = portal_usage_monthly.request_count + 1,
    success_count = portal_usage_monthly.success_count + CASE WHEN p_success THEN 1 ELSE 0 END,
    error_count = portal_usage_monthly.error_count + CASE WHEN p_success THEN 0 ELSE 1 END,
    last_request_at = NOW(),
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;