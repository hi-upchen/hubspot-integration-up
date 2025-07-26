# Usage Aggregation System

This document explains how to use the usage aggregation system for the HubSpot Date Formatter marketplace app.

## Overview

The usage tracking system is split into two parts for performance:
1. **Real-time logging**: Each webhook request logs detailed data to `usage_requests` table
2. **Batch aggregation**: A script aggregates data into `portal_usage_monthly` for reporting

## Running Aggregation

### Manual Execution

```bash
# Aggregate usage for DEV environment
npm run usage:aggregate:dev

# Aggregate usage for PROD environment  
npm run usage:aggregate:prod

# Auto-detect environment (uses NODE_ENV)
npm run usage:aggregate
```

### Cron Job Setup

Add to your crontab to run automatically:

```bash
# Run every hour
0 * * * * cd /path/to/project && npm run usage:aggregate:prod

# Run every 6 hours
0 */6 * * * cd /path/to/project && npm run usage:aggregate:prod

# Run daily at 2 AM
0 2 * * * cd /path/to/project && npm run usage:aggregate:prod
```

## How It Works

### 1. Data Collection (Real-time)
- Each webhook request creates a record in `usage_requests` table
- Contains: `portal_id`, `success`, `source_date`, `source_format`, `target_format`, `month_year`
- Non-blocking: Won't slow down webhook responses

### 2. Data Aggregation (Batch)
The script:
1. Fetches all records from `usage_requests` table
2. Groups by `portal_id` and `month_year`
3. Calculates totals: `request_count`, `success_count`, `error_count`
4. Updates `portal_usage_monthly` using direct Supabase client operations
5. Reports processing statistics

### 3. Database Operations Used

**Direct Supabase Client Operations**:
- `supabase.from('portal_usage_monthly').upsert()` - Primary method
- `supabase.from('portal_usage_monthly').update()` - Fallback for adding to existing counts
- `supabase.from('portal_usage_monthly').insert()` - For new portal-month combinations

## Output Example

```
🔄 Starting usage aggregation at 2025-07-26T14:28:18.460Z
📊 Aggregating usage for DEV environment
📋 Fetching pending usage requests...
📊 Found 4 requests to aggregate
🎯 Aggregating for 1 portal-month combinations
📊 Running direct SQL aggregation...
✅ Direct aggregation completed: 1 processed, 0 errors

📊 Aggregation Summary:
   • Total requests processed: 4
   • Portal-month combinations: 1
   • Duration: 0 seconds
   • Environment: DEV
✅ Usage aggregation completed successfully
```

## Environment Variables Required

```bash
# Development
SUPABASE_DEV_URL=https://your-dev-project.supabase.co
SUPABASE_DEV_SERVICE_ROLE_KEY=your_dev_service_role_key

# Production
SUPABASE_PROD_URL=https://your-prod-project.supabase.co
SUPABASE_PROD_SERVICE_ROLE_KEY=your_prod_service_role_key
```

## Database Schema

### usage_requests (Raw logs)
```sql
CREATE TABLE usage_requests (
  id SERIAL PRIMARY KEY,
  portal_id BIGINT NOT NULL,
  request_timestamp TIMESTAMP DEFAULT NOW(),
  source_date VARCHAR(255),
  source_format VARCHAR(50),
  target_format VARCHAR(50),
  success BOOLEAN NOT NULL,
  error_message TEXT,
  month_year VARCHAR(7) NOT NULL -- '2025-01'
);
```

### portal_usage_monthly (Aggregated stats)
```sql
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
```

## Monitoring

The script provides detailed logging for monitoring:
- Total requests processed
- Portal-month combinations affected
- Success/error counts
- Processing duration
- Environment confirmation

## Troubleshooting

### Missing Environment Variables
```
Missing Supabase configuration for dev environment
```
**Solution**: Check your `.env.local` file has the required Supabase variables

### No Pending Requests
```
✅ No pending requests to aggregate
```
**Normal**: No new webhook requests since last aggregation

### Upsert Conflicts
```
❌ Error processing 243404981:2025-07: duplicate key value violates unique constraint
```
**Solution**: Script handles this automatically with fallback to manual update/insert operations

## Performance

- **Efficient**: Processes hundreds of requests in seconds using direct Supabase client operations
- **Atomic**: Uses built-in upsert operations for data consistency
- **Safe**: Can run multiple times without duplication due to automatic conflict resolution
- **Scalable**: Handles concurrent aggregation gracefully with fallback mechanisms

### ⚠️ Performance Warning

**Current Limitation**: The script fetches ALL historical data from `usage_requests` table to the client for processing. This approach may cause:
- High network traffic as dataset grows
- Increased memory usage 
- Slower processing times with millions of records

**Recommended Optimizations for Production**:
1. Add `processed` flag to `usage_requests` table
2. Only fetch unprocessed records (`WHERE processed = false`)
3. Mark records as processed after aggregation
4. Implement incremental aggregation (delta processing)
5. Use database-side aggregation for very large datasets
6. Add pagination for memory-constrained environments

**Current Scale**: Suitable for up to ~100K records. Beyond that, optimization is recommended.

## Integration with Dashboard

After aggregation, the dashboard will show updated statistics:
- Current month usage counts
- Success/error rates
- Historical trends (last 12 months)