# HubSpot Environment Separation Setup

This document explains how to set up separate HubSpot apps for development and production environments.

## Overview

To prevent development activities from affecting marketplace users, this project supports separate HubSpot apps for:
- **Development**: Testing, debugging, and feature development
- **Production**: Live marketplace deployments

## Setup Instructions

### 1. Create Separate HubSpot Apps

1. Go to [HubSpot Developer Portal](https://developer.hubspot.com)
2. Create **two separate apps**:
   - `Your App Name (Development)`
   - `Your App Name (Production)`

### 2. Configure Environment Variables

Update your `.env.local` file with environment-specific credentials:

```bash
# ====================
# PRODUCTION HubSpot App (for marketplace/live users)
# ====================
HUBSPOT_PROD_CLIENT_ID=your_production_hubspot_client_id
HUBSPOT_PROD_CLIENT_SECRET=your_production_hubspot_client_secret
HUBSPOT_PROD_REDIRECT_URI=https://yourdomain.com/api/auth/hubspot/callback
HUBSPOT_PROD_DEVELOPER_API_KEY=your_production_developer_api_key
HUBSPOT_PROD_DATE_FORMATTER_APP_ID=your_production_date_formatter_app_id

# ====================
# DEVELOPMENT HubSpot App (for testing)
# ====================
HUBSPOT_DEV_CLIENT_ID=your_development_hubspot_client_id
HUBSPOT_DEV_CLIENT_SECRET=your_development_hubspot_client_secret
HUBSPOT_DEV_REDIRECT_URI=http://localhost:3000/api/auth/hubspot/callback
HUBSPOT_DEV_DEVELOPER_API_KEY=your_development_developer_api_key
HUBSPOT_DEV_DATE_FORMATTER_APP_ID=your_development_date_formatter_app_id

# ====================
# FALLBACK (Legacy - will use dev/prod specific if available)
# ====================
HUBSPOT_CLIENT_ID=your_hubspot_client_id
HUBSPOT_CLIENT_SECRET=your_hubspot_client_secret
HUBSPOT_REDIRECT_URI=http://localhost:3000/api/auth/hubspot/callback
HUBSPOT_DEVELOPER_API_KEY=your_developer_api_key
HUBSPOT_DATE_FORMATTER_APP_ID=your_date_formatter_app_id
```

### 3. Environment Detection

The system automatically detects environments based on:

- **Development**: 
  - `NODE_ENV=development`
  - URLs containing `localhost` or `ngrok`
- **Production**: 
  - Vercel deployments
  - Any other deployment context

### 4. Usage Commands

#### Development Environment
```bash
# Register development app
npm run hubspot:dev:date-formatter:register

# Update development app  
npm run hubspot:dev:date-formatter:update
```

#### Production Environment
```bash
# Register production app
npm run hubspot:prod:date-formatter:register

# Update production app
npm run hubspot:prod:date-formatter:update
```

#### Auto-Detection (Legacy)
```bash
# Uses environment detection
npm run hubspot:date-formatter:register
npm run hubspot:date-formatter:update
```

## Environment Configuration Details

### Development App Configuration
- **Purpose**: Testing, debugging, feature development
- **Redirect URI**: `http://localhost:3000/api/auth/hubspot/callback`
- **Action Names**: Include timestamp and environment info
- **Webhook URL**: Local development server or ngrok tunnel

### Production App Configuration  
- **Purpose**: Live marketplace users
- **Redirect URI**: `https://yourdomain.com/api/auth/hubspot/callback`
- **Action Names**: Clean version numbers only
- **Webhook URL**: Production deployment URL

## Benefits

1. **Isolation**: Development activities don't affect live users
2. **Testing**: Safe environment for testing new features
3. **Versioning**: Clear separation between dev and prod versions
4. **Debugging**: Development-specific logging and naming
5. **Deployment**: Controlled rollout process

## Best Practices

1. **Always test in development first** before updating production
2. **Use descriptive naming** for development actions (includes timestamps)
3. **Keep production actions clean** (version numbers only)
4. **Monitor both environments** separately
5. **Use separate test portals** for each environment

## Troubleshooting

### Common Issues

1. **Wrong App Being Used**
   - Check environment variables are set correctly
   - Verify `NODE_ENV` or URL-based detection
   - Look for console logs showing which app is being used

2. **Missing Environment Variables**
   - Ensure both DEV and PROD variants are set
   - Fallback variables will be used if environment-specific ones are missing

3. **OAuth Redirect Mismatch**
   - Development: Must use `localhost:3000` or ngrok URL
   - Production: Must match your deployed domain

### Debug Information

The system logs which environment and app is being used:
```
🔧 Using development HubSpot app (Client ID: 12345678...)
Environment: DEVELOPMENT
```

## Migration from Single App

If you're migrating from a single app setup:

1. **Keep existing variables** as fallbacks
2. **Add environment-specific variables** gradually  
3. **Test thoroughly** in development before production changes
4. **Update deployment scripts** to use environment-specific commands