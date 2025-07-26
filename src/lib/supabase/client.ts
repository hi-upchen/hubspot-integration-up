import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { HubSpotInstallation } from '../types';
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
      const environment = ConfigManager.getCurrentEnvironment();
      
      console.log(`🗄️  Connecting to ${environment.toUpperCase()} Supabase database`);
      
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
      const environment = ConfigManager.getCurrentEnvironment();
      
      console.log(`🔐 Connecting to ${environment.toUpperCase()} Supabase admin`);
      
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

export class HubSpotInstallationService {
  async create(installation: Omit<HubSpotInstallation, 'id' | 'createdAt' | 'updatedAt'>): Promise<HubSpotInstallation> {
    const { data, error } = await supabaseAdmin
      .from('hubspot_installations')
      .insert({
        hub_id: installation.hubId,
        access_token: installation.accessToken,
        refresh_token: installation.refreshToken,
        expires_at: installation.expiresAt,
        scope: installation.scope
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create installation: ${error.message}`);
    }

    return {
      id: data.id,
      hubId: data.hub_id,
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: data.expires_at,
      scope: data.scope,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }

  async findByHubId(hubId: number): Promise<HubSpotInstallation | null> {
    const { data, error } = await supabaseAdmin
      .from('hubspot_installations')
      .select('*')
      .eq('hub_id', hubId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to find installation: ${error.message}`);
    }

    return {
      id: data.id,
      hubId: data.hub_id,
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: data.expires_at,
      scope: data.scope,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }

  async updateTokens(hubId: number, tokens: { accessToken: string; refreshToken: string; expiresAt: string }): Promise<HubSpotInstallation> {
    const { data, error } = await supabaseAdmin
      .from('hubspot_installations')
      .update({
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
        expires_at: tokens.expiresAt,
        updated_at: new Date().toISOString()
      })
      .eq('hub_id', hubId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update tokens: ${error.message}`);
    }

    return {
      id: data.id,
      hubId: data.hub_id,
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: data.expires_at,
      scope: data.scope,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }

  async delete(hubId: number): Promise<void> {
    const { error } = await supabaseAdmin
      .from('hubspot_installations')
      .delete()
      .eq('hub_id', hubId);

    if (error) {
      throw new Error(`Failed to delete installation: ${error.message}`);
    }
  }
}