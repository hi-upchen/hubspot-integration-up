/**
 * @jest-environment node
 */

// Mock fetch and ConfigManager before imports
global.fetch = jest.fn();
jest.mock('@/lib/config/config-manager', () => ({
  ConfigManager: {
    getCurrentEnvironment: jest.fn(() => 'dev'),
    getHubSpotClientId: jest.fn(() => 'test-client-id'),
    getHubSpotClientSecret: jest.fn(() => 'test-client-secret'),
    getHubSpotRedirectUri: jest.fn(() => 'http://localhost:3000/auth/callback')
  }
}));

import { exchangeCodeForTokens, refreshAccessToken } from '@/lib/hubspot/tokens';
import { ConfigManager } from '@/lib/config/config-manager';

const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
const mockConfigManager = ConfigManager as jest.Mocked<typeof ConfigManager>;

describe('hubspot/tokens.ts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset ConfigManager mock to default
    mockConfigManager.getHubSpotClientId.mockReturnValue('test-client-id');
    mockConfigManager.getHubSpotClientSecret.mockReturnValue('test-client-secret');
    mockConfigManager.getHubSpotRedirectUri.mockReturnValue('http://localhost:3000/auth/callback');
    
    // Default successful responses
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue({ 
        access_token: 'test-token', 
        refresh_token: 'test-refresh', 
        expires_in: 3600,
        token_type: 'bearer'
      }),
      text: jest.fn().mockResolvedValue('{"access_token":"test-token","refresh_token":"test-refresh","expires_in":3600,"token_type":"bearer"}')
    } as any);
  });

  describe('exchangeCodeForTokens', () => {
    const validCode = 'valid_auth_code_123';
    const appType = 'date-formatter' as const;

    describe('Success Scenarios', () => {
      it('should successfully exchange valid authorization code for tokens', async () => {
        const result = await exchangeCodeForTokens(validCode, appType);

        expect(result).toEqual({
          accessToken: 'test-token',
          refreshToken: 'test-refresh',
          expiresIn: 3600,
          tokenType: 'bearer'
        });
        expect(mockFetch).toHaveBeenCalledWith(
          'https://api.hubapi.com/oauth/v1/token',
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
          })
        );
      });

      it('should include all required OAuth parameters', async () => {
        await exchangeCodeForTokens(validCode, appType);

        const fetchCall = mockFetch.mock.calls[0];
        const requestBody = fetchCall[1]?.body as string;
        
        expect(requestBody).toContain('grant_type=authorization_code');
        expect(requestBody).toContain('client_id=test-client-id');
        expect(requestBody).toContain('client_secret=test-client-secret');
        expect(requestBody).toContain('redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fauth%2Fcallback');
        expect(requestBody).toContain(`code=${validCode}`);
      });

      it('should handle different app types', async () => {
        await exchangeCodeForTokens(validCode, 'url-shortener');

        expect(mockConfigManager.getHubSpotClientId).toHaveBeenCalledWith('url-shortener');
        expect(mockConfigManager.getHubSpotClientSecret).toHaveBeenCalledWith('url-shortener');
      });
    });

    describe('Error Handling', () => {
      it('should handle 400 Bad Request', async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          status: 400,
          text: jest.fn().mockResolvedValue('{"error":"invalid_request"}')
        } as any);

        await expect(exchangeCodeForTokens('invalid_code', appType))
          .rejects.toThrow('Token exchange failed: 400 {"error":"invalid_request"}');
      });

      it('should handle 401 Unauthorized', async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          status: 401,
          text: jest.fn().mockResolvedValue('{"error":"invalid_client"}')
        } as any);

        await expect(exchangeCodeForTokens(validCode, appType))
          .rejects.toThrow('Token exchange failed: 401 {"error":"invalid_client"}');
      });

      it('should handle network errors', async () => {
        mockFetch.mockRejectedValue(new Error('Network error'));

        await expect(exchangeCodeForTokens(validCode, appType))
          .rejects.toThrow('Failed to exchange code for tokens: Error: Network error');
      });

      it('should handle missing configuration', async () => {
        mockConfigManager.getHubSpotClientId.mockReturnValue('');

        await expect(exchangeCodeForTokens(validCode, appType))
          .rejects.toThrow('Missing HubSpot OAuth configuration');
      });
    });
  });

  describe('refreshAccessToken', () => {
    const validRefreshToken = 'valid_refresh_token_123';
    const appType = 'date-formatter' as const;

    describe('Success Scenarios', () => {
      it('should successfully refresh access token', async () => {
        const result = await refreshAccessToken(validRefreshToken, appType);

        expect(result).toEqual({
          accessToken: 'test-token',
          refreshToken: 'test-refresh',
          expiresIn: 3600,
          tokenType: 'bearer'
        });
        expect(mockFetch).toHaveBeenCalledWith(
          'https://api.hubapi.com/oauth/v1/token',
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
          })
        );
      });

      it('should include correct refresh token parameters', async () => {
        await refreshAccessToken(validRefreshToken, appType);

        const fetchCall = mockFetch.mock.calls[0];
        const requestBody = fetchCall[1]?.body as string;
        
        expect(requestBody).toContain('grant_type=refresh_token');
        expect(requestBody).toContain('client_id=test-client-id');
        expect(requestBody).toContain('client_secret=test-client-secret');
        expect(requestBody).toContain(`refresh_token=${validRefreshToken}`);
      });

      it('should handle different app types', async () => {
        await refreshAccessToken(validRefreshToken, 'url-shortener');

        expect(mockConfigManager.getHubSpotClientId).toHaveBeenCalledWith('url-shortener');
        expect(mockConfigManager.getHubSpotClientSecret).toHaveBeenCalledWith('url-shortener');
      });
    });

    describe('Error Handling', () => {
      it('should handle 400 Bad Request', async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          status: 400,
          text: jest.fn().mockResolvedValue('{"error":"invalid_grant"}')
        } as any);

        await expect(refreshAccessToken('invalid_refresh', appType))
          .rejects.toThrow('Token refresh failed: 400 {"error":"invalid_grant"}');
      });

      it('should handle 401 Unauthorized', async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          status: 401,
          text: jest.fn().mockResolvedValue('{"error":"invalid_client"}')
        } as any);

        await expect(refreshAccessToken(validRefreshToken, appType))
          .rejects.toThrow('Token refresh failed: 401 {"error":"invalid_client"}');
      });

      it('should handle network errors', async () => {
        mockFetch.mockRejectedValue(new Error('Network timeout'));

        await expect(refreshAccessToken(validRefreshToken, appType))
          .rejects.toThrow('Failed to refresh access token: Error: Network timeout');
      });

      it('should handle missing configuration', async () => {
        mockConfigManager.getHubSpotClientSecret.mockReturnValue('');

        await expect(refreshAccessToken(validRefreshToken, appType))
          .rejects.toThrow('Missing HubSpot OAuth configuration');
      });
    });
  });
});