/**
 * Environment Configuration Utility
 * Handles environment detection and configuration management for HubSpot integration
 */

export type Environment = 'dev' | 'prod';

export interface HubSpotConfig {
  redirectUri: string;
  developerApiKey: string;
  dateFormatter: {
    clientId: string;
    clientSecret: string;
    appId: string;
  };
  urlShortener: {
    clientId: string;
    clientSecret: string;
    appId: string;
  };
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  serviceRoleKey: string;
}

export interface EnvironmentConfig {
  environment: Environment;
  hubspot: HubSpotConfig;
  supabase: SupabaseConfig;
}

/**
 * Gets environment configuration based on manual selection
 * @param environment - Manually specified environment ('dev' or 'prod')
 * @returns Complete environment configuration
 * @throws Error if required environment variables are missing
 */
export function getEnvironmentConfig(environment: Environment): EnvironmentConfig {
  validateEnvironment(environment);
  
  const hubspotConfig = getHubSpotConfig(environment);
  const supabaseConfig = getSupabaseConfig(environment);
  
  return {
    environment,
    hubspot: hubspotConfig,
    supabase: supabaseConfig
  };
}

/**
 * Validates environment parameter
 */
function validateEnvironment(environment: string): asserts environment is Environment {
  if (environment !== 'dev' && environment !== 'prod') {
    throw new Error(`Invalid environment: ${environment}. Must be 'dev' or 'prod'`);
  }
}

/**
 * Gets HubSpot configuration for specified environment
 */
function getHubSpotConfig(environment: Environment): HubSpotConfig {
  const prefix = environment === 'dev' ? 'DEV' : 'PROD';
  
  const config = {
    redirectUri: process.env[`HUBSPOT_${prefix}_REDIRECT_URI`],
    developerApiKey: process.env[`HUBSPOT_${prefix}_DEVELOPER_API_KEY`],
    dateFormatter: {
      clientId: process.env[`HUBSPOT_${prefix}_DATE_FORMATTER_CLIENT_ID`],
      clientSecret: process.env[`HUBSPOT_${prefix}_DATE_FORMATTER_CLIENT_SECRET`],
      appId: process.env[`HUBSPOT_${prefix}_DATE_FORMATTER_APP_ID`],
    },
    urlShortener: {
      clientId: process.env[`HUBSPOT_${prefix}_URL_SHORTENER_CLIENT_ID`],
      clientSecret: process.env[`HUBSPOT_${prefix}_URL_SHORTENER_CLIENT_SECRET`],
      appId: process.env[`HUBSPOT_${prefix}_URL_SHORTENER_APP_ID`],
    },
  };
  
  // Validate shared required fields
  const sharedMissingFields = [
    ['redirectUri', `HUBSPOT_${prefix}_REDIRECT_URI`],
    ['developerApiKey', `HUBSPOT_${prefix}_DEVELOPER_API_KEY`],
  ].filter(([key]) => !config[key as keyof typeof config])
    .map(([, envVar]) => envVar);
  
  // Validate date formatter fields
  const dateFormatterMissing = [
    ['clientId', `HUBSPOT_${prefix}_DATE_FORMATTER_CLIENT_ID`],
    ['clientSecret', `HUBSPOT_${prefix}_DATE_FORMATTER_CLIENT_SECRET`],
    ['appId', `HUBSPOT_${prefix}_DATE_FORMATTER_APP_ID`],
  ].filter(([key]) => !config.dateFormatter[key as keyof typeof config.dateFormatter])
    .map(([, envVar]) => envVar);
  
  // Validate URL shortener fields
  const urlShortenerMissing = [
    ['clientId', `HUBSPOT_${prefix}_URL_SHORTENER_CLIENT_ID`],
    ['clientSecret', `HUBSPOT_${prefix}_URL_SHORTENER_CLIENT_SECRET`],
    ['appId', `HUBSPOT_${prefix}_URL_SHORTENER_APP_ID`],
  ].filter(([key]) => !config.urlShortener[key as keyof typeof config.urlShortener])
    .map(([, envVar]) => envVar);
  
  const allMissingFields = [...sharedMissingFields, ...dateFormatterMissing, ...urlShortenerMissing];
  
  if (allMissingFields.length > 0) {
    throw new Error(
      `Missing required HubSpot ${environment} environment variables: ${allMissingFields.join(', ')}`
    );
  }
  
  return config as HubSpotConfig;
}

/**
 * Gets Supabase configuration for specified environment
 */
function getSupabaseConfig(environment: Environment): SupabaseConfig {
  const prefix = environment === 'dev' ? 'DEV' : 'PROD';
  
  const config = {
    url: process.env[`SUPABASE_${prefix}_URL`],
    anonKey: process.env[`SUPABASE_${prefix}_ANON_KEY`],
    serviceRoleKey: process.env[`SUPABASE_${prefix}_SERVICE_ROLE_KEY`],
  };
  
  // Validate all required fields are present
  const missingFields = Object.entries(config)
    .filter(([, value]) => !value)
    .map(([key]) => `SUPABASE_${prefix}_${key.replace(/([A-Z])/g, '_$1').toUpperCase()}`);
  
  if (missingFields.length > 0) {
    throw new Error(
      `Missing required Supabase ${environment} environment variables: ${missingFields.join(', ')}`
    );
  }
  
  return config as SupabaseConfig;
}

/**
 * Logs environment configuration for debugging (safe - no secrets)
 */
export function logEnvironmentInfo(environment: Environment): void {
  const prefix = environment === 'dev' ? 'DEV' : 'PROD';
  const dateFormatterAppId = process.env[`HUBSPOT_${prefix}_DATE_FORMATTER_APP_ID`];
  const urlShortenerAppId = process.env[`HUBSPOT_${prefix}_URL_SHORTENER_APP_ID`];
  const supabaseUrl = process.env[`SUPABASE_${prefix}_URL`];
  
  console.log(`🔧 Environment: ${environment.toUpperCase()}`);
  console.log(`   Date Formatter App ID: ${dateFormatterAppId?.substring(0, 8)}...`);
  console.log(`   URL Shortener App ID: ${urlShortenerAppId?.substring(0, 8)}...`);
  console.log(`   Supabase Project: ${supabaseUrl?.split('.')[0].split('//')[1]}...`);
}