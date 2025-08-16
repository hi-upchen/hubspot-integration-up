/**
 * Configuration Manager
 * Handles environment detection and provides direct access to configuration
 * Now uses ConfigLoader for JSON-based configuration instead of environment variables
 */

import { ConfigLoader, type AppConfig } from './config-loader';
import type { Environment } from './environment';

export class ConfigManager {
  private static config: AppConfig;

  /**
   * Gets complete configuration for current environment
   * @returns Complete configuration object
   */
  static getConfig(): AppConfig {
    if (!this.config) {
      this.initializeConfig();
    }
    return this.config;
  }

  /**
   * Gets HubSpot configuration for current environment
   * @returns HubSpot configuration object
   */
  static getHubSpotConfig(): AppConfig['hubspot'] {
    return this.getConfig().hubspot;
  }

  /**
   * Gets app-specific HubSpot client ID
   * @param appType - The app type ('date-formatter' or 'url-shortener')
   * @returns Client ID for the specified app
   */
  static getHubSpotClientId(appType: 'date-formatter' | 'url-shortener' = 'date-formatter'): string {
    const hubspotConfig = this.getHubSpotConfig();
    const appConfig = hubspotConfig.apps[appType];
    if (!appConfig) {
      throw new Error(`No configuration found for app: ${appType}`);
    }
    return appConfig.clientId;
  }

  /**
   * Gets app-specific HubSpot client secret
   * @param appType - The app type ('date-formatter' or 'url-shortener')
   * @returns Client secret for the specified app
   */
  static getHubSpotClientSecret(appType: 'date-formatter' | 'url-shortener' = 'date-formatter'): string {
    const hubspotConfig = this.getHubSpotConfig();
    const appConfig = hubspotConfig.apps[appType];
    if (!appConfig) {
      throw new Error(`No configuration found for app: ${appType}`);
    }
    return appConfig.clientSecret;
  }

  /**
   * Gets app-specific HubSpot app ID
   * @param appType - The app type ('date-formatter' or 'url-shortener')
   * @returns App ID for the specified app
   */
  static getHubSpotAppId(appType: 'date-formatter' | 'url-shortener' = 'date-formatter'): string {
    const hubspotConfig = this.getHubSpotConfig();
    const appConfig = hubspotConfig.apps[appType];
    if (!appConfig) {
      throw new Error(`No configuration found for app: ${appType}`);
    }
    return appConfig.appId;
  }

  /**
   * Gets HubSpot redirect URI for current environment
   * @returns Redirect URI
   */
  static getHubSpotRedirectUri(): string {
    return this.getHubSpotConfig().shared.redirectUri;
  }

  /**
   * Gets HubSpot developer API key for current environment
   * @returns Developer API key
   */
  static getHubSpotDeveloperApiKey(): string {
    return this.getHubSpotConfig().shared.developerApiKey;
  }

  /**
   * Gets Supabase configuration for current environment
   * @returns Supabase configuration object
   */
  static getSupabaseConfig(): AppConfig['supabase'] {
    return this.getConfig().supabase;
  }

  /**
   * Gets application configuration for current environment
   * @returns Application configuration object
   */
  static getApplicationConfig(): AppConfig['application'] {
    return this.getConfig().application;
  }

  /**
   * Gets Next.js URL for current environment
   * @returns Next.js base URL
   */
  static getNextjsUrl(): string {
    return this.getApplicationConfig().nextjsUrl;
  }

  /**
   * Gets encryption key for current environment
   * @returns Encryption key for API key encryption
   */
  static getEncryptionKey(): string {
    return this.getApplicationConfig().encryptionKey;
  }

  /**
   * Gets NextAuth secret for current environment
   * @returns NextAuth secret
   */
  static getNextAuthSecret(): string {
    return this.getApplicationConfig().nextAuthSecret;
  }

  /**
   * Gets cron secret for current environment
   * @returns Cron job security secret
   */
  static getCronSecret(): string {
    return this.getApplicationConfig().cronSecret;
  }

  /**
   * Initializes configuration with detected environment
   */
  private static initializeConfig(): void {
    const environment = this.determineEnvironment();
    this.config = ConfigLoader.loadConfig(environment);
  }

  /**
   * Gets the current detected environment
   * Useful for debugging and logging
   * 
   * @returns Current environment ('dev' or 'prod')
   */
  static getCurrentEnvironment(): Environment {
    return this.determineEnvironment();
  }

  /**
   * Gets the source of configuration loading
   * Useful for health endpoint and debugging
   * 
   * @returns Configuration source ('environment', 'file', or 'none')
   */
  static getConfigSource(): 'environment' | 'file' | 'none' {
    return ConfigLoader.getConfigSource();
  }

  /**
   * Determines the current environment based on context
   * Priority: Command line args > NODE_ENV > Default to 'dev'
   * 
   * @returns Environment setting
   */
  private static determineEnvironment(): Environment {
    // For scripts: check command line arguments (highest priority)
    if (process.argv.includes('dev')) {
      return 'dev';
    }
    if (process.argv.includes('prod')) {
      return 'prod';
    }

    // For API routes: use standard NODE_ENV environment variable
    if (process.env.NODE_ENV === 'production') {
      return 'prod';
    }
    if (process.env.NODE_ENV === 'development') {
      return 'dev';
    }

    // Fallback with warning for unknown NODE_ENV values
    if (process.env.NODE_ENV !== undefined && !['development', 'production'].includes(process.env.NODE_ENV)) {
      if (console.warn) {
        console.warn(`Unknown NODE_ENV '${process.env.NODE_ENV}', defaulting to dev`);
      }
    }

    return 'dev';
  }

  /**
   * TESTING ONLY: Resets the configuration cache
   * Should only be used in test files to ensure clean test state
   * @private
   */
  private static reset(): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.config = undefined as any;
    ConfigLoader.clearCache();
  }

  /**
   * TESTING ONLY: Expose reset method for test files
   * This method should never be called in production code
   */
  static __resetForTesting(): void {
    this.reset();
  }
}