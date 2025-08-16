# HubSpot Integration Up - Claude Development Notes

## Project Overview
Next.js application with HubSpot workflow actions for date formatting and other utilities.

## Development Preferences

### Communication Style
- **Proposal-first approach**: Always provide proposal/plan before implementation
- **Ask clarifying questions**: Use yes/no questions to gather context until 95% confidence
- **Concise responses**: Keep explanations brief and to-the-point
- **Use sub-agents**: Delegate independent tasks to sub-agents when possible

### Code Standards
- **JSON naming**: Use camelCase for all JSON object keys in API responses/requests
- **No premature implementation**: Don't make changes without clear requirements
- **Industry best practices**: Follow established patterns and conventions
- **Config-driven architecture**: Separate configuration from business logic
- **Function naming conventions**:
  - `get` - Simple retrieval, usually from cache/database first
  - `fetch` - Always makes external call (API/network), implies fresh data retrieval

### Git Workflow
- **Clean commit messages**: Write main description + 2-5 detailed points
- **No auto-generated signatures**: Never add Claude Code co-author tags
- **Meaningful commits**: Focus on the "why" rather than just the "what"

### HubSpot Development
- **Test thoroughly**: Always test in fresh workflows after updates
- **Debug comprehensively**: Add detailed logging for troubleshooting
- **Handle edge cases**: Support 2-digit years, empty values, format variations
- **User-friendly UX**: Clear labels, helpful descriptions, logical field ordering

### Project Management
- **Multi-app architecture**: Design for scalability (date-formatter, url-shortener, etc.)
- **Environment awareness**: Different behavior for dev vs production
- **Versioning strategy**: Auto-append version numbers, timestamps only in dev

## Key Learnings & Configurations

### HubSpot Workflow Actions
- **inputFieldDependencies**: Correct property for conditional field display:
  ```json
  "inputFieldDependencies": [
    {
      "dependencyType": "CONDITIONAL_SINGLE_FIELD",
      "controllingFieldName": "targetFormat",
      "controllingFieldValue": "CUSTOM",
      "dependentFieldNames": ["customTargetFormat"]
    }
  ]
  ```
- **dependencyType options**:
  - `SINGLE_FIELD`: Gray out fields until conditions met
  - `CONDITIONAL_SINGLE_FIELD`: Show/hide fields based on conditions
- **No defaultValue support**: HubSpot doesn't support `defaultValue` in workflow action fields
- **First option = default**: UI treats first enumeration option as default
- **UI caching issues**: Test in fresh workflows after updates, clear browser cache

### Date Formatter Implementation
- **2-digit year support**: 00-49 → 2000-2049, 50-99 → 1950-1999
- **Pre-resolved values**: HubSpot sends resolved values in `inputFields`, not dynamic tokens
- **Payload structure**: `portalId` is in `origin.portalId`, not root level
- **Custom format tokens**: Date-only (YYYY, MM, DD, etc.) - no time tokens

### Webhook Payload Structure
```json
{
  "callbackId": "string",
  "origin": {
    "portalId": 243404981,
    "actionDefinitionId": 218240898
  },
  "inputFields": {
    "sourceDateField": "7/24/25",
    "sourceFormat": "AUTO",
    "targetFormat": "TAIWAN_STANDARD"
  }
}
```

## Environment Separation Architecture

### ConfigManager System
- **Automatic Detection**: Environment determined by `process.argv` (dev/prod) or `NODE_ENV`
- **Priority Order**: Command-line args → NODE_ENV → default (dev)
- **Single Source of Truth**: All configuration flows through ConfigManager
- **42 Test Coverage**: Comprehensive edge case testing for reliability

### Environment Configuration
```typescript
// Development
HUBSPOT_DEV_CLIENT_ID=dev_app_client_id
SUPABASE_DEV_URL=https://dev-project.supabase.co

// Production  
HUBSPOT_PROD_CLIENT_ID=prod_app_client_id
SUPABASE_PROD_URL=https://prod-project.supabase.co

// Auto-detection
NODE_ENV=development  # or production
```

