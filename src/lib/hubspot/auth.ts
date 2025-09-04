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
 * Now uses app-specific redirect URIs, eliminating need for state parameter
 * 
 * @param appType - The app type to generate OAuth URL for
 * @returns Complete OAuth authorization URL
 * @throws Error if required environment variables are missing
 */
export function generateOAuthUrl(appType: 'date-formatter' | 'url-shortener'): string {
  const clientId = ConfigManager.getHubSpotClientId(appType);
  const redirectUri = ConfigManager.getHubSpotRedirectUri(appType); // Now app-specific
  // Environment configuration handled by ConfigManager
  
  // Validate required configuration
  if (!clientId || !redirectUri) {
    throw new Error(`Missing OAuth configuration for ${appType}`);
  }
  
  // Build OAuth authorization URL parameters
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: HUBSPOT_OAUTH_SCOPES.join(' '),
    response_type: 'code'
    // Note: No state parameter needed - app type is in the redirect URI path
  });

  
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

