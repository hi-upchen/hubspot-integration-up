import { createClient } from '@supabase/supabase-js';
import type { HubSpotInstallation } from '../types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Using anon key instead of service key for now
export const supabaseAdmin = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

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