/**
 * @jest-environment node
 */

// Mock Next.js server components before any imports
jest.mock('next/server', () => ({
  NextRequest: jest.fn().mockImplementation((url: string) => ({
    url,
    nextUrl: new URL(url),
    cookies: {
      get: jest.fn(),
      set: jest.fn(),
      delete: jest.fn()
    }
  })),
  NextResponse: {
    json: jest.fn((data, init) => ({
      ...init,
      json: async () => data,
      status: init?.status || 200,
      headers: new Map(Object.entries(init?.headers || {}))
    })),
    redirect: jest.fn((url) => ({
      status: 307,
      headers: new Map([['location', url.toString()]])
    }))
  }
}));

// Now import the route and dependencies
import { GET } from '../route';
import { validateOAuthCallback, generateOAuthUrl } from '@/lib/hubspot/auth';
import { exchangeCodeForTokens } from '@/lib/hubspot/tokens';
import { fetchAccessTokenInfo } from '@/lib/hubspot/portal-api';
import { 
  findInstallationByHubIdAndApp, 
  createInstallation,
  updateInstallationTokensForApp 
} from '@/lib/hubspot/installations';

// Mock dependencies
jest.mock('@/lib/hubspot/auth', () => ({
  validateOAuthCallback: jest.fn(),
  generateOAuthUrl: jest.fn(),
  HUBSPOT_OAUTH_SCOPES: ['oauth']
}));
jest.mock('@/lib/hubspot/tokens');
jest.mock('@/lib/hubspot/portal-api');
jest.mock('@/lib/hubspot/installations');

