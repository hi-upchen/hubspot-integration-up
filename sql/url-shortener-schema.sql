-- URL Shortener Schema
-- Created: January 2025
-- Description: Database schema for URL shortener feature with Bitly integration

-- API Keys for URL shortener services
CREATE TABLE IF NOT EXISTS url_shortener_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portal_id INTEGER UNIQUE NOT NULL,
  service_name TEXT DEFAULT 'bitly' NOT NULL,
  api_key TEXT NOT NULL, -- will be encrypted at application level
  settings_json JSONB DEFAULT '{}',
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  FOREIGN KEY (portal_id) REFERENCES hubspot_installations(hub_id) ON DELETE CASCADE
);

-- Usage tracking for URL shortener
CREATE TABLE IF NOT EXISTS url_shortener_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portal_id INTEGER NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT now(),
  long_url TEXT,
  short_url TEXT,
  custom_domain TEXT,
  service_used TEXT DEFAULT 'bitly',
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  response_time_ms INTEGER
);

-- Monthly aggregated usage for URL shortener
CREATE TABLE IF NOT EXISTS url_shortener_usage_monthly (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portal_id INTEGER NOT NULL,
  month DATE NOT NULL,
  total_requests INTEGER DEFAULT 0,
  successful_requests INTEGER DEFAULT 0,
  failed_requests INTEGER DEFAULT 0,
  unique_domains_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(portal_id, month)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_url_shortener_usage_portal_timestamp 
  ON url_shortener_usage(portal_id, timestamp DESC);
  
CREATE INDEX IF NOT EXISTS idx_url_shortener_api_keys_portal 
  ON url_shortener_api_keys(portal_id);

CREATE INDEX IF NOT EXISTS idx_url_shortener_usage_monthly_portal_month
  ON url_shortener_usage_monthly(portal_id, month DESC);

-- Add RLS (Row Level Security) policies if needed
ALTER TABLE url_shortener_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE url_shortener_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE url_shortener_usage_monthly ENABLE ROW LEVEL SECURITY;

-- Grant permissions to service role
GRANT ALL ON url_shortener_api_keys TO service_role;
GRANT ALL ON url_shortener_usage TO service_role;
GRANT ALL ON url_shortener_usage_monthly TO service_role;

-- Add update trigger for updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_url_shortener_api_keys_updated_at BEFORE UPDATE
  ON url_shortener_api_keys FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_url_shortener_usage_monthly_updated_at BEFORE UPDATE
  ON url_shortener_usage_monthly FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();