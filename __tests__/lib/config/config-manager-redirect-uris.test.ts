import { ConfigManager } from '@/lib/config/config-manager';

describe('ConfigManager - App-Specific Redirect URIs', () => {
  beforeEach(() => {
    // Reset config manager for clean test state
    ConfigManager.__resetForTesting();
    
    // Reset environment variables
    delete process.env.NODE_ENV;
    process.argv = process.argv.filter(arg => !['dev', 'prod'].includes(arg));
  });

  describe('getHubSpotRedirectUri with app type', () => {
    it('should return app-specific redirect URI for date-formatter in dev', () => {
      process.argv.push('dev');
      
      const redirectUri = ConfigManager.getHubSpotRedirectUri('date-formatter');
      
      expect(redirectUri).toBe('http://localhost:3000/api/auth/hubspot/callback/date-formatter');
    });

    it('should return app-specific redirect URI for url-shortener in dev', () => {
      process.argv.push('dev');
      
      const redirectUri = ConfigManager.getHubSpotRedirectUri('url-shortener');
      
      expect(redirectUri).toBe('http://localhost:3000/api/auth/hubspot/callback/url-shortener');
    });

    it('should return app-specific redirect URI for date-formatter in prod', () => {
      process.env.NODE_ENV = 'production';
      
      const redirectUri = ConfigManager.getHubSpotRedirectUri('date-formatter');
      
      expect(redirectUri).toBe('https://www.integration-up.com/api/auth/hubspot/callback/date-formatter');
    });

    it('should return app-specific redirect URI for url-shortener in prod', () => {
      process.env.NODE_ENV = 'production';
      
      const redirectUri = ConfigManager.getHubSpotRedirectUri('url-shortener');
      
      expect(redirectUri).toBe('https://www.integration-up.com/api/auth/hubspot/callback/url-shortener');
    });

    it('should fallback to legacy single redirect URI if redirectUris not defined', () => {
      // Mock the config to simulate old configuration format
      const getHubSpotConfig = jest.spyOn(ConfigManager as any, 'getHubSpotConfig');
      getHubSpotConfig.mockReturnValue({
        shared: {
          redirectUri: 'http://localhost:3000/api/auth/hubspot/callback',
          developerApiKey: 'test-key'
        },
        apps: {
          'date-formatter': {
            appId: '123',
            clientId: 'test-client',
            clientSecret: 'test-secret'
          },
          'url-shortener': {
            appId: '456',
            clientId: 'test-client-2',
            clientSecret: 'test-secret-2'
          }
        }
      });

      const redirectUri = ConfigManager.getHubSpotRedirectUri('date-formatter');
      
      expect(redirectUri).toBe('http://localhost:3000/api/auth/hubspot/callback');
      
      getHubSpotConfig.mockRestore();
    });
  });

  describe('Backward compatibility', () => {
    it('should support both old getHubSpotRedirectUri() and new getHubSpotRedirectUri(appType)', () => {
      process.argv.push('dev');
      
      // Old method without parameter should still work
      const legacyUri = ConfigManager.getHubSpotRedirectUri();
      expect(legacyUri).toBeDefined();
      
      // New method with parameter should work
      const appSpecificUri = ConfigManager.getHubSpotRedirectUri('date-formatter');
      expect(appSpecificUri).toBe('http://localhost:3000/api/auth/hubspot/callback/date-formatter');
    });
  });

  describe('Configuration validation', () => {
    it('should return fallback for invalid app type', () => {
      process.argv.push('dev');
      
      // For invalid app types, it should return the fallback (legacy) redirect URI
      // @ts-expect-error Testing invalid input
      const result = ConfigManager.getHubSpotRedirectUri('invalid-app');
      expect(result).toBe('http://localhost:3000/api/auth/hubspot/callback');
    });

    it('should handle missing redirectUris gracefully', () => {
      // Mock config without redirectUris but with legacy redirectUri
      const getHubSpotConfig = jest.spyOn(ConfigManager as any, 'getHubSpotConfig');
      getHubSpotConfig.mockReturnValue({
        shared: {
          redirectUri: 'http://localhost:3000/api/auth/hubspot/callback'
        },
        apps: {}
      });

      const result = ConfigManager.getHubSpotRedirectUri('date-formatter');
      expect(result).toBe('http://localhost:3000/api/auth/hubspot/callback');
      
      getHubSpotConfig.mockRestore();
    });
  });
});