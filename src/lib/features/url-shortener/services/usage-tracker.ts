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