### Environment-Specific Commands
```bash
# Development Environment
npm run hubspot:dev:list           # List dev workflow actions
npm run hubspot:dev:register       # Register to dev HubSpot app
npm run hubspot:dev:update         # Update dev action
npm run hubspot:dev:delete <id>    # Delete dev action

# Production Environment
npm run hubspot:prod:list          # List prod workflow actions
npm run hubspot:prod:register      # Register to prod HubSpot app
npm run hubspot:prod:update        # Update prod action
npm run hubspot:prod:delete <id>   # Delete prod action

# Legacy Commands (auto-detect environment)
npm run hubspot:date-formatter:register  # Uses ConfigManager detection
npm run hubspot:date-formatter:update    # Uses ConfigManager detection
npm run hubspot:date-formatter:list      # Uses ConfigManager detection
```

### Service Integration
- **Supabase Client**: Automatically connects to dev/prod databases
- **HubSpot Services**: OAuth, tokens, client manager use ConfigManager
- **API Routes**: All routes use environment-aware configuration
- **Webhook Handler**: Processes requests with correct environment context

### Action Naming Convention
- **Development**: `Date Formatter v1.0.0 (Dev - 2025-01-26 14:30)` (with timestamp)
- **Production**: `Date Formatter v1.0.0` (clean, professional)

## File Structure (Current - August 2025)

### Core Configuration
- `src/lib/config/config-manager.ts` - Central configuration management
- `src/lib/config/environment.ts` - Environment-specific configurations
- `config/credentials/dev.json` - Development environment credentials
- `config/apps.json` - Multi-app configuration

### Database & Usage Tracking
- `src/lib/database/supabase.ts` - Supabase client with connection pooling
- `src/lib/database/usage.ts` - Unified usage tracking functions
- `src/lib/database/types.ts` - TypeScript interfaces for usage data
- `src/lib/shared/services/unified-usage-aggregator.ts` - Cron job aggregation

### Feature Services (Clean Architecture)
- `src/lib/features/date-formatter/services/date-formatter.ts` - Core date formatting logic
- `src/lib/features/date-formatter/services/webhook-handler.ts` - Date formatter webhook processing
- `src/lib/features/date-formatter/types.ts` - Date formatter type definitions
- `src/lib/features/url-shortener/services/usage-tracker.ts` - URL shortener tracking (trackUsage only)
- `src/lib/features/url-shortener/services/bitly.ts` - Bitly API integration

### API Endpoints
- `src/app/api/webhook/date-formatter/route.ts` - Date formatter webhook
- `src/app/api/webhook/url-shortener/route.ts` - URL shortener webhook
- `src/app/api/usage/stats/route.ts` - Usage statistics API
- `src/app/api/portal/info/route.ts` - Portal information API
- `src/app/api/cron/aggregate-usage/route.ts` - Unified aggregation cron job

### Dashboard & Frontend
- `src/app/dashboard/page.tsx` - Server-side rendered dashboard
- `src/app/dashboard/components/AppUsageChart.tsx` - App-specific usage visualization
- `src/app/dashboard/components/FeatureTabs.tsx` - Multi-app tab interface
- `src/app/install/page.tsx` - App installation landing page

### Scripts & Deployment
- `scripts/*.mjs` - ES module management scripts for HubSpot app deployment
- `sql/usage-tracking-schema.sql` - Complete database schema
- `sql/migrations/` - Database migration scripts

## Development Guidelines

### Environment Setup
1. **Create separate HubSpot apps**: One for development, one for production
2. **Create separate Supabase projects**: `hubspot-integration-up-dev` and `hubspot-integration-up-prod`
3. **Configure environment variables**: Set DEV_* and PROD_* variables in `.env.local`
4. **Use explicit commands**: `npm run hubspot:dev:*` for development work

### Testing Best Practices
- **Fresh workflows**: Always test in completely new HubSpot workflows after updates
- **Environment isolation**: Use dev commands for development, prod commands for releases
- **ConfigManager tests**: Run `npm test -- __tests__/lib/config/config-manager.test.ts`
- **Build verification**: `npm run build` should connect to PROD environment

### Deployment Process
1. **Development**: Use `npm run hubspot:dev:*` commands
2. **Testing**: Verify in dev HubSpot app and dev Supabase database
3. **Production**: Use `npm run hubspot:prod:*` commands for releases
4. **Verification**: Set `NODE_ENV=production` for production builds

