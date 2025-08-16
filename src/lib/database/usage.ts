/**
 * Database Usage Operations
 * Handles usage tracking and analytics database operations
 */

import { supabaseAdmin } from './supabase';
import type { BaseUsageTrackingData } from '@/lib/shared/types';
import type { UsageStats, TrackingResult } from './types';

// Generic usage tracking type that can be extended by features
export type UsageTrackingData = BaseUsageTrackingData & Record<string, unknown>;


/**
 * Validates only essential tracking data
 * Only portal ID is truly required for tracking - other fields are optional
 * to ensure we can track ALL requests including validation failures
 */
function validateTrackingData(data: UsageTrackingData): void {
  if (!data.portalId || data.portalId <= 0) {
    throw new Error('Valid portal ID is required for tracking');
  }
  // All other fields are optional to allow tracking of invalid requests
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
    // Only validate essential fields - we want to track ALL requests
    validateTrackingData(data);
    
    const timestamp = new Date();
    
    // Insert detailed usage record
    const { error: insertError } = await supabaseAdmin
      .from('date_formatter_usage')
      .insert({
        portal_id: data.portalId,
        source_date: data.sourceDate || null,
        source_format: data.sourceFormat || null,
        target_format: data.targetFormat || null,
        custom_target_format: data.customTargetFormat || null,
        formatted_date: data.formattedDate || null,
        success: data.success,
        error_message: data.errorMessage || null,
        request_timestamp: timestamp.toISOString(),
        created_at: timestamp.toISOString()
      });

    if (insertError) {
      throw new Error(`Failed to insert usage record: ${insertError.message}`);
    }

    // Monthly aggregation is now handled by UnifiedUsageAggregator via cron job
    // This provides better performance and reliability than real-time aggregation

    return {
      success: true,
      message: 'Usage tracked successfully'
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown tracking error';
    console.error('Usage tracking failed:', {
      error: errorMessage,
      data: data,
      timestamp: new Date().toISOString()
    });
    
    return {
      success: false,
      message: errorMessage,
      error: error instanceof Error ? error : new Error(errorMessage)
    };
  }
}

/**
 * Gets usage statistics for a specific portal (last 3 months, separated by app)
 */
export async function getUsageStats(portalId: number): Promise<UsageStats> {
  try {
    validatePortalId(portalId);

    // Get current month + last 2 months (3 total)
    const months: string[] = [];
    const now = new Date();
    for (let i = 0; i < 3; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0'); // Convert 0-based to 1-based month
      months.push(`${year}-${month}-01`);
    }

    // Query unified usage_monthly table for last 3 months
    const { data, error } = await supabaseAdmin
      .from('usage_monthly')
      .select('month_start, app_type, successful_requests, failed_requests')
      .eq('portal_id', portalId)
      .in('month_start', months);

    if (error) {
      throw new Error(`Failed to get usage stats: ${error.message}`);
    }

    const currentMonth = now.toISOString().slice(0, 7); // "2025-01"
    const appTypes = ['date-formatter', 'url-shortener'];
    
    // Create app-specific data structure
    const apps = appTypes.map(appType => {
      const monthlyData = months.map(monthStart => {
        const monthKey = monthStart.slice(0, 7); // Convert "2025-01-01" to "2025-01"
        const record = data?.find(d => 
          d.app_type === appType && 
          d.month_start === monthStart
        );
        
        return {
          month: monthKey,
          successfulRequests: record?.successful_requests || 0,
          failedRequests: record?.failed_requests || 0,
          isCurrentMonth: monthKey === currentMonth
        };
      });
      
      return {
        appType,
        monthlyData
      };
    });

    return {
      portalId,
      apps
    };

  } catch (error) {
    console.error('Failed to get usage stats:', error);
    throw error;
  }
}


/**
 * Fire-and-forget usage tracking wrapper
 * Never throws errors - logs them instead to prevent breaking webhook responses
 */
export async function trackUsageAsync(data: UsageTrackingData): Promise<void> {
  try {
    await trackUsage(data);
  } catch (error) {
    // Log error but don't throw - we don't want tracking failures to break webhooks
    console.error('Async usage tracking failed:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      portalId: data.portalId,
      timestamp: new Date().toISOString()
    });
  }
}

