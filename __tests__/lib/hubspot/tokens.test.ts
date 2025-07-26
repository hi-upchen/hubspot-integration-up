/**
 * @jest-environment node
 */

// Mock fetch and ConfigManager before imports
global.fetch = jest.fn();
jest.mock('@/lib/config/config-manager', () => ({
  ConfigManager: {
    getCurrentEnvironment: jest.fn(() => 'dev'),
    getHubSpotConfig: jest.fn(() => ({
      clientId: 'test-client-id',
      clientSecret: 'test-client-secret',
      redirectUri: 'http://localhost:3000/auth/callback'
    })),
    getSupabaseConfig: jest.fn(() => ({
      url: 'https://test.supabase.co',
      anonKey: 'test-anon-key',
      serviceRoleKey: 'test-service-key'
    }))
  }
}));

import { exchangeCodeForTokens, refreshAccessToken, getPortalInfo } from '@/lib/hubspot/tokens';
import { ConfigManager } from '@/lib/config/config-manager';

const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
const mockConfigManager = ConfigManager as jest.Mocked<typeof ConfigManager>;

describe('hubspot/tokens.ts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset ConfigManager mock to default
    mockConfigManager.getHubSpotConfig.mockReturnValue({
      clientId: 'test-client-id',
      clientSecret: 'test-client-secret',
      redirectUri: 'http://localhost:3000/auth/callback'
    });
    
    // Default successful responses
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue({ access_token: 'test-token', refresh_token: 'test-refresh', expires_in: 3600 }),
      text: jest.fn().mockResolvedValue('{"access_token":"test-token","refresh_token":"test-refresh","expires_in":3600}')
    } as any);
  });

  describe('exchangeCodeForTokens', () => {
    const validCode = 'valid_auth_code_123';

    describe('Success Scenarios', () => {
      test('should successfully exchange valid authorization code for tokens', async () => {
        const mockApiResponse = {
          access_token: 'access_token_123',
          refresh_token: 'refresh_token_456',
          expires_in: 21600,
          token_type: 'bearer'
        };
        
        const expectedResult = {
          access_token: 'access_token_123',
          refresh_token: 'refresh_token_456',
          expires_in: 21600,
          token_type: 'bearer'
        };
        
        mockFetch.mockResolvedValue({
          ok: true,
          status: 200,
          json: jest.fn().mockResolvedValue(mockApiResponse),
          text: jest.fn().mockResolvedValue(JSON.stringify(mockApiResponse))
        } as any);

        const result = await exchangeCodeForTokens(validCode);

        expect(result).toEqual(expectedResult);
        expect(mockFetch).toHaveBeenCalledWith(
          'https://api.hubapi.com/oauth/v1/token',
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: expect.stringContaining('grant_type=authorization_code')
          })
        );
      });

      test('should URL encode authorization code in request body', async () => {
        const specialCode = 'code with spaces & special chars!';
        await exchangeCodeForTokens(specialCode);

        const callArgs = mockFetch.mock.calls[0];
        const body = callArgs[1]?.body as string;
        // URL encoding in forms uses + for spaces, not %20
        expect(body).toContain('code+with+spaces+%26+special+chars%21');
      });

      test('should include all required OAuth parameters', async () => {
        await exchangeCodeForTokens(validCode);

        const callArgs = mockFetch.mock.calls[0];
        const body = callArgs[1]?.body as string;

        expect(body).toContain('grant_type=authorization_code');
        expect(body).toContain('client_id=test-client-id');
        expect(body).toContain('client_secret=test-client-secret');
        expect(body).toContain(`code=${validCode}`);
        expect(body).toContain('redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fauth%2Fcallback');
      });
    });

    describe('4xx Error Responses', () => {
      test('should handle 400 Bad Request', async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          status: 400,
          text: jest.fn().mockResolvedValue('{"error":"invalid_request","error_description":"Missing parameter"}')
        } as any);

        await expect(exchangeCodeForTokens(validCode)).rejects.toThrow('HTTP 400: invalid_request - Missing parameter');
      });

      test('should handle 401 Unauthorized', async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          status: 401,
          text: jest.fn().mockResolvedValue('{"error":"invalid_client"}')
        } as any);

        await expect(exchangeCodeForTokens(validCode)).rejects.toThrow('HTTP 401: invalid_client');
      });

      test('should handle 403 Forbidden', async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          status: 403,
          text: jest.fn().mockResolvedValue('{"error":"access_denied"}')
        } as any);

        await expect(exchangeCodeForTokens(validCode)).rejects.toThrow('HTTP 403: access_denied');
      });

      test('should handle 404 Not Found', async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          status: 404,
          text: jest.fn().mockResolvedValue('{"error":"not_found"}')
        } as any);

        await expect(exchangeCodeForTokens(validCode)).rejects.toThrow('HTTP 404: not_found');
      });

      test('should handle 429 Rate Limit', async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          status: 429,
          text: jest.fn().mockResolvedValue('{"error":"too_many_requests"}')
        } as any);

        await expect(exchangeCodeForTokens(validCode)).rejects.toThrow('HTTP 429: too_many_requests');
      });
    });

    describe('5xx Error Responses', () => {
      test('should handle 500 Internal Server Error', async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          status: 500,
          text: jest.fn().mockResolvedValue('{"error":"internal_error"}')
        } as any);

        await expect(exchangeCodeForTokens(validCode)).rejects.toThrow('HTTP 500: internal_error');
      });

      test('should handle 502 Bad Gateway', async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          status: 502,
          text: jest.fn().mockResolvedValue('Bad Gateway')
        } as any);

        await expect(exchangeCodeForTokens(validCode)).rejects.toThrow('HTTP 502: Bad Gateway');
      });

      test('should handle 503 Service Unavailable', async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          status: 503,
          text: jest.fn().mockResolvedValue('Service Unavailable')
        } as any);

        await expect(exchangeCodeForTokens(validCode)).rejects.toThrow('HTTP 503: Service Unavailable');
      });
    });

    describe('Network Error Handling', () => {
      test('should handle network timeout errors', async () => {
        mockFetch.mockRejectedValue(new Error('Network timeout'));

        await expect(exchangeCodeForTokens(validCode)).rejects.toThrow('Network timeout');
      });

      test('should handle DNS resolution errors', async () => {
        mockFetch.mockRejectedValue(new Error('ENOTFOUND api.hubapi.com'));

        await expect(exchangeCodeForTokens(validCode)).rejects.toThrow('ENOTFOUND api.hubapi.com');
      });

      test('should handle connection refused errors', async () => {
        mockFetch.mockRejectedValue(new Error('ECONNREFUSED'));

        await expect(exchangeCodeForTokens(validCode)).rejects.toThrow('ECONNREFUSED');
      });

      test('should handle abort signal errors', async () => {
        mockFetch.mockRejectedValue(new Error('The operation was aborted'));

        await expect(exchangeCodeForTokens(validCode)).rejects.toThrow('The operation was aborted');
      });
    });

    describe('Invalid/Expired Authorization Codes', () => {
      test('should handle empty authorization code', async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          status: 400,
          text: jest.fn().mockResolvedValue('{"error":"invalid_grant","error_description":"Code cannot be empty"}')
        } as any);

        await expect(exchangeCodeForTokens('')).rejects.toThrow('HTTP 400: invalid_grant - Code cannot be empty');
      });

      test('should handle expired authorization code', async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          status: 400,
          text: jest.fn().mockResolvedValue('{"error":"invalid_grant","error_description":"Authorization code expired"}')
        } as any);

        await expect(exchangeCodeForTokens('expired_code')).rejects.toThrow('HTTP 400: invalid_grant - Authorization code expired');
      });

      test('should handle very long authorization codes', async () => {
        const longCode = 'A'.repeat(1000);
        await exchangeCodeForTokens(longCode);

        expect(mockFetch).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            body: expect.stringContaining(`code=${longCode}`)
          })
        );
      });

      test('should handle special characters in authorization codes', async () => {
        const specialCode = 'code@#$%^&*()_+{}|:"<>?[]\\;\',.//';
        await exchangeCodeForTokens(specialCode);

        const callArgs = mockFetch.mock.calls[0];
        const body = callArgs[1]?.body as string;
        // URLSearchParams encodes differently than encodeURIComponent for some characters
        expect(body).toContain('code=code%40%23%24%25%5E%26*%28%29_%2B%7B%7D%7C%3A%22%3C%3E%3F%5B%5D%5C%3B%27%2C.%2F%2F');
      });
    });

    describe('Malformed OAuth Responses', () => {
      test('should handle invalid JSON responses', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          status: 200,
          text: jest.fn().mockResolvedValue('invalid json {')
        } as any);

        await expect(exchangeCodeForTokens(validCode)).rejects.toThrow();
      });

      test('should handle empty JSON responses', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          status: 200,
          text: jest.fn().mockResolvedValue('{}')
        } as any);

        const result = await exchangeCodeForTokens(validCode);
        expect(result).toEqual({});
      });

      test('should handle partial JSON responses', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          status: 200,
          text: jest.fn().mockResolvedValue('{"access_token":"test"}')
        } as any);

        const result = await exchangeCodeForTokens(validCode);
        expect(result).toEqual({ access_token: 'test' });
      });

      test('should handle null values in JSON', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          status: 200,
          text: jest.fn().mockResolvedValue('{"access_token":null,"refresh_token":"test"}')
        } as any);

        const result = await exchangeCodeForTokens(validCode);
        expect(result).toEqual({ access_token: null, refresh_token: 'test' });
      });
    });

    describe('Configuration Validation', () => {
      test('should handle missing client ID', async () => {
        mockConfigManager.getHubSpotConfig.mockReturnValue({
          clientId: undefined as any,
          clientSecret: 'test-secret',
          redirectUri: 'http://localhost:3000/callback'
        } as any);

        await expect(exchangeCodeForTokens(validCode)).rejects.toThrow('Missing HubSpot OAuth configuration');
      });

      test('should handle ConfigManager throwing errors', async () => {
        mockConfigManager.getHubSpotConfig.mockImplementation(() => {
          throw new Error('Configuration error');
        });

        await expect(exchangeCodeForTokens(validCode)).rejects.toThrow('Configuration error');
      });
    });
  });

  describe('refreshAccessToken', () => {
    const validRefreshToken = 'valid_refresh_token_123';

    describe('Success Scenarios', () => {
      test('should successfully refresh access token', async () => {
        const mockResponse = {
          access_token: 'new_access_token',
          refresh_token: 'new_refresh_token',
          expires_in: 21600
        };
        
        mockFetch.mockResolvedValue({
          ok: true,
          status: 200,
          text: jest.fn().mockResolvedValue(JSON.stringify(mockResponse))
        } as any);

        const result = await refreshAccessToken(validRefreshToken);

        expect(result).toEqual(mockResponse);
        expect(mockFetch).toHaveBeenCalledWith(
          'https://api.hubapi.com/oauth/v1/token',
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: expect.stringContaining('grant_type=refresh_token')
          })
        );
      });

      test('should include all required refresh parameters', async () => {
        await refreshAccessToken(validRefreshToken);

        const callArgs = mockFetch.mock.calls[0];
        const body = callArgs[1]?.body as string;

        expect(body).toContain('grant_type=refresh_token');
        expect(body).toContain('client_id=test-client-id');
        expect(body).toContain('client_secret=test-client-secret');
        expect(body).toContain(`refresh_token=${validRefreshToken}`);
      });
    });

    describe('Token Refresh Failure Scenarios', () => {
      test('should handle invalid refresh tokens (400 error)', async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          status: 400,
          text: jest.fn().mockResolvedValue('{"error":"invalid_grant","error_description":"Invalid refresh token"}')
        } as any);

        await expect(refreshAccessToken('invalid_token')).rejects.toThrow('HTTP 400: invalid_grant - Invalid refresh token');
      });

      test('should handle expired refresh tokens', async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          status: 400,
          text: jest.fn().mockResolvedValue('{"error":"invalid_grant","error_description":"Refresh token expired"}')
        } as any);

        await expect(refreshAccessToken('expired_token')).rejects.toThrow('HTTP 400: invalid_grant - Refresh token expired');
      });

      test('should handle client authentication failures (401 error)', async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          status: 401,
          text: jest.fn().mockResolvedValue('{"error":"invalid_client"}')
        } as any);

        await expect(refreshAccessToken(validRefreshToken)).rejects.toThrow('HTTP 401: invalid_client');
      });

      test('should handle network timeouts during refresh', async () => {
        mockFetch.mockRejectedValue(new Error('Request timeout'));

        await expect(refreshAccessToken(validRefreshToken)).rejects.toThrow('Request timeout');
      });

      test('should handle malformed refresh responses', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          status: 200,
          text: jest.fn().mockResolvedValue('malformed json')
        } as any);

        await expect(refreshAccessToken(validRefreshToken)).rejects.toThrow();
      });
    });
  });

  describe('getPortalInfo', () => {
    const validAccessToken = 'valid_access_token_123';

    describe('Success Scenarios', () => {
      test('should successfully get portal information', async () => {
        const mockResponse = {
          portalId: 12345678,
          domain: 'test-portal.hubspot.com',
          timeZone: 'America/New_York'
        };
        
        mockFetch.mockResolvedValue({
          ok: true,
          status: 200,
          text: jest.fn().mockResolvedValue(JSON.stringify(mockResponse))
        } as any);

        const result = await getPortalInfo(validAccessToken);

        expect(result).toEqual(mockResponse);
        expect(mockFetch).toHaveBeenCalledWith(
          'https://api.hubapi.com/account-info/v3/api-usage',
          expect.objectContaining({
            method: 'GET',
            headers: { 'Authorization': `Bearer ${validAccessToken}` }
          })
        );
      });

      test('should use Bearer token authentication', async () => {
        await getPortalInfo(validAccessToken);

        expect(mockFetch).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            headers: { 'Authorization': `Bearer ${validAccessToken}` }
          })
        );
      });
    });

    describe('Portal Info API Failures', () => {
      test('should handle invalid access tokens (401 Unauthorized)', async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          status: 401,
          text: jest.fn().mockResolvedValue('{"error":"invalid_token"}')
        } as any);

        await expect(getPortalInfo('invalid_token')).rejects.toThrow('HTTP 401: invalid_token');
      });

      test('should handle insufficient permissions (403 Forbidden)', async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          status: 403,
          text: jest.fn().mockResolvedValue('{"error":"insufficient_scope"}')
        } as any);

        await expect(getPortalInfo(validAccessToken)).rejects.toThrow('HTTP 403: insufficient_scope');
      });

      test('should handle rate limiting (429 errors)', async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          status: 429,
          text: jest.fn().mockResolvedValue('{"error":"rate_limit_exceeded"}')
        } as any);

        await expect(getPortalInfo(validAccessToken)).rejects.toThrow('HTTP 429: rate_limit_exceeded');
      });

      test('should handle server errors (500)', async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          status: 500,
          text: jest.fn().mockResolvedValue('{"error":"internal_server_error"}')
        } as any);

        await expect(getPortalInfo(validAccessToken)).rejects.toThrow('HTTP 500: internal_server_error');
      });

      test('should handle server errors (502)', async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          status: 502,
          text: jest.fn().mockResolvedValue('Bad Gateway')
        } as any);

        await expect(getPortalInfo(validAccessToken)).rejects.toThrow('HTTP 502: Bad Gateway');
      });

      test('should handle server errors (503)', async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          status: 503,
          text: jest.fn().mockResolvedValue('Service Unavailable')
        } as any);

        await expect(getPortalInfo(validAccessToken)).rejects.toThrow('HTTP 503: Service Unavailable');
      });

      test('should handle malformed portal data responses', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          status: 200,
          text: jest.fn().mockResolvedValue('invalid json response')
        } as any);

        await expect(getPortalInfo(validAccessToken)).rejects.toThrow();
      });
    });

    describe('Edge Cases', () => {
      test('should handle empty access token', async () => {
        await getPortalInfo('');

        expect(mockFetch).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            headers: { 'Authorization': 'Bearer ' }
          })
        );
      });

      test('should handle very long access tokens', async () => {
        const longToken = 'A'.repeat(1000);
        await getPortalInfo(longToken);

        expect(mockFetch).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            headers: { 'Authorization': `Bearer ${longToken}` }
          })
        );
      });

      test('should handle special characters in access token', async () => {
        const specialToken = 'token@#$%^&*()';
        await getPortalInfo(specialToken);

        expect(mockFetch).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            headers: { 'Authorization': `Bearer ${specialToken}` }
          })
        );
      });
    });
  });

  describe('Integration & Performance Tests', () => {
    test('should handle complete OAuth flow (exchange → portal info → refresh)', async () => {
      // Step 1: Exchange code for tokens
      const exchangeResponse = {
        access_token: 'access_token_123',
        refresh_token: 'refresh_token_456',
        expires_in: 21600
      };
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: jest.fn().mockResolvedValue(JSON.stringify(exchangeResponse))
      } as any);

      const tokens = await exchangeCodeForTokens('auth_code_123');
      expect(tokens).toEqual(exchangeResponse);

      // Step 2: Get portal info
      const portalResponse = {
        portalId: 12345678,
        domain: 'test.hubspot.com'
      };
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: jest.fn().mockResolvedValue(JSON.stringify(portalResponse))
      } as any);

      const portalInfo = await getPortalInfo(tokens.access_token);
      expect(portalInfo).toEqual(portalResponse);

      // Step 3: Refresh tokens
      const refreshResponse = {
        access_token: 'new_access_token',
        refresh_token: 'new_refresh_token',
        expires_in: 21600
      };
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: jest.fn().mockResolvedValue(JSON.stringify(refreshResponse))
      } as any);

      const newTokens = await refreshAccessToken(tokens.refresh_token);
      expect(newTokens).toEqual(refreshResponse);

      expect(mockFetch).toHaveBeenCalledTimes(3);
    });

    test('should handle mixed success/failure scenarios', async () => {
      // First call succeeds
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: jest.fn().mockResolvedValue('{"access_token":"test"}')
      } as any);

      const result1 = await exchangeCodeForTokens('valid_code');
      expect(result1).toEqual({ access_token: 'test' });

      // Second call fails
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: jest.fn().mockResolvedValue('{"error":"invalid_token"}')
      } as any);

      await expect(getPortalInfo('invalid_token')).rejects.toThrow('HTTP 401: invalid_token');
    });

    test('should handle concurrent requests', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        text: jest.fn().mockResolvedValue('{"access_token":"concurrent_test"}')
      } as any);

      const promises = Array.from({ length: 10 }, (_, i) => 
        exchangeCodeForTokens(`code_${i}`)
      );

      const results = await Promise.all(promises);
      
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result).toEqual({ access_token: 'concurrent_test' });
      });
      expect(mockFetch).toHaveBeenCalledTimes(10);
    });

    test('should handle large JSON responses', async () => {
      const largeResponse = {
        access_token: 'test',
        ...Array.from({ length: 1000 }, (_, i) => ({ [`field_${i}`]: `value_${i}` })).reduce((acc, obj) => ({ ...acc, ...obj }), {})
      };
      
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        text: jest.fn().mockResolvedValue(JSON.stringify(largeResponse))
      } as any);

      const result = await exchangeCodeForTokens('test_code');
      expect(result).toEqual(largeResponse);
    });
  });
});