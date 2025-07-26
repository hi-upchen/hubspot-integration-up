import { URLSearchParams } from 'url';
import { ConfigManager } from '@/lib/config/config-manager';

/**
 * OAuth scopes required for the HubSpot integration
 * Includes automation for workflow actions functionality
 */
export const HUBSPOT_OAUTH_SCOPES = [
  'oauth',         // Basic OAuth scope for authentication
  'automation'     // For workflow automation features and custom actions
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
  if (!code) {
    throw new Error('Authorization code is required');
  }

  // Basic format validation for authorization code
  if (code.length < 10) {
    throw new Error('Invalid authorization code format');
  }
}

