/**
 * HubSpot Portal Service
 * Business logic for managing portal information
 */

import { supabaseAdmin } from '@/lib/supabase/client';
import { fetchHubSpotAccessTokenInfo } from '@/lib/hubspot/portal-api';
import type { PortalInfo, PortalUserData } from './types';
import type { HubSpotAccessTokenResponse } from '@/lib/hubspot/types';

/**
 * Gets portal information from database only
 * @param portalId - The portal ID to look up
 * @returns Portal info or null if not found
 */
export async function getPortalInfo(portalId: number): Promise<PortalInfo | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('portal_info')
      .select('*')
      .eq('portal_id', portalId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') { // No rows found
        return null;
      }
      console.error('Database error fetching portal info:', error);
      throw new Error('Failed to fetch portal info from database');
    }
    
    return transformDatabaseToPortalInfo(data);
  } catch (error) {
    if (error instanceof Error && error.message.includes('Failed to fetch')) {
      throw error;
    }
    console.error('Error in getPortalInfo:', error);
    throw new Error('Unexpected error while fetching portal info');
  }
}

/**
 * Creates new portal info by fetching from HubSpot and saving to database
 * @param portalId - The portal ID to create info for
 * @returns Created portal info
 */
export async function createPortalInfo(portalId: number): Promise<PortalInfo> {
  try {
    // Get access token for this portal
    const { data: tokenData, error: tokenError } = await supabaseAdmin
      .from('hubspot_installations')
      .select('access_token')
      .eq('hub_id', portalId)
      .single();
    
    if (tokenError || !tokenData?.access_token) {
      throw new Error(`No access token found for portal ${portalId}`);
    }
    
    // Fetch portal info from HubSpot
    const hubspotData = await fetchHubSpotAccessTokenInfo(tokenData.access_token);
    
    // Transform and save to database
    const portalData = {
      portal_id: portalId,
      portal_name: hubspotData.hub_domain,
      user_email: hubspotData.user,
      domain: hubspotData.hub_domain,
      hubspot_user_id: hubspotData.user_id,
      hub_id: hubspotData.hub_id,
    };
    
    const { data: savedData, error: saveError } = await supabaseAdmin
      .from('portal_info')
      .insert(portalData)
      .select()
      .single();
    
    if (saveError) {
      console.error('Error saving portal info:', saveError);
      throw new Error('Failed to save portal info to database');
    }
    
    return transformDatabaseToPortalInfo(savedData);
  } catch (error) {
    console.error('Error in createPortalInfo:', error);
    throw error instanceof Error 
      ? error 
      : new Error('Unexpected error while creating portal info');
  }
}

/**
 * Gets existing portal info or creates new one if not found
 * @param portalId - The portal ID to get or create
 * @returns Portal info (existing or newly created)
 */
export async function getOrCreatePortalInfo(portalId: number): Promise<PortalInfo> {
  const existing = await getPortalInfo(portalId);
  if (existing) {
    return existing;
  }
  
  return await createPortalInfo(portalId);
}

/**
 * Updates user-provided portal information
 * @param portalId - The portal ID to update
 * @param userData - User name and organization name
 * @returns Updated portal info or null if portal not found
 */
export async function updatePortalUserInfo(portalId: number, userData: PortalUserData): Promise<PortalInfo | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('portal_info')
      .update({
        user_name: userData.userName,
        organization_name: userData.organizationName,
        updated_at: new Date().toISOString(),
      })
      .eq('portal_id', portalId)
      .select()
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') { // No rows found
        return null;
      }
      console.error('Error updating portal user info:', error);
      throw new Error('Failed to update portal user info');
    }
    
    return transformDatabaseToPortalInfo(data);
  } catch (error) {
    if (error instanceof Error && error.message.includes('Failed to update')) {
      throw error;
    }
    console.error('Error in updatePortalUserInfo:', error);
    throw new Error('Unexpected error while updating portal user info');
  }
}

/**
 * Ensures portal info exists in database (creates if needed)
 * @param portalId - The portal ID to ensure exists
 * @returns Portal info (guaranteed to exist)
 */
export async function ensurePortalInfoExists(portalId: number): Promise<PortalInfo> {
  return await getOrCreatePortalInfo(portalId);
}

/**
 * Transforms database row to PortalInfo interface
 */
function transformDatabaseToPortalInfo(data: any): PortalInfo {
  return {
    portalId: data.portal_id,
    portalName: data.portal_name,
    userEmail: data.user_email,
    domain: data.domain,
    userName: data.user_name,
    organizationName: data.organization_name,
    hubspotUserId: data.hubspot_user_id,
    hubId: data.hub_id,
  };
}