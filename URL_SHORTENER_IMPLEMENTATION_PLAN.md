# URL Shortener Feature - Implementation Plan

## Overview
This document contains the complete implementation plan for adding the URL Shortener feature to the Integration Up platform. Each phase should be completed in order, with verification steps before moving to the next phase.

**IMPORTANT**: Review this file before executing each phase to ensure all requirements are met.

---

## Architecture Summary
- Multi-feature monorepo using Next.js App Router under `/src`
- Shared OAuth authentication across features
- Separate HubSpot app registration for URL Shortener
- Usage tracking per feature (must await completion in Vercel Functions)
- "Integration Up" as the platform brand
- Bitly as the initial URL shortening service

---

## Project Structure (Target)
```
/src/
  /app/                         # Next.js App Router
    /api/
      /webhook/
        /date-formatter/        # Existing
          - route.ts
        /url-shortener/         # New
          - route.ts
      /hubspot/
        /[appType]/             # Dynamic route for multi-app
          /install/
            - route.ts
          /uninstall/
            - route.ts
    /install/
      /[appType]/               # Dynamic routes
        /success/
          - page.tsx
      - page.tsx                # App selector
    /dashboard/
      /components/
        - ApiKeySettings.tsx    # New
        - FeatureTabs.tsx       # New
      - page.tsx                # Updated with tabs

  /lib/
    /config/                    # Existing
    /hubspot/                   # Existing
    /supabase/                  # Existing
    
    /features/                  # NEW - Feature-specific
      /date-formatter/
        /services/
          - date-formatter.ts
          - usage-aggregator.ts
        /config/
          - workflow-action.json
      /url-shortener/
        /services/
          - bitly-service.ts
          - url-shortener.ts
          - usage-tracker.ts
        /config/
          - workflow-action.json
    
    /shared/                    # Renamed from services
      - webhook-handler.ts
      - usage-tracker.ts
      - hubspot-portal.ts
      - encryption.ts           # New - for API key encryption

/config/
  /workflow-actions/
    - date-formatter.json       # Existing
    - url-shortener.json        # New

/scripts/
  - register-workflow-action.mjs  # Update for multi-app
  - update-workflow-action.mjs
```

---

## Database Schema
```sql
-- API Keys for URL shortener services
CREATE TABLE url_shortener_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portal_id INTEGER UNIQUE NOT NULL,
  service_name TEXT DEFAULT 'bitly' NOT NULL,
  api_key TEXT NOT NULL, -- encrypted
  settings_json JSONB DEFAULT '{}',
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  FOREIGN KEY (portal_id) REFERENCES hubspot_installations(hub_id)
);

-- Usage tracking for URL shortener
CREATE TABLE url_shortener_usage (
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

-- Monthly aggregated usage
CREATE TABLE url_shortener_usage_monthly (
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
CREATE INDEX idx_url_shortener_usage_portal_timestamp 
  ON url_shortener_usage(portal_id, timestamp DESC);
CREATE INDEX idx_url_shortener_api_keys_portal 
  ON url_shortener_api_keys(portal_id);
```

---

## Implementation Phases

### Phase 1: Project Restructuring
**Goal**: Reorganize codebase for multi-feature architecture

**Tasks**:
- [ ] Create `/src/lib/features/` directory structure
- [ ] Create `/src/lib/features/date-formatter/` folders
- [ ] Create `/src/lib/features/url-shortener/` folders
- [ ] Move date-formatter specific files to features folder
- [ ] Rename `/src/lib/services/` to `/src/lib/shared/`
- [ ] Update all import paths for moved files
- [ ] Test existing date-formatter functionality still works

**Verification**:
- Run `npm run build` - should succeed
- Run `npm test` - all tests should pass
- Test date formatter webhook locally

---

### Phase 2: Database Setup
**Goal**: Create database tables for URL shortener

**Tasks**:
- [ ] Create SQL migration for `url_shortener_api_keys` table
- [ ] Create SQL migration for `url_shortener_usage` tables
- [ ] Add indexes for performance optimization
- [ ] Run migrations on development database
- [ ] Create encryption utility for API keys
- [ ] Test database connections and queries

**Verification**:
- Check tables exist in Supabase dashboard
- Run test INSERT/SELECT queries
- Verify foreign key constraints work

---

### Phase 3: Bitly Service
**Goal**: Implement Bitly API integration