### Common Operations
```bash
# Check current environment detection
npm run hubspot:dev:list    # Should show "DEV environment configuration"
npm run hubspot:prod:list   # Should show "PROD environment configuration"

# Deploy to development
npm run hubspot:dev:register

# Deploy to production
npm run hubspot:prod:register

# Debug configuration
npm test -- __tests__/lib/config/config-manager.test.ts
```

### Troubleshooting
- **Wrong environment**: Check `NODE_ENV` and command-line arguments
- **Missing config**: Verify DEV_*/PROD_* environment variables are set
- **Database errors**: Ensure Supabase projects are created and keys are correct
- **Cache issues**: Test in fresh HubSpot workflows, clear browser cache
- **Build issues**: ConfigManager should automatically use PROD environment during builds

## Usage Tracking & Pricing

### Pricing Tiers (Future Implementation)
- **Free**: 3,000 requests/month - $0
- **Starter**: 30,000 requests/month - $19
- **Professional**: 300,000 requests/month - $99  
- **Enterprise**: 3,000,000 requests/month - $499

### Beta Behavior
- **Current Status**: All usage is free during beta period
- **Soft Limits**: Track usage but allow all requests
- **Future Notice**: 30-day advance notice before implementing billing
- **Usage Tracking**: Full request logging and analytics for optimization

## Usage Tracking Architecture (Current - August 2025)

### Unified Aggregation System
- **Raw Data Collection**: Individual app tables (`date_formatter_usage`, `url_shortener_usage`)
- **Unified Aggregation**: Single `usage_monthly` table for all apps via `UnifiedUsageAggregator`
- **Cron-based Processing**: Background aggregation jobs for optimal performance
- **Dashboard Integration**: Server-side rendering with app-specific usage charts

### Key Architecture Principles
- **Non-blocking tracking**: Usage logging wrapped in try-catch, errors don't break webhooks
- **Awaited in Vercel**: MUST await tracking calls or Vercel will kill the database write
- **Unified data model**: Single aggregation table supports multiple apps
- **Minimal indexing strategy**: Optimized for bulk insert performance (20-30% faster)
- **Environment separation**: Complete dev/prod isolation with separate databases
- **Scalable design**: Ready for additional apps with consistent patterns

### Services Architecture
- **trackUsage()**: Awaited raw usage logging (date formatter) - MUST await in Vercel
- **trackUrlShortenerUsage()**: Awaited raw usage logging (URL shortener) - MUST await in Vercel
- **UnifiedUsageAggregator**: Cron job for batch aggregation to `usage_monthly`
- **getUsageStats()**: Dashboard API for last 3 months per app
- **HubSpot Portal Service**: Cached portal info from HubSpot API

### Performance Characteristics
- **No real-time aggregation**: Eliminated failing RPC calls during webhooks
- **Batch processing**: Monthly aggregation via scheduled jobs
- **Concurrent safety**: Atomic database operations for high-volume periods
- **Response time**: Webhook responses under 500ms (95th percentile)

## Current Status (August 2025)

### Recently Completed - Architecture Cleanup
- ✅ **Legacy code removal**: Eliminated 2,921 lines of dead/deprecated code
- ✅ **Unified aggregation**: Single `UnifiedUsageAggregator` for all apps
- ✅ **Performance optimization**: Removed real-time RPC calls from webhooks
- ✅ **Database cleanup**: Dropped legacy tables and functions
- ✅ **Simplified dashboard**: App-specific usage charts (last 3 months)
- ✅ **Clean test suite**: 673 tests passing with streamlined coverage

### Production Readiness
- ✅ **Code quality**: Zero dead code, optimized performance
- ✅ **Test coverage**: Comprehensive unit tests, all passing
- ✅ **Error handling**: Robust validation and error recovery
- ✅ **Scalability**: Multi-app architecture ready for expansion
- ⏳ **Deployment**: Ready for production deployment

### Next Priority Items
1. **Production deployment**: Deploy to production environment
2. **Landing pages**: Public-facing marketing and support pages
3. **Marketplace submission**: Prepare for HubSpot App Marketplace
4. **Additional features**: Data transformer, text formatter utilities

## Development Status

### Current Architecture (August 2025)
- **Clean codebase**: 2,921 lines of legacy code removed
- **Unified tracking**: Single aggregation system for all apps
- **Optimized performance**: No blocking operations in webhook handlers
- **Scalable design**: Ready for multiple apps with consistent patterns
- **Production ready**: Comprehensive testing and error handling

