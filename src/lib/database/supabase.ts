import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ConfigManager } from '@/lib/config/config-manager';

/**
 * Environment-aware Supabase client singleton
 * Automatically connects to dev or prod database based on ConfigManager
 */
class SupabaseService {
  private static instance: SupabaseClient | null = null;
  private static adminInstance: SupabaseClient | null = null;

  /**
   * Gets Supabase client instance with automatic environment detection
   */
  static getClient(): SupabaseClient {
    if (!this.instance) {
      const supabaseConfig = ConfigManager.getSupabaseConfig();
      
      this.instance = createClient(
        supabaseConfig.url,
        supabaseConfig.anonKey
      );
    }
    
    return this.instance;
  }

  /**
   * Gets Supabase admin client with service role key
   */
  static getAdminClient(): SupabaseClient {
    if (!this.adminInstance) {
      const supabaseConfig = ConfigManager.getSupabaseConfig();
      
      this.adminInstance = createClient(
        supabaseConfig.url,
        supabaseConfig.serviceRoleKey,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      );
    }
    
    return this.adminInstance;
  }

  /**
   * Reset client instances (for testing or environment changes)
   */
  static reset(): void {
    this.instance = null;
    this.adminInstance = null;
  }
}

export const supabase = SupabaseService.getClient();
export const supabaseAdmin = SupabaseService.getAdminClient();