/**
 * Usage Tracker Service
 * Handles request tracking and usage analytics
 */

import { supabaseAdmin } from '@/lib/supabase/client';
import { ensurePortalInfoExists } from './hubspot-portal';
import type { UsageTrackingData, TrackingResult, UsageStats, UsageAnalytics } from './types';

/**
 * Gets current month-year string in YYYY-MM format
 */
function getCurrentMonthYear(): string {
  return new Date().toISOString().slice(0, 7); // '2025-01'
}

/**
 * Validates usage tracking data
 */
function validateUsageData(data: UsageTrackingData): void {
  if (!data.portalId || data.portalId <= 0) {
    throw new Error('Valid portal ID is required');
  }
  if (!data.sourceDate?.trim()) {
    throw new Error('Source date is required');
  }
  if (!data.sourceFormat?.trim()) {
    throw new Error('Source format is required');
  }
  if (!data.targetFormat?.trim()) {
    throw new Error('Target format is required');
  }
}

/**
 * Validates portal ID parameter
 */
function validatePortalId(portalId: number): void {
  if (!portalId || portalId <= 0) {
    throw new Error('Valid portal ID is required');
  }
}

/**
 * Tracks a usage request with full request data
 * Uses database function for atomic updates to handle concurrency
 */
export async function trackUsage(data: UsageTrackingData): Promise<TrackingResult> {
  try {
    validateUsageData(data);
    
    const monthYear = getCurrentMonthYear();
    const timestamp = data.timestamp || new Date();
    
    // Ensure portal info exists (first-time setup)
    await ensurePortalInfoExists(data.portalId);
    
    // Log detailed request data (for analytics)
    const { error: logError } = await supabaseAdmin
      .from('usage_requests')
      .insert({
        portal_id: data.portalId,
        request_timestamp: timestamp.toISOString(),
        source_date: data.sourceDate,
        source_format: data.sourceFormat,
        target_format: data.targetFormat,
        custom_target_format: data.customTargetFormat,
        success: data.success,
        error_message: data.errorMessage,
        month_year: monthYear
      });
    
    if (logError) {
      console.error('Error logging usage request:', {
        portalId: data.portalId,
        error: logError,
        timestamp: timestamp.toISOString()
      });
    }
    
    // Return success even if some operations failed (non-blocking)
    return { success: true };
    
  } catch (error) {
    console.error('Usage tracking failed (non-blocking):', {
      portalId: data.portalId,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Gets current usage stats for a portal
 */
export async function getUsageStats(portalId: number): Promise<UsageStats> {
  try {
    validatePortalId(portalId);
    
    const monthYear = getCurrentMonthYear();
    
    // Get current month usage
    const { data: usage, error: usageError } = await supabaseAdmin
      .from('portal_usage_monthly')
      .select('request_count, success_count, error_count')
      .eq('portal_id', portalId)
      .eq('month_year', monthYear)
      .single();
    
    if (usageError && usageError.code !== 'PGRST116') {
      console.error('Error fetching usage stats:', {
        portalId,
        error: usageError,
        timestamp: new Date().toISOString()
      });
      throw new Error('Failed to fetch usage statistics');
    }
    
    const currentUsage = usage?.request_count || 0;
    const successCount = usage?.success_count || 0;
    const errorCount = usage?.error_count || 0;
    
    return {
      currentUsage,
      successCount,
      errorCount,
      monthYear
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes('Failed to fetch')) {
      throw error;
    }
    console.error('Error in getUsageStats:', error);
    throw new Error('Unexpected error while fetching usage statistics');
  }
}

/**
 * Gets usage analytics for a portal (last 12 months)
 */
export async function getUsageAnalytics(portalId: number): Promise<UsageAnalytics> {
  try {
    validatePortalId(portalId);
    
    const { data: monthlyData, error } = await supabaseAdmin
      .from('portal_usage_monthly')
      .select('month_year, request_count, success_count, error_count')
      .eq('portal_id', portalId)
      .order('month_year', { ascending: false })
      .limit(12);
    
    if (error) {
      console.error('Error fetching usage analytics:', {
        portalId,
        error,
        timestamp: new Date().toISOString()
      });
      throw new Error('Failed to fetch usage analytics');
    }
    
    const monthlyUsage = (monthlyData || []).map(row => ({
      monthYear: row.month_year,
      requestCount: row.request_count,
      successCount: row.success_count,
      errorCount: row.error_count
    }));
    
    const totalRequests = monthlyUsage.reduce((sum, month) => sum + month.requestCount, 0);
    const averageMonthlyRequests = monthlyUsage.length > 0 ? Math.round(totalRequests / monthlyUsage.length) : 0;
    
    return {
      monthlyUsage,
      totalRequests,
      averageMonthlyRequests
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes('Failed to fetch')) {
      throw error;
    }
    console.error('Error in getUsageAnalytics:', error);
    throw new Error('Unexpected error while fetching usage analytics');
  }
}