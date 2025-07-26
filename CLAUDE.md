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

## File Structure
- `src/lib/config/config-manager.ts` - Central configuration management
- `src/lib/config/environment.ts` - Environment-specific configurations
- `src/lib/supabase/client.ts` - Environment-aware database client
- `scripts/config-helper.mjs` - ES module configuration for scripts
- `config/apps.json` - Multi-app configuration
- `config/workflow-actions/` - Action definitions
- `scripts/*.mjs` - ES module management scripts
- `src/app/api/webhook/` - Webhook endpoints
- `src/lib/services/` - Business logic services

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