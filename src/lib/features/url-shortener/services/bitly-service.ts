/**
 * Bitly API Service
 * Handles URL shortening using Bitly's v4 API
 */

export interface BitlyConfig {
  apiKey: string;
  baseUrl?: string;
}

export interface ShortenResult {
  shortUrl: string;
  longUrl: string;
  domain: string;
  createdAt: string;
  id: string;
}

export interface BitlyError {
  message: string;
  errors?: Array<{
    field: string;
    error_code: string;
  }>;
}

export class BitlyService {
  private readonly MAX_RETRIES = 3;
  private readonly BASE_URL = 'https://api-ssl.bitly.com/v4';
  private readonly RETRY_DELAY_MS = 1000;
  
  constructor(private config: BitlyConfig) {
    if (!config.apiKey) {
      throw new Error('Bitly API key is required');
    }
  }
  
  /**
   * Shortens a URL using Bitly API
   * @param longUrl - The URL to shorten
   * @param customDomain - Optional custom branded domain
   * @returns The shortened URL details
   */
  async shortenUrl(longUrl: string, customDomain?: string): Promise<ShortenResult> {
    // If custom domain not provided, get user's default domain
    let domain = customDomain;
    if (!domain) {
      try {
        domain = await this.getUserDefaultDomain();
      } catch {
        // If we can't get default domain, Bitly will use bit.ly
        domain = undefined;
      }
    }
    
    const payload: Record<string, unknown> = {
      long_url: longUrl,
      domain: domain || 'bit.ly',
      group_guid: await this.getDefaultGroupGuid()
    };
    
    return this.retryWithBackoff(async () => {
      const response = await fetch(`${this.BASE_URL}/shorten`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const error = await response.json() as BitlyError;
        
        // Handle rate limiting
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.');
        }
        
        // Handle authentication errors
        if (response.status === 403 || response.status === 401) {
          throw new Error('Invalid Bitly API key. Please check your configuration.');
        }
        
        // Handle validation errors
        if (response.status === 400) {
          if (error.message?.includes('INVALID_ARG_LONG_URL')) {
            throw new Error('Invalid URL format. Please provide a valid URL.');
          }
          if (error.message?.includes('INVALID_ARG_DOMAIN')) {
            throw new Error(`Invalid domain: ${domain}. Please check your custom domain setting.`);
          }
        }
        
        throw new Error(error.message || 'Failed to shorten URL');
      }
      
      const data = await response.json();
      
      return {
        shortUrl: data.link,
        longUrl: data.long_url,
        domain: new URL(data.link).hostname,
        createdAt: data.created_at || new Date().toISOString(),
        id: data.id
      };
    });
  }
  
  /**
   * Validates the API key by making a test request
   * @returns true if the API key is valid
   */
  async validateApiKey(): Promise<boolean> {
    try {
      const response = await fetch(`${this.BASE_URL}/user`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
        }
      });
      
      return response.ok;
    } catch {
      return false;
    }
  }
  
  /**
   * Gets the user's default branded domain
   * @returns The default domain or 'bit.ly' if none configured
   */
  async getUserDefaultDomain(): Promise<string> {
    try {
      const response = await fetch(`${this.BASE_URL}/user`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
        }
      });
      
      if (!response.ok) {
        return 'bit.ly';
      }
      
      const data = await response.json();
      return data.default_group_guid ? await this.getGroupDomain(data.default_group_guid) : 'bit.ly';
    } catch {
      return 'bit.ly';
    }
  }
  
  /**
   * Gets the default group GUID for the user
   * @returns The group GUID
   */
  private async getDefaultGroupGuid(): Promise<string> {
    try {
      const response = await fetch(`${this.BASE_URL}/groups`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to get groups');
      }
      
      const data = await response.json();
      if (data.groups && data.groups.length > 0) {
        return data.groups[0].guid;
      }
      
      throw new Error('No groups found');
    } catch (error) {
      throw new Error('Failed to get default group: ' + (error as Error).message);
    }
  }
  
  /**
   * Gets the domain for a specific group
   * @param groupGuid - The group GUID
   * @returns The domain for the group
   */
  private async getGroupDomain(groupGuid: string): Promise<string> {
    try {
      const response = await fetch(`${this.BASE_URL}/groups/${groupGuid}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
        }
      });
      
      if (!response.ok) {
        return 'bit.ly';
      }
      
      const data = await response.json();
      return data.bsds?.[0]?.domain || 'bit.ly';
    } catch {
      return 'bit.ly';
    }
  }
  
  /**
   * Implements retry logic with exponential backoff
   * @param fn - The function to retry
   * @returns The result of the function
   */
  private async retryWithBackoff<T>(fn: () => Promise<T>): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < this.MAX_RETRIES; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on authentication or validation errors
        if (lastError.message.includes('Invalid Bitly API key') ||
            lastError.message.includes('Invalid URL format') ||
            lastError.message.includes('Invalid domain')) {
          throw lastError;
        }
        
        // Calculate delay with exponential backoff
        const delay = this.RETRY_DELAY_MS * Math.pow(2, attempt);
        
        // Don't wait on the last attempt
        if (attempt < this.MAX_RETRIES - 1) {
          await this.sleep(delay);
        }
      }
    }
    
    throw lastError || new Error('Failed after maximum retries');
  }
  
  /**
   * Sleep utility for retry delays
   * @param ms - Milliseconds to sleep
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Creates a new Bitly service instance
 * @param apiKey - The Bitly API key
 * @returns A configured Bitly service
 */
export function createBitlyService(apiKey: string): BitlyService {
  return new BitlyService({ apiKey });
}