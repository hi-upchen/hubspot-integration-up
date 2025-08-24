import { generateOAuthUrl } from '@/lib/hubspot/auth';
import { ConfigManager } from '@/lib/config/config-manager';

jest.mock('@/lib/config/config-manager');

describe('OAuth URL Generation with App-Specific Redirect URIs', () => {
  const mockConfigManager = ConfigManager as jest.Mocked<typeof ConfigManager>;
  const originalConsoleLog = console.log;

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock getCurrentEnvironment to prevent undefined error
    mockConfigManager.getCurrentEnvironment = jest.fn().mockReturnValue('dev');
    // Suppress console.log in tests
    console.log = jest.fn();
  });

  afterEach(() => {
    // Restore console.log
    console.log = originalConsoleLog;
  });

  describe('generateOAuthUrl with app-specific redirect URIs', () => {
    it('should generate OAuth URL for date-formatter with specific redirect URI', () => {
      mockConfigManager.getHubSpotClientId.mockReturnValue('date-formatter-client-id');
      mockConfigManager.getHubSpotRedirectUri.mockReturnValue(
        'https://www.integration-up.com/api/auth/hubspot/callback/date-formatter'
      );

      const url = generateOAuthUrl('date-formatter');

      expect(mockConfigManager.getHubSpotClientId).toHaveBeenCalledWith('date-formatter');
      expect(mockConfigManager.getHubSpotRedirectUri).toHaveBeenCalledWith('date-formatter');
      
      const urlObj = new URL(url);
      expect(urlObj.hostname).toBe('app.hubspot.com');
      expect(urlObj.pathname).toBe('/oauth/authorize');
      expect(urlObj.searchParams.get('client_id')).toBe('date-formatter-client-id');
      expect(urlObj.searchParams.get('redirect_uri')).toBe(
        'https://www.integration-up.com/api/auth/hubspot/callback/date-formatter'
      );
      expect(urlObj.searchParams.get('scope')).toBe('oauth');
      expect(urlObj.searchParams.has('state')).toBe(false); // No state parameter needed
    });

    it('should generate OAuth URL for url-shortener with specific redirect URI', () => {
      mockConfigManager.getHubSpotClientId.mockReturnValue('url-shortener-client-id');
      mockConfigManager.getHubSpotRedirectUri.mockReturnValue(
        'https://www.integration-up.com/api/auth/hubspot/callback/url-shortener'
      );

      const url = generateOAuthUrl('url-shortener');

      expect(mockConfigManager.getHubSpotClientId).toHaveBeenCalledWith('url-shortener');
      expect(mockConfigManager.getHubSpotRedirectUri).toHaveBeenCalledWith('url-shortener');
      
      const urlObj = new URL(url);
      expect(urlObj.searchParams.get('client_id')).toBe('url-shortener-client-id');
      expect(urlObj.searchParams.get('redirect_uri')).toBe(
        'https://www.integration-up.com/api/auth/hubspot/callback/url-shortener'
      );
      expect(urlObj.searchParams.has('state')).toBe(false); // No state parameter needed
    });

    it('should not include state parameter in OAuth URL', () => {
      mockConfigManager.getHubSpotClientId.mockReturnValue('test-client-id');
      mockConfigManager.getHubSpotRedirectUri.mockReturnValue(
        'https://www.integration-up.com/api/auth/hubspot/callback/date-formatter'
      );

      const url = generateOAuthUrl('date-formatter');
      const urlObj = new URL(url);

      // State parameter should not be present
      expect(urlObj.searchParams.has('state')).toBe(false);
      expect(Array.from(urlObj.searchParams.keys())).toEqual(['client_id', 'redirect_uri', 'scope', 'response_type']);
    });

    it('should handle missing configuration', () => {
      mockConfigManager.getHubSpotClientId.mockReturnValue('');
      mockConfigManager.getHubSpotRedirectUri.mockReturnValue('');

      expect(() => generateOAuthUrl('date-formatter')).toThrow();
    });

    it('should encode redirect URI properly', () => {
      mockConfigManager.getHubSpotClientId.mockReturnValue('test-client-id');
      mockConfigManager.getHubSpotRedirectUri.mockReturnValue(
        'https://www.integration-up.com/api/auth/hubspot/callback/date-formatter'
      );

      const url = generateOAuthUrl('date-formatter');
      const urlObj = new URL(url);

      // Redirect URI should be properly encoded in the URL
      expect(urlObj.searchParams.get('redirect_uri')).toBe(
        'https://www.integration-up.com/api/auth/hubspot/callback/date-formatter'
      );
      
      // The actual URL string should have the redirect_uri encoded
      expect(url).toContain('redirect_uri=https%3A%2F%2Fwww.integration-up.com%2Fapi%2Fauth%2Fhubspot%2Fcallback%2Fdate-formatter');
    });
  });

  describe('OAuth URL differences between apps', () => {
    it('should generate different OAuth URLs for different apps', () => {
      // Date formatter setup
      mockConfigManager.getHubSpotClientId.mockReturnValueOnce('date-formatter-client');
      mockConfigManager.getHubSpotRedirectUri.mockReturnValueOnce(
        'https://www.integration-up.com/api/auth/hubspot/callback/date-formatter'
      );
      
      const dateFormatterUrl = generateOAuthUrl('date-formatter');

      // URL shortener setup
      mockConfigManager.getHubSpotClientId.mockReturnValueOnce('url-shortener-client');
      mockConfigManager.getHubSpotRedirectUri.mockReturnValueOnce(
        'https://www.integration-up.com/api/auth/hubspot/callback/url-shortener'
      );
      
      const urlShortenerUrl = generateOAuthUrl('url-shortener');

      // URLs should be different
      expect(dateFormatterUrl).not.toBe(urlShortenerUrl);
      
      // Parse and compare
      const dateFormatterUrlObj = new URL(dateFormatterUrl);
      const urlShortenerUrlObj = new URL(urlShortenerUrl);
      
      expect(dateFormatterUrlObj.searchParams.get('client_id')).toBe('date-formatter-client');
      expect(urlShortenerUrlObj.searchParams.get('client_id')).toBe('url-shortener-client');
      
      expect(dateFormatterUrlObj.searchParams.get('redirect_uri')).toContain('date-formatter');
      expect(urlShortenerUrlObj.searchParams.get('redirect_uri')).toContain('url-shortener');
    });
  });
});