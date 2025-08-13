/**
 * Pure database operations for portal information
 * No business logic - just CRUD operations
 */

import { supabaseAdmin } from './supabase';

export interface PortalInfoRecord {
  portal_id: number;
  name: string;
  domain: string;
  user_email: string | null;
  user_name: string | null;
  organization: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Gets portal info record from database
 */
export async function getPortalInfoRecord(portalId: number): Promise<PortalInfoRecord | null> {
  const { data, error } = await supabaseAdmin
    .from('portal_info')
    .select('*')
    .eq('portal_id', portalId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    throw error;
  }

  return data;
}

/**
 * Creates portal info record in database
 */
export async function createPortalInfoRecord(portalInfo: Omit<PortalInfoRecord, 'created_at' | 'updated_at'>): Promise<PortalInfoRecord> {
  const { data, error } = await supabaseAdmin
    .from('portal_info')
    .insert(portalInfo)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Updates portal info record in database
 */
export async function updatePortalInfoRecord(
  portalId: number, 
  updates: Partial<Omit<PortalInfoRecord, 'portal_id' | 'created_at' | 'updated_at'>>
): Promise<PortalInfoRecord> {
  const { data, error } = await supabaseAdmin
    .from('portal_info')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('portal_id', portalId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Deletes portal info record from database
 */
export async function deletePortalInfoRecord(portalId: number): Promise<void> {
  const { error } = await supabaseAdmin
    .from('portal_info')
    .delete()
    .eq('portal_id', portalId);

  if (error) {
    throw error;
  }
}