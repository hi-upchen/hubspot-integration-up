/**
 * Configuration Manager
 * Handles environment detection and provides direct access to configuration
 */

import { getEnvironmentConfig, type Environment, type EnvironmentConfig, type HubSpotConfig, type SupabaseConfig } from './environment';

export class ConfigManager {
  private static config: EnvironmentConfig;

  /**
   * Gets HubSpot configuration for current environment
   * @returns HubSpot configuration object
   */
  static getHubSpotConfig(): HubSpotConfig {
    if (!this.config) {
      this.initializeConfig();
    }
    return this.config.hubspot;
  }

  /**
   * Gets Supabase configuration for current environment
   * @returns Supabase configuration object
   */
  static getSupabaseConfig(): SupabaseConfig {
    if (!this.config) {
      this.initializeConfig();
    }
    return this.config.supabase;
  }

  /**
   * Initializes configuration with detected environment
   */
  private static initializeConfig(): void {
    const environment = this.determineEnvironment();
    this.config = getEnvironmentConfig(environment);
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
  }

  /**
   * TESTING ONLY: Expose reset method for test files
   * This method should never be called in production code
   */
  static __resetForTesting(): void {
    this.reset();
  }
}