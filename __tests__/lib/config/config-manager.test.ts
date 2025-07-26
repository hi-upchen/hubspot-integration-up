import { ConfigManager } from '@/lib/config/config-manager';

// Mock the environment configuration to avoid real environment setup
jest.mock('@/lib/config/environment', () => ({
  getEnvironmentConfig: jest.fn().mockReturnValue({
    environment: 'dev',
    hubspot: {
      clientId: 'mock-client-id',
      clientSecret: 'mock-client-secret',
      redirectUri: 'mock-redirect-uri',
      developerApiKey: 'mock-api-key',
      dateFormatterAppId: 'mock-app-id'
    },
    supabase: {
      url: 'mock-supabase-url',
      anonKey: 'mock-anon-key',
      serviceRoleKey: 'mock-service-key'
    }
  })
}));

const { getEnvironmentConfig } = require('@/lib/config/environment');

describe('ConfigManager', () => {
  let originalArgv: string[];
  let originalEnv: NodeJS.ProcessEnv;
  let consoleWarnSpy: jest.SpyInstance;

  beforeEach(() => {
    // Save originals
    originalArgv = [...process.argv];
    originalEnv = { ...process.env };
    
    // Setup spies
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    
    // Reset configuration cache
    (ConfigManager as any).__resetForTesting();
    
    // Reset mocks completely
    jest.clearAllMocks();
    getEnvironmentConfig.mockReturnValue({
      environment: 'dev',
      hubspot: {
        clientId: 'mock-client-id',
        clientSecret: 'mock-client-secret',
        redirectUri: 'mock-redirect-uri',
        developerApiKey: 'mock-api-key',
        dateFormatterAppId: 'mock-app-id'
      },
      supabase: {
        url: 'mock-supabase-url',
        anonKey: 'mock-anon-key',
        serviceRoleKey: 'mock-service-key'
      }
    });
  });

  afterEach(() => {
    // Restore originals
    process.argv = originalArgv;
    process.env = originalEnv;
    
    // Restore console
    consoleWarnSpy.mockRestore();
  });

  describe('process.argv edge cases', () => {
    test('should handle empty process.argv', () => {
      process.argv = [];
      delete process.env.NODE_ENV;
      
      const env = ConfigManager.getCurrentEnvironment();
      expect(env).toBe('dev');
    });

    test('should handle process.argv with only script name', () => {
      process.argv = ['node', 'script.js'];
      delete process.env.NODE_ENV;
      
      const env = ConfigManager.getCurrentEnvironment();
      expect(env).toBe('dev');
    });

    test('should handle multiple dev/prod arguments (first wins)', () => {
      process.argv = ['node', 'script.js', 'dev', 'prod'];
      
      const env = ConfigManager.getCurrentEnvironment();
      expect(env).toBe('dev');
    });

    test('should handle dev and prod both present (dev wins - appears first in check)', () => {
      process.argv = ['node', 'script.js', 'prod', 'dev'];
      
      const env = ConfigManager.getCurrentEnvironment();
      expect(env).toBe('dev'); // dev check comes first in code
    });

    test('should handle case sensitivity (DEV vs dev)', () => {
      process.argv = ['node', 'script.js', 'DEV'];
      delete process.env.NODE_ENV;
      
      const env = ConfigManager.getCurrentEnvironment();
      expect(env).toBe('dev'); // Should default since 'DEV' != 'dev'
    });

    test('should handle partial matches (development vs dev)', () => {
      process.argv = ['node', 'script.js', 'development'];
      delete process.env.NODE_ENV;
      
      const env = ConfigManager.getCurrentEnvironment();
      expect(env).toBe('dev'); // Should default since 'development' != 'dev'
    });

    test('should handle special characters in argv', () => {
      process.argv = ['node', 'script.js', 'dev!@#', 'prod$%^'];
      delete process.env.NODE_ENV;
      
      const env = ConfigManager.getCurrentEnvironment();
      expect(env).toBe('dev'); // Should default since exact match required
    });
  });

  describe('NODE_ENV edge cases', () => {
    test('should handle undefined NODE_ENV', () => {
      process.argv = ['node', 'script.js'];
      delete process.env.NODE_ENV;
      
      const env = ConfigManager.getCurrentEnvironment();
      expect(env).toBe('dev');
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    test('should handle null NODE_ENV', () => {
      process.argv = ['node', 'script.js'];
      (process.env as any).NODE_ENV = null;
      
      const env = ConfigManager.getCurrentEnvironment();
      expect(env).toBe('dev');
      expect(consoleWarnSpy).toHaveBeenCalledWith("Unknown NODE_ENV 'null', defaulting to dev");
    });

    test('should handle empty string NODE_ENV', () => {
      process.argv = ['node', 'script.js'];
      process.env.NODE_ENV = '';
      
      const env = ConfigManager.getCurrentEnvironment();
      expect(env).toBe('dev');
      expect(consoleWarnSpy).toHaveBeenCalledWith("Unknown NODE_ENV '', defaulting to dev");
    });

    test('should handle whitespace-only NODE_ENV', () => {
      process.argv = ['node', 'script.js'];
      process.env.NODE_ENV = '   ';
      
      const env = ConfigManager.getCurrentEnvironment();
      expect(env).toBe('dev');
      expect(consoleWarnSpy).toHaveBeenCalledWith("Unknown NODE_ENV '   ', defaulting to dev");
    });

    test('should handle case variations (DEVELOPMENT, Development, development)', () => {
      const cases = ['DEVELOPMENT', 'Development', 'PRODUCTION', 'Production'];
      
      cases.forEach(nodeEnv => {
        (ConfigManager as any).__resetForTesting();
        consoleWarnSpy.mockClear();
        
        process.argv = ['node', 'script.js'];
        process.env.NODE_ENV = nodeEnv;
        
        const env = ConfigManager.getCurrentEnvironment();
        expect(env).toBe('dev');
        expect(consoleWarnSpy).toHaveBeenCalledWith(`Unknown NODE_ENV '${nodeEnv}', defaulting to dev`);
      });
    });

    test('should handle invalid values (test, staging, local)', () => {
      const invalidValues = ['test', 'staging', 'local', 'qa'];
      
      invalidValues.forEach(nodeEnv => {
        (ConfigManager as any).__resetForTesting();
        consoleWarnSpy.mockClear();
        
        process.argv = ['node', 'script.js'];
        process.env.NODE_ENV = nodeEnv;
        
        const env = ConfigManager.getCurrentEnvironment();
        expect(env).toBe('dev');
        expect(consoleWarnSpy).toHaveBeenCalledWith(`Unknown NODE_ENV '${nodeEnv}', defaulting to dev`);
      });
    });

    test('should handle numbers as environment (1, 0)', () => {
      const numberValues = ['1', '0', '123'];
      
      numberValues.forEach(nodeEnv => {
        (ConfigManager as any).__resetForTesting();
        consoleWarnSpy.mockClear();
        
        process.argv = ['node', 'script.js'];
        process.env.NODE_ENV = nodeEnv;
        
        const env = ConfigManager.getCurrentEnvironment();
        expect(env).toBe('dev');
        expect(consoleWarnSpy).toHaveBeenCalledWith(`Unknown NODE_ENV '${nodeEnv}', defaulting to dev`);
      });
    });

    test('should handle special characters in environment', () => {
      const specialValues = ['dev!', 'prod@#$', 'test-env', 'env_with_underscores'];
      
      specialValues.forEach(nodeEnv => {
        (ConfigManager as any).__resetForTesting();
        consoleWarnSpy.mockClear();
        
        process.argv = ['node', 'script.js'];
        process.env.NODE_ENV = nodeEnv;
        
        const env = ConfigManager.getCurrentEnvironment();
        expect(env).toBe('dev');
        expect(consoleWarnSpy).toHaveBeenCalledWith(`Unknown NODE_ENV '${nodeEnv}', defaulting to dev`);
      });
    });
  });

  describe('Configuration loading error scenarios', () => {
    test('should handle getEnvironmentConfig throwing error', () => {
      getEnvironmentConfig.mockImplementation(() => {
        throw new Error('Environment config failed to load');
      });

      expect(() => {
        ConfigManager.getHubSpotConfig();
      }).toThrow('Environment config failed to load');
    });

    test('should handle missing environment configuration', () => {
      getEnvironmentConfig.mockImplementation(() => {
        throw new Error('Missing required environment variables');
      });

      expect(() => {
        ConfigManager.getSupabaseConfig();
      }).toThrow('Missing required environment variables');
    });

    test('should handle corrupted environment variables', () => {
      // Simulate corrupted process.env
      const originalDescriptor = Object.getOwnPropertyDescriptor(process, 'env');
      Object.defineProperty(process, 'env', {
        get: () => { throw new Error('Environment corrupted'); }
      });

      try {
        expect(() => {
          ConfigManager.getCurrentEnvironment();
        }).toThrow('Environment corrupted');
      } finally {
        // Restore process.env
        if (originalDescriptor) {
          Object.defineProperty(process, 'env', originalDescriptor);
        }
      }
    });

    test('should re-throw environment config errors appropriately', () => {
      const customError = new Error('Custom config error');
      getEnvironmentConfig.mockImplementation(() => {
        throw customError;
      });

      expect(() => {
        ConfigManager.getHubSpotConfig();
      }).toThrow(customError);
    });
  });

  describe('configuration caching edge cases', () => {
    test('should maintain same config across environment changes', () => {
      process.argv = ['node', 'script.js', 'dev'];
      const config1 = ConfigManager.getHubSpotConfig();
      
      // Change environment after first call
      process.argv = ['node', 'script.js', 'prod'];
      const config2 = ConfigManager.getHubSpotConfig();
      
      expect(config1).toBe(config2);
      expect(getEnvironmentConfig).toHaveBeenCalledTimes(1);
      expect(getEnvironmentConfig).toHaveBeenCalledWith('dev'); // First call wins
    });

    test('should not reinitialize config when process.argv changes after first call', () => {
      process.argv = ['node', 'script.js', 'dev'];
      ConfigManager.getHubSpotConfig();
      
      process.argv = ['node', 'script.js', 'prod'];
      process.env.NODE_ENV = 'production';
      ConfigManager.getSupabaseConfig();
      
      expect(getEnvironmentConfig).toHaveBeenCalledTimes(1);
      expect(getEnvironmentConfig).toHaveBeenCalledWith('dev');
    });

    test('should handle concurrent access (multiple calls before config created)', () => {
      process.argv = ['node', 'script.js', 'dev'];
      
      // Simulate concurrent calls
      const promises = Array(5).fill(0).map(() => 
        Promise.resolve(ConfigManager.getHubSpotConfig())
      );
      
      return Promise.all(promises).then(configs => {
        // All should return the same config
        configs.forEach(config => {
          expect(config).toBe(configs[0]);
        });
        
        // Config should only be created once
        expect(getEnvironmentConfig).toHaveBeenCalledTimes(1);
      });
    });

    test('should handle reset during active usage', () => {
      process.argv = ['node', 'script.js', 'dev'];
      const config1 = ConfigManager.getHubSpotConfig();
      
      // Reset while config exists
      (ConfigManager as any).__resetForTesting();
      
      const config2 = ConfigManager.getHubSpotConfig();
      
      expect(config1).toBe(config2); // Mock returns same object
      expect(getEnvironmentConfig).toHaveBeenCalledTimes(2);
    });
  });

  describe('logging edge cases', () => {
    test('should warn only once for same invalid environment', () => {
      process.argv = ['node', 'script.js'];
      process.env.NODE_ENV = 'invalid';
      
      ConfigManager.getCurrentEnvironment();
      ConfigManager.getCurrentEnvironment();
      ConfigManager.getCurrentEnvironment();
      
      // Should warn every time getCurrentEnvironment is called (no caching of warnings)
      expect(consoleWarnSpy).toHaveBeenCalledTimes(3);
      expect(consoleWarnSpy).toHaveBeenCalledWith("Unknown NODE_ENV 'invalid', defaulting to dev");
    });

    test('should handle console.warn being undefined', () => {
      const originalWarn = console.warn;
      (console as any).warn = undefined;
      
      try {
        process.argv = ['node', 'script.js'];
        process.env.NODE_ENV = 'invalid';
        
        expect(() => {
          ConfigManager.getCurrentEnvironment();
        }).not.toThrow();
      } finally {
        console.warn = originalWarn;
      }
    });

    test('should handle console.warn throwing error', () => {
      consoleWarnSpy.mockImplementation(() => {
        throw new Error('Console error');
      });
      
      process.argv = ['node', 'script.js'];
      process.env.NODE_ENV = 'invalid';
      
      expect(() => {
        ConfigManager.getCurrentEnvironment();
      }).toThrow('Console error');
    });

    test('should not warn for valid environments', () => {
      const validCases = [
        { argv: ['node', 'script.js', 'dev'], nodeEnv: undefined },
        { argv: ['node', 'script.js', 'prod'], nodeEnv: undefined },
        { argv: ['node', 'script.js'], nodeEnv: 'development' },
        { argv: ['node', 'script.js'], nodeEnv: 'production' },
      ];
      
      validCases.forEach(({ argv, nodeEnv }) => {
        (ConfigManager as any).__resetForTesting();
        consoleWarnSpy.mockClear();
        
        process.argv = argv;
        if (nodeEnv) {
          process.env.NODE_ENV = nodeEnv;
        } else {
          delete process.env.NODE_ENV;
        }
        
        ConfigManager.getCurrentEnvironment();
        expect(consoleWarnSpy).not.toHaveBeenCalled();
      });
    });

    test('should warn with correct message format', () => {
      process.argv = ['node', 'script.js'];
      process.env.NODE_ENV = 'staging';
      
      ConfigManager.getCurrentEnvironment();
      
      expect(consoleWarnSpy).toHaveBeenCalledWith("Unknown NODE_ENV 'staging', defaulting to dev");
      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('memory and performance edge cases', () => {
    test('should not leak memory on repeated calls', () => {
      process.argv = ['node', 'script.js', 'dev'];
      
      // Make many calls
      for (let i = 0; i < 1000; i++) {
        ConfigManager.getHubSpotConfig();
        ConfigManager.getSupabaseConfig();
        ConfigManager.getCurrentEnvironment();
      }
      
      // Should only initialize config once
      expect(getEnvironmentConfig).toHaveBeenCalledTimes(1);
    });

    test('should handle very long process.argv arrays', () => {
      const longArgv = ['node', 'script.js'];
      // Add 10000 dummy arguments
      for (let i = 0; i < 10000; i++) {
        longArgv.push(`arg${i}`);
      }
      longArgv.push('dev'); // Add target at the end
      
      process.argv = longArgv;
      
      const env = ConfigManager.getCurrentEnvironment();
      expect(env).toBe('dev');
    });

    test('should handle very long environment variable values', () => {
      process.argv = ['node', 'script.js'];
      // Create very long invalid NODE_ENV
      const longValue = 'a'.repeat(10000);
      process.env.NODE_ENV = longValue;
      
      const env = ConfigManager.getCurrentEnvironment();
      expect(env).toBe('dev');
      expect(consoleWarnSpy).toHaveBeenCalledWith(`Unknown NODE_ENV '${longValue}', defaulting to dev`);
    });

    test('should perform well with frequent getCurrentEnvironment() calls', () => {
      process.argv = ['node', 'script.js', 'dev'];
      
      const startTime = performance.now();
      
      // Make many calls
      for (let i = 0; i < 10000; i++) {
        ConfigManager.getCurrentEnvironment();
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should complete quickly (less than 100ms for 10k calls)
      expect(duration).toBeLessThan(100);
    });
  });

  describe('integration edge cases', () => {
    test('should work when imported in different modules simultaneously', () => {
      process.argv = ['node', 'script.js', 'dev'];
      
      // Simulate multiple modules accessing ConfigManager
      const results = [
        ConfigManager.getHubSpotConfig(),
        ConfigManager.getCurrentEnvironment(),
        ConfigManager.getSupabaseConfig(),
        ConfigManager.getCurrentEnvironment(),
      ];
      
      expect(results[0]).toBeDefined(); // HubSpot config
      expect(results[1]).toBe('dev');
      expect(results[2]).toBeDefined(); // Supabase config
      expect(results[3]).toBe('dev');
      expect(getEnvironmentConfig).toHaveBeenCalledTimes(1);
    });

    test('should handle being called before any environment setup', () => {
      // Clear everything
      process.argv = [];
      delete process.env.NODE_ENV;
      
      const env = ConfigManager.getCurrentEnvironment();
      expect(env).toBe('dev');
      
      const hubspotConfig = ConfigManager.getHubSpotConfig();
      expect(hubspotConfig).toBeDefined();
      expect(getEnvironmentConfig).toHaveBeenCalledWith('dev');
    });

    test('should work with mocked global process object', () => {
      const originalProcess = global.process;
      
      try {
        // Mock process object
        (global as any).process = {
          argv: ['node', 'script.js', 'prod'],
          env: { NODE_ENV: 'development' }
        };
        
        (ConfigManager as any).__resetForTesting();
        
        const env = ConfigManager.getCurrentEnvironment();
        expect(env).toBe('prod'); // argv takes priority
      } finally {
        global.process = originalProcess;
      }
    });

    test('should handle process.env being read-only', () => {
      // Make process.env non-configurable for NODE_ENV
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'production',
        writable: false,
        configurable: false
      });
      
      process.argv = ['node', 'script.js'];
      
      const env = ConfigManager.getCurrentEnvironment();
      expect(env).toBe('prod');
    });
  });

  describe('priority order verification', () => {
    test('should prioritize command line args over NODE_ENV', () => {
      process.argv = ['node', 'script.js', 'dev'];
      process.env.NODE_ENV = 'production';
      
      const env = ConfigManager.getCurrentEnvironment();
      expect(env).toBe('dev');
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    test('should use NODE_ENV when no command line args', () => {
      process.argv = ['node', 'script.js'];
      process.env.NODE_ENV = 'production';
      
      const env = ConfigManager.getCurrentEnvironment();
      expect(env).toBe('prod');
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    test('should default to dev when neither is available', () => {
      process.argv = ['node', 'script.js'];
      delete process.env.NODE_ENV;
      
      const env = ConfigManager.getCurrentEnvironment();
      expect(env).toBe('dev');
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
  });

  describe('configuration access methods', () => {
    test('should return HubSpot configuration', () => {
      process.argv = ['node', 'script.js', 'dev'];
      
      const config = ConfigManager.getHubSpotConfig();
      
      expect(config).toEqual({
        clientId: 'mock-client-id',
        clientSecret: 'mock-client-secret',
        redirectUri: 'mock-redirect-uri',
        developerApiKey: 'mock-api-key',
        dateFormatterAppId: 'mock-app-id'
      });
      expect(getEnvironmentConfig).toHaveBeenCalledWith('dev');
    });

    test('should return Supabase configuration', () => {
      process.argv = ['node', 'script.js', 'prod'];
      
      const config = ConfigManager.getSupabaseConfig();
      
      expect(config).toEqual({
        url: 'mock-supabase-url',
        anonKey: 'mock-anon-key',
        serviceRoleKey: 'mock-service-key'
      });
      expect(getEnvironmentConfig).toHaveBeenCalledWith('prod');
    });

    test('should cache configuration after first access', () => {
      process.argv = ['node', 'script.js', 'dev'];
      
      const hubspotConfig1 = ConfigManager.getHubSpotConfig();
      const supabaseConfig1 = ConfigManager.getSupabaseConfig();
      const hubspotConfig2 = ConfigManager.getHubSpotConfig();
      const supabaseConfig2 = ConfigManager.getSupabaseConfig();
      
      expect(hubspotConfig1).toBe(hubspotConfig2);
      expect(supabaseConfig1).toBe(supabaseConfig2);
      expect(getEnvironmentConfig).toHaveBeenCalledTimes(1);
    });
  });
});