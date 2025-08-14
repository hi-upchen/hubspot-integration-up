/**
 * URL Shortener Service
 * Main service for handling URL shortening operations
 */

import { supabaseAdmin } from '@/lib/database/supabase';
import { decryptApiKey } from '@/lib/features/url-shortener/utils/encryption';
import { createBitlyService } from './bitly-service';
import { isValidUrl, isValidDomain, isAlreadyShortened } from './url-validator';

export interface UrlShortenerConfig {
  portalId: number;
  longUrl: string;
  customDomain?: string;
}

export interface UrlShortenerResult {
  success: boolean;
  shortUrl?: string;
  longUrl?: string;
  domain?: string;
  createdAt?: string;
  error?: string;
}

export interface ApiKeyRecord {
  portal_id: number;
  service_name: string;
  api_key: string;
  settings_json: Record<string, unknown>;
  verified_at: string | null;
}

/**
 * URL Shortener Service
 * Handles the complete flow of URL shortening
 */
export class UrlShortenerService {
  private supabase = supabaseAdmin;
  
  /**
   * Shortens a URL for a given portal
   * @param config - The configuration for shortening
   * @returns The shortened URL result
   */
  async shortenUrl(config: UrlShortenerConfig): Promise<UrlShortenerResult> {
    try {
      // Validate the URL
      if (!isValidUrl(config.longUrl)) {
        return {
          success: false,
          error: 'Invalid URL format. Please provide a valid HTTP or HTTPS URL.'
        };
      }
      
      // Check if URL is already shortened
      if (isAlreadyShortened(config.longUrl)) {
        return {
          success: false,
          error: 'This URL appears to already be shortened. Please provide the original long URL.'
        };
      }
      
      // Validate custom domain if provided
      if (config.customDomain && !isValidDomain(config.customDomain)) {
        return {
          success: false,
          error: 'Invalid custom domain format. Please provide a valid domain (e.g., yourdomain.com).'
        };
      }
      
      // Get the API key for this portal
      const apiKey = await this.getApiKey(config.portalId);
      if (!apiKey) {
        return {
          success: false,
          error: 'Please configure your Bitly API key in Integration Up dashboard. Go to your dashboard > URL Shortener Settings > Enter your Bitly API key.'
        };
      }
      
      // Decrypt the API key
      let decryptedKey: string;
      try {
        decryptedKey = decryptApiKey(apiKey.api_key);
      } catch (error) {
        console.error('Failed to decrypt API key:', error);
        return {
          success: false,
          error: 'Failed to decrypt API key. Please re-enter your API key in the dashboard.'
        };
      }
      
      // Create Bitly service and shorten the URL
      const bitlyService = createBitlyService(decryptedKey);
      const result = await bitlyService.shortenUrl(config.longUrl, config.customDomain);
      
      return {
        success: true,
        shortUrl: result.shortUrl,
        longUrl: result.longUrl,
        domain: result.domain,
        createdAt: result.createdAt
      };
      
    } catch (error) {
      console.error('URL shortening failed:', error);
      
      // Extract user-friendly error message
      const errorMessage = (error as Error).message;
      
      // Return appropriate error message
      if (errorMessage.includes('Rate limit')) {
        return {
          success: false,
          error: 'Bitly rate limit exceeded. Please try again in a few moments.'
        };
      }
      
      if (errorMessage.includes('Invalid Bitly API key')) {
        return {
          success: false,
          error: 'Invalid Bitly API key. Please check your API key in the dashboard settings.'
        };
      }
      
      if (errorMessage.includes('Invalid domain')) {
        return {
          success: false,
          error: errorMessage
        };
      }
      
      return {
        success: false,
        error: errorMessage || 'An unexpected error occurred while shortening the URL.'
      };
    }
  }
  
  /**
   * Gets the API key for a portal
   * @param portalId - The HubSpot portal ID
   * @returns The API key record or null
   */
  async getApiKey(portalId: number): Promise<ApiKeyRecord | null> {
    try {
      const { data, error } = await this.supabase
        .from('url_shortener_api_keys')
        .select('*')
        .eq('portal_id', portalId)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // No rows found
          return null;
        }
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Failed to get API key:', error);
      return null;
    }
  }
  
  /**
   * Saves or updates an API key for a portal
   * @param portalId - The HubSpot portal ID
   * @param apiKey - The encrypted API key
   * @param verified - Whether the key has been verified
   * @returns Success status
   */
  async saveApiKey(
    portalId: number,
    apiKey: string,
    verified: boolean = false
  ): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('url_shortener_api_keys')
        .upsert({
          portal_id: portalId,
          api_key: apiKey,
          service_name: 'bitly',
          verified_at: verified ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'portal_id'
        });
      
      if (error) {
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error('Failed to save API key:', error);
      return false;
    }
  }
  
  /**
   * Deletes the API key for a portal
   * @param portalId - The HubSpot portal ID
   * @returns Success status
   */
  async deleteApiKey(portalId: number): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('url_shortener_api_keys')
        .delete()
        .eq('portal_id', portalId);
      
      if (error) {
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error('Failed to delete API key:', error);
      return false;
    }
  }
  
  /**
   * Validates an API key by testing with Bitly
   * @param apiKey - The decrypted API key to validate
   * @returns Whether the key is valid
   */
  async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      const bitlyService = createBitlyService(apiKey);
      return await bitlyService.validateApiKey();
    } catch (error) {
      console.error('Failed to validate API key:', error);
      return false;
    }
  }
}

/**
 * Gets a singleton instance of the URL shortener service
 */
let urlShortenerService: UrlShortenerService | null = null;

export function getUrlShortenerService(): UrlShortenerService {
  if (!urlShortenerService) {
    urlShortenerService = new UrlShortenerService();
  }
  return urlShortenerService;
}