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

/**
 * Custom error class that preserves Bitly HTTP status code
 */
export class BitlyApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly endpoint: string
  ) {
    super(message);
    this.name = 'BitlyApiError';
  }
}

// Module-level caches — persist across warm Vercel instances
// Keyed by hashed API key for security, with TTL for freshness
interface CacheEntry {
  value: string;
  expiresAt: number;
}

const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes
const CACHE_MAX_SIZE = 1000;

const groupGuidCache = new Map<string, CacheEntry>();
const defaultDomainCache = new Map<string, CacheEntry>();

/**
 * Creates a simple hash of the API key for use as cache key
 */
function hashKey(apiKey: string): string {
  let hash = 0;
  for (let i = 0; i < apiKey.length; i++) {
    const char = apiKey.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32-bit integer
  }
  return hash.toString(36);
}

function getCacheEntry(cache: Map<string, CacheEntry>, key: string): string | undefined {
  const entry = cache.get(key);
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return undefined;
  }
  return entry.value;
}

function setCacheEntry(cache: Map<string, CacheEntry>, key: string, value: string): void {
  // Evict oldest entries if cache is too large
  if (cache.size >= CACHE_MAX_SIZE) {
    const firstKey = cache.keys().next().value;
    if (firstKey) cache.delete(firstKey);
  }
  cache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
}

/**
 * Clears all module-level Bitly caches (for testing)
 */
export function clearBitlyCache(): void {
  groupGuidCache.clear();
  defaultDomainCache.clear();
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
      // Let BitlyApiError propagate — caller needs to see Bitly status
      domain = await this.getUserDefaultDomain();
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
        let message = 'Failed to shorten URL';
        try {
          const error = await response.json() as BitlyError;
          if (error.message) message = error.message;
        } catch { /* use default message */ }
        throw new BitlyApiError(message, response.status, '/shorten');
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
    // Check module-level cache first
    const cacheKey = hashKey(this.config.apiKey);
    const cached = getCacheEntry(defaultDomainCache, cacheKey);
    if (cached) {
      return cached;
    }

    const response = await fetch(`${this.BASE_URL}/user`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
      }
    });

    if (!response.ok) {
      let message = 'Failed to get Bitly user info';
      try {
        const body = await response.json();
        if (body.message) message = body.message;
      } catch { /* use default message */ }
      throw new BitlyApiError(message, response.status, '/user');
    }

    const data = await response.json();
    if (!data.default_group_guid) {
      const domain = 'bit.ly';
      setCacheEntry(defaultDomainCache, cacheKey, domain);
      return domain;
    }

    const domain = await this.getGroupDomain(data.default_group_guid);
    setCacheEntry(defaultDomainCache, cacheKey, domain);
    return domain;
  }
  
  /**
   * Gets the default group GUID for the user
   * @returns The group GUID
   */
  private async getDefaultGroupGuid(): Promise<string> {
    // Check module-level cache first
    const cacheKey = hashKey(this.config.apiKey);
    const cached = getCacheEntry(groupGuidCache, cacheKey);
    if (cached) {
      return cached;
    }

    const response = await fetch(`${this.BASE_URL}/groups`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
      }
    });

    if (!response.ok) {
      let message = 'Failed to get Bitly groups';
      try {
        const body = await response.json();
        if (body.message) message = body.message;
      } catch { /* use default message */ }
      throw new BitlyApiError(message, response.status, '/groups');
    }

    const data = await response.json();
    if (!data.groups || data.groups.length === 0) {
      throw new BitlyApiError('No Bitly groups found for this account', 404, '/groups');
    }

    const guid = data.groups[0].guid;
    setCacheEntry(groupGuidCache, cacheKey, guid);
    return guid;
  }
  
  /**
   * Gets the domain for a specific group
   * @param groupGuid - The group GUID
   * @returns The domain for the group
   */
  private async getGroupDomain(groupGuid: string): Promise<string> {
    const response = await fetch(`${this.BASE_URL}/groups/${groupGuid}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
      }
    });

    if (!response.ok) {
      let message = 'Failed to get Bitly group details';
      try {
        const body = await response.json();
        if (body.message) message = body.message;
      } catch { /* use default message */ }
      throw new BitlyApiError(message, response.status, `/groups/${groupGuid}`);
    }

    const data = await response.json();
    return data.bsds?.[0]?.domain || 'bit.ly';
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

        // Don't retry on client errors (4xx) — user needs to fix these
        // Exception: 429 (rate limit) is retryable
        if (error instanceof BitlyApiError && error.statusCode >= 400 && error.statusCode < 500 && error.statusCode !== 429) {
          throw error;
        }

        // Don't wait on the last attempt
        if (attempt < this.MAX_RETRIES - 1) {
          const delay = this.RETRY_DELAY_MS * Math.pow(2, attempt);
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