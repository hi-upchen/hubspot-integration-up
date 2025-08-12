/**
 * URL Validation Utility
 * Validates URLs before sending to shortening service
 */

/**
 * Validates if a string is a valid URL
 * @param urlString - The string to validate
 * @returns true if valid URL, false otherwise
 */
export function isValidUrl(urlString: string): boolean {
  if (!urlString || typeof urlString !== 'string') {
    return false;
  }
  
  // Trim whitespace
  const trimmed = urlString.trim();
  
  // Check for empty string
  if (trimmed.length === 0) {
    return false;
  }
  
  // Check for minimum length (e.g., "http://a.b")
  if (trimmed.length < 10) {
    return false;
  }
  
  // Check for maximum length (Bitly has a 2048 character limit)
  if (trimmed.length > 2048) {
    return false;
  }
  
  try {
    const url = new URL(trimmed);
    
    // Check for valid protocols
    const validProtocols = ['http:', 'https:'];
    if (!validProtocols.includes(url.protocol)) {
      return false;
    }
    
    // Check for hostname
    if (!url.hostname || url.hostname.length === 0) {
      return false;
    }
    
    // Check for valid hostname format
    const hostnameRegex = /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)*[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/;
    
    // Allow IP addresses
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    const ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
    
    const hostname = url.hostname.replace(/^\[|\]$/g, ''); // Remove brackets for IPv6
    
    if (!hostnameRegex.test(hostname) && !ipRegex.test(hostname) && !ipv6Regex.test(hostname) && hostname !== 'localhost') {
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
}

/**
 * Validates if a string is a valid custom domain
 * @param domain - The domain to validate
 * @returns true if valid domain, false otherwise
 */
export function isValidDomain(domain: string): boolean {
  if (!domain || typeof domain !== 'string') {
    return false;
  }
  
  const trimmed = domain.trim().toLowerCase();
  
  // Check for empty string
  if (trimmed.length === 0) {
    return false;
  }
  
  // Remove protocol if present
  const domainOnly = trimmed.replace(/^https?:\/\//, '').replace(/\/$/, '');
  
  // Check for valid domain format
  const domainRegex = /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
  
  return domainRegex.test(domainOnly);
}

/**
 * Normalizes a URL for consistent processing
 * @param urlString - The URL to normalize
 * @returns The normalized URL or null if invalid
 */
export function normalizeUrl(urlString: string): string | null {
  if (!isValidUrl(urlString)) {
    return null;
  }
  
  try {
    const url = new URL(urlString.trim());
    
    // Remove trailing slash from pathname if it's just "/"
    if (url.pathname === '/') {
      url.pathname = '';
    }
    
    // Sort query parameters for consistency
    if (url.search) {
      const params = new URLSearchParams(url.search);
      const sortedParams = new URLSearchParams([...params].sort());
      url.search = sortedParams.toString();
    }
    
    // Manually construct URL to avoid Node.js URL quirks
    let result = `${url.protocol}//${url.hostname}`;
    if (url.port && url.port !== '80' && url.port !== '443') {
      result += `:${url.port}`;
    }
    if (url.pathname && url.pathname !== '/') {
      result += url.pathname;
    }
    if (url.search) {
      result += url.search;
    }
    if (url.hash) {
      result += url.hash;
    }
    
    return result;
  } catch {
    return null;
  }
}

/**
 * Extracts the domain from a URL
 * @param urlString - The URL to extract domain from
 * @returns The domain or null if invalid
 */
export function extractDomain(urlString: string): string | null {
  try {
    const url = new URL(urlString.trim());
    return url.hostname;
  } catch {
    return null;
  }
}

/**
 * Checks if a URL is already shortened
 * @param urlString - The URL to check
 * @returns true if the URL appears to be shortened
 */
export function isAlreadyShortened(urlString: string): boolean {
  const shortenerDomains = [
    'bit.ly',
    'bitly.com',
    'tinyurl.com',
    'tiny.cc',
    'short.link',
    'ow.ly',
    'is.gd',
    'buff.ly',
    'soo.gd',
    'bl.ink',
    'branch.io',
    'cutt.ly',
    'lnkd.in',
    'rebrand.ly',
    'short.cm',
    't.co',
    'goo.gl'
  ];
  
  const domain = extractDomain(urlString);
  if (!domain) {
    return false;
  }
  
  return shortenerDomains.some(shortener => 
    domain === shortener || domain.endsWith(`.${shortener}`)
  );
}