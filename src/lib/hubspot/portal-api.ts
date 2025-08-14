/**
 * HubSpot Portal API calls
 * Pure API communication layer - no business logic
 */

import type { HubSpotAccessTokenResponse } from './types';

/**
 * Fetches access token information from HubSpot API using raw token
 * @param accessToken - Raw access token string
 * @returns Raw HubSpot API response with token metadata
 * @throws Error if API call fails
 */
export async function fetchAccessTokenInfo(accessToken: string): Promise<HubSpotAccessTokenResponse> {
  const url = `https://api.hubapi.com/oauth/v1/access-tokens/${accessToken}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    const error = new Error(`HubSpot API error: ${response.status} ${response.statusText}`);
    (error as Error & { status?: number }).status = response.status;
    throw error;
  }
  
  return await response.json() as HubSpotAccessTokenResponse;
}