**Tasks**:
- [ ] Implement BitlyService class with API v4 integration
- [ ] Add URL validation utility function
- [ ] Implement retry logic with exponential backoff
- [ ] Add method to validate API key
- [ ] Add method to fetch user's default domain
- [ ] Write unit tests for Bitly service
- [ ] Test with actual Bitly API in development

**Files to create**:
- `/src/lib/features/url-shortener/services/bitly-service.ts`
- `/src/lib/features/url-shortener/services/url-validator.ts`
- `/__tests__/lib/features/url-shortener/bitly-service.test.ts`

**Verification**:
- Unit tests pass
- Can successfully shorten a URL with test API key
- Retry logic works with rate limit simulation

---

### Phase 4: Webhook Handler
**Goal**: Create webhook endpoint for URL shortener

**Tasks**:
- [ ] Create `/api/webhook/url-shortener/route.ts`
- [ ] Implement request validation
- [ ] Add portal authorization check
- [ ] Integrate Bitly service
- [ ] Implement usage tracking (await completion)
- [ ] Add comprehensive error handling
- [ ] Test webhook with curl commands

**Test command**:
```bash
curl -X POST http://localhost:3000/api/webhook/url-shortener \
  -H "Content-Type: application/json" \
  -d '{
    "origin": {"portalId": 243404981},
    "inputFields": {
      "urlToShorten": "https://example.com/very-long-url",
      "customDomain": ""
    }
  }'
```

**Verification**:
- Webhook returns proper response format
- Usage is tracked in database
- Error cases return appropriate messages

---

### Phase 5: Dashboard Updates
**Goal**: Add UI for API key management and usage stats

**Tasks**:
- [ ] Create ApiKeySettings component
- [ ] Add API key encryption/decryption
- [ ] Implement "Test Connection" functionality
- [ ] Create FeatureTabs component for multi-feature view
- [ ] Update dashboard page with new components
- [ ] Add URL Shortener usage stats display
- [ ] Style components to match existing design

**Files to create**:
- `/src/app/dashboard/components/ApiKeySettings.tsx`
- `/src/app/dashboard/components/FeatureTabs.tsx`
- `/src/lib/shared/encryption.ts`

**Verification**:
- Can save and retrieve encrypted API key
- Test connection validates API key
- Usage stats display correctly
- UI is responsive and matches design

---

### Phase 6: OAuth & Installation Flow
**Goal**: Support multi-app installation flow

**Tasks**:
- [ ] Create dynamic `/api/hubspot/[appType]/` routes
- [ ] Update OAuth callback to handle state parameter
- [ ] Create `/install/[appType]/success/` pages
- [ ] Create app selector on `/install/` page
- [ ] Implement install/uninstall webhook handlers
- [ ] Test OAuth flow for URL shortener app

**Files to create**:
- `/src/app/api/hubspot/[appType]/install/route.ts`
- `/src/app/api/hubspot/[appType]/uninstall/route.ts`
- `/src/app/install/[appType]/success/page.tsx`
- `/src/app/install/page.tsx` (update)

**Verification**:
- Can complete OAuth flow for URL shortener
- Success page displays correctly
- Installation is tracked in database

---

### Phase 7: HubSpot App Configuration
**Goal**: Configure HubSpot app settings

**Tasks**:
- [ ] Create URL Shortener app in HubSpot developer account (dev)
- [ ] Configure OAuth redirect URLs
- [ ] Set webhook URLs
- [ ] Create workflow action definition JSON
- [ ] Add environment variables to `.env.local`
- [ ] Update ConfigManager for multi-app support

**Environment variables to add**:
```env
HUBSPOT_URL_SHORTENER_DEV_CLIENT_ID=xxx
HUBSPOT_URL_SHORTENER_DEV_CLIENT_SECRET=xxx
HUBSPOT_URL_SHORTENER_DEV_APP_ID=xxx
ENCRYPTION_KEY=xxx
```

**HubSpot App Settings**:
- Redirect URL: `https://[domain]/api/auth/hubspot/callback`
- Webhook URL: `https://[domain]/api/webhook/url-shortener`
- Required scopes: Same as date formatter

**Verification**:
- App appears in HubSpot developer portal
- Environment variables are loaded correctly
- ConfigManager recognizes new app

---

### Phase 8: Scripts & Commands
**Goal**: Create management scripts for URL shortener