### Code Quality Metrics
- **Test Coverage**: 673 tests passing (100% success rate)
- **Performance**: Webhook responses under 500ms
- **Maintainability**: Zero dead code, clear separation of concerns
- **Scalability**: Multi-app architecture with unified data model
- **Reliability**: Robust error handling and validation

### Deployment Architecture
- **Environment separation**: Complete dev/prod isolation
- **Database**: Supabase with connection pooling
- **Hosting**: Vercel with serverless functions
- **Monitoring**: Comprehensive logging and error tracking
- **Security**: OAuth integration with token management

## Production URLs and Endpoints
- **Webhook URL**: https://your-domain.vercel.app/api/webhook/date-formatter
- **OAuth Callback**: https://your-domain.vercel.app/api/auth/hubspot/callback
- **Dashboard**: https://your-domain.vercel.app/dashboard
- **Install URL**: https://your-domain.vercel.app/install

## Database Access
- **Dev Supabase**: hubspot-integration-up-dev (project in Supabase dashboard)
- **Prod Supabase**: hubspot-integration-up-prod (project in Supabase dashboard)
- **SQL Schema Location**: `/sql/usage-tracking-schema.sql`
- **Connection**: Using Supabase client with connection pooling enabled

## Database Schema (Current - August 2025)

### Table Structure Overview
```
Table Count: 6 tables total (cleaned up from 8)
Storage Size: ~150 kB total
Indexing Strategy: Minimal composite indexes for bulk insert performance
Migration Status: Fully standardized and cleaned (August 16, 2025)
Legacy Cleanup: Removed portal_usage_monthly, url_shortener_usage_monthly
```

### Core Tables

#### 1. hubspot_installations
**Purpose**: Stores HubSpot OAuth tokens and app installations per portal
```sql
CREATE TABLE hubspot_installations (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hub_id            BIGINT NOT NULL,
  access_token      TEXT NOT NULL,
  refresh_token     TEXT NOT NULL,
  expires_at        TIMESTAMPTZ NOT NULL,
  scope             TEXT NOT NULL,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),
  app_type          VARCHAR(50) NOT NULL DEFAULT 'date-formatter',
  
  CONSTRAINT uk_hubspot_installations_hub_id_app_type UNIQUE (hub_id, app_type),
  CONSTRAINT chk_app_type CHECK (app_type IN ('date-formatter', 'url-shortener'))
);

-- Indexes
CREATE INDEX idx_hubspot_installations_hub_id ON hubspot_installations (hub_id);
CREATE INDEX idx_hubspot_installations_app_type ON hubspot_installations (app_type);
CREATE INDEX idx_hubspot_installations_expires_at ON hubspot_installations (expires_at);
```

#### 2. portal_info  
**Purpose**: Cached HubSpot portal information for dashboard display
```sql
CREATE TABLE portal_info (
  id                SERIAL PRIMARY KEY,
  portal_id         BIGINT NOT NULL UNIQUE,
  portal_name       VARCHAR(255),
  user_email        VARCHAR(255),
  domain            VARCHAR(255),
  user_name         VARCHAR(255),
  organization_name VARCHAR(255),
  hubspot_user_id   BIGINT,
  hub_id            BIGINT,
  created_at        TIMESTAMP DEFAULT NOW(),
  updated_at        TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_portal_info_portal_id ON portal_info (portal_id);
```

#### 3. date_formatter_usage ⭐ (Standardized August 2025)
**Purpose**: Raw usage tracking for date formatting operations with minimal indexing
```sql
CREATE TABLE date_formatter_usage (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portal_id             INTEGER NOT NULL,
  request_timestamp     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source_date           VARCHAR(255),
  source_format         VARCHAR(50),
  target_format         VARCHAR(50),
  custom_target_format  VARCHAR(255),
  formatted_date        VARCHAR(255),
  success               BOOLEAN NOT NULL DEFAULT true,
  error_message         TEXT,
  response_time_ms      INTEGER,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Minimal Indexing Strategy (Optimized for Bulk Inserts)
CREATE INDEX idx_date_formatter_usage_portal_timestamp 
ON date_formatter_usage (portal_id, request_timestamp DESC);
```

