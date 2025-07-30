/**
 * Configuration helper for ES module scripts
 * Mirrors ConfigManager logic for script compatibility
 */

import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

/**
 * Determines the current environment (mirrors ConfigManager logic)
 */
export function getCurrentEnvironment() {
  if (process.argv.includes('dev')) return 'dev';
  if (process.argv.includes('prod')) return 'prod';
  if (process.env.NODE_ENV === 'production') return 'prod';
  if (process.env.NODE_ENV === 'development') return 'dev';
  return 'dev';
}

/**
 * Gets environment-specific HubSpot configuration
 * @param {string} explicitEnv - Optional explicit environment ('dev' or 'prod')
 */
export function getHubSpotConfig(explicitEnv) {
  const environment = explicitEnv || getCurrentEnvironment();
  const isDev = environment === 'dev';
  
  return {
    developerApiKey: process.env[isDev ? 'HUBSPOT_DEV_DEVELOPER_API_KEY' : 'HUBSPOT_PROD_DEVELOPER_API_KEY'],
    dateFormatterAppId: process.env[isDev ? 'HUBSPOT_DEV_DATE_FORMATTER_APP_ID' : 'HUBSPOT_PROD_DATE_FORMATTER_APP_ID']
  };
}

/**
 * Gets webhook base URL for current environment
 */
export function getWebhookBaseUrl() {
  const environment = getCurrentEnvironment();
  const isDev = environment === 'dev';
  
  if (isDev) {
    return process.env.NEXTJS_URL || process.env.DEV_NEXTJS_URL || 'http://localhost:3000';
  }
  
  return process.env.PROD_NEXTJS_URL || process.env.NEXTJS_URL;
}

/**
 * Checks if we're in development mode based on URL
 */
export function isDevelopmentMode(url) {
  return url.includes('localhost') || url.includes('ngrok') || url.includes('127.0.0.1');
}