**Tasks**:
- [ ] Update registration scripts for multi-app support
- [ ] Create `npm run hubspot:url-shortener:dev:register`
- [ ] Create `npm run hubspot:url-shortener:dev:update`
- [ ] Create `npm run hubspot:url-shortener:dev:delete`
- [ ] Add production variants of commands
- [ ] Test scripts with both apps

**Files to update**:
- `/scripts/register-workflow-action.mjs`
- `/scripts/update-workflow-action.mjs`
- `/package.json` (add new scripts)

**Verification**:
- Can register URL shortener action
- Can update action definition
- Can list both apps' actions

---

### Phase 9: Testing
**Goal**: Comprehensive testing of URL shortener

**Tasks**:
- [ ] Write unit tests for URL shortener webhook handler
- [ ] Write integration tests for complete flow
- [ ] Test with real HubSpot workflow in dev
- [ ] Test API key validation and storage
- [ ] Test usage tracking and aggregation
- [ ] Performance test with concurrent requests
- [ ] Test error scenarios and edge cases

**Test scenarios**:
1. Valid URL shortening
2. Invalid URL format
3. Missing API key
4. Invalid API key
5. Bitly API rate limit
6. Custom domain usage
7. Concurrent requests
8. Portal not authorized

**Verification**:
- All tests pass
- Works in actual HubSpot workflow
- Performance meets requirements (<500ms p95)

---

### Phase 10: Documentation
**Goal**: Complete documentation for URL shortener

**Tasks**:
- [ ] Update CLAUDE.md with URL shortener details
- [ ] Create user documentation for URL shortener
- [ ] Document API key setup process
- [ ] Add troubleshooting guide
- [ ] Update README with multi-app architecture

**Documentation to create**:
- `/docs/URL_SHORTENER_SETUP.md`
- `/docs/BITLY_API_KEY_GUIDE.md`
- Update `/CLAUDE.md`
- Update `/README.md`

**Verification**:
- Documentation is clear and complete
- Setup guide works for new users
- Troubleshooting covers common issues

---

### Phase 11: Production Deployment
**Goal**: Deploy URL shortener to production

**Tasks**:
- [ ] Create production HubSpot app
- [ ] Set production environment variables in Vercel
- [ ] Deploy database schema to production
- [ ] Register production workflow action
- [ ] Test production webhook
- [ ] Verify usage tracking in production
- [ ] Monitor for errors and performance

**Production environment variables**:
```env
HUBSPOT_URL_SHORTENER_PROD_CLIENT_ID=xxx
HUBSPOT_URL_SHORTENER_PROD_CLIENT_SECRET=xxx
HUBSPOT_URL_SHORTENER_PROD_APP_ID=xxx
```

**Verification**:
- Production webhook responds correctly
- Usage tracking works in production
- No errors in Vercel logs
- Performance meets SLA

---

## Success Criteria
- [ ] URL shortener works end-to-end in HubSpot workflow
- [ ] API keys are securely stored and encrypted
- [ ] Usage is tracked separately from date formatter
- [ ] Dashboard shows both features with separate stats
- [ ] Error messages are user-friendly
- [ ] Performance: <500ms response time (p95)
- [ ] All tests pass
- [ ] Documentation is complete

---

## Notes & Considerations

### Security
- API keys must be encrypted at rest
- Validate all inputs from HubSpot
- Use HTTPS for all Bitly API calls
- Never log API keys or sensitive data

### Performance
- Webhook must respond within 20 seconds (HubSpot limit)
- Use connection pooling for database
- Implement proper retry logic with backoff
- Cache user's default domain for 5 minutes

### Error Handling
- All errors should return user-friendly messages
- Log errors with context for debugging
- Track failed requests in usage tables
- Provide clear setup instructions when API key missing

### Future Enhancements
- Support for other URL shortening services (TinyURL, Rebrandly)
- Bulk URL shortening
- QR code generation
- Click tracking and analytics
- Custom URL slugs

---

## Rollback Plan
If issues arise during deployment:
1. Revert code changes via Git
2. Keep database tables (no harm in having them)
3. Disable webhook endpoint if needed
4. Unregister HubSpot workflow action
5. Communicate with affected users

---

## Contact & Support
- Primary Developer: [Your Name]
- Review Date: January 2025
- Last Updated: [Current Date]

---

**Remember**: Check this file before starting each phase!