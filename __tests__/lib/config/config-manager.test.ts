/**
 * @jest-environment node
 */

import { ConfigManager } from '@/lib/config/config-manager';
import { ConfigLoader, type AppConfig } from '@/lib/config/config-loader';

// Mock ConfigLoader to control what config is returned
jest.mock('@/lib/config/config-loader', () => ({
  ConfigLoader: {
    loadConfig: jest.fn(),
    clearCache: jest.fn(),
    getConfigSource: jest.fn(),
  },
}));

const mockConfigLoader = ConfigLoader as jest.Mocked<typeof ConfigLoader>;

describe('ConfigManager', () => {
  const originalProcessArgv = process.argv;
  const originalNodeEnv = process.env.NODE_ENV;

  // Mock configuration data
  const mockDevConfig: AppConfig = {
    hubspot: {
      shared: {
        redirectUri: 'http://localhost:3000/api/auth/hubspot/callback',
        developerApiKey: 'dev_api_key_12345',
      },
      apps: {
        'date-formatter': {
          appId: 'dev_df_app_id',
          clientId: 'dev_df_client_id',
          clientSecret: 'dev_df_client_secret',
        },
        'url-shortener': {
          appId: 'dev_us_app_id',
          clientId: 'dev_us_client_id',
          clientSecret: 'dev_us_client_secret',
        },
      },
    },
    supabase: {
      url: 'https://dev-project.supabase.co',
      anonKey: 'dev_anon_key',
      serviceRoleKey: 'dev_service_role_key',
    },
    application: {
      nextjsUrl: 'http://localhost:3000',
      encryptionKey: 'dev_encryption_key_32_characters',
      nextAuthSecret: 'dev_nextauth_secret',
      cronSecret: 'dev_cron_secret',
    },
  };

  const mockProdConfig: AppConfig = {
    hubspot: {
      shared: {
        redirectUri: 'https://production.com/api/auth/hubspot/callback',
        developerApiKey: 'prod_api_key_12345',
      },
      apps: {
        'date-formatter': {
          appId: 'prod_df_app_id',
          clientId: 'prod_df_client_id',
          clientSecret: 'prod_df_client_secret',
        },
        'url-shortener': {
          appId: 'prod_us_app_id',
          clientId: 'prod_us_client_id',
          clientSecret: 'prod_us_client_secret',
        },
      },
    },
    supabase: {
      url: 'https://prod-project.supabase.co',
      anonKey: 'prod_anon_key',
      serviceRoleKey: 'prod_service_role_key',
    },
    application: {
      nextjsUrl: 'https://production.com',
      encryptionKey: 'prod_encryption_key_32_characters',
      nextAuthSecret: 'prod_nextauth_secret',
      cronSecret: 'prod_cron_secret',
    },
  };

  beforeEach(() => {
    // Reset ConfigManager state before each test
    ConfigManager.__resetForTesting();
    
    // Clear all mocks
    jest.clearAllMocks();
    
    // Setup default mock behavior
    mockConfigLoader.loadConfig.mockImplementation((env) => {
      if (env === 'dev') return mockDevConfig;
      if (env === 'prod') return mockProdConfig;
      throw new Error(`Unknown environment: ${env}`);
    });
    mockConfigLoader.getConfigSource.mockReturnValue('file');
  });

  afterEach(() => {
    // Restore original values
    process.argv = originalProcessArgv;
    process.env.NODE_ENV = originalNodeEnv;
    
    // Reset for next test
    ConfigManager.__resetForTesting();
  });

  describe('Environment Detection', () => {
    test('should detect dev environment from command line args', () => {
      process.argv = ['node', 'script.js', 'dev'];
      process.env.NODE_ENV = 'production'; // Should be overridden by argv
      
      const env = ConfigManager.getCurrentEnvironment();
      expect(env).toBe('dev');
    });

    test('should detect prod environment from command line args', () => {
      process.argv = ['node', 'script.js', 'prod'];
      process.env.NODE_ENV = 'development'; // Should be overridden by argv
      
      const env = ConfigManager.getCurrentEnvironment();
      expect(env).toBe('prod');
    });

    test('should use NODE_ENV when no command line args present', () => {
      process.argv = ['node', 'script.js'];
      process.env.NODE_ENV = 'production';
      
      const env = ConfigManager.getCurrentEnvironment();
      expect(env).toBe('prod');
    });

    test('should default to dev when neither argv nor NODE_ENV specify environment', () => {
      process.argv = ['node', 'script.js'];
      delete process.env.NODE_ENV;
      
      const env = ConfigManager.getCurrentEnvironment();
      expect(env).toBe('dev');
    });

    test('should prioritize command line args over NODE_ENV', () => {
      process.argv = ['node', 'script.js', 'dev'];
      process.env.NODE_ENV = 'production';
      
      const env = ConfigManager.getCurrentEnvironment();
      expect(env).toBe('dev');
    });

    test('should warn for unknown NODE_ENV values and default to dev', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      process.argv = ['node', 'script.js'];
      process.env.NODE_ENV = 'test';
      
      const env = ConfigManager.getCurrentEnvironment();
      expect(env).toBe('dev');
      expect(consoleSpy).toHaveBeenCalledWith("Unknown NODE_ENV 'test', defaulting to dev");
      
      consoleSpy.mockRestore();
    });
  });

  describe('Configuration Loading', () => {
    test('should load dev configuration when environment is dev', () => {
      process.argv = ['node', 'script.js', 'dev'];
      
      const config = ConfigManager.getConfig();
      
      expect(mockConfigLoader.loadConfig).toHaveBeenCalledWith('dev');
      expect(config).toEqual(mockDevConfig);
    });

    test('should load prod configuration when environment is prod', () => {
      process.argv = ['node', 'script.js', 'prod'];
      
      const config = ConfigManager.getConfig();
      
      expect(mockConfigLoader.loadConfig).toHaveBeenCalledWith('prod');
      expect(config).toEqual(mockProdConfig);
    });

    test('should cache configuration after first load', () => {
      process.argv = ['node', 'script.js', 'dev'];
      
      const config1 = ConfigManager.getConfig();
      const config2 = ConfigManager.getConfig();
      
      expect(mockConfigLoader.loadConfig).toHaveBeenCalledTimes(1);
      expect(config1).toBe(config2); // Same reference
    });

    test('should handle ConfigLoader errors gracefully', () => {
      const error = new Error('Configuration file not found');
      mockConfigLoader.loadConfig.mockImplementation(() => {
        throw error;
      });
      
      expect(() => ConfigManager.getConfig()).toThrow('Configuration file not found');
    });
  });

  describe('HubSpot Configuration Access', () => {
    beforeEach(() => {
      process.argv = ['node', 'script.js', 'dev'];
    });

    test('should return complete HubSpot configuration', () => {
      const hubspotConfig = ConfigManager.getHubSpotConfig();
      
      expect(hubspotConfig).toEqual(mockDevConfig.hubspot);
      expect(hubspotConfig.shared.redirectUri).toBe('http://localhost:3000/api/auth/hubspot/callback');
      expect(hubspotConfig.apps['date-formatter'].clientId).toBe('dev_df_client_id');
    });

    test('should return date-formatter client ID by default', () => {
      const clientId = ConfigManager.getHubSpotClientId();
      expect(clientId).toBe('dev_df_client_id');
    });

    test('should return url-shortener client ID when specified', () => {
      const clientId = ConfigManager.getHubSpotClientId('url-shortener');
      expect(clientId).toBe('dev_us_client_id');
    });

    test('should return date-formatter client secret by default', () => {
      const clientSecret = ConfigManager.getHubSpotClientSecret();
      expect(clientSecret).toBe('dev_df_client_secret');
    });

    test('should return url-shortener client secret when specified', () => {
      const clientSecret = ConfigManager.getHubSpotClientSecret('url-shortener');
      expect(clientSecret).toBe('dev_us_client_secret');
    });

    test('should return date-formatter app ID by default', () => {
      const appId = ConfigManager.getHubSpotAppId();
      expect(appId).toBe('dev_df_app_id');
    });

    test('should return url-shortener app ID when specified', () => {
      const appId = ConfigManager.getHubSpotAppId('url-shortener');
      expect(appId).toBe('dev_us_app_id');
    });

    test('should return redirect URI', () => {
      const redirectUri = ConfigManager.getHubSpotRedirectUri();
      expect(redirectUri).toBe('http://localhost:3000/api/auth/hubspot/callback');
    });

    test('should return developer API key', () => {
      const apiKey = ConfigManager.getHubSpotDeveloperApiKey();
      expect(apiKey).toBe('dev_api_key_12345');
    });

    test('should throw error for unknown app type', () => {
      expect(() => {
        ConfigManager.getHubSpotClientId('unknown-app' as any);
      }).toThrow('No configuration found for app: unknown-app');
    });
  });

  describe('Supabase Configuration Access', () => {
    beforeEach(() => {
      process.argv = ['node', 'script.js', 'dev'];
    });

    test('should return complete Supabase configuration', () => {
      const supabaseConfig = ConfigManager.getSupabaseConfig();
      
      expect(supabaseConfig).toEqual(mockDevConfig.supabase);
      expect(supabaseConfig.url).toBe('https://dev-project.supabase.co');
      expect(supabaseConfig.anonKey).toBe('dev_anon_key');
      expect(supabaseConfig.serviceRoleKey).toBe('dev_service_role_key');
    });
  });

  describe('Application Configuration Access', () => {
    beforeEach(() => {
      process.argv = ['node', 'script.js', 'dev'];
    });

    test('should return complete application configuration', () => {
      const appConfig = ConfigManager.getApplicationConfig();
      
      expect(appConfig).toEqual(mockDevConfig.application);
    });

    test('should return Next.js URL', () => {
      const url = ConfigManager.getNextjsUrl();
      expect(url).toBe('http://localhost:3000');
    });

    test('should return encryption key', () => {
      const key = ConfigManager.getEncryptionKey();
      expect(key).toBe('dev_encryption_key_32_characters');
    });

    test('should return NextAuth secret', () => {
      const secret = ConfigManager.getNextAuthSecret();
      expect(secret).toBe('dev_nextauth_secret');
    });

    test('should return cron secret', () => {
      const secret = ConfigManager.getCronSecret();
      expect(secret).toBe('dev_cron_secret');
    });
  });

  describe('Environment-Specific Configuration', () => {
    test('should return different configurations for different environments', () => {
      // Test dev environment
      process.argv = ['node', 'script.js', 'dev'];
      ConfigManager.__resetForTesting();
      
      const devUrl = ConfigManager.getNextjsUrl();
      expect(devUrl).toBe('http://localhost:3000');
      
      // Test prod environment
      process.argv = ['node', 'script.js', 'prod'];
      ConfigManager.__resetForTesting();
      
      const prodUrl = ConfigManager.getNextjsUrl();
      expect(prodUrl).toBe('https://production.com');
    });

    test('should call ConfigLoader with correct environment', () => {
      process.env.NODE_ENV = 'production';
      process.argv = ['node', 'script.js'];
      
      ConfigManager.getConfig();
      
      expect(mockConfigLoader.loadConfig).toHaveBeenCalledWith('prod');
    });
  });

  describe('Testing Utilities', () => {
    test('should reset configuration cache for testing', () => {
      // Load config first
      ConfigManager.getConfig();
      expect(mockConfigLoader.loadConfig).toHaveBeenCalledTimes(1);
      
      // Reset and load again
      ConfigManager.__resetForTesting();
      ConfigManager.getConfig();
      
      expect(mockConfigLoader.loadConfig).toHaveBeenCalledTimes(2);
      expect(mockConfigLoader.clearCache).toHaveBeenCalled();
    });
  });

  describe('Configuration Source Tracking', () => {
    test('should return configuration source from ConfigLoader', () => {
      mockConfigLoader.getConfigSource.mockReturnValue('environment');
      
      const source = ConfigManager.getConfigSource();
      
      expect(source).toBe('environment');
      expect(mockConfigLoader.getConfigSource).toHaveBeenCalled();
    });

    test('should handle different source types', () => {
      const sources: Array<'environment' | 'file' | 'none'> = ['environment', 'file', 'none'];
      
      sources.forEach(source => {
        mockConfigLoader.getConfigSource.mockReturnValue(source);
        expect(ConfigManager.getConfigSource()).toBe(source);
      });
    });
  });

  describe('Error Handling', () => {
    test('should propagate ConfigLoader validation errors', () => {
      const validationError = new Error('Invalid configuration for environment \'dev\':\n  - hubspot.shared.redirectUri is required');
      mockConfigLoader.loadConfig.mockImplementation(() => {
        throw validationError;
      });
      
      expect(() => ConfigManager.getConfig()).toThrow(validationError.message);
    });

    test('should propagate ConfigLoader file not found errors', () => {
      const fileError = new Error('Configuration file not found: config/credentials/dev.json');
      mockConfigLoader.loadConfig.mockImplementation(() => {
        throw fileError;
      });
      
      expect(() => ConfigManager.getConfig()).toThrow(fileError.message);
    });

    test('should handle missing app configuration gracefully', () => {
      const incompleteConfig = {
        ...mockDevConfig,
        hubspot: {
          ...mockDevConfig.hubspot,
          apps: {
            'date-formatter': mockDevConfig.hubspot.apps['date-formatter'],
            // url-shortener is missing
          },
        },
      };
      
      mockConfigLoader.loadConfig.mockReturnValue(incompleteConfig);
      
      expect(() => {
        ConfigManager.getHubSpotClientId('url-shortener');
      }).toThrow('No configuration found for app: url-shortener');
    });
  });

  describe('Edge Cases', () => {
    test('should handle multiple command line arguments', () => {
      process.argv = ['node', 'script.js', 'dev', 'prod', 'extra'];
      
      const env = ConfigManager.getCurrentEnvironment();
      expect(env).toBe('dev'); // First match wins
    });

    test('should handle empty process.argv', () => {
      process.argv = [];
      delete process.env.NODE_ENV;
      
      const env = ConfigManager.getCurrentEnvironment();
      expect(env).toBe('dev'); // Default fallback
    });

    test('should handle undefined console.warn gracefully', () => {
      const originalWarn = console.warn;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (console as any).warn = undefined;
      
      process.argv = ['node', 'script.js'];
      process.env.NODE_ENV = 'test';
      
      // Should not throw
      expect(() => {
        ConfigManager.getCurrentEnvironment();
      }).not.toThrow();
      
      console.warn = originalWarn;
    });

    test('should maintain consistent behavior across multiple calls', () => {
      process.argv = ['node', 'script.js', 'dev'];
      
      const env1 = ConfigManager.getCurrentEnvironment();
      const env2 = ConfigManager.getCurrentEnvironment();
      const config1 = ConfigManager.getConfig();
      const config2 = ConfigManager.getConfig();
      
      expect(env1).toBe(env2);
      expect(config1).toBe(config2);
      expect(mockConfigLoader.loadConfig).toHaveBeenCalledTimes(1);
    });
  });
});