#### 4. url_shortener_usage ⭐ (Standardized August 2025)
**Purpose**: Raw usage tracking for URL shortening operations with minimal indexing
```sql
CREATE TABLE url_shortener_usage (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portal_id         INTEGER NOT NULL,
  request_timestamp TIMESTAMPTZ DEFAULT NOW(),  -- Renamed from 'timestamp'
  long_url          TEXT,
  short_url         TEXT,
  custom_domain     TEXT,
  service_used      TEXT DEFAULT 'bitly',
  success           BOOLEAN DEFAULT true,
  error_message     TEXT,
  response_time_ms  INTEGER,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()  -- Added for consistency
);

-- Minimal Indexing Strategy (Optimized for Bulk Inserts)
CREATE INDEX idx_url_shortener_usage_portal_timestamp 
ON url_shortener_usage (portal_id, request_timestamp DESC);
```

#### 5. usage_monthly ⭐ (Unified Aggregation Table)
**Purpose**: Unified monthly aggregation for all apps (date-formatter, url-shortener)
```sql
CREATE TABLE usage_monthly (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portal_id             INTEGER NOT NULL,
  app_type              VARCHAR(50) NOT NULL,
  month_start           DATE NOT NULL,  -- First day of month (YYYY-MM-01)
  total_requests        INTEGER NOT NULL DEFAULT 0,
  successful_requests   INTEGER NOT NULL DEFAULT 0,
  failed_requests       INTEGER NOT NULL DEFAULT 0,
  last_request_at       TIMESTAMPTZ,
  metadata              JSONB NOT NULL DEFAULT '{}',  -- App-specific data
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT usage_monthly_portal_id_app_type_month_start_key 
    UNIQUE (portal_id, app_type, month_start),
  CONSTRAINT usage_monthly_app_type_check 
    CHECK (app_type IN ('date-formatter', 'url-shortener')),
  CONSTRAINT usage_monthly_check 
    CHECK ((successful_requests + failed_requests) <= total_requests),
  CONSTRAINT usage_monthly_total_requests_check 
    CHECK (total_requests >= 0),
  CONSTRAINT usage_monthly_successful_requests_check 
    CHECK (successful_requests >= 0),
  CONSTRAINT usage_monthly_failed_requests_check 
    CHECK (failed_requests >= 0)
);

-- Indexes
CREATE INDEX idx_usage_monthly_portal_app_month 
ON usage_monthly (portal_id, app_type, month_start DESC);
CREATE INDEX idx_usage_monthly_updated_at 
ON usage_monthly (updated_at DESC);
```

#### 6. url_shortener_api_keys
**Purpose**: Encrypted storage of Bitly API keys per portal
```sql
CREATE TABLE url_shortener_api_keys (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portal_id     INTEGER NOT NULL UNIQUE,
  service_name  TEXT NOT NULL DEFAULT 'bitly',
  api_key       TEXT NOT NULL,  -- AES-256-GCM encrypted
  settings_json JSONB DEFAULT '{}',
  verified_at   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_url_shortener_api_keys_portal ON url_shortener_api_keys (portal_id);

-- Triggers
CREATE TRIGGER update_url_shortener_api_keys_updated_at 
BEFORE UPDATE ON url_shortener_api_keys 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

#### 7. migration_log
**Purpose**: Track database migrations and schema changes
```sql
CREATE TABLE migration_log (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  migration_name VARCHAR(255) NOT NULL UNIQUE,
  executed_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  executed_by    VARCHAR(100) DEFAULT USER
);
```

### Migration History
```
Migration 002: 2025-08-15 - Table standardization with minimal indexing
Migration 003: 2025-08-15 - Data migration from usage_requests to date_formatter_usage
Migration 004: 2025-08-15 - Legacy table cleanup (dropped usage_requests)
Migration 005: 2025-08-16 - Final legacy cleanup (dropped portal_usage_monthly, url_shortener_usage_monthly, upsert_monthly_usage function)
```

### Database Design Principles

#### Standardization (Completed August 2025)
- **Consistent Naming**: All tables use `snake_case` naming convention
- **Unified Column Types**: UUID primary keys, INTEGER portal_id, TIMESTAMPTZ timestamps
- **Standardized Timestamps**: All raw usage tables have `request_timestamp` and `created_at`
- **App Type Pattern**: Multi-app support with app_type column and constraints

#### Minimal Indexing Strategy 
- **Performance Focus**: Optimized for bulk insert operations (20-30% faster)
- **Single Composite Index**: portal_id + request_timestamp DESC per table
- **No Secondary Indexes**: Eliminates success, created_at indexes for bulk insert speed
- **Aggregation Optimized**: Composite indexes perfectly match GROUP BY queries

#### Current Data Flow Architecture (Optimized)
```
Webhook Requests → Raw Usage Tables → Unified Aggregation → Dashboard
                       ↓                      ↓                ↓
   Fire-and-forget  date_formatter_usage  UnifiedUsageAggregator  App-specific charts
   logging (fast)   url_shortener_usage   (cron job batching)     (last 3 months)
                                              ↓
                                         usage_monthly
                                        (single table)
