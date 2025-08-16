/**
 * @jest-environment node
 */

import { readFileSync, existsSync } from 'fs';
import { ConfigLoader, type AppConfig } from '@/lib/config/config-loader';

// Mock fs functions
jest.mock('fs', () => ({
  readFileSync: jest.fn(),
  existsSync: jest.fn(),
}));

const mockReadFileSync = readFileSync as jest.MockedFunction<typeof readFileSync>;
const mockExistsSync = existsSync as jest.MockedFunction<typeof existsSync>;

describe('ConfigLoader - Environment-First Loading', () => {
  const originalEnv = process.env;

  // Mock configuration data
  const mockConfig: AppConfig = {
    hubspot: {
      shared: {
        redirectUri: 'http://localhost:3000/api/auth/hubspot/callback',
        developerApiKey: 'test_api_key',
      },
      apps: {
        'date-formatter': {
          appId: 'test_df_app_id',
          clientId: 'test_df_client_id',
          clientSecret: 'test_df_client_secret',
        },
        'url-shortener': {
          appId: 'test_us_app_id',
          clientId: 'test_us_client_id',
          clientSecret: 'test_us_client_secret',
        },
      },
    },
    supabase: {
      url: 'https://test-project.supabase.co',
      anonKey: 'test_anon_key',
      serviceRoleKey: 'test_service_role_key',
    },
    application: {
      nextjsUrl: 'http://localhost:3000',
      encryptionKey: 'test_encryption_key_32_characters',
      nextAuthSecret: 'test_nextauth_secret',
      cronSecret: 'test_cron_secret',
    },
  };

  const mockConfigJson = JSON.stringify(mockConfig);
  const mockConfigBase64 = Buffer.from(mockConfigJson, 'utf-8').toString('base64');

  beforeEach(() => {
    // Reset environment
    process.env = { ...originalEnv };
    delete process.env.VERCEL_DEV_CONFIG_JSON;
    delete process.env.VERCEL_PROD_CONFIG_JSON;
    
    // Clear cache and mocks
    ConfigLoader.clearCache();
    jest.clearAllMocks();

    // Default mock behaviors
    mockExistsSync.mockReturnValue(false);
    mockReadFileSync.mockReturnValue('{}');
  });

  afterEach(() => {
    process.env = originalEnv;
    ConfigLoader.clearCache();
  });

  describe('Environment-First Loading Priority', () => {
    test('should load from environment variable first when both env var and file exist', () => {
      // Setup: both environment variable and file exist
      process.env.VERCEL_DEV_CONFIG_JSON = mockConfigBase64;
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue(JSON.stringify({ different: 'config' }));

      const config = ConfigLoader.loadConfig('dev');

      expect(config).toEqual(mockConfig);
      expect(mockExistsSync).not.toHaveBeenCalled(); // Should not check file existence
      expect(mockReadFileSync).not.toHaveBeenCalled(); // Should not read file
    });

    test('should fallback to file when environment variable does not exist', () => {
      // Setup: no environment variable, file exists
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue(mockConfigJson);

      const config = ConfigLoader.loadConfig('dev');

      expect(config).toEqual(mockConfig);
      expect(mockExistsSync).toHaveBeenCalledWith(expect.stringContaining('dev.json'));
      expect(mockReadFileSync).toHaveBeenCalledWith(expect.stringContaining('dev.json'), 'utf-8');
    });

    test('should throw error when neither environment variable nor file exist', () => {
      // Setup: no environment variable, no file
      mockExistsSync.mockReturnValue(false);

      expect(() => ConfigLoader.loadConfig('dev')).toThrow(
        'No configuration found for environment \'dev\':\n' +
        '  - Environment variable: VERCEL_DEV_CONFIG_JSON not set or invalid\n' +
        '  - File: config/credentials/dev.json not found or invalid'
      );
    });
  });

  describe('Environment Variable Loading', () => {
    test('should load dev config from VERCEL_DEV_CONFIG_JSON', () => {
      process.env.VERCEL_DEV_CONFIG_JSON = mockConfigBase64;

      const config = ConfigLoader.loadConfig('dev');

      expect(config).toEqual(mockConfig);
    });

    test('should load prod config from VERCEL_PROD_CONFIG_JSON', () => {
      process.env.VERCEL_PROD_CONFIG_JSON = mockConfigBase64;

      const config = ConfigLoader.loadConfig('prod');

      expect(config).toEqual(mockConfig);
    });

    test('should handle invalid base64 in environment variable gracefully', () => {
      process.env.VERCEL_DEV_CONFIG_JSON = 'invalid-base64!@#';
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue(mockConfigJson);

      // Should fallback to file
      const config = ConfigLoader.loadConfig('dev');
      expect(config).toEqual(mockConfig);
      expect(mockReadFileSync).toHaveBeenCalled();
    });

    test('should handle invalid JSON in environment variable gracefully', () => {
      const invalidJson = Buffer.from('invalid json', 'utf-8').toString('base64');
      process.env.VERCEL_DEV_CONFIG_JSON = invalidJson;
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue(mockConfigJson);

      // Should fallback to file
      const config = ConfigLoader.loadConfig('dev');
      expect(config).toEqual(mockConfig);
      expect(mockReadFileSync).toHaveBeenCalled();
    });
  });

  describe('File Loading (Fallback)', () => {
    test('should load config from dev.json when environment variable not set', () => {
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue(mockConfigJson);

      const config = ConfigLoader.loadConfig('dev');

      expect(config).toEqual(mockConfig);
      expect(mockExistsSync).toHaveBeenCalledWith(expect.stringContaining('dev.json'));
    });

    test('should load config from prod.json when environment variable not set', () => {
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue(mockConfigJson);

      const config = ConfigLoader.loadConfig('prod');

      expect(config).toEqual(mockConfig);
      expect(mockExistsSync).toHaveBeenCalledWith(expect.stringContaining('prod.json'));
    });

    test('should handle file parsing errors gracefully', () => {
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue('invalid json');

      expect(() => ConfigLoader.loadConfig('dev')).toThrow();
    });
  });

  describe('Source Tracking', () => {
    test('should track environment as source when loaded from env var', () => {
      process.env.VERCEL_DEV_CONFIG_JSON = mockConfigBase64;

      ConfigLoader.loadConfig('dev');
      const source = ConfigLoader.getConfigSource();

      expect(source).toBe('environment');
    });

    test('should track file as source when loaded from file', () => {
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue(mockConfigJson);

      ConfigLoader.loadConfig('dev');
      const source = ConfigLoader.getConfigSource();

      expect(source).toBe('file');
    });

    test('should track none as source when loading fails', () => {
      mockExistsSync.mockReturnValue(false);

      try {
        ConfigLoader.loadConfig('dev');
      } catch {
        // Expected to throw
      }

      const source = ConfigLoader.getConfigSource();
      expect(source).toBe('none');
    });
  });

  describe('Configuration Validation', () => {
    test('should validate configuration structure', () => {
      const incompleteConfig = {
        hubspot: {
          shared: {
            redirectUri: 'test',
            // missing developerApiKey
          },
          apps: {},
        },
      };

      process.env.VERCEL_DEV_CONFIG_JSON = Buffer.from(JSON.stringify(incompleteConfig), 'utf-8').toString('base64');

      expect(() => ConfigLoader.loadConfig('dev')).toThrow('hubspot.shared.developerApiKey is required');
    });

    test('should validate all required hubspot app configurations', () => {
      const configMissingApps = {
        ...mockConfig,
        hubspot: {
          ...mockConfig.hubspot,
          apps: {
            'date-formatter': mockConfig.hubspot.apps['date-formatter'],
            // missing url-shortener
          },
        },
      };

      process.env.VERCEL_DEV_CONFIG_JSON = Buffer.from(JSON.stringify(configMissingApps), 'utf-8').toString('base64');

      expect(() => ConfigLoader.loadConfig('dev')).toThrow('hubspot.apps.url-shortener configuration is required');
    });
  });

  describe('Caching Behavior', () => {
    test('should cache configuration after first load', () => {
      process.env.VERCEL_DEV_CONFIG_JSON = mockConfigBase64;

      const config1 = ConfigLoader.loadConfig('dev');
      const config2 = ConfigLoader.loadConfig('dev');

      expect(config1).toBe(config2); // Same reference
    });

    test('should cache configurations separately for dev and prod', () => {
      process.env.VERCEL_DEV_CONFIG_JSON = mockConfigBase64;
      process.env.VERCEL_PROD_CONFIG_JSON = mockConfigBase64;

      const devConfig = ConfigLoader.loadConfig('dev');
      const prodConfig = ConfigLoader.loadConfig('prod');

      expect(devConfig).toEqual(prodConfig); // Same content
      expect(devConfig).not.toBe(prodConfig); // Different references
    });

    test('should clear cache when clearCache is called', () => {
      process.env.VERCEL_DEV_CONFIG_JSON = mockConfigBase64;

      ConfigLoader.loadConfig('dev');
      ConfigLoader.clearCache();

      // Should reload from source
      const config = ConfigLoader.loadConfig('dev');
      expect(config).toEqual(mockConfig);
    });
  });

  describe('Error Handling', () => {
    test('should provide detailed error when both sources fail', () => {
      mockExistsSync.mockReturnValue(false);

      expect(() => ConfigLoader.loadConfig('dev')).toThrow(
        'No configuration found for environment \'dev\':\n' +
        '  - Environment variable: VERCEL_DEV_CONFIG_JSON not set or invalid\n' +
        '  - File: config/credentials/dev.json not found or invalid'
      );
    });

    test('should handle file system errors gracefully', () => {
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockImplementation(() => {
        throw new Error('Permission denied');
      });

      expect(() => ConfigLoader.loadConfig('dev')).toThrow();
    });
  });

  describe('Performance Characteristics', () => {
    test('should not check file existence when environment variable is present', () => {
      process.env.VERCEL_DEV_CONFIG_JSON = mockConfigBase64;

      ConfigLoader.loadConfig('dev');

      expect(mockExistsSync).not.toHaveBeenCalled();
      expect(mockReadFileSync).not.toHaveBeenCalled();
    });

    test('should check file existence before attempting to read', () => {
      mockExistsSync.mockReturnValue(false);

      try {
        ConfigLoader.loadConfig('dev');
      } catch {
        // Expected to throw
      }

      expect(mockExistsSync).toHaveBeenCalled();
      expect(mockReadFileSync).not.toHaveBeenCalled();
    });
  });
});