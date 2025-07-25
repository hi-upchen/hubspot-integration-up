import { URLSearchParams } from 'url';

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
 * 
 * @returns Complete OAuth authorization URL
 * @throws Error if required environment variables are missing
 */
export function generateOAuthUrl(): string {
  const clientId = process.env.HUBSPOT_CLIENT_ID;
  const redirectUri = process.env.HUBSPOT_REDIRECT_URI;
  
  // Validate required OAuth configuration
  if (!clientId || !redirectUri) {
    throw new Error('Missing HubSpot OAuth configuration');
  }

  // Build OAuth authorization URL parameters
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: HUBSPOT_OAUTH_SCOPES.join(' '),
    response_type: 'code'
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
  if (!code) {
    throw new Error('Authorization code is required');
  }

  // Basic format validation for authorization code
  if (code.length < 10) {
    throw new Error('Invalid authorization code format');
  }
}