```

### Performance Characteristics
- **Bulk Insert Rate**: 20-30% faster with minimal indexing
- **Storage Efficiency**: Reduced index storage overhead
- **Query Performance**: Optimal for time-series aggregation queries
- **Concurrent Operations**: Better lock performance during high-volume periods

### Usage Patterns
- **Raw Data**: 38 date formatter + 37 url shortener requests logged
- **Aggregated Data**: 4 monthly summaries across 3 portals
- **Storage Size**: 176 kB total (48 kB per raw table, 80 kB unified)
- **Indexing**: 1 composite index per raw table (minimal strategy)

### Key Relationships
```
hubspot_installations (hub_id) ←→ portal_info (portal_id)
portal_info (portal_id) ←→ date_formatter_usage (portal_id)
portal_info (portal_id) ←→ url_shortener_usage (portal_id)
portal_info (portal_id) ←→ url_shortener_api_keys (portal_id)
[date_formatter_usage + url_shortener_usage] → usage_monthly (via aggregation)
```

## Known Issues and Workarounds
- **Jest ES Modules**: Integration tests removed due to Supabase ES module incompatibility
- **HubSpot Caching**: Always test in fresh workflows, UI caches action definitions
- **Portal Info Fetching**: May fail on first attempt, handled with retry logic
- **Input Fields Null**: Webhook handler gracefully handles null/undefined inputFields

## Performance Considerations
- **HubSpot API Limits**: 100 requests/10 seconds per app
- **Webhook Timeout**: HubSpot expects response within 20 seconds
- **Database Connections**: Using Supabase connection pooling
- **Concurrent Requests**: System designed for thousands of simultaneous webhooks
- **Fire-and-forget**: Usage tracking never blocks webhook responses

## Security Implementation
- **Token Storage**: Encrypted refresh/access tokens in hubspot_installations table
- **Portal Validation**: Every webhook validates portal has valid installation
- **Dashboard Auth**: Requires valid HubSpot access token via cookies
- **CORS**: Currently open for webhooks, restricted for dashboard
- **Environment Isolation**: Separate apps/databases for dev and production

## Production Deployment Checklist
- [ ] Set production environment variables in Vercel
  - HUBSPOT_PROD_CLIENT_ID
  - HUBSPOT_PROD_CLIENT_SECRET
  - SUPABASE_PROD_URL
  - SUPABASE_PROD_ANON_KEY
  - SUPABASE_PROD_SERVICE_ROLE_KEY
- [ ] Run SQL schema on production Supabase database
- [ ] Update HubSpot app settings with production URLs
  - Redirect URL: https://your-domain.vercel.app/api/auth/hubspot/callback
  - Webhook URL: https://your-domain.vercel.app/api/webhook/date-formatter
- [ ] Test webhook with production HubSpot workflow
- [ ] Verify dashboard authentication flow
- [ ] Check usage tracking in production database
- [ ] Update action version number if needed

## Monitoring and Debugging
- **Error Logging**: Check Vercel function logs for webhook errors
- **Usage Tracking Failures**: Non-blocking, logged to console with full stack trace
- **Database Queries**: Enable Supabase query logging for debugging
- **Test Commands**: 
  - `npm run usage:aggregate:dev` - Test aggregation locally
  - `npm run hubspot:dev:list` - Verify action registration
  - `npm test` - Run all unit tests
  - `curl -X POST http://localhost:3000/api/webhook/date-formatter -H "Content-Type: application/json" -d '{"origin":{"portalId":243404981},"inputFields":{"sourceDateField":"01/26/2025","sourceFormat":"US_STANDARD","targetFormat":"ISO_DATE"}}'`
