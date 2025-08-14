import { 
  findInstallationByHubIdAndApp,
  updateInstallationTokensForApp 
} from './installations';
import { refreshAccessToken } from './tokens';

interface CachedToken {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  portalId: number;
  appType: 'date-formatter' | 'url-shortener';
  cachedAt: Date;
}

export class TokenManager {
  private static instance: TokenManager;
  private tokenCache: Map<string, CachedToken> = new Map();
  private readonly CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache
  private readonly TOKEN_REFRESH_BUFFER_MS = 5 * 60 * 1000; // Refresh 5 min before expiry
  
  private constructor() {}
  
  static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager();
    }
    return TokenManager.instance;
  }
  
  /**
   * Get access token for a portal and app, with automatic refresh if expiring
   * Note: Token may still be invalid due to user actions (app uninstall, password change, etc.)
   * Callers should handle 401 errors appropriately
   * 
   * @param portalId - HubSpot portal ID
   * @param appType - Specific app type (required for clarity)
   * @param options - Control token fetching behavior
   * @returns Access token or throws error
   */
  async getValidToken(
    portalId: number,
    appType: 'date-formatter' | 'url-shortener',
    options: { 
      forceRefresh?: boolean;  // Skip cache and fetch fresh token
    } = {}
  ): Promise<string> {
    const cacheKey = `${portalId}-${appType}`;
    
    // Step 1: Check cache (unless force refresh requested)
    if (!options.forceRefresh) {
      const cached = this.tokenCache.get(cacheKey);
      if (cached && !this.isCacheExpired(cached)) {
        if (!this.isTokenExpiring(cached)) {
          return cached.accessToken;
        }
        // Token expiring soon but cache is fresh - need refresh
      }
    }
    
    // Step 2: Fetch from database
    const installation = await findInstallationByHubIdAndApp(portalId, appType);
      
    if (!installation) {
      throw new Error(`No ${appType} installation found for portal ${portalId}`);
    }
    
    // Step 3: Check if token needs refresh
    const tokenData: CachedToken = {
      accessToken: installation.accessToken,
      refreshToken: installation.refreshToken,
      expiresAt: new Date(installation.expiresAt),
      portalId: installation.hubId,
      appType: appType,
      cachedAt: new Date()
    };
    
    // Step 4: Refresh if expiring soon OR force refresh requested
    if (this.isTokenExpiring(tokenData) || options.forceRefresh) {
      const refreshed = await this.refreshToken(tokenData);
      tokenData.accessToken = refreshed.accessToken;
      tokenData.refreshToken = refreshed.refreshToken;
      tokenData.expiresAt = new Date(Date.now() + refreshed.expiresIn * 1000);
      
      // Update database with new tokens
      await this.updateTokensInDb(portalId, appType, refreshed);
    }
    
    // Step 5: Update cache with token
    this.tokenCache.set(cacheKey, tokenData);
    
    return tokenData.accessToken;
  }
  
  /**
   * Check if cache entry has expired (older than TTL)
   */
  private isCacheExpired(cached: CachedToken): boolean {
    const now = Date.now();
    const cacheAge = now - cached.cachedAt.getTime();
    return cacheAge > this.CACHE_TTL_MS;
  }
  
  /**
   * Check if token is expiring soon (within buffer time)
   */
  private isTokenExpiring(token: CachedToken): boolean {
    const now = Date.now();
    const expiryWithBuffer = token.expiresAt.getTime() - this.TOKEN_REFRESH_BUFFER_MS;
    return now >= expiryWithBuffer;
  }
  
  /**
   * Refresh expired/expiring token
   */
  private async refreshToken(token: CachedToken): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  }> {
    try {
      return await refreshAccessToken(token.refreshToken, token.appType);
    } catch (error) {
      // Clear cache on refresh failure
      this.clearPortalCache(token.portalId, token.appType);
      throw new Error(`Token refresh failed for portal ${token.portalId} (${token.appType}): ${error}`);
    }
  }
  
  /**
   * Update tokens in database
   */
  private async updateTokensInDb(
    portalId: number,
    appType: 'date-formatter' | 'url-shortener',
    tokens: { accessToken: string; refreshToken: string; expiresIn: number }
  ): Promise<void> {
    await updateInstallationTokensForApp(portalId, appType, {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: new Date(Date.now() + tokens.expiresIn * 1000).toISOString()
    });
  }
  
  /**
   * Clear cache for a specific portal and app
   */
  clearPortalCache(portalId: number, appType?: 'date-formatter' | 'url-shortener'): void {
    if (appType) {
      this.tokenCache.delete(`${portalId}-${appType}`);
    } else {
      // Clear all apps for this portal
      this.tokenCache.delete(`${portalId}-date-formatter`);
      this.tokenCache.delete(`${portalId}-url-shortener`);
    }
  }
  
  /**
   * Clear entire cache (useful for testing)
   */
  clearAllCache(): void {
    this.tokenCache.clear();
  }
  
  /**
   * Get cache statistics (for monitoring)
   */
  getCacheStats(): { 
    size: number; 
    entries: Array<{ portalId: number; appType: string; expiresAt: string }> 
  } {
    const entries = Array.from(this.tokenCache.values()).map(token => ({
      portalId: token.portalId,
      appType: token.appType,
      expiresAt: token.expiresAt.toISOString()
    }));
    
    return { size: this.tokenCache.size, entries };
  }
}

export const tokenManager = TokenManager.getInstance();