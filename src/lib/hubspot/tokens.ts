import type { OAuthTokens, HubSpotOAuthResponse } from '../types';
import { ConfigManager } from '@/lib/config/config-manager';

/**
 * Exchanges HubSpot authorization code for access and refresh tokens
 * 
 * @param code - Authorization code received from HubSpot OAuth callback
 * @param appType - App type to determine which OAuth credentials to use
 * @returns Promise containing OAuth tokens (access_token, refresh_token, expires_in, token_type)
 * @throws Error if token exchange fails or configuration is missing
 */
export async function exchangeCodeForTokens(code: string, appType: 'date-formatter' | 'url-shortener'): Promise<OAuthTokens> {
  const clientId = ConfigManager.getHubSpotClientId(appType);
  const clientSecret = ConfigManager.getHubSpotClientSecret(appType);
  const { redirectUri } = ConfigManager.getHubSpotConfig();

  // Validate required OAuth configuration
  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error('Missing HubSpot OAuth configuration');
  }

  const tokenUrl = 'https://api.hubapi.com/oauth/v1/token';
  
  // Prepare token exchange request body
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    code: code
  });

  try {
    // Make token exchange request to HubSpot
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString()
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Token exchange failed: ${response.status} ${errorText}`);
    }

    const data: HubSpotOAuthResponse = await response.json();

    // Return normalized token structure
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
      tokenType: data.token_type
    };
  } catch (error) {
    throw new Error(`Failed to exchange code for tokens: ${error}`);
  }
}

/**
 * Refreshes an expired HubSpot access token using refresh token
 * 
 * @param refreshToken - Valid refresh token from previous OAuth flow
 * @param appType - App type to determine which OAuth credentials to use
 * @returns Promise containing new OAuth tokens
 * @throws Error if token refresh fails or configuration is missing
 */
export async function refreshAccessToken(refreshToken: string, appType: 'date-formatter' | 'url-shortener'): Promise<OAuthTokens> {
  const clientId = ConfigManager.getHubSpotClientId(appType);
  const clientSecret = ConfigManager.getHubSpotClientSecret(appType);

  // Validate required OAuth configuration
  if (!clientId || !clientSecret) {
    throw new Error('Missing HubSpot OAuth configuration');
  }

  const tokenUrl = 'https://api.hubapi.com/oauth/v1/token';
  
  // Prepare token refresh request body
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken
  });

  try {
    // Make token refresh request to HubSpot
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString()
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Token refresh failed: ${response.status} ${errorText}`);
    }

    const data: HubSpotOAuthResponse = await response.json();

    // Return normalized token structure
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
      tokenType: data.token_type
    };
  } catch (error) {
    throw new Error(`Failed to refresh access token: ${error}`);
  }
}

/**
 * Retrieves HubSpot portal information using access token
 * 
 * @param accessToken - Valid HubSpot access token
 * @returns Promise containing portal ID and domain information
 * @throws Error if API request fails or token is invalid
 */
export async function getPortalInfo(accessToken: string): Promise<{ portalId: number; domain: string }> {
  try {
    // Make request to HubSpot account info API
    const response = await fetch('https://api.hubapi.com/account-info/v3/details', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to get portal info: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    
    // Return portal information
    return {
      portalId: data.portalId,
      domain: data.domain || 'unknown'
    };
  } catch (error) {
    throw new Error(`Failed to get portal info: ${error}`);
  }
}