- **Common Issues**:
  - 401 errors: Portal not authorized, needs app reinstallation
  - 400 errors: Missing required fields (check validation logs)
  - Empty formatted dates: Source date was empty or invalid format

## Critical Code Patterns to Maintain

### Core Principles (August 2025)
- **Awaited tracking in Vercel**: MUST await usage logging or database writes will be killed
- **Error-wrapped tracking**: Tracking failures don't break webhook responses (try-catch)
- **Unified aggregation**: Use UnifiedUsageAggregator for all monthly statistics
- **Environment separation**: All services auto-detect dev vs production
- **Minimal indexing**: Optimize for bulk insert performance over query speed
- **Clean architecture**: No dead code, clear separation of concerns

### Error Handling & Validation
- **Async Error Handling**: Always use try-catch in services, log errors with context
- **Portal ID Validation**: Check portalId exists and is > 0 before any operations
- **Null Safety**: Use optional chaining (?.) and nullish coalescing (??) operators
- **Logging Pattern**: Log errors with context object including portalId, timestamp, stack trace
- **Response Format**: Always return WorkflowResponse with outputFields, even for errors
- **Defensive Programming**: Handle null/undefined inputFields gracefully with fallbacks

### Service & Function Patterns
- **Service Naming**: Use `get*` for cache/DB retrieval, `fetch*` for external API calls
- **Error Messages**: User-friendly messages in outputFields.error for workflow visibility
- **Raw Usage Tracking**: Use app-specific functions (trackUsage, trackUrlShortenerUsage) - MUST await
- **Aggregation**: Never create new monthly aggregation functions - use UnifiedUsageAggregator
- **Database Operations**: Await tracking calls in Vercel Functions (serverless constraint)
- **Tracking Pattern**: Wrap tracking in try-catch so failures don't break webhook responses

### Legacy Code Removal Lessons (August 2025)
- **Real-time aggregation is anti-pattern**: Causes webhook delays and RPC failures
- **Duplicate utilities**: Check for unused utils directories before creating new ones
- **Dead code accumulates**: Regular cleanup prevents 2,000+ line accumulations
- **Test coverage helps**: Unused functions often lack test coverage
- **Database functions**: Avoid custom PostgreSQL functions unless absolutely necessary

## Future Architecture Considerations
- **Multi-App Support**: System designed for multiple apps (date-formatter, url-shortener, etc.)
- **Pricing Implementation**: Stripe integration planned but not yet implemented
- **Email System**: Consider SendGrid/Resend for usage alerts and notifications
- **Analytics Platform**: Consider Mixpanel/Amplitude for detailed usage analytics
- **API Versioning**: May need versioned endpoints for backward compatibility
- **Webhook Queue**: Consider implementing queue system for high-volume processing
- **Caching Layer**: Redis for frequently accessed portal info and rate limiting
- **Batch Processing**: Aggregate usage data in batches for better performance
- **Marketplace Expansion**: Design patterns should support multiple workflow actions

## Business Model and Strategy
- **Target Market**: HubSpot users needing advanced workflow utilities
- **Pain Points Solved**: 
  - Limited native date formatting in HubSpot
  - No support for international date formats
  - Poor handling of 2-digit years
  - Lack of custom format options
- **Monetization**: Usage-based pricing after beta period (3K free, then tiered)
- **Competition**: Native HubSpot functions limited, few quality marketplace apps
- **Differentiation**: 
  - Comprehensive format support (US, UK, Taiwan, Korea, Japan, ISO)
  - Reliable 2-digit year handling
  - Custom format tokens
  - Error handling that doesn't break workflows
- **Expansion Plans**: 
  - ✅ **URL shortener action** (Completed January 2025)
  - Data transformer action
  - Text formatter action
  - Number formatter action
- **Success Metrics**: Monthly active portals, requests per portal, error rates

## URL Shortener Implementation (Completed January 2025)

### Features
- **Bitly Integration**: Powered by Bitly API v4 for reliable URL shortening
- **Custom Domain Support**: Use branded domains (e.g., yourbrand.co) or default bit.ly
- **Error Handling**: Comprehensive error messages for API key issues, invalid URLs, rate limits
- **Usage Tracking**: Full request logging and analytics separate from date formatter
- **Security**: Encrypted API key storage with AES-256-GCM encryption
- **Multi-App Architecture**: Clean separation from date formatter with shared OAuth

