/**
 * @jest-environment node
 */

import { getEnvironmentConfig, logEnvironmentInfo, type Environment, type EnvironmentConfig } from '@/lib/config/environment';

// Mock console.log to test logging behavior
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();

describe('environment.ts', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment variables before each test
    process.env = { ...originalEnv };
    mockConsoleLog.mockClear();
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  afterAll(() => {
    // Restore console.log mock after all tests
    mockConsoleLog.mockRestore();
  });

  describe('getEnvironmentConfig', () => {
    describe('Environment Validation', () => {
      test('should throw error for invalid environment - empty string', () => {
        expect(() => getEnvironmentConfig('' as Environment)).toThrow(
          "Invalid environment: . Must be 'dev' or 'prod'"
        );
      });

      test('should throw error for invalid environment - null', () => {
        expect(() => getEnvironmentConfig(null as any)).toThrow(
          "Invalid environment: null. Must be 'dev' or 'prod'"
        );
      });

      test('should throw error for invalid environment - undefined', () => {
        expect(() => getEnvironmentConfig(undefined as any)).toThrow(
          "Invalid environment: undefined. Must be 'dev' or 'prod'"
        );
      });

      test('should throw error for invalid environment - wrong string', () => {
        expect(() => getEnvironmentConfig('production' as Environment)).toThrow(
          "Invalid environment: production. Must be 'dev' or 'prod'"
        );
      });

      test('should throw error for invalid environment - number', () => {
        expect(() => getEnvironmentConfig(1 as any)).toThrow(
          "Invalid environment: 1. Must be 'dev' or 'prod'"
        );
      });

      test('should throw error for invalid environment - case sensitivity', () => {
        expect(() => getEnvironmentConfig('DEV' as Environment)).toThrow(
          "Invalid environment: DEV. Must be 'dev' or 'prod'"
        );
        expect(() => getEnvironmentConfig('PROD' as Environment)).toThrow(
          "Invalid environment: PROD. Must be 'dev' or 'prod'"
        );
      });
    });

    describe('HubSpot Configuration - Dev Environment', () => {
      beforeEach(() => {
        // Set up complete dev environment
        process.env.HUBSPOT_DEV_CLIENT_ID = 'dev_client_123';
        process.env.HUBSPOT_DEV_CLIENT_SECRET = 'dev_secret_456';
        process.env.HUBSPOT_DEV_REDIRECT_URI = 'http://localhost:3000/auth/callback';
        process.env.HUBSPOT_DEV_DEVELOPER_API_KEY = 'dev_api_789';
        process.env.HUBSPOT_DEV_DATE_FORMATTER_APP_ID = 'dev_app_101112';
        process.env.DEV_SUPABASE_URL = 'https://dev-project.supabase.co';
        process.env.DEV_SUPABASE_ANON_KEY = 'dev_anon_key';
        process.env.DEV_SUPABASE_SERVICE_ROLE_KEY = 'dev_service_key';
      });

      test('should return complete dev configuration when all variables present', () => {
        const config = getEnvironmentConfig('dev');

        expect(config).toEqual({
          environment: 'dev',
          hubspot: {
            clientId: 'dev_client_123',
            clientSecret: 'dev_secret_456',
            redirectUri: 'http://localhost:3000/auth/callback',
            developerApiKey: 'dev_api_789',
            dateFormatterAppId: 'dev_app_101112'
          },
          supabase: {
            url: 'https://dev-project.supabase.co',
            anonKey: 'dev_anon_key',
            serviceRoleKey: 'dev_service_key'
          }
        });
      });

      test('should throw error when missing HubSpot CLIENT_ID', () => {
        delete process.env.HUBSPOT_DEV_CLIENT_ID;

        expect(() => getEnvironmentConfig('dev')).toThrow(
          'Missing required HubSpot dev environment variables: HUBSPOT_DEV_CLIENT_ID'
        );
      });

      test('should throw error when missing HubSpot CLIENT_SECRET', () => {
        delete process.env.HUBSPOT_DEV_CLIENT_SECRET;

        expect(() => getEnvironmentConfig('dev')).toThrow(
          'Missing required HubSpot dev environment variables: HUBSPOT_DEV_CLIENT_SECRET'
        );
      });

      test('should throw error when missing multiple HubSpot variables', () => {
        delete process.env.HUBSPOT_DEV_CLIENT_ID;
        delete process.env.HUBSPOT_DEV_DEVELOPER_API_KEY;
        delete process.env.HUBSPOT_DEV_DATE_FORMATTER_APP_ID;

        expect(() => getEnvironmentConfig('dev')).toThrow(
          'Missing required HubSpot dev environment variables: HUBSPOT_DEV_CLIENT_ID, HUBSPOT_DEV_DEVELOPER_API_KEY, HUBSPOT_DEV_DATE_FORMATTER_APP_ID'
        );
      });

      test('should handle field name transformation - developerApiKey', () => {
        delete process.env.HUBSPOT_DEV_DEVELOPER_API_KEY;

        expect(() => getEnvironmentConfig('dev')).toThrow(
          'Missing required HubSpot dev environment variables: HUBSPOT_DEV_DEVELOPER_API_KEY'
        );
      });

      test('should handle field name transformation - dateFormatterAppId', () => {
        delete process.env.HUBSPOT_DEV_DATE_FORMATTER_APP_ID;

        expect(() => getEnvironmentConfig('dev')).toThrow(
          'Missing required HubSpot dev environment variables: HUBSPOT_DEV_DATE_FORMATTER_APP_ID'
        );
      });
    });

    describe('HubSpot Configuration - Prod Environment', () => {
      beforeEach(() => {
        // Set up complete prod environment
        process.env.HUBSPOT_PROD_CLIENT_ID = 'prod_client_123';
        process.env.HUBSPOT_PROD_CLIENT_SECRET = 'prod_secret_456';
        process.env.HUBSPOT_PROD_REDIRECT_URI = 'https://myapp.com/auth/callback';
        process.env.HUBSPOT_PROD_DEVELOPER_API_KEY = 'prod_api_789';
        process.env.HUBSPOT_PROD_DATE_FORMATTER_APP_ID = 'prod_app_101112';
        process.env.PROD_SUPABASE_URL = 'https://prod-project.supabase.co';
        process.env.PROD_SUPABASE_ANON_KEY = 'prod_anon_key';
        process.env.PROD_SUPABASE_SERVICE_ROLE_KEY = 'prod_service_key';
      });

      test('should return complete prod configuration when all variables present', () => {
        const config = getEnvironmentConfig('prod');

        expect(config).toEqual({
          environment: 'prod',
          hubspot: {
            clientId: 'prod_client_123',
            clientSecret: 'prod_secret_456',
            redirectUri: 'https://myapp.com/auth/callback',
            developerApiKey: 'prod_api_789',
            dateFormatterAppId: 'prod_app_101112'
          },
          supabase: {
            url: 'https://prod-project.supabase.co',
            anonKey: 'prod_anon_key',
            serviceRoleKey: 'prod_service_key'
          }
        });
      });

      test('should use PROD prefix for prod environment', () => {
        delete process.env.HUBSPOT_PROD_CLIENT_ID;

        expect(() => getEnvironmentConfig('prod')).toThrow(
          'Missing required HubSpot prod environment variables: HUBSPOT_PROD_CLIENT_ID'
        );
      });
    });

    describe('Supabase Configuration - Dev Environment', () => {
      beforeEach(() => {
        // Set up HubSpot vars to avoid those errors
        process.env.HUBSPOT_DEV_CLIENT_ID = 'dev_client';
        process.env.HUBSPOT_DEV_CLIENT_SECRET = 'dev_secret';
        process.env.HUBSPOT_DEV_REDIRECT_URI = 'http://localhost:3000/callback';
        process.env.HUBSPOT_DEV_DEVELOPER_API_KEY = 'dev_api';
        process.env.HUBSPOT_DEV_DATE_FORMATTER_APP_ID = 'dev_app';
      });

      test('should throw error when missing Supabase URL', () => {
        process.env.DEV_SUPABASE_ANON_KEY = 'anon_key';
        process.env.DEV_SUPABASE_SERVICE_ROLE_KEY = 'service_key';

        expect(() => getEnvironmentConfig('dev')).toThrow(
          'Missing required Supabase dev environment variables: DEV_SUPABASE_URL'
        );
      });

      test('should throw error when missing multiple Supabase variables', () => {
        process.env.DEV_SUPABASE_URL = 'https://test.supabase.co';

        expect(() => getEnvironmentConfig('dev')).toThrow(
          'Missing required Supabase dev environment variables: DEV_SUPABASE_ANON_KEY, DEV_SUPABASE_SERVICE_ROLE_KEY'
        );
      });

      test('should handle field name transformation - serviceRoleKey', () => {
        process.env.DEV_SUPABASE_URL = 'https://test.supabase.co';
        process.env.DEV_SUPABASE_ANON_KEY = 'anon_key';

        expect(() => getEnvironmentConfig('dev')).toThrow(
          'Missing required Supabase dev environment variables: DEV_SUPABASE_SERVICE_ROLE_KEY'
        );
      });
    });

    describe('Supabase Configuration - Prod Environment', () => {
      beforeEach(() => {
        // Set up HubSpot vars to avoid those errors
        process.env.HUBSPOT_PROD_CLIENT_ID = 'prod_client';
        process.env.HUBSPOT_PROD_CLIENT_SECRET = 'prod_secret';
        process.env.HUBSPOT_PROD_REDIRECT_URI = 'https://app.com/callback';
        process.env.HUBSPOT_PROD_DEVELOPER_API_KEY = 'prod_api';
        process.env.HUBSPOT_PROD_DATE_FORMATTER_APP_ID = 'prod_app';
      });

      test('should use PROD prefix for prod Supabase config', () => {
        process.env.PROD_SUPABASE_ANON_KEY = 'anon_key';
        process.env.PROD_SUPABASE_SERVICE_ROLE_KEY = 'service_key';

        expect(() => getEnvironmentConfig('prod')).toThrow(
          'Missing required Supabase prod environment variables: PROD_SUPABASE_URL'
        );
      });
    });

    describe('Edge Cases and Boundary Conditions', () => {
      test('should treat empty string as missing variable', () => {
        process.env.HUBSPOT_DEV_CLIENT_ID = '';
        process.env.HUBSPOT_DEV_CLIENT_SECRET = 'secret';
        process.env.HUBSPOT_DEV_REDIRECT_URI = 'uri';
        process.env.HUBSPOT_DEV_DEVELOPER_API_KEY = 'key';
        process.env.HUBSPOT_DEV_DATE_FORMATTER_APP_ID = 'app';
        process.env.DEV_SUPABASE_URL = 'url';
        process.env.DEV_SUPABASE_ANON_KEY = 'anon';
        process.env.DEV_SUPABASE_SERVICE_ROLE_KEY = 'service';

        expect(() => getEnvironmentConfig('dev')).toThrow(
          'Missing required HubSpot dev environment variables: HUBSPOT_DEV_CLIENT_ID'
        );
      });

      test('should accept whitespace-only string as valid (current behavior)', () => {
        process.env.HUBSPOT_DEV_CLIENT_ID = '   ';
        process.env.HUBSPOT_DEV_CLIENT_SECRET = 'secret';
        process.env.HUBSPOT_DEV_REDIRECT_URI = 'uri';
        process.env.HUBSPOT_DEV_DEVELOPER_API_KEY = 'key';
        process.env.HUBSPOT_DEV_DATE_FORMATTER_APP_ID = 'app';
        process.env.DEV_SUPABASE_URL = 'url';
        process.env.DEV_SUPABASE_ANON_KEY = 'anon';
        process.env.DEV_SUPABASE_SERVICE_ROLE_KEY = 'service';

        const config = getEnvironmentConfig('dev');
        expect(config.hubspot.clientId).toBe('   ');
      });

      test('should handle Unicode characters in environment variables', () => {
        process.env.HUBSPOT_DEV_CLIENT_ID = 'client_测试_123';
        process.env.HUBSPOT_DEV_CLIENT_SECRET = 'secret_🔑_456';
        process.env.HUBSPOT_DEV_REDIRECT_URI = 'http://localhost:3000/测试';
        process.env.HUBSPOT_DEV_DEVELOPER_API_KEY = 'api_ключ_789';
        process.env.HUBSPOT_DEV_DATE_FORMATTER_APP_ID = 'app_アプリ_101';
        process.env.DEV_SUPABASE_URL = 'https://test-项目.supabase.co';
        process.env.DEV_SUPABASE_ANON_KEY = 'anon_匿名_key';
        process.env.DEV_SUPABASE_SERVICE_ROLE_KEY = 'service_サービス_key';

        const config = getEnvironmentConfig('dev');

        expect(config.hubspot.clientId).toBe('client_测试_123');
        expect(config.hubspot.clientSecret).toBe('secret_🔑_456');
        expect(config.supabase.url).toBe('https://test-项目.supabase.co');
      });

      test('should handle newlines in environment variables', () => {
        process.env.HUBSPOT_DEV_CLIENT_ID = 'client\nwith\nnewlines';
        process.env.HUBSPOT_DEV_CLIENT_SECRET = 'secret';
        process.env.HUBSPOT_DEV_REDIRECT_URI = 'uri';
        process.env.HUBSPOT_DEV_DEVELOPER_API_KEY = 'key';
        process.env.HUBSPOT_DEV_DATE_FORMATTER_APP_ID = 'app';
        process.env.DEV_SUPABASE_URL = 'url';
        process.env.DEV_SUPABASE_ANON_KEY = 'anon';
        process.env.DEV_SUPABASE_SERVICE_ROLE_KEY = 'service';

        const config = getEnvironmentConfig('dev');
        expect(config.hubspot.clientId).toBe('client\nwith\nnewlines');
      });
    });

    describe('Environment Isolation', () => {
      test('should not cross-contaminate dev and prod configurations', () => {
        // Set up only dev variables
        process.env.HUBSPOT_DEV_CLIENT_ID = 'dev_client';
        process.env.HUBSPOT_DEV_CLIENT_SECRET = 'dev_secret';
        process.env.HUBSPOT_DEV_REDIRECT_URI = 'dev_uri';
        process.env.HUBSPOT_DEV_DEVELOPER_API_KEY = 'dev_key';
        process.env.HUBSPOT_DEV_DATE_FORMATTER_APP_ID = 'dev_app';
        process.env.DEV_SUPABASE_URL = 'dev_url';
        process.env.DEV_SUPABASE_ANON_KEY = 'dev_anon';
        process.env.DEV_SUPABASE_SERVICE_ROLE_KEY = 'dev_service';

        // Should work for dev
        expect(() => getEnvironmentConfig('dev')).not.toThrow();

        // Should fail for prod
        expect(() => getEnvironmentConfig('prod')).toThrow(
          'Missing required HubSpot prod environment variables'
        );
      });

      test('should switch environments correctly in same process', () => {
        // Set up both environments
        process.env.HUBSPOT_DEV_CLIENT_ID = 'dev_client';
        process.env.HUBSPOT_DEV_CLIENT_SECRET = 'dev_secret';
        process.env.HUBSPOT_DEV_REDIRECT_URI = 'dev_uri';
        process.env.HUBSPOT_DEV_DEVELOPER_API_KEY = 'dev_key';
        process.env.HUBSPOT_DEV_DATE_FORMATTER_APP_ID = 'dev_app';
        process.env.DEV_SUPABASE_URL = 'dev_url';
        process.env.DEV_SUPABASE_ANON_KEY = 'dev_anon';
        process.env.DEV_SUPABASE_SERVICE_ROLE_KEY = 'dev_service';

        process.env.HUBSPOT_PROD_CLIENT_ID = 'prod_client';
        process.env.HUBSPOT_PROD_CLIENT_SECRET = 'prod_secret';
        process.env.HUBSPOT_PROD_REDIRECT_URI = 'prod_uri';
        process.env.HUBSPOT_PROD_DEVELOPER_API_KEY = 'prod_key';
        process.env.HUBSPOT_PROD_DATE_FORMATTER_APP_ID = 'prod_app';
        process.env.PROD_SUPABASE_URL = 'prod_url';
        process.env.PROD_SUPABASE_ANON_KEY = 'prod_anon';
        process.env.PROD_SUPABASE_SERVICE_ROLE_KEY = 'prod_service';

        const devConfig = getEnvironmentConfig('dev');
        const prodConfig = getEnvironmentConfig('prod');

        expect(devConfig.hubspot.clientId).toBe('dev_client');
        expect(prodConfig.hubspot.clientId).toBe('prod_client');
        expect(devConfig.supabase.url).toBe('dev_url');
        expect(prodConfig.supabase.url).toBe('prod_url');
      });
    });
  });

  describe('logEnvironmentInfo', () => {
    beforeEach(() => {
      mockConsoleLog.mockClear();
    });

    describe('Safe Logging - No Secret Exposure', () => {
      test('should safely log dev environment info without exposing secrets', () => {
        process.env.HUBSPOT_DEV_DATE_FORMATTER_APP_ID = '12345678901234567890';
        process.env.DEV_SUPABASE_URL = 'https://abcdefghijklmnop.supabase.co';

        logEnvironmentInfo('dev');

        expect(mockConsoleLog).toHaveBeenCalledWith('🔧 Environment: DEV');
        expect(mockConsoleLog).toHaveBeenCalledWith('   HubSpot App ID: 12345678...');
        expect(mockConsoleLog).toHaveBeenCalledWith('   Supabase Project: abcdefghijklmnop...');
      });

      test('should safely log prod environment info without exposing secrets', () => {
        process.env.HUBSPOT_PROD_DATE_FORMATTER_APP_ID = '98765432109876543210';
        process.env.PROD_SUPABASE_URL = 'https://zyxwvutsrqponmlk.supabase.co';

        logEnvironmentInfo('prod');

        expect(mockConsoleLog).toHaveBeenCalledWith('🔧 Environment: PROD');
        expect(mockConsoleLog).toHaveBeenCalledWith('   HubSpot App ID: 98765432...');
        expect(mockConsoleLog).toHaveBeenCalledWith('   Supabase Project: zyxwvutsrqponmlk...');
      });

      test('should handle short App ID gracefully', () => {
        process.env.HUBSPOT_DEV_DATE_FORMATTER_APP_ID = '123';
        process.env.DEV_SUPABASE_URL = 'https://test.supabase.co';

        logEnvironmentInfo('dev');

        expect(mockConsoleLog).toHaveBeenCalledWith('   HubSpot App ID: 123...');
      });

      test('should handle exactly 8 character App ID', () => {
        process.env.HUBSPOT_DEV_DATE_FORMATTER_APP_ID = '12345678';
        process.env.DEV_SUPABASE_URL = 'https://test.supabase.co';

        logEnvironmentInfo('dev');

        expect(mockConsoleLog).toHaveBeenCalledWith('   HubSpot App ID: 12345678...');
      });
    });

    describe('Supabase URL Parsing', () => {
      test('should extract project name from standard Supabase URL', () => {
        process.env.HUBSPOT_DEV_DATE_FORMATTER_APP_ID = '12345678';
        process.env.DEV_SUPABASE_URL = 'https://myprojectname.supabase.co';

        logEnvironmentInfo('dev');

        expect(mockConsoleLog).toHaveBeenCalledWith('   Supabase Project: myprojectname...');
      });

      test('should handle custom Supabase domain', () => {
        process.env.HUBSPOT_DEV_DATE_FORMATTER_APP_ID = '12345678';
        process.env.DEV_SUPABASE_URL = 'https://custom-domain.example.com';

        logEnvironmentInfo('dev');

        expect(mockConsoleLog).toHaveBeenCalledWith('   Supabase Project: custom-domain...');
      });

      test('should handle URL with path', () => {
        process.env.HUBSPOT_DEV_DATE_FORMATTER_APP_ID = '12345678';
        process.env.DEV_SUPABASE_URL = 'https://myproject.supabase.co/rest/v1';

        logEnvironmentInfo('dev');

        expect(mockConsoleLog).toHaveBeenCalledWith('   Supabase Project: myproject...');
      });

      test('should handle malformed URL gracefully', () => {
        process.env.HUBSPOT_DEV_DATE_FORMATTER_APP_ID = '12345678';
        process.env.DEV_SUPABASE_URL = 'not-a-url';

        logEnvironmentInfo('dev');

        // Should not throw, but might log undefined safely
        expect(mockConsoleLog).toHaveBeenCalledTimes(3);
      });
    });

    describe('Missing Values Handling', () => {
      test('should handle missing App ID gracefully', () => {
        process.env.DEV_SUPABASE_URL = 'https://test.supabase.co';

        logEnvironmentInfo('dev');

        expect(mockConsoleLog).toHaveBeenCalledWith('🔧 Environment: DEV');
        expect(mockConsoleLog).toHaveBeenCalledWith('   HubSpot App ID: undefined...');
      });

      test('should handle missing Supabase URL gracefully', () => {
        process.env.HUBSPOT_DEV_DATE_FORMATTER_APP_ID = '12345678';

        logEnvironmentInfo('dev');

        expect(mockConsoleLog).toHaveBeenCalledWith('🔧 Environment: DEV');
        expect(mockConsoleLog).toHaveBeenCalledWith('   HubSpot App ID: 12345678...');
        // Should handle undefined URL without crashing
        expect(mockConsoleLog).toHaveBeenCalledTimes(3);
      });

      test('should handle both missing values gracefully', () => {
        logEnvironmentInfo('dev');

        expect(mockConsoleLog).toHaveBeenCalledWith('🔧 Environment: DEV');
        expect(mockConsoleLog).toHaveBeenCalledTimes(3);
      });
    });

    describe('Consistent Output Formatting', () => {
      test('should maintain consistent log format across calls', () => {
        process.env.HUBSPOT_PROD_DATE_FORMATTER_APP_ID = '11111111';
        process.env.PROD_SUPABASE_URL = 'https://production.supabase.co';

        logEnvironmentInfo('prod');

        expect(mockConsoleLog).toHaveBeenNthCalledWith(1, '🔧 Environment: PROD');
        expect(mockConsoleLog).toHaveBeenNthCalledWith(2, '   HubSpot App ID: 11111111...');
        expect(mockConsoleLog).toHaveBeenNthCalledWith(3, '   Supabase Project: production...');
      });

      test('should use proper spacing and emoji consistently', () => {
        process.env.HUBSPOT_DEV_DATE_FORMATTER_APP_ID = '22222222';
        process.env.DEV_SUPABASE_URL = 'https://test.supabase.co';

        logEnvironmentInfo('dev');

        const calls = mockConsoleLog.mock.calls;
        expect(calls[0][0]).toBe('🔧 Environment: DEV');
        expect(calls[1][0]).toBe('   HubSpot App ID: 22222222...');
        expect(calls[2][0]).toBe('   Supabase Project: test...');
      });
    });
  });
});