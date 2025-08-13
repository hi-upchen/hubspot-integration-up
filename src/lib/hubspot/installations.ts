import { supabaseAdmin } from '@/lib/database/supabase';
import type { HubSpotInstallation } from './types';

/**
 * Database operations for managing HubSpot app installations
 * Pure functions for CRUD operations on installation records
 */

type TokenUpdateData = {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
};

type AppType = 'date-formatter' | 'url-shortener';

/**
 * Helper function to transform database record to domain model
 */
function transformInstallationRecord(data: any): HubSpotInstallation {
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

/**
 * Creates a new HubSpot installation record
 */
export async function createInstallation(installation: Omit<HubSpotInstallation, 'id' | 'createdAt' | 'updatedAt'>): Promise<HubSpotInstallation> {
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

  return transformInstallationRecord(data);
}

/**
 * Finds any installation for hub (legacy compatibility - gets most recent)
 */
export async function findInstallationByHubId(hubId: number): Promise<HubSpotInstallation | null> {
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

  return transformInstallationRecord(data[0]);
}

/**
 * Finds specific app installation for hub
 */
export async function findInstallationByHubIdAndApp(hubId: number, appType: AppType): Promise<HubSpotInstallation | null> {
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

  return transformInstallationRecord(data);
}

/**
 * Updates tokens for first found installation (legacy compatibility)
 */
export async function updateInstallationTokens(hubId: number, tokens: TokenUpdateData): Promise<HubSpotInstallation> {
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

  return transformInstallationRecord(data);
}

/**
 * Updates tokens for specific app installation
 */
export async function updateInstallationTokensForApp(hubId: number, appType: AppType, tokens: TokenUpdateData): Promise<HubSpotInstallation> {
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

  return transformInstallationRecord(data);
}

/**
 * Deletes all installations for a hub
 */
export async function deleteInstallation(hubId: number): Promise<void> {
  const { error } = await supabaseAdmin
    .from('hubspot_installations')
    .delete()
    .eq('hub_id', hubId);

  if (error) {
    throw new Error(`Failed to delete installation: ${error.message}`);
  }
}

/**
 * Deletes specific app installation for a hub
 */
export async function deleteInstallationByApp(hubId: number, appType: AppType): Promise<void> {
  const { error } = await supabaseAdmin
    .from('hubspot_installations')
    .delete()
    .eq('hub_id', hubId)
    .eq('app_type', appType);

  if (error) {
    throw new Error(`Failed to delete ${appType} installation: ${error.message}`);
  }
}