/**
 * URL Shortener Usage Tracker
 * Tracks usage statistics for URL shortening operations
 */

import { supabaseAdmin } from '@/lib/database/supabase';

export interface UrlShortenerUsageData {
  portalId: number;
  longUrl?: string;
  shortUrl?: string;
  customDomain?: string;
  success: boolean;
  errorMessage?: string;
  responseTimeMs?: number;
}

/**
 * Tracks URL shortener usage
 * NOTE: This must be awaited in Vercel Functions (not fire-and-forget)
 */
export async function trackUrlShortenerUsage(data: UrlShortenerUsageData): Promise<void> {
  const supabase = supabaseAdmin;
  
  try {
    // Insert usage record
    const { error } = await supabase
      .from('url_shortener_usage')
      .insert({
        portal_id: data.portalId,
        long_url: data.longUrl?.substring(0, 2048), // Limit URL length
        short_url: data.shortUrl?.substring(0, 500),
        custom_domain: data.customDomain?.substring(0, 255),
        service_used: 'bitly',
        success: data.success,
        error_message: data.errorMessage?.substring(0, 500),
        response_time_ms: data.responseTimeMs,
        request_timestamp: new Date().toISOString()
      });
    
    if (error) {
      // Log error but don't throw - we don't want tracking failures to break the webhook
      console.error('Failed to track URL shortener usage:', {
        error,
        portalId: data.portalId,
        request_timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    // Log error but don't throw
    console.error('Exception tracking URL shortener usage:', {
      error,
      portalId: data.portalId,
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * Gets usage statistics for a portal
 * @param portalId - The HubSpot portal ID
 * @param startDate - Start date for the period
 * @param endDate - End date for the period
 */
export async function getUrlShortenerUsageStats(
  portalId: number,
  startDate?: Date,
  endDate?: Date
) {
  const supabase = supabaseAdmin;
  
  try {
    let query = supabase
      .from('url_shortener_usage')
      .select('*')
      .eq('portal_id', portalId)
      .order('request_timestamp', { ascending: false });
    
    if (startDate) {
      query = query.gte('request_timestamp', startDate.toISOString());
    }
    
    if (endDate) {
      query = query.lte('request_timestamp', endDate.toISOString());
    }
    
    const { data, error } = await query;
    
    if (error) {
      throw error;
    }
    
    // Calculate statistics
    const total = data?.length || 0;
    const successful = data?.filter(r => r.success).length || 0;
    const failed = total - successful;
    const uniqueDomains = new Set(data?.map(r => r.custom_domain).filter(Boolean)).size;
    const avgResponseTime = data?.length 
      ? data.reduce((sum, r) => sum + (r.response_time_ms || 0), 0) / data.length 
      : 0;
    
    return {
      total,
      successful,
      failed,
      uniqueDomains,
      avgResponseTime: Math.round(avgResponseTime),
      requests: data
    };
  } catch (error) {
    console.error('Failed to get usage stats:', error);
    return {
      total: 0,
      successful: 0,
      failed: 0,
      uniqueDomains: 0,
      avgResponseTime: 0,
      requests: []
    };
  }
}

/**
 * Gets monthly aggregated usage for a portal
 * @param portalId - The HubSpot portal ID
 * @param months - Number of months to retrieve
 */
export async function getMonthlyUsageStats(portalId: number, months: number = 12) {
  const supabase = supabaseAdmin;
  
  try {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);
    
    const { data, error } = await supabase
      .from('url_shortener_usage_monthly')
      .select('*')
      .eq('portal_id', portalId)
      .gte('month', startDate.toISOString().substring(0, 7) + '-01')
      .order('month', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Failed to get monthly usage stats:', error);
    return [];
  }
}

/**
 * Aggregates daily usage into monthly statistics
 * This should be called by a cron job, not in the webhook handler
 */
export async function aggregateMonthlyUsage(portalId: number, month: string): Promise<void> {
  const supabase = supabaseAdmin;
  
  try {
    // Get start and end dates for the month
    const startDate = new Date(month + '-01');
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);
    endDate.setDate(0); // Last day of the month
    
    // Get all usage for the month
    const { data, error } = await supabase
      .from('url_shortener_usage')
      .select('*')
      .eq('portal_id', portalId)
      .gte('request_timestamp', startDate.toISOString())
      .lt('request_timestamp', endDate.toISOString());
    
    if (error) {
      throw error;
    }
    
    // Calculate aggregates
    const total = data?.length || 0;
    const successful = data?.filter(r => r.success).length || 0;
    const failed = total - successful;
    const uniqueDomains = new Set(data?.map(r => r.custom_domain).filter(Boolean)).size;
    
    // Upsert monthly stats
    const { error: upsertError } = await supabase
      .from('url_shortener_usage_monthly')
      .upsert({
        portal_id: portalId,
        month: month + '-01',
        total_requests: total,
        successful_requests: successful,
        failed_requests: failed,
        unique_domains_used: uniqueDomains,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'portal_id,month'
      });
    
    if (upsertError) {
      throw upsertError;
    }
  } catch (error) {
    console.error('Failed to aggregate monthly usage:', error);
    throw error;
  }
}