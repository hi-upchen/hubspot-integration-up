/**
 * @jest-environment node
 */

import { generateOAuthUrl, validateOAuthCallback, HUBSPOT_OAUTH_SCOPES } from '@/lib/hubspot/auth';
import { ConfigManager } from '@/lib/config/config-manager';

// Mock ConfigManager
jest.mock('@/lib/config/config-manager', () => ({
  ConfigManager: {
    getHubSpotClientId: jest.fn(),
    getHubSpotRedirectUri: jest.fn(),
    getCurrentEnvironment: jest.fn(),
  },
}));

const mockConfigManager = ConfigManager as jest.Mocked<typeof ConfigManager>;

describe('HubSpot OAuth Authentication', () => {
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    // Setup console spy
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    
    // Clear all mocks
    jest.clearAllMocks();
    
    // Setup default mock behavior
    mockConfigManager.getHubSpotClientId.mockReturnValue('mock-client-id');
    mockConfigManager.getHubSpotRedirectUri.mockReturnValue('http://localhost:3000/api/auth/hubspot/callback');
    mockConfigManager.getCurrentEnvironment.mockReturnValue('dev');
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  describe('HUBSPOT_OAUTH_SCOPES constant', () => {
    test('should contain required OAuth scopes', () => {
      expect(HUBSPOT_OAUTH_SCOPES).toContain('oauth');
    });

    test('should be an array', () => {
      expect(Array.isArray(HUBSPOT_OAUTH_SCOPES)).toBe(true);
    });

    test('should contain string values only', () => {
      HUBSPOT_OAUTH_SCOPES.forEach(scope => {
        expect(typeof scope).toBe('string');
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
        const url = generateOAuthUrl('date-formatter');
        
        expect(url).toContain('https://app.hubspot.com/oauth/authorize');
        expect(url).toContain('client_id=mock-client-id');
        expect(url).toContain('redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fapi%2Fauth%2Fhubspot%2Fcallback');
        expect(url).toContain('scope=oauth');
        expect(url).toContain('response_type=code');
        expect(url).toContain('state=date-formatter');
      });

      test('should call ConfigManager methods with correct app type', () => {
        generateOAuthUrl('url-shortener');
        
        expect(mockConfigManager.getHubSpotClientId).toHaveBeenCalledWith('url-shortener');
        expect(mockConfigManager.getHubSpotRedirectUri).toHaveBeenCalledTimes(1);
        expect(mockConfigManager.getCurrentEnvironment).toHaveBeenCalledTimes(1);
      });

      test('should log OAuth URL generation with environment and app type', () => {
        generateOAuthUrl('date-formatter');
        
        expect(consoleLogSpy).toHaveBeenCalledWith('🔐 Generating OAuth URL for date-formatter (DEV environment)');
      });
    });

    describe('URL Parameter Encoding Edge Cases', () => {
      test('should properly encode client ID with special characters', () => {
        mockConfigManager.getHubSpotClientId.mockReturnValue('client-id-with-special@#$%^&*()_+{}|:"<>?[]\\;\',./');
        
        const url = generateOAuthUrl('date-formatter');
        
        expect(url).toContain('client_id=client-id-with-special%40%23%24%25%5E%26*%28%29_%2B%7B%7D%7C%3A%22%3C%3E%3F%5B%5D%5C%3B%27%2C.%2F');
      });

      test('should properly encode redirect URI with query parameters', () => {
        mockConfigManager.getHubSpotRedirectUri.mockReturnValue('https://example.com/callback?param1=value1&param2=value with spaces');
        
        const url = generateOAuthUrl('date-formatter');
        
        expect(url).toContain('redirect_uri=https%3A%2F%2Fexample.com%2Fcallback%3Fparam1%3Dvalue1%26param2%3Dvalue+with+spaces');
      });

      test('should handle redirect URI with Unicode characters', () => {
        mockConfigManager.getHubSpotRedirectUri.mockReturnValue('https://example.com/コールバック');
        
        const url = generateOAuthUrl('date-formatter');
        
        expect(url).toContain('redirect_uri=https%3A%2F%2Fexample.com%2F%E3%82%B3%E3%83%BC%E3%83%AB%E3%83%90%E3%83%83%E3%82%AF');
      });

      test('should handle empty string values', () => {
        mockConfigManager.getHubSpotClientId.mockReturnValue('');
        mockConfigManager.getHubSpotRedirectUri.mockReturnValue('');
        
        const url = generateOAuthUrl('date-formatter');
        
        expect(url).toContain('client_id=');
        expect(url).toContain('redirect_uri=');
        expect(url).toContain('state=date-formatter');
      });

      test('should handle very long parameter values', () => {
        const longClientId = 'a'.repeat(500);
        const longRedirectUri = 'https://example.com/' + 'b'.repeat(500);
        
        mockConfigManager.getHubSpotClientId.mockReturnValue(longClientId);
        mockConfigManager.getHubSpotRedirectUri.mockReturnValue(longRedirectUri);
        
        const url = generateOAuthUrl('date-formatter');
        
        expect(url).toContain(`client_id=${encodeURIComponent(longClientId)}`);
        expect(url).toContain(`redirect_uri=${encodeURIComponent(longRedirectUri)}`);
      });
    });

    describe('App Type Handling', () => {
      test('should use date-formatter as app type in state parameter', () => {
        const url = generateOAuthUrl('date-formatter');
        
        expect(url).toContain('state=date-formatter');
        expect(mockConfigManager.getHubSpotClientId).toHaveBeenCalledWith('date-formatter');
      });

      test('should use url-shortener as app type in state parameter', () => {
        const url = generateOAuthUrl('url-shortener');
        
        expect(url).toContain('state=url-shortener');
        expect(mockConfigManager.getHubSpotClientId).toHaveBeenCalledWith('url-shortener');
      });
    });

    describe('Scope Validation Edge Cases', () => {
      test('should handle single scope correctly', () => {
        const url = generateOAuthUrl('date-formatter');
        
        expect(url).toContain('scope=oauth');
      });

      test('should handle scope encoding correctly', () => {
        const url = generateOAuthUrl('date-formatter');
        
        // OAuth scope should be properly URL encoded (though 'oauth' doesn't need encoding)
        expect(url).toContain('scope=oauth');
      });

      test('should include all required OAuth parameters', () => {
        const url = generateOAuthUrl('date-formatter');
        
        expect(url).toContain('response_type=code');
        expect(url).toContain('scope=oauth');
        expect(url).toContain('client_id=');
        expect(url).toContain('redirect_uri=');
        expect(url).toContain('state=');
      });
    });

    describe('Environment-specific Configuration Edge Cases', () => {
      test('should handle dev environment correctly', () => {
        mockConfigManager.getCurrentEnvironment.mockReturnValue('dev');
        
        generateOAuthUrl('date-formatter');
        
        expect(consoleLogSpy).toHaveBeenCalledWith('🔐 Generating OAuth URL for date-formatter (DEV environment)');
      });

      test('should handle prod environment correctly', () => {
        mockConfigManager.getCurrentEnvironment.mockReturnValue('prod');
        
        generateOAuthUrl('date-formatter');
        
        expect(consoleLogSpy).toHaveBeenCalledWith('🔐 Generating OAuth URL for date-formatter (PROD environment)');
      });

      test('should handle different config values per app type', () => {
        mockConfigManager.getHubSpotClientId.mockImplementation((appType) => {
          if (appType === 'date-formatter') return 'df-client-id';
          if (appType === 'url-shortener') return 'us-client-id';
          return 'default-client-id';
        });
        
        const dfUrl = generateOAuthUrl('date-formatter');
        const usUrl = generateOAuthUrl('url-shortener');
        
        expect(dfUrl).toContain('client_id=df-client-id');
        expect(dfUrl).toContain('state=date-formatter');
        expect(usUrl).toContain('client_id=us-client-id');
        expect(usUrl).toContain('state=url-shortener');
      });

      test('should throw error when ConfigManager throws', () => {
        mockConfigManager.getHubSpotClientId.mockImplementation(() => {
          throw new Error('No configuration found for app: invalid-app');
        });

        expect(() => {
          generateOAuthUrl('date-formatter');
        }).toThrow('No configuration found for app: invalid-app');
      });
    });

    describe('URL Structure Validation', () => {
      test('should always use HubSpot OAuth base URL', () => {
        const url = generateOAuthUrl('date-formatter');
        
        expect(url).toMatch(/^https:\/\/app\.hubspot\.com\/oauth\/authorize\?/);
      });

      test('should contain all required parameters', () => {
        const url = generateOAuthUrl('date-formatter');
        
        const params = ['client_id', 'redirect_uri', 'scope', 'response_type', 'state'];
        params.forEach(param => {
          expect(url).toContain(`${param}=`);
        });
      });

      test('should have parameters in valid URL format', () => {
        const url = generateOAuthUrl('date-formatter');
        
        // Should be a valid URL
        expect(() => new URL(url)).not.toThrow();
        
        // Should have query parameters
        const urlObj = new URL(url);
        expect(urlObj.searchParams.get('client_id')).toBe('mock-client-id');
        expect(urlObj.searchParams.get('response_type')).toBe('code');
        expect(urlObj.searchParams.get('scope')).toBe('oauth');
        expect(urlObj.searchParams.get('state')).toBe('date-formatter');
      });

      test('should generate different URLs for different app types', () => {
        mockConfigManager.getHubSpotClientId.mockImplementation((appType) => {
          if (appType === 'date-formatter') return 'df-client-id';
          if (appType === 'url-shortener') return 'us-client-id';
          return 'default-client-id';
        });
        
        const url1 = generateOAuthUrl('date-formatter');
        const url2 = generateOAuthUrl('url-shortener');
        
        expect(url1).not.toBe(url2);
        expect(url1).toContain('state=date-formatter');
        expect(url2).toContain('state=url-shortener');
      });
    });
  });

  describe('validateOAuthCallback', () => {
    describe('Basic validation', () => {
      test('should pass validation for valid authorization code', () => {
        expect(() => {
          validateOAuthCallback('valid-auth-code-12345');
        }).not.toThrow();
      });

      test('should throw error for empty string', () => {
        expect(() => {
          validateOAuthCallback('');
        }).toThrow('Authorization code is required');
      });

      test('should throw error for undefined', () => {
        expect(() => {
          validateOAuthCallback(undefined as any);
        }).toThrow('Authorization code is required');
      });

      test('should throw error for null', () => {
        expect(() => {
          validateOAuthCallback(null as any);
        }).toThrow('Authorization code is required');
      });
    });

    describe('Format validation edge cases', () => {
      test('should reject codes shorter than 10 characters', () => {
        expect(() => {
          validateOAuthCallback('short');
        }).toThrow('Invalid authorization code format');
      });

      test('should accept codes exactly 10 characters long', () => {
        expect(() => {
          validateOAuthCallback('1234567890');
        }).not.toThrow();
      });

      test('should accept codes longer than 10 characters', () => {
        expect(() => {
          validateOAuthCallback('very-long-authorization-code-12345');
        }).not.toThrow();
      });

      test('should handle codes with special characters', () => {
        expect(() => {
          validateOAuthCallback('auth-code-with-special-chars@#$%');
        }).not.toThrow();
      });

      test('should handle codes with numbers', () => {
        expect(() => {
          validateOAuthCallback('1234567890abcdef');
        }).not.toThrow();
      });

      test('should handle codes with mixed case', () => {
        expect(() => {
          validateOAuthCallback('AuthCode123ABC');
        }).not.toThrow();
      });

      test('should handle codes with Unicode characters', () => {
        expect(() => {
          validateOAuthCallback('auth-code-ユニコード');
        }).not.toThrow();
      });

      test('should handle codes with whitespace', () => {
        expect(() => {
          validateOAuthCallback('auth code with spaces');
        }).not.toThrow();
      });
    });

    describe('Edge case error handling', () => {
      test('should handle boolean false as invalid', () => {
        expect(() => {
          validateOAuthCallback(false as any);
        }).toThrow('Authorization code is required');
      });

      test('should handle boolean true as invalid', () => {
        expect(() => {
          validateOAuthCallback(true as any);
        }).toThrow('Invalid authorization code format');
      });

      test('should handle number 0 as invalid', () => {
        expect(() => {
          validateOAuthCallback(0 as any);
        }).toThrow('Authorization code is required');
      });

      test('should handle positive number as string conversion', () => {
        expect(() => {
          validateOAuthCallback(1234567890 as any);
        }).not.toThrow();
      });

      test('should handle object as string conversion', () => {
        expect(() => {
          validateOAuthCallback({ toString: () => 'object-auth-code' } as any);
        }).not.toThrow();
      });

      test('should handle array as string conversion', () => {
        expect(() => {
          validateOAuthCallback(['auth', 'code', '12345'] as any);
        }).not.toThrow();
      });

      test('should provide correct error messages', () => {
        expect(() => {
          validateOAuthCallback('');
        }).toThrow('Authorization code is required');

        expect(() => {
          validateOAuthCallback('short');
        }).toThrow('Invalid authorization code format');
      });

      test('should handle very long authorization codes', () => {
        const longCode = 'a'.repeat(1000);
        expect(() => {
          validateOAuthCallback(longCode);
        }).not.toThrow();
      });

      test('should handle codes at exact boundary (9 vs 10 characters)', () => {
        expect(() => {
          validateOAuthCallback('123456789'); // 9 characters
        }).toThrow('Invalid authorization code format');

        expect(() => {
          validateOAuthCallback('1234567890'); // 10 characters
        }).not.toThrow();
      });
    });

    describe('Real-world HubSpot code patterns', () => {
      test('should handle typical HubSpot authorization codes', () => {
        const typicalCodes = [
          'a1b2c3d4e5f6g7h8i9j0',
          'HUBSPOT_AUTH_CODE_123456',
          'hub-auth-2024-01-28-xyz',
          '1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p',
        ];

        typicalCodes.forEach(code => {
          expect(() => {
            validateOAuthCallback(code);
          }).not.toThrow();
        });
      });

      test('should reject malformed codes that might be injection attempts', () => {
        const maliciousCodes = [
          'code',           // Too short
          '',               // Empty
          'false',          // False string
          'null',           // Null string
        ];

        maliciousCodes.forEach(code => {
          expect(() => {
            validateOAuthCallback(code);
          }).toThrow();
        });
      });
    });

    describe('Type coercion edge cases', () => {
      test('should handle string coercion for numeric values', () => {
        expect(() => {
          validateOAuthCallback(1234567890 as any);
        }).not.toThrow();
      });

      test('should handle string coercion for NaN', () => {
        expect(() => {
          validateOAuthCallback(NaN as any);
        }).toThrow('Authorization code is required');
      });

      test('should handle string coercion for Infinity', () => {
        expect(() => {
          validateOAuthCallback(Infinity as any);
        }).not.toThrow();
      });

      test('should handle string coercion for -Infinity', () => {
        expect(() => {
          validateOAuthCallback(-Infinity as any);
        }).not.toThrow();
      });
    });
  });

  describe('Integration between generateOAuthUrl and validateOAuthCallback', () => {
    test('should generate URL that can be used in OAuth flow', () => {
      const url = generateOAuthUrl('date-formatter');
      
      // URL should be valid and contain expected parameters
      const urlObj = new URL(url);
      expect(urlObj.hostname).toBe('app.hubspot.com');
      expect(urlObj.pathname).toBe('/oauth/authorize');
      expect(urlObj.searchParams.get('response_type')).toBe('code');
    });

    test('should handle callback validation after URL generation', () => {
      // Generate URL first
      const url = generateOAuthUrl('date-formatter');
      expect(url).toBeTruthy();
      
      // Then validate a typical callback code
      expect(() => {
        validateOAuthCallback('callback-code-12345');
      }).not.toThrow();
    });

    test('should maintain consistency across multiple OAuth flows', () => {
      // Generate URLs for different app types
      const dfUrl = generateOAuthUrl('date-formatter');
      const usUrl = generateOAuthUrl('url-shortener');
      
      // Both should be valid URLs
      expect(() => new URL(dfUrl)).not.toThrow();
      expect(() => new URL(usUrl)).not.toThrow();
      
      // Both should work with validation
      expect(() => {
        validateOAuthCallback('auth-code-df-12345');
      }).not.toThrow();
      
      expect(() => {
        validateOAuthCallback('auth-code-us-67890');
      }).not.toThrow();
    });
  });

  describe('Performance and reliability', () => {
    test('should generate URLs quickly', () => {
      const start = Date.now();
      
      for (let i = 0; i < 100; i++) {
        generateOAuthUrl(i % 2 === 0 ? 'date-formatter' : 'url-shortener');
      }
      
      const end = Date.now();
      expect(end - start).toBeLessThan(100); // Should take less than 100ms for 100 calls
    });

    test('should validate codes quickly', () => {
      const start = Date.now();
      
      for (let i = 0; i < 1000; i++) {
        validateOAuthCallback(`auth-code-${i}-1234567890`);
      }
      
      const end = Date.now();
      expect(end - start).toBeLessThan(100); // Should take less than 100ms for 1000 calls
    });

    test('should handle memory efficiently with repeated operations', () => {
      // Generate many URLs and validate many codes
      const urls = [];
      for (let i = 0; i < 50; i++) {
        urls.push(generateOAuthUrl('date-formatter'));
        validateOAuthCallback(`auth-code-${i}-1234567890`);
      }
      
      // Should not throw memory errors
      expect(urls.length).toBe(50);
      urls.forEach(url => {
        expect(url).toContain('https://app.hubspot.com/oauth/authorize');
      });
    });
  });
});