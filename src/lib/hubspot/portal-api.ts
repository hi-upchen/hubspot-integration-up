/**
 * HubSpot Portal API calls
 * Pure API communication layer - no business logic
 */

import type { HubSpotAccessTokenResponse } from './types';

/**
 * Fetches access token information from HubSpot API
 * @param accessToken - The access token to get information for
 * @returns Raw HubSpot API response with token metadata
 * @throws Error if API call fails
 */
export async function fetchHubSpotAccessTokenInfo(accessToken: string): Promise<HubSpotAccessTokenResponse> {
  const url = `https://api.hubapi.com/oauth/v1/access-tokens/${accessToken}`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HubSpot API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data as HubSpotAccessTokenResponse;
  } catch (error) {
    console.error('Failed to fetch HubSpot access token info:', error);
    throw error instanceof Error 
      ? error 
      : new Error('Unknown error occurred while fetching access token info');
  }
}

/**
 * Retrieves HubSpot portal information using access token
 * @param accessToken - Valid HubSpot access token
 * @returns Promise containing portal ID and domain information
 * @throws Error if API request fails or token is invalid
 */
export async function fetchPortalInfo(accessToken: string): Promise<{ portalId: number; domain: string }> {
  try {
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
    
    return {
      portalId: data.portalId,
      domain: data.domain || 'unknown'
    };
  } catch (error) {
    throw new Error(`Failed to get portal info: ${error}`);
  }
}