#!/usr/bin/env node

/**
 * Deploy Configuration Script
 * 
 * Deploys dev.json and prod.json configuration files to Vercel as base64-encoded environment variables
 * 
 * Usage:
 *   npm run config:deploy:dev     # Deploy dev config only
 *   npm run config:deploy:prod    # Deploy prod config only  
 *   npm run config:deploy:all     # Deploy both dev and prod configs
 *   npm run config:deploy         # Interactive mode - choose what to deploy
 */

import { readFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import { resolve, join } from 'path';

class ConfigDeployer {
  constructor() {
    this.configDir = join(process.cwd(), 'config', 'credentials');
    this.configs = [
      {
        env: 'dev',
        file: 'dev.json',
        vercelEnv: 'VERCEL_DEV_CONFIG_JSON',
        environments: ['development', 'preview'] // Vercel environments
      },
      {
        env: 'prod', 
        file: 'prod.json',
        vercelEnv: 'VERCEL_PROD_CONFIG_JSON',
        environments: ['production'] // Vercel environments
      }
    ];
  }

  /**
   * Main entry point
   */
  async run() {
    const args = process.argv.slice(2);
    const command = args[0];

    console.log('🚀 HubSpot Integration Up - Config Deployment\n');

    try {
      switch (command) {
        case 'dev':
          await this.deployConfig('dev');
          break;
        case 'prod':
          await this.deployConfig('prod');
          break;
        case 'all':
          await this.deployAllConfigs();
          break;
        default:
          await this.interactiveMode();
          break;
      }
    } catch (error) {
      console.error('❌ Deployment failed:', error.message);
      process.exit(1);
    }
  }

  /**
   * Interactive mode - let user choose what to deploy
   */
  async interactiveMode() {
    console.log('Available commands:');
    console.log('  npm run config:deploy:dev     # Deploy development config');
    console.log('  npm run config:deploy:prod    # Deploy production config');
    console.log('  npm run config:deploy:all     # Deploy both configs\n');
    
    console.log('💡 Run with specific environment: npm run config:deploy:prod');
  }

  /**
   * Deploy all available configurations
   */
  async deployAllConfigs() {
    console.log('📦 Deploying all configurations...\n');
    
    for (const config of this.configs) {
      if (this.configExists(config.env)) {
        await this.deployConfig(config.env);
        console.log(''); // Empty line between deployments
      } else {
        console.log(`⚠️  Skipping ${config.env} - file not found: ${config.file}`);
      }
    }
  }

  /**
   * Deploy a specific configuration
   * @param {string} environment - 'dev' or 'prod'
   */
  async deployConfig(environment) {
    const config = this.configs.find(c => c.env === environment);
    if (!config) {
      throw new Error(`Unknown environment: ${environment}`);
    }

    console.log(`📋 Deploying ${environment.toUpperCase()} configuration...`);

    // Check if config file exists
    if (!this.configExists(environment)) {
      throw new Error(`Configuration file not found: ${config.file}`);
    }

    // Load and encode configuration
    const configData = this.loadConfig(environment);
    const encodedConfig = this.encodeConfig(configData);

    // Validate configuration structure
    this.validateConfig(configData, environment);

    // Deploy to each Vercel environment
    for (const vercelEnv of config.environments) {
      console.log(`  🔧 Setting ${config.vercelEnv} for ${vercelEnv} environment...`);
      await this.setVercelEnv(config.vercelEnv, encodedConfig, vercelEnv);
    }

    console.log(`✅ Successfully deployed ${environment.toUpperCase()} configuration`);
    console.log(`   Variable: ${config.vercelEnv}`);
    console.log(`   Environments: ${config.environments.join(', ')}`);
    console.log(`   Size: ${this.formatBytes(Buffer.byteLength(encodedConfig, 'base64'))}`);
  }

  /**
   * Check if configuration file exists
   * @param {string} environment 
   * @returns {boolean}
   */
  configExists(environment) {
    const config = this.configs.find(c => c.env === environment);
    const filePath = resolve(this.configDir, config.file);
    return existsSync(filePath);
  }

  /**
   * Load configuration from file
   * @param {string} environment 
   * @returns {object}
   */
  loadConfig(environment) {
    const config = this.configs.find(c => c.env === environment);
    const filePath = resolve(this.configDir, config.file);
    
    try {
      const fileContent = readFileSync(filePath, 'utf-8');
      return JSON.parse(fileContent);
    } catch (error) {
      throw new Error(`Failed to load ${config.file}: ${error.message}`);
    }
  }

  /**
   * Encode configuration as base64
   * @param {object} configData 
   * @returns {string}
   */
  encodeConfig(configData) {
    const jsonString = JSON.stringify(configData);
    return Buffer.from(jsonString, 'utf-8').toString('base64');
  }

  /**
   * Validate configuration structure
   * @param {object} configData 
   * @param {string} environment 
   */
  validateConfig(configData, environment) {
    const requiredPaths = [
      'hubspot.shared.redirectUri',
      'hubspot.shared.developerApiKey',
      'hubspot.apps.date-formatter.clientId',
      'hubspot.apps.date-formatter.clientSecret',
      'hubspot.apps.url-shortener.clientId', 
      'hubspot.apps.url-shortener.clientSecret',
      'supabase.url',
      'supabase.anonKey',
      'supabase.serviceRoleKey',
      'application.nextjsUrl',
      'application.encryptionKey'
    ];

    const missing = [];
    for (const path of requiredPaths) {
      if (!this.getNestedValue(configData, path)) {
        missing.push(path);
      }
    }

    if (missing.length > 0) {
      throw new Error(
        `Configuration validation failed for ${environment}:\n` +
        missing.map(path => `  - Missing: ${path}`).join('\n')
      );
    }
  }

  /**
   * Get nested object value by path
   * @param {object} obj 
   * @param {string} path 
   * @returns {any}
   */
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Set Vercel environment variable
   * @param {string} name 
   * @param {string} value 
   * @param {string} environment 
   */
  async setVercelEnv(name, value, environment) {
    try {
      // Use echo to pipe the value to vercel env add
      const command = `echo "${value}" | vercel env add ${name} ${environment}`;
      execSync(command, { 
        stdio: ['pipe', 'pipe', 'pipe'],
        encoding: 'utf-8'
      });
      console.log(`    ✅ Set ${name}`);
    } catch (error) {
      // Check if variable already exists
      if (error.message.includes('already exists')) {
        console.log(`    ℹ️  Variable ${name} already exists, updating...`);
        
        // Remove existing variable and add new one
        try {
          execSync(`vercel env rm ${name} ${environment} --yes`, { 
            stdio: ['pipe', 'pipe', 'pipe'] 
          });
          const command = `echo "${value}" | vercel env add ${name} ${environment}`;
          execSync(command, { 
            stdio: ['pipe', 'pipe', 'pipe'],
            encoding: 'utf-8'
          });
          console.log(`    ✅ Updated ${name}`);
        } catch (updateError) {
          throw new Error(`Failed to update environment variable ${name}: ${updateError.message}`);
        }
      } else {
        throw new Error(`Failed to set environment variable ${name}: ${error.message}`);
      }
    }
  }

  /**
   * Format bytes to human readable string
   * @param {number} bytes 
   * @returns {string}
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// Run the deployer
const deployer = new ConfigDeployer();
deployer.run().catch(error => {
  console.error('❌ Fatal error:', error.message);
  process.exit(1);
});