/**
 * Tests for URL Validator
 */

import {
  isValidUrl,
  isValidDomain,
  normalizeUrl,
  extractDomain,
  isAlreadyShortened
} from '@/lib/features/url-shortener/services/url-validator';

describe('URL Validator', () => {
  describe('isValidUrl', () => {
    it('should validate valid HTTP URLs', () => {
      expect(isValidUrl('http://example.com')).toBe(true);
      expect(isValidUrl('http://www.example.com')).toBe(true);
      expect(isValidUrl('http://example.com/path')).toBe(true);
      expect(isValidUrl('http://example.com/path?query=value')).toBe(true);
      expect(isValidUrl('http://example.com:8080')).toBe(true);
    });

    it('should validate valid HTTPS URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('https://www.example.com')).toBe(true);
      expect(isValidUrl('https://example.com/path')).toBe(true);
      expect(isValidUrl('https://example.com/path?query=value')).toBe(true);
      expect(isValidUrl('https://example.com:443')).toBe(true);
    });

    it('should validate URLs with IP addresses', () => {
      expect(isValidUrl('http://192.168.1.1')).toBe(true);
      expect(isValidUrl('https://127.0.0.1:8080')).toBe(true);
      expect(isValidUrl('http://localhost')).toBe(true);
    });

    it('should reject invalid protocols', () => {
      expect(isValidUrl('ftp://example.com')).toBe(false);
      expect(isValidUrl('file://example.com')).toBe(false);
      expect(isValidUrl('javascript:alert(1)')).toBe(false);
    });

    it('should reject malformed URLs', () => {
      expect(isValidUrl('not-a-url')).toBe(false);
      expect(isValidUrl('http://')).toBe(false);
      expect(isValidUrl('https://')).toBe(false);
      expect(isValidUrl('http://.')).toBe(false);
      expect(isValidUrl('http://..')).toBe(false);
    });

    it('should reject empty or null values', () => {
      expect(isValidUrl('')).toBe(false);
      expect(isValidUrl('   ')).toBe(false);
      expect(isValidUrl(null as any)).toBe(false);
      expect(isValidUrl(undefined as any)).toBe(false);
    });

    it('should reject URLs that are too long', () => {
      const longUrl = 'https://example.com/' + 'a'.repeat(2100);
      expect(isValidUrl(longUrl)).toBe(false);
    });

    it('should reject URLs that are too short', () => {
      expect(isValidUrl('http://a')).toBe(false);
      expect(isValidUrl('https://a')).toBe(false);
    });

    it('should handle URLs with special characters', () => {
      // Note: URL constructor accepts spaces and automatically encodes them
      expect(isValidUrl('https://example.com/path with spaces')).toBe(true);
      expect(isValidUrl('https://example.com/path%20with%20spaces')).toBe(true);
      expect(isValidUrl('https://example.com/path-with-dashes')).toBe(true);
      expect(isValidUrl('https://example.com/path_with_underscores')).toBe(true);
    });
  });

  describe('isValidDomain', () => {
    it('should validate proper domain names', () => {
      expect(isValidDomain('example.com')).toBe(true);
      expect(isValidDomain('www.example.com')).toBe(true);
      expect(isValidDomain('sub.domain.example.com')).toBe(true);
      expect(isValidDomain('example-site.co.uk')).toBe(true);
    });

    it('should reject invalid domains', () => {
      expect(isValidDomain('')).toBe(false);
      expect(isValidDomain('   ')).toBe(false);
      expect(isValidDomain('example')).toBe(false);
      expect(isValidDomain('.com')).toBe(false);
      expect(isValidDomain('example.')).toBe(false);
      expect(isValidDomain('ex..ample.com')).toBe(false);
    });

    it('should handle domains with protocols', () => {
      expect(isValidDomain('https://example.com')).toBe(true);
      expect(isValidDomain('http://www.example.com')).toBe(true);
      expect(isValidDomain('https://example.com/')).toBe(true);
    });

    it('should reject null/undefined values', () => {
      expect(isValidDomain(null as any)).toBe(false);
      expect(isValidDomain(undefined as any)).toBe(false);
    });
  });

  describe('normalizeUrl', () => {
    it('should normalize valid URLs', () => {
      expect(normalizeUrl('https://example.com')).toBe('https://example.com');
      expect(normalizeUrl('https://example.com/')).toBe('https://example.com');
      expect(normalizeUrl('https://example.com/path')).toBe('https://example.com/path');
    });

    it('should sort query parameters', () => {
      const normalized = normalizeUrl('https://example.com?z=1&a=2&m=3');
      expect(normalized).toBe('https://example.com?a=2&m=3&z=1');
    });

    it('should return null for invalid URLs', () => {
      expect(normalizeUrl('not-a-url')).toBe(null);
      expect(normalizeUrl('')).toBe(null);
      expect(normalizeUrl('ftp://example.com')).toBe(null);
    });

    it('should handle edge cases', () => {
      expect(normalizeUrl('  https://example.com  ')).toBe('https://example.com');
    });
  });

  describe('extractDomain', () => {
    it('should extract domain from URLs', () => {
      expect(extractDomain('https://example.com')).toBe('example.com');
      expect(extractDomain('https://www.example.com/path')).toBe('www.example.com');
      expect(extractDomain('http://sub.domain.example.com:8080')).toBe('sub.domain.example.com');
    });

    it('should return null for invalid URLs', () => {
      expect(extractDomain('not-a-url')).toBe(null);
      expect(extractDomain('')).toBe(null);
      expect(extractDomain('invalid')).toBe(null);
    });

    it('should handle URLs with whitespace', () => {
      expect(extractDomain('  https://example.com  ')).toBe('example.com');
    });
  });

  describe('isAlreadyShortened', () => {
    it('should detect common shortener domains', () => {
      expect(isAlreadyShortened('https://bit.ly/3ABC123')).toBe(true);
      expect(isAlreadyShortened('https://tinyurl.com/xyz123')).toBe(true);
      expect(isAlreadyShortened('https://t.co/abcd123')).toBe(true);
      expect(isAlreadyShortened('https://ow.ly/xyz')).toBe(true);
      expect(isAlreadyShortened('https://is.gd/test')).toBe(true);
    });

    it('should detect subdomain shorteners', () => {
      expect(isAlreadyShortened('https://go.bit.ly/abc123')).toBe(true);
      expect(isAlreadyShortened('https://short.bit.ly/xyz')).toBe(true);
    });

    it('should not flag regular URLs', () => {
      expect(isAlreadyShortened('https://example.com')).toBe(false);
      expect(isAlreadyShortened('https://www.google.com')).toBe(false);
      expect(isAlreadyShortened('https://github.com/user/repo')).toBe(false);
    });

    it('should handle invalid URLs gracefully', () => {
      expect(isAlreadyShortened('not-a-url')).toBe(false);
      expect(isAlreadyShortened('')).toBe(false);
      expect(isAlreadyShortened(null as any)).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(isAlreadyShortened('https://bit.ly.example.com')).toBe(false);
      expect(isAlreadyShortened('https://notbit.ly/abc')).toBe(false);
    });
  });
});