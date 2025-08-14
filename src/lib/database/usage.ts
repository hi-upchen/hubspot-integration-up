/**
 * Database Usage Operations
 * Handles usage tracking and analytics database operations
 */

import { supabaseAdmin } from './supabase';
import type { BaseUsageTrackingData } from '@/lib/shared/types';
import type { UsageStats, TrackingResult } from './types';

// Generic usage tracking type that can be extended by features
export type UsageTrackingData = BaseUsageTrackingData & Record<string, any>;

/**
 * Gets current month-year string in YYYY-MM format
 */
function getCurrentMonthYear(): string {
  return new Date().toISOString().slice(0, 7); // '2025-01'
}

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
    
    const monthYear = getCurrentMonthYear();
    const timestamp = new Date();
    
    // Insert detailed usage record
    const { error: insertError } = await supabaseAdmin
      .from('usage_requests')
      .insert({
        portal_id: data.portalId,
        source_date: data.sourceDate || null,
        source_format: data.sourceFormat || null,
        target_format: data.targetFormat || null,
        custom_target_format: data.customTargetFormat || null,
        formatted_date: data.formattedDate || null,
        success: data.success,
        error_message: data.errorMessage || null,
        created_at: timestamp.toISOString()
      });

    if (insertError) {
      throw new Error(`Failed to insert usage record: ${insertError.message}`);
    }

    // Update monthly aggregates using atomic operations
    const { error: upsertError } = await supabaseAdmin
      .rpc('upsert_monthly_usage', {
        p_portal_id: data.portalId,
        p_month_year: monthYear,
        p_success: data.success
      });

    if (upsertError) {
      // Log but don't throw - detailed record was saved successfully
      console.error('Failed to update monthly aggregates:', upsertError);
    }

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
 * Gets usage statistics for a specific portal
 */
export async function getUsageStats(portalId: number): Promise<UsageStats> {
  try {
    validatePortalId(portalId);

    const { data, error } = await supabaseAdmin
      .from('portal_usage_monthly')
      .select('*')
      .eq('portal_id', portalId)
      .order('month_year', { ascending: false });

    if (error) {
      throw new Error(`Failed to get usage stats: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        successRate: 0,
        thisMonth: 0,
        lastMonth: 0,
        averagePerDay: 0
      };
    }

    // Calculate aggregated stats with null safety
    const totalRequests = data.reduce((sum, month) => sum + (month.total_requests || 0), 0);
    const successfulRequests = data.reduce((sum, month) => sum + (month.successful_requests || 0), 0);
    const failedRequests = data.reduce((sum, month) => sum + (month.failed_requests || 0), 0);
    const successRate = totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 0;

    const currentMonth = getCurrentMonthYear();
    const lastMonthDate = new Date();
    lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
    const lastMonth = lastMonthDate.toISOString().slice(0, 7);

    const thisMonthData = data.find(month => month.month_year === currentMonth);
    const lastMonthData = data.find(month => month.month_year === lastMonth);

    const thisMonthRequests = thisMonthData?.total_requests || 0;
    const lastMonthRequests = lastMonthData?.total_requests || 0;

    // Calculate average per day based on current month
    const daysInMonth = new Date().getDate();
    const averagePerDay = daysInMonth > 0 ? thisMonthRequests / daysInMonth : 0;

    return {
      totalRequests,
      successfulRequests,
      failedRequests,
      successRate: Math.round(successRate * 100) / 100, // Round to 2 decimal places
      thisMonth: thisMonthRequests,
      lastMonth: lastMonthRequests,
      averagePerDay: Math.round(averagePerDay * 100) / 100
    };

  } catch (error) {
    console.error('Failed to get usage stats:', error);
    throw error;
  }
}

/**
 * Gets 12-month historical usage analytics for dashboard charts
 */
export async function getUsageAnalytics(portalId: number) {
  try {
    validatePortalId(portalId);

    // Get last 12 months of data
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
    const startMonth = twelveMonthsAgo.toISOString().slice(0, 7);

    const { data, error } = await supabaseAdmin
      .from('portal_usage_monthly')
      .select('*')
      .eq('portal_id', portalId)
      .gte('month_year', startMonth)
      .order('month_year', { ascending: true });

    if (error) {
      throw new Error(`Failed to get usage analytics: ${error.message}`);
    }

    // Create array of last 12 months
    const months = [];
    const monthlyData = new Map();
    
    // Map data by month
    if (data) {
      data.forEach(item => {
        monthlyData.set(item.month_year, {
          total: item.total_requests,
          successful: item.successful_requests,
          failed: item.failed_requests
        });
      });
    }

    // Fill in all 12 months with zeros for missing data
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = date.toISOString().slice(0, 7);
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      const data = monthlyData.get(monthKey) || { total: 0, successful: 0, failed: 0 };
      months.push({
        month: monthKey,
        monthName,
        ...data
      });
    }

    return {
      months,
      summary: {
        totalRequests: months.reduce((sum, m) => sum + m.total, 0),
        successRate: months.reduce((sum, m) => sum + m.total, 0) > 0 
          ? (months.reduce((sum, m) => sum + m.successful, 0) / months.reduce((sum, m) => sum + m.total, 0)) * 100 
          : 0
      }
    };

  } catch (error) {
    console.error('Failed to get usage analytics:', error);
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

export class UsageService {
  /**
   * Track usage for any feature type
   */
  async track(data: UsageTrackingData): Promise<TrackingResult> {
    return trackUsage(data);
  }

  /**
   * Get usage statistics for a portal
   */  
  async getStats(portalId: number): Promise<UsageStats> {
    return getUsageStats(portalId);
  }

  /**
   * Fire-and-forget tracking (for webhooks)
   */
  async trackAsync(data: UsageTrackingData): Promise<void> {
    return trackUsageAsync(data);
  }
}

// Export singleton instance
export const usageService = new UsageService();