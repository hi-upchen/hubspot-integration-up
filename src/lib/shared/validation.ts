/**
 * Common validation functions used across features
 */

/**
 * Validates if a value is a non-empty string
 */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Validates if a portal ID is valid
 */
export function isValidPortalId(portalId: unknown): portalId is number {
  return typeof portalId === 'number' && portalId > 0 && Number.isInteger(portalId);
}

/**
 * Validates if a URL is well-formed
 */
export function isValidUrl(url: string): boolean {
  if (!isNonEmptyString(url)) {
    return false;
  }
  
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validates if a URL is HTTP or HTTPS
 */
export function isHttpUrl(url: string): boolean {
  if (!isValidUrl(url)) {
    return false;
  }
  
  const parsed = new URL(url);
  return parsed.protocol === 'http:' || parsed.protocol === 'https:';
}

/**
 * Sanitizes a string by trimming and removing extra whitespace
 */
export function sanitizeString(value: unknown): string {
  if (typeof value !== 'string') {
    return '';
  }
  return value.trim().replace(/\s+/g, ' ');
}

/**
 * Validates email format (basic validation)
 */
export function isValidEmail(email: string): boolean {
  if (!isNonEmptyString(email)) {
    return false;
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates if a domain name is valid
 */
export function isValidDomain(domain: string): boolean {
  if (!isNonEmptyString(domain)) {
    return false;
  }
  
  // Basic domain validation
  const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return domainRegex.test(domain) && domain.length <= 253;
}