### Implementation Details
- **Database Schema**: New tables for API keys (`url_shortener_api_keys`), usage tracking (`url_shortener_usage`), and monthly aggregates
- **API Key Management**: Dashboard UI for Bitly token configuration with connection testing
- **Webhook Handler**: `/api/webhook/url-shortener` with input validation and retry logic
- **Service Architecture**: Modular design with `BitlyService`, `UrlValidator`, and `UrlShortenerService`
- **OAuth Integration**: State parameter support for app-specific redirect flows
- **Scripts**: NPM commands for dev/prod registration and management

### Configuration Files
- **Workflow Action**: `/config/workflow-actions/url-shortener.json`
- **App Config**: Updated `/config/apps.json` with url-shortener entry
- **Package Scripts**: Added `hubspot:url-shortener:dev:*` and `hubspot:url-shortener:prod:*` commands

### User Experience
- **Installation Flow**: Dedicated success page at `/install/url-shortener/success`
- **Dashboard Integration**: Tabbed interface with API key settings and usage statistics  
- **Error Messages**: User-friendly messages with clear resolution steps
- **Documentation**: Complete setup guides in `/docs/URL_SHORTENER_SETUP.md` and `/docs/BITLY_API_KEY_GUIDE.md`

### Testing Coverage
- **Unit Tests**: Comprehensive test suites for BitlyService, URL validation, encryption, and webhook handler
- **Error Scenarios**: Rate limits, invalid API keys, malformed URLs, custom domain issues
- **Edge Cases**: Network failures, retry logic, concurrent requests, authentication errors

### Security Implementation
- **API Key Encryption**: AES-256-GCM with PBKDF2 key derivation
- **Environment Variables**: Separate DEV/PROD configurations
- **Input Validation**: URL format validation and domain verification
- **Portal Authorization**: Installation verification for each request

## Critical Test Scenarios
### Date Formatting Tests
- **Empty Date**: Should return empty string with error message in outputFields
- **Invalid Format**: Should return original value with specific error message
- **2-Digit Years**: 
  - 00-49 → 2000-2049
  - 50-99 → 1950-1999
  - Test with various formats (MM/DD/YY, DD-MM-YY, etc.)
- **Edge Cases**:
  - Leap years (02/29/24)
  - Invalid dates (13/32/2025)
  - Different separators (/, -, ., space)
  - Leading zeros (01/01/2025 vs 1/1/2025)

### URL Shortener Tests
- **Valid URL**: Should successfully shorten standard HTTP/HTTPS URLs
- **Custom Domain**: Should respect custom Bitly domains when provided
- **Invalid URL**: Should return validation error for malformed URLs
- **Missing API Key**: Should return setup instructions error message
- **Invalid API Key**: Should return "Please check your Bitly API key" error
- **Rate Limiting**: Should handle Bitly rate limits with retry logic and user-friendly messages
- **Network Failures**: Should retry with exponential backoff (max 3 attempts)
- **Already Shortened**: Should detect and warn about already-shortened URLs
- **Long URLs**: Should handle URLs up to 2048 characters
- **Unicode URLs**: Should properly encode international characters

### Authentication Tests
- **Portal Not Found**: Should return 401 unauthorized
- **Expired Token**: Should attempt refresh, then fail gracefully
- **Invalid Installation**: Should prompt for app reinstallation
- **Missing Token**: Should return appropriate error message

### Validation Tests
- **Missing Fields**: Should return 400 with specific field error
- **Null inputFields**: Should handle gracefully without crashing
- **Invalid portalId**: Should reject with validation error
- **Custom format without selection**: Should return validation error

### Performance Tests
- **Concurrent Requests**: Fire 100+ webhooks simultaneously
- **Large Portal**: Test with portal having millions of requests
- **Database Connection Pool**: Verify no connection exhaustion
- **Response Time**: Ensure < 500ms for 95th percentile

### Integration Tests
- **Fresh Install Flow**: OAuth → Token Storage → First Webhook
- **Dashboard Access**: Portal auth → Stats display → Profile update
- **Usage Tracking**: Webhook → Log → Aggregation → Display
- **Error Scenarios**: Network failures, API limits, database downtime