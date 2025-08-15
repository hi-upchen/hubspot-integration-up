/**
 * PostgreSQL Client Wrapper
 * Provides a singleton connection pool for direct PostgreSQL queries
 */

import { Pool } from 'pg';
import { ConfigManager } from '@/lib/config/config-manager';

export class PostgresClient {
  private static instance: Pool | undefined;

  /**
   * Get the singleton PostgreSQL connection pool
   * Creates a new pool on first call, returns existing pool on subsequent calls
   */
  static getPool(): Pool {
    if (!this.instance) {
      const config = ConfigManager.getConfig();
      
      // Validate PostgreSQL configuration exists
      if (!config.supabase.postgres?.pooledConnectionString) {
        throw new Error('PostgreSQL connection string not configured');
      }
      
      const connectionString = config.supabase.postgres.pooledConnectionString;
      
      if (!connectionString || connectionString.trim() === '') {
        throw new Error('PostgreSQL connection string not configured');
      }
      
      // Create connection pool with optimized settings for serverless
      this.instance = new Pool({
        connectionString,
        max: 20, // Maximum number of clients in the pool
        idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
        connectionTimeoutMillis: 2000, // Fail fast on connection timeout
      });
      
      // Handle pool errors
      this.instance.on('error', (err) => {
        console.error('Unexpected PostgreSQL pool error:', err);
      });
    }
    
    return this.instance;
  }

  /**
   * Close the connection pool and reset the singleton
   * Useful for cleanup in tests or graceful shutdown
   */
  static async end(): Promise<void> {
    if (this.instance) {
      await this.instance.end();
      this.instance = undefined;
    }
  }
}