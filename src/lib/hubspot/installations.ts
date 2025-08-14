import { supabaseAdmin } from '@/lib/database/supabase';
import type { HubSpotInstallation } from './types';
import type { AppType } from '@/lib/shared/types';

/**
 * Database operations for managing HubSpot app installations
 * Pure functions for CRUD operations on installation records
 */

type TokenUpdateData = {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
};


/**
 * Helper function to transform database record to domain model
 */
function transformInstallationRecord(data: Record<string, unknown>): HubSpotInstallation {
  return {
    id: data.id as string,
    hubId: data.hub_id as number,
    accessToken: data.access_token as string,
    refreshToken: data.refresh_token as string,
    expiresAt: data.expires_at as string,
    scope: data.scope as string,
    appType: data.app_type as AppType,
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string
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