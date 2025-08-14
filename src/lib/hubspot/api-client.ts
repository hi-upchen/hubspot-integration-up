import { tokenManager } from './token-manager';

/**
 * Wrapper for HubSpot API calls that handles 401 errors with automatic token refresh
 * Follows OAuth 2.0 best practice: "Always be prepared for 401 errors"
 * 
 * @param apiCall - Function that makes the API call
 * @param portalId - HubSpot portal ID
 * @param appType - App type for token management
 * @returns API call result or throws error
 */
export async function withTokenRetry<T>(
  apiCall: () => Promise<T>,
  portalId: number,
  appType: 'date-formatter' | 'url-shortener'
): Promise<T> {
  try {
    return await apiCall();
  } catch (error: unknown) {
    // Only retry once for 401 errors (token might be invalid for other reasons)
    if ((error as { status?: number }).status === 401) {
      // Force refresh token and retry once
      await tokenManager.getValidToken(portalId, appType, { forceRefresh: true });
      return await apiCall();
    }
    throw error;
  }
}