describe('OAuth Callback Dynamic Route', () => {
  const mockValidateOAuthCallback = validateOAuthCallback as jest.MockedFunction<typeof validateOAuthCallback>;
  const mockGenerateOAuthUrl = generateOAuthUrl as jest.MockedFunction<typeof generateOAuthUrl>;
  const mockExchangeCodeForTokens = exchangeCodeForTokens as jest.MockedFunction<typeof exchangeCodeForTokens>;
  const mockFetchAccessTokenInfo = fetchAccessTokenInfo as jest.MockedFunction<typeof fetchAccessTokenInfo>;
  const mockFindInstallationByHubIdAndApp = findInstallationByHubIdAndApp as jest.MockedFunction<typeof findInstallationByHubIdAndApp>;
  const mockCreateInstallation = createInstallation as jest.MockedFunction<typeof createInstallation>;
  const mockUpdateInstallationTokensForApp = updateInstallationTokensForApp as jest.MockedFunction<typeof updateInstallationTokensForApp>;

  // Helper to create NextRequest
  const createRequest = (url: string) => {
    const { NextRequest } = require('next/server');
    return new NextRequest(url);
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('App Type Validation', () => {
    it('should reject invalid app types', async () => {
      const request = createRequest('http://localhost:3000/api/auth/hubspot/callback/invalid-app');
      const params = { appType: 'invalid-app' };

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('invalid_app_type');
      expect(data.message).toContain('Invalid app type: invalid-app');
    });

    it('should accept date-formatter as valid app type', async () => {
      const request = createRequest('http://localhost:3000/api/auth/hubspot/callback/date-formatter');
      const params = { appType: 'date-formatter' };

      const response = await GET(request, { params });
      
      // Should redirect to install page when no code
      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toContain('/install');
    });

    it('should accept url-shortener as valid app type', async () => {
      const request = createRequest('http://localhost:3000/api/auth/hubspot/callback/url-shortener');
      const params = { appType: 'url-shortener' };

      const response = await GET(request, { params });
      
      // Should redirect to install page when no code
      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toContain('/install');
    });
  });

  describe('Direct Access Handling (No OAuth Code)', () => {
    it('should redirect directly to HubSpot OAuth for date-formatter', async () => {
      mockGenerateOAuthUrl.mockReturnValue(
        'https://app.hubspot.com/oauth/authorize?client_id=test-client&redirect_uri=https%3A%2F%2Fwww.integration-up.com%2Fapi%2Fauth%2Fhubspot%2Fcallback%2Fdate-formatter&scope=oauth&response_type=code'
      );
      
      const request = createRequest('http://localhost:3000/api/auth/hubspot/callback/date-formatter');
      const params = { appType: 'date-formatter' };

      const response = await GET(request, { params });

      expect(mockGenerateOAuthUrl).toHaveBeenCalledWith('date-formatter');
      expect(response.status).toBe(307);
      const location = response.headers.get('location');
      expect(location).toContain('https://app.hubspot.com/oauth/authorize');
      expect(location).toContain('client_id=');
      expect(location).toContain('redirect_uri=');
      expect(location).toContain('callback%2Fdate-formatter');
    });

    it('should redirect directly to HubSpot OAuth for url-shortener', async () => {
      mockGenerateOAuthUrl.mockReturnValue(
        'https://app.hubspot.com/oauth/authorize?client_id=test-client-2&redirect_uri=https%3A%2F%2Fwww.integration-up.com%2Fapi%2Fauth%2Fhubspot%2Fcallback%2Furl-shortener&scope=oauth&response_type=code'
      );
      
      const request = createRequest('http://localhost:3000/api/auth/hubspot/callback/url-shortener');
      const params = { appType: 'url-shortener' };

      const response = await GET(request, { params });

      expect(mockGenerateOAuthUrl).toHaveBeenCalledWith('url-shortener');
      expect(response.status).toBe(307);
      const location = response.headers.get('location');
      expect(location).toContain('https://app.hubspot.com/oauth/authorize');
      expect(location).toContain('client_id=');
      expect(location).toContain('redirect_uri=');
      expect(location).toContain('callback%2Furl-shortener');
    });
  });

  describe('OAuth Error Handling', () => {
    it('should redirect to install page with error message when OAuth error occurs', async () => {
      const request = createRequest(
        'http://localhost:3000/api/auth/hubspot/callback/date-formatter?error=access_denied&error_description=User+denied+access'
      );
      const params = { appType: 'date-formatter' };

      const response = await GET(request, { params });

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toBe('http://localhost:3000/install?error=User%20denied%20access');
    });

    it('should handle OAuth error without description', async () => {
      const request = createRequest(
        'http://localhost:3000/api/auth/hubspot/callback/url-shortener?error=invalid_scope'
      );
      const params = { appType: 'url-shortener' };

      const response = await GET(request, { params });

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toBe('http://localhost:3000/install?error=invalid_scope');
    });
  });

  describe('Successful OAuth Flow', () => {
    const mockTokens = {
      accessToken: 'test-access-token',
      refreshToken: 'test-refresh-token',
      expiresIn: 21600,
      tokenType: 'bearer'
    };

    const mockTokenInfo = {
      hub_id: 123456789,
      app_id: 16695303,
      expires_in: 21600,
      user_id: 987654321,
      token_type: 'access',
      user: 'test@example.com',
      hub_domain: 'test.hubspot.com',
      scopes: ['oauth']
    };

    beforeEach(() => {
      mockValidateOAuthCallback.mockImplementation(() => {});
      mockExchangeCodeForTokens.mockResolvedValue(mockTokens);
      mockFetchAccessTokenInfo.mockResolvedValue(mockTokenInfo);
    });

    it('should create new installation for date-formatter', async () => {
      const request = createRequest(
        'http://localhost:3000/api/auth/hubspot/callback/date-formatter?code=test-auth-code'
      );
      const params = { appType: 'date-formatter' };

      mockFindInstallationByHubIdAndApp.mockResolvedValue(null);
      mockCreateInstallation.mockResolvedValue({ id: 'new-installation-id' } as any);

      const response = await GET(request, { params });

      expect(mockValidateOAuthCallback).toHaveBeenCalledWith('test-auth-code');
      expect(mockExchangeCodeForTokens).toHaveBeenCalledWith('test-auth-code', 'date-formatter');
      expect(mockFetchAccessTokenInfo).toHaveBeenCalledWith('test-access-token');
      expect(mockFindInstallationByHubIdAndApp).toHaveBeenCalledWith(123456789, 'date-formatter');
      expect(mockCreateInstallation).toHaveBeenCalledWith(
        expect.objectContaining({
          hubId: 123456789,
          accessToken: 'test-access-token',
          refreshToken: 'test-refresh-token',
          expiresAt: expect.any(String),
          scope: 'oauth',
          appType: 'date-formatter'
        })
      );
      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toBe('http://localhost:3000/install/date-formatter/success?portalId=123456789');
    });

    it('should update existing installation for url-shortener', async () => {
      const request = createRequest(
        'http://localhost:3000/api/auth/hubspot/callback/url-shortener?code=test-auth-code'
      );
      const params = { appType: 'url-shortener' };

      mockFindInstallationByHubIdAndApp.mockResolvedValue({ 
        id: 'existing-installation-id',
        hub_id: 123456789,
        app_type: 'url-shortener'
      } as any);
      mockUpdateInstallationTokensForApp.mockResolvedValue(undefined);

      const response = await GET(request, { params });

      expect(mockValidateOAuthCallback).toHaveBeenCalledWith('test-auth-code');
      expect(mockExchangeCodeForTokens).toHaveBeenCalledWith('test-auth-code', 'url-shortener');
      expect(mockFetchAccessTokenInfo).toHaveBeenCalledWith('test-access-token');
      expect(mockFindInstallationByHubIdAndApp).toHaveBeenCalledWith(123456789, 'url-shortener');
      expect(mockUpdateInstallationTokensForApp).toHaveBeenCalledWith(123456789, 'url-shortener', {
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token',
        expiresAt: expect.any(String)
      });
      expect(mockCreateInstallation).not.toHaveBeenCalled();
      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toBe('http://localhost:3000/install/url-shortener/success?portalId=123456789');
    });
  });

  describe('Error Recovery', () => {
    it('should handle token exchange failure with user-friendly message', async () => {
      const request = createRequest(
        'http://localhost:3000/api/auth/hubspot/callback/date-formatter?code=bad-code'
      );
      const params = { appType: 'date-formatter' };

      mockValidateOAuthCallback.mockImplementation(() => {});
      mockExchangeCodeForTokens.mockRejectedValue(
        new Error('Token exchange failed: 400 MISMATCH_REDIRECT_URI')
      );

      const response = await GET(request, { params });

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toBe(
        'http://localhost:3000/install?error=Configuration%20error%3A%20Redirect%20URI%20mismatch.%20Please%20contact%20support.'
      );
    });

    it('should handle missing OAuth configuration', async () => {
      const request = createRequest(
        'http://localhost:3000/api/auth/hubspot/callback/url-shortener?code=test-code'
      );
      const params = { appType: 'url-shortener' };

      mockValidateOAuthCallback.mockImplementation(() => {});
      mockExchangeCodeForTokens.mockRejectedValue(
        new Error('Missing HubSpot OAuth configuration')
      );

      const response = await GET(request, { params });

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toBe(
        'http://localhost:3000/install?error=Configuration%20error.%20Please%20contact%20support.'
      );
    });

    it('should handle generic errors with fallback message', async () => {
      const request = createRequest(
        'http://localhost:3000/api/auth/hubspot/callback/date-formatter?code=test-code'
      );
      const params = { appType: 'date-formatter' };

      mockValidateOAuthCallback.mockImplementation(() => {});
      mockExchangeCodeForTokens.mockRejectedValue(new Error('Network error'));

      const response = await GET(request, { params });

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toBe(
        'http://localhost:3000/install?error=Network%20error'
      );
    });

    it('should handle validation errors', async () => {
      const request = createRequest(
        'http://localhost:3000/api/auth/hubspot/callback/date-formatter?code=invalid-format'
      );
      const params = { appType: 'date-formatter' };

      mockValidateOAuthCallback.mockImplementation(() => {
        throw new Error('Invalid authorization code format');
      });

      const response = await GET(request, { params });

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toBe(
        'http://localhost:3000/install?error=Invalid%20authorization%20code%20format'
      );
    });
  });

  describe('App Type from URL Path', () => {
    it('should not use state parameter for app identification', async () => {
      // Even if state parameter is provided, app type should come from URL
      const request = createRequest(
        'http://localhost:3000/api/auth/hubspot/callback/date-formatter?code=test-code&state=url-shortener'
      );
      const params = { appType: 'date-formatter' };

      mockValidateOAuthCallback.mockImplementation(() => {});
      mockExchangeCodeForTokens.mockResolvedValue({
        accessToken: 'test-token',
        refreshToken: 'refresh-token',
        expiresIn: 21600,
        tokenType: 'bearer'
      });
      mockFetchAccessTokenInfo.mockResolvedValue({
        hub_id: 123456789,
        app_id: 16695303,
        expires_in: 21600,
        user_id: 987654321,
        token_type: 'access',
        user: 'test@example.com',
        hub_domain: 'test.hubspot.com',
        scopes: ['oauth']
      });
      mockFindInstallationByHubIdAndApp.mockResolvedValue(null);
      mockCreateInstallation.mockResolvedValue({ id: 'new-id' } as any);

      const response = await GET(request, { params });

      // Should use date-formatter from URL, not url-shortener from state
      expect(mockExchangeCodeForTokens).toHaveBeenCalledWith('test-code', 'date-formatter');
      expect(mockCreateInstallation).toHaveBeenCalledWith(
        expect.objectContaining({
          appType: 'date-formatter'
        })
      );
      expect(response.headers.get('location')).toBe('http://localhost:3000/install/date-formatter/success?portalId=123456789');
    });
  });
});