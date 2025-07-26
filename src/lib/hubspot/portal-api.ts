/**
 * HubSpot Portal API calls
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