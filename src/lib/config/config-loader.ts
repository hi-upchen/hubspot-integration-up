import { readFileSync, existsSync } from 'fs';
import { resolve, join } from 'path';

/**
 * Configuration file structure for all environments
 */
export interface AppConfig {
  hubspot: {
    shared: {
      redirectUri: string;
      developerApiKey: string;
    };
    apps: {
      [appName: string]: {
        appId: string;
        clientId: string;
        clientSecret: string;
      };
    };
  };
  supabase: {
    url: string;
    anonKey: string;
    serviceRoleKey: string;
    postgres?: {
      pooledConnectionString: string;
    };
  };
  application: {
    nextjsUrl: string;
    encryptionKey: string;
    nextAuthSecret: string;
    cronSecret: string;
  };
}

/**
 * ConfigLoader handles loading configuration from environment variables (first) or JSON files (fallback)
 * Environment-first approach for production-ready deployment
 */
export class ConfigLoader {
  private static configCache: { [environment: string]: AppConfig } = {};
  private static readonly CONFIG_DIR = join(process.cwd(), 'config', 'credentials');
  private static lastLoadSource: 'environment' | 'file' | 'none' = 'none';

  /**
   * Loads configuration for the specified environment
   * Environment-first approach: checks environment variables before files
   * @param environment - 'dev' or 'prod'
   * @returns Complete configuration object
   */
  static loadConfig(environment: 'dev' | 'prod'): AppConfig {
    // Return cached config if available
    if (ConfigLoader.configCache[environment]) {
      return ConfigLoader.configCache[environment];
    }

    let config: AppConfig | undefined;

    // 1. Check environment variables first (production standard)
    const envVarName = environment === 'dev' ? 'VERCEL_DEV_CONFIG_JSON' : 'VERCEL_PROD_CONFIG_JSON';
    if (process.env[envVarName]) {
      try {
        const decodedConfig = Buffer.from(process.env[envVarName]!, 'base64').toString('utf-8');
        config = JSON.parse(decodedConfig);
        ConfigLoader.lastLoadSource = 'environment';
        console.log(`✅ Loaded ${environment} config from environment`);
      } catch (error) {
        console.warn(`⚠️ Environment variable exists but failed to parse:`, error instanceof Error ? error.message : 'Unknown error');
        // Continue to file fallback
      }
    }

    // 2. Fallback to JSON files (development convenience)
    if (!config) {
      const configPath = resolve(ConfigLoader.CONFIG_DIR, `${environment}.json`);
      if (existsSync(configPath)) {
        try {
          const configFile = readFileSync(configPath, 'utf-8');
          config = JSON.parse(configFile);
          ConfigLoader.lastLoadSource = 'file';
          console.log(`✅ Loaded ${environment} config from file`);
        } catch (error) {
          console.warn(`⚠️ File exists but failed to parse:`, error instanceof Error ? error.message : 'Unknown error');
        }
      }
    }

    // Both methods failed
    if (!config) {
      ConfigLoader.lastLoadSource = 'none';
      throw new Error(
        `No configuration found for environment '${environment}':\n` +
        `  - Environment variable: ${envVarName} not set or invalid\n` +
        `  - File: config/credentials/${environment}.json not found or invalid`
      );
    }

    // Validate and cache
    ConfigLoader.validateConfig(config, environment);
    ConfigLoader.configCache[environment] = config;

    return config;
  }

  /**
   * Validates the loaded configuration has all required fields
   * @param config - Configuration object to validate
   * @param environment - Environment name for error messages
   */
  private static validateConfig(config: AppConfig, environment: string): void {
    const errors: string[] = [];

    // Validate HubSpot configuration
    if (!config.hubspot?.shared?.redirectUri) {
      errors.push('hubspot.shared.redirectUri is required');
    }
    if (!config.hubspot?.shared?.developerApiKey) {
      errors.push('hubspot.shared.developerApiKey is required');
    }

    // Validate app configurations
    if (!config.hubspot?.apps) {
      errors.push('hubspot.apps configuration is required');
    } else {
      const requiredApps = ['date-formatter', 'url-shortener'];
      for (const appName of requiredApps) {
        const app = config.hubspot.apps[appName];
        if (!app) {
          errors.push(`hubspot.apps.${appName} configuration is required`);
        } else {
          if (!app.appId) errors.push(`hubspot.apps.${appName}.appId is required`);
          if (!app.clientId) errors.push(`hubspot.apps.${appName}.clientId is required`);
          if (!app.clientSecret) errors.push(`hubspot.apps.${appName}.clientSecret is required`);
        }
      }
    }

    // Validate Supabase configuration
    if (!config.supabase?.url) {
      errors.push('supabase.url is required');
    }
    if (!config.supabase?.anonKey) {
      errors.push('supabase.anonKey is required');
    }
    if (!config.supabase?.serviceRoleKey) {
      errors.push('supabase.serviceRoleKey is required');
    }

    // Validate application configuration
    if (!config.application?.nextjsUrl) {
      errors.push('application.nextjsUrl is required');
    }
    if (!config.application?.encryptionKey) {
      errors.push('application.encryptionKey is required');
    }

    if (errors.length > 0) {
      throw new Error(
        `Invalid configuration for environment '${environment}':\n` +
        errors.map(error => `  - ${error}`).join('\n')
      );
    }
  }

  /**
   * Gets the source of the last loaded configuration
   * @returns Source type for health endpoint and debugging
   */
  static getConfigSource(): 'environment' | 'file' | 'none' {
    return ConfigLoader.lastLoadSource;
  }

  /**
   * Clears the configuration cache (useful for testing)
   */
  static clearCache(): void {
    ConfigLoader.configCache = {};
    ConfigLoader.lastLoadSource = 'none';
  }

  /**
   * Gets list of available app names from configuration
   * @param environment - Environment to check
   * @returns Array of app names
   */
  static getAvailableApps(environment: 'dev' | 'prod'): string[] {
    const config = ConfigLoader.loadConfig(environment);
    return Object.keys(config.hubspot.apps);
  }

  /**
   * Checks if a specific app is configured for an environment
   * @param environment - Environment to check
   * @param appName - App name to check
   * @returns True if app is configured
   */
  static isAppConfigured(environment: 'dev' | 'prod', appName: string): boolean {
    try {
      const config = ConfigLoader.loadConfig(environment);
      const app = config.hubspot.apps[appName];
      return !!(app?.appId && app?.clientId && app?.clientSecret);
    } catch {
      return false;
    }
  }
}