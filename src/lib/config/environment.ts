/**
 * Environment Configuration Utility
 * Handles environment detection and configuration management for HubSpot integration
 */

export type Environment = 'dev' | 'prod';

export interface HubSpotConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  developerApiKey: string;
  dateFormatterAppId: string;
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
    clientId: process.env[`HUBSPOT_${prefix}_CLIENT_ID`],
    clientSecret: process.env[`HUBSPOT_${prefix}_CLIENT_SECRET`],
    redirectUri: process.env[`HUBSPOT_${prefix}_REDIRECT_URI`],
    developerApiKey: process.env[`HUBSPOT_${prefix}_DEVELOPER_API_KEY`],
    dateFormatterAppId: process.env[`HUBSPOT_${prefix}_DATE_FORMATTER_APP_ID`],
  };
  
  // Validate all required fields are present
  const missingFields = Object.entries(config)
    .filter(([, value]) => !value)
    .map(([key]) => `HUBSPOT_${prefix}_${key.replace(/([A-Z])/g, '_$1').toUpperCase()}`);
  
  if (missingFields.length > 0) {
    throw new Error(
      `Missing required HubSpot ${environment} environment variables: ${missingFields.join(', ')}`
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
  const hubspotAppId = process.env[`HUBSPOT_${prefix}_DATE_FORMATTER_APP_ID`];
  const supabaseUrl = process.env[`SUPABASE_${prefix}_URL`];
  
  console.log(`🔧 Environment: ${environment.toUpperCase()}`);
  console.log(`   HubSpot App ID: ${hubspotAppId?.substring(0, 8)}...`);
  console.log(`   Supabase Project: ${supabaseUrl?.split('.')[0].split('//')[1]}...`);
}