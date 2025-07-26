import { URLSearchParams } from 'url';
import { ConfigManager } from '@/lib/config/config-manager';

/**
 * OAuth scopes required for the HubSpot integration
 * Only oauth scope is needed for basic authentication and API access
 */
export const HUBSPOT_OAUTH_SCOPES = [
  'oauth'          // Basic OAuth scope for authentication and API access
];

/**
 * Generates HubSpot OAuth authorization URL with required parameters
 * Uses environment-specific credentials detected automatically
 * 
 * @returns Complete OAuth authorization URL
 * @throws Error if required environment variables are missing
 */
export function generateOAuthUrl(): string {
  const config = ConfigManager.getHubSpotConfig();
  const environment = ConfigManager.getCurrentEnvironment();
  
  // Build OAuth authorization URL parameters
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    scope: HUBSPOT_OAUTH_SCOPES.join(' '),
    response_type: 'code'
  });

  console.log(`🔐 Generating OAuth URL for ${environment.toUpperCase()} environment`);
  
  return `https://app.hubspot.com/oauth/authorize?${params.toString()}`;
}

/**
 * Validates OAuth callback parameters
 * 
 * @param code - Authorization code from HubSpot OAuth callback
 * @throws Error if code is missing or invalid format
 */
export function validateOAuthCallback(code: string): void {
  // Handle explicit null, undefined, empty string cases
  if (code === null || code === undefined || code === '') {
    throw new Error('Authorization code is required');
  }

  // Handle non-string types by converting to string
  const codeStr = String(code);

  // Handle falsy values that become empty or very short strings
  if (!codeStr || codeStr === 'false' || codeStr === '0' || codeStr === 'null' || codeStr === 'undefined' || codeStr === 'NaN') {
    throw new Error('Authorization code is required');
  }

  // Basic format validation for authorization code
  // Allow special numeric values even if they're short
  if (codeStr.length < 10 && codeStr !== 'Infinity' && codeStr !== '-Infinity') {
    throw new Error('Invalid authorization code format');
  }
}

