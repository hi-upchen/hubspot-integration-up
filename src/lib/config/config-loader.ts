import { readFileSync } from 'fs';
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
 * ConfigLoader handles loading configuration from JSON files
 * Replaces the complex environment variable system with structured config files
 */
export class ConfigLoader {
  private static configCache: { [environment: string]: AppConfig } = {};
  private static readonly CONFIG_DIR = join(process.cwd(), 'config', 'credentials');

  /**
   * Loads configuration for the specified environment
   * @param environment - 'dev' or 'prod'
   * @returns Complete configuration object
   */
  static loadConfig(environment: 'dev' | 'prod'): AppConfig {
    // Return cached config if available
    if (ConfigLoader.configCache[environment]) {
      return ConfigLoader.configCache[environment];
    }

    try {
      const configPath = resolve(ConfigLoader.CONFIG_DIR, `${environment}.json`);
      const configFile = readFileSync(configPath, 'utf-8');
      const config: AppConfig = JSON.parse(configFile);

      // Validate required structure
      ConfigLoader.validateConfig(config, environment);

      // Cache the configuration
      ConfigLoader.configCache[environment] = config;

      return config;
    } catch (error) {
      if (error instanceof Error && error.message.includes('ENOENT')) {
        throw new Error(
          `Configuration file not found: config/credentials/${environment}.json\n` +
          `Please ensure the configuration file exists and contains valid JSON.`
        );
      }
      
      throw new Error(
        `Failed to load configuration for environment '${environment}': ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
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
   * Clears the configuration cache (useful for testing)
   */
  static clearCache(): void {
    ConfigLoader.configCache = {};
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