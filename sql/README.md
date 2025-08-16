# Database Schema

## Overview
This folder contains the complete database schema for HubSpot Integration Up.

## Files
- `schema.sql` - Complete, up-to-date database schema for production deployment

## Deployment
To deploy the schema to a new Supabase project:

1. **Development Environment:**
   ```bash
   psql "postgresql://postgres.your-dev-project:password@host:5432/postgres" -f sql/schema.sql
   ```

2. **Production Environment:**
   ```bash
   psql "postgresql://postgres.your-prod-project:password@host:5432/postgres" -f sql/schema.sql
   ```

## Schema Features
- **Multi-app support** - Unified schema for date-formatter, url-shortener, and future apps
- **Optimized performance** - Minimal indexing strategy for high-volume operations
- **Environment separation** - Identical structure across dev/prod environments
- **Usage tracking** - Raw data collection with background aggregation
- **OAuth management** - Secure token storage with app-type isolation

## Architecture
- **Raw usage tables** - `date_formatter_usage`, `url_shortener_usage`
- **Unified aggregation** - `usage_monthly` table for all apps
- **OAuth tokens** - `hubspot_installations` with multi-app support
- **Portal cache** - `portal_info` for dashboard display
- **API keys** - `url_shortener_api_keys` for encrypted Bitly tokens

## Last Updated
August 16, 2025 - Production migration completed