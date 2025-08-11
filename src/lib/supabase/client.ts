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
        scope: installation.scope,
        app_type: installation.appType
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
      appType: data.app_type,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }

  // Legacy method - finds any installation for hub (for backwards compatibility)
  async findByHubId(hubId: number): Promise<HubSpotInstallation | null> {
    const { data, error } = await supabaseAdmin
      .from('hubspot_installations')
      .select('*')
      .eq('hub_id', hubId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      throw new Error(`Failed to find installation: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return null;
    }

    const installation = data[0];
    return {
      id: installation.id,
      hubId: installation.hub_id,
      accessToken: installation.access_token,
      refreshToken: installation.refresh_token,
      expiresAt: installation.expires_at,
      scope: installation.scope,
      appType: installation.app_type,
      createdAt: installation.created_at,
      updatedAt: installation.updated_at
    };
  }

  // New method - finds specific app installation for hub
  async findByHubIdAndApp(hubId: number, appType: 'date-formatter' | 'url-shortener'): Promise<HubSpotInstallation | null> {
    const { data, error } = await supabaseAdmin
      .from('hubspot_installations')
      .select('*')
      .eq('hub_id', hubId)
      .eq('app_type', appType)
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
      appType: data.app_type,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }

  // Legacy method - updates first found installation (for backwards compatibility)
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
      .order('created_at', { ascending: false })
      .limit(1)
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
      appType: data.app_type,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }

  // New method - updates specific app installation
  async updateTokensForApp(hubId: number, appType: 'date-formatter' | 'url-shortener', tokens: { accessToken: string; refreshToken: string; expiresAt: string }): Promise<HubSpotInstallation> {
    const { data, error } = await supabaseAdmin
      .from('hubspot_installations')
      .update({
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
        expires_at: tokens.expiresAt,
        updated_at: new Date().toISOString()
      })
      .eq('hub_id', hubId)
      .eq('app_type', appType)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update tokens for ${appType}: ${error.message}`);
    }

    return {
      id: data.id,
      hubId: data.hub_id,
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: data.expires_at,
      scope: data.scope,
      appType: data.app_type,
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