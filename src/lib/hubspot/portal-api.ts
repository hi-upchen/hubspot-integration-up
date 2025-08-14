/**
 * HubSpot Portal API calls
 * Pure API communication layer - no business logic
 */

import { withTokenRetry } from './api-client';
import { tokenManager } from './token-manager';
import type { HubSpotAccessTokenResponse } from './types';

/**
 * Fetches access token information from HubSpot API
 * @param portalId - HubSpot portal ID
 * @param appType - App type for token management
 * @returns Raw HubSpot API response with token metadata
 * @throws Error if API call fails
 */
export async function fetchHubSpotAccessTokenInfo(
  portalId: number,
  appType: 'date-formatter' | 'url-shortener'
): Promise<HubSpotAccessTokenResponse> {
  return withTokenRetry(async () => {
    const accessToken = await tokenManager.getValidToken(portalId, appType);
    const url = `https://api.hubapi.com/oauth/v1/access-tokens/${accessToken}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const error = new Error(`HubSpot API error: ${response.status} ${response.statusText}`);
      (error as any).status = response.status;
      throw error;
    }
    
    return await response.json() as HubSpotAccessTokenResponse;
  }, portalId, appType);
}

/**
 * Retrieves HubSpot portal information using access token
 * @param portalId - HubSpot portal ID
 * @param appType - App type for token management
 * @returns Promise containing portal ID and domain information
 * @throws Error if API request fails or token is invalid
 */
export async function fetchPortalInfo(
  portalId: number,
  appType: 'date-formatter' | 'url-shortener'
): Promise<{ portalId: number; domain: string }> {
  return withTokenRetry(async () => {
    const accessToken = await tokenManager.getValidToken(portalId, appType);
    
    const response = await fetch('https://api.hubapi.com/account-info/v3/details', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      const error = new Error(`Failed to get portal info: ${response.status}`);
      (error as any).status = response.status;
      
      // 401 after retry means app was uninstalled
      if (response.status === 401) {
        (error as any).message = `App ${appType} has been uninstalled from portal ${portalId}`;
      }
      
      throw error;
    }

    const data = await response.json();
    
    return {
      portalId: data.portalId,
      domain: data.domain || 'unknown'
    };
  }, portalId, appType);
}