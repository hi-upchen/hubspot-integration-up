import { tokenManager } from '@/lib/hubspot/token-manager';
import { createMockFetch, MOCK_SCENARIOS } from '../../helpers/mock-fetch';

// Mock the installations module
jest.mock('@/lib/hubspot/installations', () => ({
  findInstallationByHubIdAndApp: jest.fn(),
  updateInstallationTokensForApp: jest.fn()
}));

// Mock the config manager
jest.mock('@/lib/config/config-manager', () => ({
  ConfigManager: {
    getHubSpotClientId: jest.fn(() => 'test-client-id'),
    getHubSpotClientSecret: jest.fn(() => 'test-client-secret')
  }
}));

import { findInstallationByHubIdAndApp, updateInstallationTokensForApp } from '@/lib/hubspot/installations';
import { ConfigManager } from '@/lib/config/config-manager';

const mockFindInstallation = findInstallationByHubIdAndApp as jest.MockedFunction<typeof findInstallationByHubIdAndApp>;
const mockUpdateTokens = updateInstallationTokensForApp as jest.MockedFunction<typeof updateInstallationTokensForApp>;

describe('TokenManager', () => {
  let originalFetch: typeof fetch;

  beforeEach(() => {
    jest.clearAllMocks();
    originalFetch = global.fetch;
    // Clear cache between tests
    (tokenManager as any).tokenCache.clear();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe('getValidToken', () => {
    const mockInstallation = {
      id: 1,
      hubId: 123,
      accessToken: 'access-token-123',
      refreshToken: 'refresh-token-123',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes from now
      scope: 'contacts',
      appType: 'date-formatter' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    it('should return cached valid token', async () => {
      mockFindInstallation.mockResolvedValue(mockInstallation);

      const token = await tokenManager.getValidToken(123, 'date-formatter');
      
      expect(token).toBe('access-token-123');
      expect(mockFindInstallation).toHaveBeenCalledWith(123, 'date-formatter');
    });

    it('should refresh token when expired', async () => {
      const expiredInstallation = {
        ...mockInstallation,
        expiresAt: new Date(Date.now() - 1000).toISOString() // 1 second ago
      };

      const refreshedInstallation = {
        ...mockInstallation,
        accessToken: 'new-access-token',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString()
      };

      mockFindInstallation.mockResolvedValue(expiredInstallation);
      mockUpdateTokens.mockResolvedValue(refreshedInstallation);

      global.fetch = createMockFetch([{
        ok: true,
        data: {
          access_token: 'new-access-token',
          refresh_token: 'new-refresh-token',
          expires_in: 1800
        }
      }]);

      const token = await tokenManager.getValidToken(123, 'date-formatter');
      
      expect(token).toBe('new-access-token');
      expect(mockUpdateTokens).toHaveBeenCalled();
    });

    it('should force refresh when requested', async () => {
      const refreshedInstallation = {
        ...mockInstallation,
        accessToken: 'forced-new-token',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString()
      };

      mockFindInstallation.mockResolvedValue(mockInstallation);
      mockUpdateTokens.mockResolvedValue(refreshedInstallation);

      global.fetch = createMockFetch([{
        ok: true,
        data: {
          access_token: 'forced-new-token',
          refresh_token: 'new-refresh-token',
          expires_in: 1800
        }
      }]);

      const token = await tokenManager.getValidToken(123, 'date-formatter', { forceRefresh: true });
      
      expect(token).toBe('forced-new-token');
      expect(mockUpdateTokens).toHaveBeenCalled();
    });

    it('should use cache when available and valid', async () => {
      mockFindInstallation.mockResolvedValue(mockInstallation);

      // First call
      await tokenManager.getValidToken(123, 'date-formatter');
      
      // Second call should use cache
      const token = await tokenManager.getValidToken(123, 'date-formatter');
      
      expect(token).toBe('access-token-123');
      // Should only call database once
      expect(mockFindInstallation).toHaveBeenCalledTimes(1);
    });

    it('should throw error when installation not found', async () => {
      mockFindInstallation.mockResolvedValue(null);

      await expect(tokenManager.getValidToken(123, 'date-formatter'))
        .rejects.toThrow('No date-formatter installation found for portal 123');
    });

    it('should throw error when token refresh fails', async () => {
      const expiredInstallation = {
        ...mockInstallation,
        expiresAt: new Date(Date.now() - 1000).toISOString()
      };

      mockFindInstallation.mockResolvedValue(expiredInstallation);
      global.fetch = createMockFetch([{ ok: false, status: 400 }]);

      await expect(tokenManager.getValidToken(123, 'date-formatter'))
        .rejects.toThrow('Token refresh failed: 400');
    });
  });

  describe('cache behavior', () => {
    const mockInstallation = {
      id: 1,
      hubId: 123,
      accessToken: 'access-token-123',
      refreshToken: 'refresh-token-123',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      scope: 'contacts',
      appType: 'date-formatter' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    it('should cache tokens separately by portal and app type', async () => {
      const urlShortenerInstallation = {
        ...mockInstallation,
        appType: 'url-shortener' as const,
        accessToken: 'url-shortener-token'
      };

      mockFindInstallation
        .mockResolvedValueOnce(mockInstallation)
        .mockResolvedValueOnce(urlShortenerInstallation);

      const dateFormatterToken = await tokenManager.getValidToken(123, 'date-formatter');
      const urlShortenerToken = await tokenManager.getValidToken(123, 'url-shortener');

      expect(dateFormatterToken).toBe('access-token-123');
      expect(urlShortenerToken).toBe('url-shortener-token');
      expect(mockFindInstallation).toHaveBeenCalledTimes(2);
    });

    it('should respect cache TTL', async () => {
      // Override TTL for testing
      const originalTtl = (tokenManager as any).CACHE_TTL_MS;
      (tokenManager as any).CACHE_TTL_MS = 100; // 100ms

      mockFindInstallation.mockResolvedValue(mockInstallation);

      await tokenManager.getValidToken(123, 'date-formatter');
      
      // Wait for cache to expire
      await new Promise(resolve => setTimeout(resolve, 150));
      
      await tokenManager.getValidToken(123, 'date-formatter');

      expect(mockFindInstallation).toHaveBeenCalledTimes(2);

      // Restore original TTL
      (tokenManager as any).CACHE_TTL_MS = originalTtl;
    });
  });
});