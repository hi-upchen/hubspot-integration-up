import { generateOAuthUrl, validateOAuthCallback, HUBSPOT_OAUTH_SCOPES } from '@/lib/hubspot/auth';
import { ConfigManager } from '@/lib/config/config-manager';

// Mock ConfigManager to avoid real environment setup
jest.mock('@/lib/config/config-manager', () => ({
  ConfigManager: {
    getHubSpotConfig: jest.fn(),
    getCurrentEnvironment: jest.fn(),
    __resetForTesting: jest.fn()
  }
}));

const mockConfigManager = ConfigManager as jest.Mocked<typeof ConfigManager>;

describe('HubSpot OAuth Authentication', () => {
  let consoleLogSpy: jest.SpyInstance;
  
  beforeEach(() => {
    jest.clearAllMocks();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    
    // Default mock configuration
    mockConfigManager.getHubSpotConfig.mockReturnValue({
      clientId: 'test-client-id',
      clientSecret: 'test-client-secret',
      redirectUri: 'https://example.com/callback',
      developerApiKey: 'test-api-key',
      dateFormatterAppId: 'test-app-id'
    });
    
    mockConfigManager.getCurrentEnvironment.mockReturnValue('dev');
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  describe('HUBSPOT_OAUTH_SCOPES constant', () => {
    test('should contain required OAuth scopes', () => {
      expect(HUBSPOT_OAUTH_SCOPES).toEqual(['oauth']);
    });

    test('should be an array', () => {
      expect(Array.isArray(HUBSPOT_OAUTH_SCOPES)).toBe(true);
    });

    test('should contain string values only', () => {
      HUBSPOT_OAUTH_SCOPES.forEach(scope => {
        expect(typeof scope).toBe('string');
        expect(scope.length).toBeGreaterThan(0);
      });
    });

    test('should not be empty', () => {
      expect(HUBSPOT_OAUTH_SCOPES.length).toBeGreaterThan(0);
    });

    test('should not contain duplicate scopes', () => {
      const uniqueScopes = [...new Set(HUBSPOT_OAUTH_SCOPES)];
      expect(uniqueScopes).toEqual(HUBSPOT_OAUTH_SCOPES);
    });
  });

  describe('generateOAuthUrl', () => {
    describe('Basic functionality', () => {
      test('should generate valid OAuth URL with standard configuration', () => {
        const url = generateOAuthUrl();
        
        expect(url).toMatch(/^https:\/\/app\.hubspot\.com\/oauth\/authorize\?/);
        expect(url).toContain('client_id=test-client-id');
        expect(url).toContain('redirect_uri=https%3A%2F%2Fexample.com%2Fcallback');
        expect(url).toContain('scope=oauth');
        expect(url).toContain('response_type=code');
      });

      test('should call ConfigManager methods', () => {
        generateOAuthUrl();
        
        expect(mockConfigManager.getHubSpotConfig).toHaveBeenCalledTimes(1);
        expect(mockConfigManager.getCurrentEnvironment).toHaveBeenCalledTimes(1);
      });

      test('should log OAuth URL generation with environment', () => {
        generateOAuthUrl();
        
        expect(consoleLogSpy).toHaveBeenCalledWith('🔐 Generating OAuth URL for DEV environment');
      });
    });

    describe('URL Parameter Encoding Edge Cases', () => {
      test('should properly encode client ID with special characters', () => {
        mockConfigManager.getHubSpotConfig.mockReturnValue({
          clientId: 'client-id-with-special@#$%^&*()_+{}|:"<>?[]\\;\',./',
          clientSecret: 'test-secret',
          redirectUri: 'https://example.com/callback',
          developerApiKey: 'test-api-key',
          dateFormatterAppId: 'test-app-id'
        });

        const url = generateOAuthUrl();
        
        expect(url).toContain('client_id=client-id-with-special%40%23%24%25%5E%26*%28%29_%2B%7B%7D%7C%3A%22%3C%3E%3F%5B%5D%5C%3B%27%2C.%2F');
      });

      test('should properly encode redirect URI with query parameters', () => {
        mockConfigManager.getHubSpotConfig.mockReturnValue({
          clientId: 'test-client-id',
          clientSecret: 'test-secret',
          redirectUri: 'https://example.com/callback?param1=value1&param2=value with spaces',
          developerApiKey: 'test-api-key',
          dateFormatterAppId: 'test-app-id'
        });

        const url = generateOAuthUrl();
        
        expect(url).toContain('redirect_uri=https%3A%2F%2Fexample.com%2Fcallback%3Fparam1%3Dvalue1%26param2%3Dvalue+with+spaces');
      });

      test('should handle redirect URI with Unicode characters', () => {
        mockConfigManager.getHubSpotConfig.mockReturnValue({
          clientId: 'test-client-id',
          clientSecret: 'test-secret',
          redirectUri: 'https://example.com/コールバック',
          developerApiKey: 'test-api-key',
          dateFormatterAppId: 'test-app-id'
        });

        const url = generateOAuthUrl();
        
        expect(url).toContain('redirect_uri=https%3A%2F%2Fexample.com%2F%E3%82%B3%E3%83%BC%E3%83%AB%E3%83%90%E3%83%83%E3%82%AF');
      });

      test('should handle empty string values', () => {
        mockConfigManager.getHubSpotConfig.mockReturnValue({
          clientId: '',
          clientSecret: 'test-secret',
          redirectUri: '',
          developerApiKey: 'test-api-key',
          dateFormatterAppId: 'test-app-id'
        });

        const url = generateOAuthUrl();
        
        expect(url).toContain('client_id=');
        expect(url).toContain('redirect_uri=');
        expect(url).toContain('scope=oauth');
        expect(url).toContain('response_type=code');
      });

      test('should handle very long parameter values', () => {
        const longClientId = 'a'.repeat(1000);
        const longRedirectUri = 'https://example.com/' + 'b'.repeat(500);
        
        mockConfigManager.getHubSpotConfig.mockReturnValue({
          clientId: longClientId,
          clientSecret: 'test-secret',
          redirectUri: longRedirectUri,
          developerApiKey: 'test-api-key',
          dateFormatterAppId: 'test-app-id'
        });

        const url = generateOAuthUrl();
        
        expect(url).toContain(`client_id=${encodeURIComponent(longClientId)}`);
        expect(url).toContain(`redirect_uri=${encodeURIComponent(longRedirectUri)}`);
      });
    });

    describe('Scope Validation Edge Cases', () => {
      test('should handle single scope correctly', () => {
        const url = generateOAuthUrl();
        
        expect(url).toContain('scope=oauth');
      });

      test('should handle scope encoding correctly', () => {
        // Mock HUBSPOT_OAUTH_SCOPES with special characters for testing
        const originalScopes = [...HUBSPOT_OAUTH_SCOPES];
        (HUBSPOT_OAUTH_SCOPES as any).length = 0;
        HUBSPOT_OAUTH_SCOPES.push('oauth@test');
        
        try {
          const url = generateOAuthUrl();
          expect(url).toContain('scope=oauth%40test');
        } finally {
          // Restore original scopes
          (HUBSPOT_OAUTH_SCOPES as any).length = 0;
          HUBSPOT_OAUTH_SCOPES.push(...originalScopes);
        }
      });

      test('should handle single scope correctly', () => {
        const originalScopes = [...HUBSPOT_OAUTH_SCOPES];
        (HUBSPOT_OAUTH_SCOPES as any).length = 0;
        HUBSPOT_OAUTH_SCOPES.push('oauth');
        
        try {
          const url = generateOAuthUrl();
          expect(url).toContain('scope=oauth');
          expect(url).not.toContain('scope=oauth%20');
        } finally {
          // Restore original scopes
          (HUBSPOT_OAUTH_SCOPES as any).length = 0;
          HUBSPOT_OAUTH_SCOPES.push(...originalScopes);
        }
      });

      test('should handle empty scopes array', () => {
        const originalScopes = [...HUBSPOT_OAUTH_SCOPES];
        (HUBSPOT_OAUTH_SCOPES as any).length = 0;
        
        try {
          const url = generateOAuthUrl();
          expect(url).toContain('scope=');
        } finally {
          // Restore original scopes
          (HUBSPOT_OAUTH_SCOPES as any).length = 0;
          HUBSPOT_OAUTH_SCOPES.push(...originalScopes);
        }
      });
    });

    describe('Redirect URI Validation Edge Cases', () => {
      test('should handle HTTP redirect URI', () => {
        mockConfigManager.getHubSpotConfig.mockReturnValue({
          clientId: 'test-client-id',
          clientSecret: 'test-secret',
          redirectUri: 'http://localhost:3000/callback',
          developerApiKey: 'test-api-key',
          dateFormatterAppId: 'test-app-id'
        });

        const url = generateOAuthUrl();
        
        expect(url).toContain('redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fcallback');
      });

      test('should handle HTTPS redirect URI', () => {
        mockConfigManager.getHubSpotConfig.mockReturnValue({
          clientId: 'test-client-id',
          clientSecret: 'test-secret',
          redirectUri: 'https://secure.example.com:8443/oauth/callback',
          developerApiKey: 'test-api-key',
          dateFormatterAppId: 'test-app-id'
        });

        const url = generateOAuthUrl();
        
        expect(url).toContain('redirect_uri=https%3A%2F%2Fsecure.example.com%3A8443%2Foauth%2Fcallback');
      });

      test('should handle custom scheme redirect URI', () => {
        mockConfigManager.getHubSpotConfig.mockReturnValue({
          clientId: 'test-client-id',
          clientSecret: 'test-secret',
          redirectUri: 'myapp://oauth/callback',
          developerApiKey: 'test-api-key',
          dateFormatterAppId: 'test-app-id'
        });

        const url = generateOAuthUrl();
        
        expect(url).toContain('redirect_uri=myapp%3A%2F%2Foauth%2Fcallback');
      });

      test('should handle redirect URI with port number', () => {
        mockConfigManager.getHubSpotConfig.mockReturnValue({
          clientId: 'test-client-id',
          clientSecret: 'test-secret',
          redirectUri: 'https://example.com:8080/callback',
          developerApiKey: 'test-api-key',
          dateFormatterAppId: 'test-app-id'
        });

        const url = generateOAuthUrl();
        
        expect(url).toContain('redirect_uri=https%3A%2F%2Fexample.com%3A8080%2Fcallback');
      });

      test('should handle redirect URI with path segments', () => {
        mockConfigManager.getHubSpotConfig.mockReturnValue({
          clientId: 'test-client-id',
          clientSecret: 'test-secret',
          redirectUri: 'https://example.com/api/v1/oauth/hubspot/callback',
          developerApiKey: 'test-api-key',
          dateFormatterAppId: 'test-app-id'
        });

        const url = generateOAuthUrl();
        
        expect(url).toContain('redirect_uri=https%3A%2F%2Fexample.com%2Fapi%2Fv1%2Foauth%2Fhubspot%2Fcallback');
      });
    });

    describe('Environment-specific Configuration Edge Cases', () => {
      test('should handle dev environment correctly', () => {
        mockConfigManager.getCurrentEnvironment.mockReturnValue('dev');
        
        generateOAuthUrl();
        
        expect(consoleLogSpy).toHaveBeenCalledWith('🔐 Generating OAuth URL for DEV environment');
      });

      test('should handle prod environment correctly', () => {
        mockConfigManager.getCurrentEnvironment.mockReturnValue('prod');
        
        generateOAuthUrl();
        
        expect(consoleLogSpy).toHaveBeenCalledWith('🔐 Generating OAuth URL for PROD environment');
      });

      test('should handle different config values per environment', () => {
        // Test dev environment
        mockConfigManager.getCurrentEnvironment.mockReturnValue('dev');
        mockConfigManager.getHubSpotConfig.mockReturnValue({
          clientId: 'dev-client-id',
          clientSecret: 'dev-secret',
          redirectUri: 'https://dev.example.com/callback',
          developerApiKey: 'dev-api-key',
          dateFormatterAppId: 'dev-app-id'
        });

        const devUrl = generateOAuthUrl();
        expect(devUrl).toContain('client_id=dev-client-id');
        expect(devUrl).toContain('redirect_uri=https%3A%2F%2Fdev.example.com%2Fcallback');

        // Reset mocks for prod environment test
        jest.clearAllMocks();
        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
        
        mockConfigManager.getCurrentEnvironment.mockReturnValue('prod');
        mockConfigManager.getHubSpotConfig.mockReturnValue({
          clientId: 'prod-client-id',
          clientSecret: 'prod-secret',
          redirectUri: 'https://prod.example.com/callback',
          developerApiKey: 'prod-api-key',
          dateFormatterAppId: 'prod-app-id'
        });

        const prodUrl = generateOAuthUrl();
        expect(prodUrl).toContain('client_id=prod-client-id');
        expect(prodUrl).toContain('redirect_uri=https%3A%2F%2Fprod.example.com%2Fcallback');
      });

      test('should throw error when ConfigManager throws', () => {
        mockConfigManager.getHubSpotConfig.mockImplementation(() => {
          throw new Error('Configuration not found');
        });

        expect(() => generateOAuthUrl()).toThrow('Configuration not found');
      });

      test('should handle missing configuration gracefully', () => {
        mockConfigManager.getHubSpotConfig.mockReturnValue({
          clientId: undefined as any,
          clientSecret: undefined as any,
          redirectUri: undefined as any,
          developerApiKey: undefined as any,
          dateFormatterAppId: undefined as any
        });

        const url = generateOAuthUrl();
        
        expect(url).toContain('client_id=undefined');
        expect(url).toContain('redirect_uri=undefined');
      });
    });

    describe('URL Structure Validation', () => {
      test('should always use HubSpot OAuth base URL', () => {
        const url = generateOAuthUrl();
        
        expect(url).toMatch(/^https:\/\/app\.hubspot\.com\/oauth\/authorize\?/);
      });

      test('should contain all required parameters', () => {
        const url = generateOAuthUrl();
        
        expect(url).toContain('client_id=');
        expect(url).toContain('redirect_uri=');
        expect(url).toContain('scope=');
        expect(url).toContain('response_type=code');
      });

      test('should have parameters in consistent format', () => {
        const url = generateOAuthUrl();
        const urlObj = new URL(url);
        
        expect(urlObj.searchParams.get('client_id')).toBe('test-client-id');
        expect(urlObj.searchParams.get('redirect_uri')).toBe('https://example.com/callback');
        expect(urlObj.searchParams.get('scope')).toBe('oauth');
        expect(urlObj.searchParams.get('response_type')).toBe('code');
      });

      test('should generate different URLs for different configurations', () => {
        const url1 = generateOAuthUrl();
        
        mockConfigManager.getHubSpotConfig.mockReturnValue({
          clientId: 'different-client-id',
          clientSecret: 'different-secret',
          redirectUri: 'https://different.com/callback',
          developerApiKey: 'different-api-key',
          dateFormatterAppId: 'different-app-id'
        });
        
        const url2 = generateOAuthUrl();
        
        expect(url1).not.toBe(url2);
      });
    });
  });

  describe('validateOAuthCallback', () => {
    describe('Basic validation', () => {
      test('should pass validation for valid authorization code', () => {
        expect(() => validateOAuthCallback('valid-auth-code-123')).not.toThrow();
      });

      test('should throw error for empty string', () => {
        expect(() => validateOAuthCallback('')).toThrow('Authorization code is required');
      });

      test('should throw error for undefined', () => {
        expect(() => validateOAuthCallback(undefined as any)).toThrow('Authorization code is required');
      });

      test('should throw error for null', () => {
        expect(() => validateOAuthCallback(null as any)).toThrow('Authorization code is required');
      });
    });

    describe('Format validation edge cases', () => {
      test('should reject codes shorter than 10 characters', () => {
        const shortCodes = ['a', 'ab', 'abc', 'abcd', 'abcde', 'abcdef', 'abcdefg', 'abcdefgh', 'abcdefghi'];
        
        shortCodes.forEach(code => {
          expect(() => validateOAuthCallback(code)).toThrow('Invalid authorization code format');
        });
      });

      test('should accept codes exactly 10 characters long', () => {
        expect(() => validateOAuthCallback('abcdefghij')).not.toThrow();
      });

      test('should accept codes longer than 10 characters', () => {
        const longCodes = [
          'abcdefghijk', // 11 characters
          'abcdefghijklmnop', // 16 characters
          'a'.repeat(100), // 100 characters
          'a'.repeat(1000) // 1000 characters
        ];
        
        longCodes.forEach(code => {
          expect(() => validateOAuthCallback(code)).not.toThrow();
        });
      });

      test('should handle codes with special characters', () => {
        const specialCodes = [
          'abcdef-123',
          'abcdef_123',
          'abcdef.123',
          'abcdef@123',
          'abcdef#123',
          'abcdef$123',
          'abcdef%123',
          'abcdef^123',
          'abcdef&123',
          'abcdef*123',
          'abcdef(123',
          'abcdef)123',
          'abcdef+123',
          'abcdef=123',
          'abcdef[123',
          'abcdef]123',
          'abcdef{123',
          'abcdef}123',
          'abcdef|123',
          'abcdef\\123',
          'abcdef:123',
          'abcdef;123',
          'abcdef"123',
          'abcdef\'123',
          'abcdef<123',
          'abcdef>123',
          'abcdef,123',
          'abcdef?123',
          'abcdef/123'
        ];
        
        specialCodes.forEach(code => {
          expect(() => validateOAuthCallback(code)).not.toThrow();
        });
      });

      test('should handle codes with numbers', () => {
        const numericCodes = [
          '1234567890',
          'abc1234567',
          '123abc4567',
          '1234567abc'
        ];
        
        numericCodes.forEach(code => {
          expect(() => validateOAuthCallback(code)).not.toThrow();
        });
      });

      test('should handle codes with mixed case', () => {
        const mixedCaseCodes = [
          'AbCdEfGhIj',
          'ABCDEFGHIJ',
          'abcdefghij',
          'AbC123XyZ0'
        ];
        
        mixedCaseCodes.forEach(code => {
          expect(() => validateOAuthCallback(code)).not.toThrow();
        });
      });

      test('should handle codes with Unicode characters', () => {
        const unicodeCodes = [
          'abcdefghijñ',
          'abcdefghijé',
          'abcdefghij中',
          'abcdefghij🚀',
          'abcdefghijß'
        ];
        
        unicodeCodes.forEach(code => {
          expect(() => validateOAuthCallback(code)).not.toThrow();
        });
      });

      test('should handle codes with whitespace', () => {
        const whitespaceCodes = [
          'abcdef ghij', // space in middle
          ' abcdefghij', // leading space
          'abcdefghij ', // trailing space
          'abcdef\tghij', // tab character
          'abcdef\nghij', // newline character
          'abcdef\rghij'  // carriage return
        ];
        
        whitespaceCodes.forEach(code => {
          expect(() => validateOAuthCallback(code)).not.toThrow();
        });
      });
    });

    describe('Edge case error handling', () => {
      test('should handle boolean false as invalid', () => {
        expect(() => validateOAuthCallback(false as any)).toThrow('Authorization code is required');
      });

      test('should handle boolean true as invalid', () => {
        expect(() => validateOAuthCallback(true as any)).toThrow('Invalid authorization code format');
      });

      test('should handle number 0 as invalid', () => {
        expect(() => validateOAuthCallback(0 as any)).toThrow('Authorization code is required');
      });

      test('should handle positive number as string conversion', () => {
        expect(() => validateOAuthCallback(1234567890 as any)).not.toThrow();
      });

      test('should handle object as string conversion', () => {
        const obj = { toString: () => 'abcdefghij' };
        expect(() => validateOAuthCallback(obj as any)).not.toThrow();
      });

      test('should handle array as string conversion', () => {
        const arr = ['abcdefghij']; // becomes "abcdefghij" (10 chars) - should pass
        expect(() => validateOAuthCallback(arr as any)).not.toThrow();
      });

      test('should provide correct error messages', () => {
        expect(() => validateOAuthCallback('')).toThrow('Authorization code is required');
        expect(() => validateOAuthCallback('short')).toThrow('Invalid authorization code format');
        
        // Verify exact error messages
        try {
          validateOAuthCallback('');
        } catch (error) {
          expect((error as Error).message).toBe('Authorization code is required');
        }
        
        try {
          validateOAuthCallback('short');
        } catch (error) {
          expect((error as Error).message).toBe('Invalid authorization code format');
        }
      });

      test('should handle very long authorization codes', () => {
        const veryLongCode = 'a'.repeat(10000);
        expect(() => validateOAuthCallback(veryLongCode)).not.toThrow();
      });

      test('should handle codes at exact boundary (9 vs 10 characters)', () => {
        expect(() => validateOAuthCallback('123456789')).toThrow('Invalid authorization code format'); // 9 chars
        expect(() => validateOAuthCallback('1234567890')).not.toThrow(); // 10 chars
      });
    });

    describe('Real-world HubSpot code patterns', () => {
      test('should handle typical HubSpot authorization codes', () => {
        const typicalCodes = [
          'f8c3de3d-1fea-4d7c-a8b0-29f63c4c3454', // UUID-like
          'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9', // JWT-like
          'ac1234567890abcdef1234567890abcdef12', // Hex-like
          'AQECAHi7_7OWDhjV-bgjhQ', // Base64-like
          'hub_12345_abcdef1234567890' // HubSpot-like format
        ];
        
        typicalCodes.forEach(code => {
          expect(() => validateOAuthCallback(code)).not.toThrow();
        });
      });

      test('should reject malformed codes that might be injection attempts', () => {
        const malformedCodes = ['', 'null', 'undefined', '   '];
        
        malformedCodes.forEach(code => {
          expect(() => validateOAuthCallback(code)).toThrow();
        });
      });
    });

    describe('Type coercion edge cases', () => {
      test('should handle string coercion for numeric values', () => {
        expect(() => validateOAuthCallback(1234567890123 as any)).not.toThrow();
      });

      test('should handle string coercion for NaN', () => {
        expect(() => validateOAuthCallback(NaN as any)).toThrow('Authorization code is required');
      });

      test('should handle string coercion for Infinity', () => {
        expect(() => validateOAuthCallback(Infinity as any)).not.toThrow();
      });

      test('should handle string coercion for -Infinity', () => {
        expect(() => validateOAuthCallback(-Infinity as any)).not.toThrow();
      });
    });
  });

  describe('Integration between generateOAuthUrl and validateOAuthCallback', () => {
    test('should generate URL that can be used in OAuth flow', () => {
      const url = generateOAuthUrl();
      const urlObj = new URL(url);
      
      // Verify URL structure is valid for OAuth flow
      expect(urlObj.protocol).toBe('https:');
      expect(urlObj.hostname).toBe('app.hubspot.com');
      expect(urlObj.pathname).toBe('/oauth/authorize');
      expect(urlObj.searchParams.get('response_type')).toBe('code');
    });

    test('should handle callback validation after URL generation', () => {
      generateOAuthUrl();
      
      // Simulate receiving callback with authorization code
      const mockAuthCode = 'mock-authorization-code-from-hubspot';
      expect(() => validateOAuthCallback(mockAuthCode)).not.toThrow();
    });

    test('should maintain consistency across multiple OAuth flows', () => {
      const url1 = generateOAuthUrl();
      const url2 = generateOAuthUrl();
      
      // URLs should be identical with same config
      expect(url1).toBe(url2);
      
      // Both should lead to valid callback validation
      const mockAuthCode = 'consistent-auth-code';
      expect(() => validateOAuthCallback(mockAuthCode)).not.toThrow();
    });
  });

  describe('Performance and reliability', () => {
    test('should generate URLs quickly', () => {
      const startTime = performance.now();
      
      for (let i = 0; i < 100; i++) {
        generateOAuthUrl();
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should complete 100 generations in less than 50ms
      expect(duration).toBeLessThan(50);
    });

    test('should validate codes quickly', () => {
      const startTime = performance.now();
      const testCode = 'performance-test-code';
      
      for (let i = 0; i < 1000; i++) {
        validateOAuthCallback(testCode);
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should complete 1000 validations in less than 10ms
      expect(duration).toBeLessThan(10);
    });

    test('should handle memory efficiently with repeated operations', () => {
      const initialMemory = process.memoryUsage().heapUsed;
      
      // Perform many operations
      for (let i = 0; i < 1000; i++) {
        generateOAuthUrl();
        validateOAuthCallback(`test-code-${i.toString().padStart(10, '0')}`);
      }
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryGrowth = finalMemory - initialMemory;
      
      // Memory growth should be reasonable (less than 10MB)
      expect(memoryGrowth).toBeLessThan(10 * 1024 * 1024);
    });
  });
});