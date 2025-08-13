/**
 * @jest-environment node
 */

/**
 * Comprehensive test suite for HubSpot webhook security implementation
 * Tests all aspects of v3 signature verification and security validation
 */

import { createHmac } from 'crypto';
import {
  verifyHubSpotSignatureV3,
  validateTimestamp,
  canBypassSecurity,
  validateRequestOrigin,
  validateHubSpotWebhook,
  createSecurityErrorResponse
} from '@/lib/shared/webhook-security';

// Mock ConfigManager
jest.mock('@/lib/config/config-manager', () => ({
  ConfigManager: {
    getHubSpotClientSecret: jest.fn(),
    getCurrentEnvironment: jest.fn()
  }
}));

import { ConfigManager } from '@/lib/config/config-manager';

const mockConfigManager = ConfigManager as jest.Mocked<typeof ConfigManager>;

describe('HubSpot Webhook Security', () => {
  const testClientSecret = 'test-client-secret-123';
  const testMethod = 'POST';
  const testUri = 'https://example.com/api/webhook/test';
  const testBody = '{"test": "data"}';
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset environment variables
    delete process.env.NODE_ENV;
    delete process.env.BYPASS_WEBHOOK_SECURITY;
    
    // Setup default mocks
    mockConfigManager.getHubSpotClientSecret.mockReturnValue(testClientSecret);
    mockConfigManager.getCurrentEnvironment.mockReturnValue('dev');
  });

  describe('verifyHubSpotSignatureV3', () => {
    function generateValidSignature(method: string, uri: string, body: string, timestamp: string): string {
      const sourceString = method + uri + body + timestamp;
      return createHmac('sha256', testClientSecret)
        .update(sourceString, 'utf8')
        .digest('base64');
    }

    it('should verify valid signatures correctly', () => {
      const timestamp = Date.now().toString();
      const validSignature = generateValidSignature(testMethod, testUri, testBody, timestamp);

      const result = verifyHubSpotSignatureV3(
        testMethod,
        testUri,
        testBody,
        timestamp,
        validSignature,
        testClientSecret
      );

      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject invalid signatures', () => {
      const timestamp = Date.now().toString();
      const invalidSignature = 'invalid-signature-123';

      const result = verifyHubSpotSignatureV3(
        testMethod,
        testUri,
        testBody,
        timestamp,
        invalidSignature,
        testClientSecret
      );

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Signature length mismatch');
    });

    it('should handle signatures with sha256= prefix', () => {
      const timestamp = Date.now().toString();
      const validSignature = generateValidSignature(testMethod, testUri, testBody, timestamp);
      const prefixedSignature = `sha256=${validSignature}`;

      const result = verifyHubSpotSignatureV3(
        testMethod,
        testUri,
        testBody,
        timestamp,
        prefixedSignature,
        testClientSecret
      );

      expect(result.isValid).toBe(true);
    });

    it('should reject signatures with wrong client secret', () => {
      const timestamp = Date.now().toString();
      const wrongSecret = 'wrong-secret';
      const signature = generateValidSignature(testMethod, testUri, testBody, timestamp);

      const result = verifyHubSpotSignatureV3(
        testMethod,
        testUri,
        testBody,
        timestamp,
        signature,
        wrongSecret
      );

      expect(result.isValid).toBe(false);
    });

    it('should handle missing required parameters', () => {
      const result = verifyHubSpotSignatureV3('', '', '', '', '', '');
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Missing required parameters for signature verification');
    });

    it('should handle different request methods and URIs', () => {
      const timestamp = Date.now().toString();
      const getMethod = 'GET';
      const differentUri = 'https://other.com/webhook';
      
      const signature = generateValidSignature(getMethod, differentUri, testBody, timestamp);

      const result = verifyHubSpotSignatureV3(
        getMethod,
        differentUri,
        testBody,
        timestamp,
        signature,
        testClientSecret
      );

      expect(result.isValid).toBe(true);
    });

    it('should reject tampered request bodies', () => {
      const timestamp = Date.now().toString();
      const originalBody = '{"original": "data"}';
      const tamperedBody = '{"tampered": "data"}';
      
      const signature = generateValidSignature(testMethod, testUri, originalBody, timestamp);

      const result = verifyHubSpotSignatureV3(
        testMethod,
        testUri,
        tamperedBody,
        timestamp,
        signature,
        testClientSecret
      );

      expect(result.isValid).toBe(false);
    });
  });

  describe('validateTimestamp', () => {
    it('should accept recent timestamps', () => {
      const recentTimestamp = Date.now().toString();
      
      const result = validateTimestamp(recentTimestamp);
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject old timestamps (> 5 minutes)', () => {
      const oldTimestamp = (Date.now() - 6 * 60 * 1000).toString(); // 6 minutes ago
      
      const result = validateTimestamp(oldTimestamp);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Request too old');
    });

    it('should reject future timestamps (clock skew protection)', () => {
      const futureTimestamp = (Date.now() + 2 * 60 * 1000).toString(); // 2 minutes in future
      
      const result = validateTimestamp(futureTimestamp);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Request timestamp is too far in the future');
    });

    it('should allow small clock skew (30 seconds)', () => {
      const slightlyFutureTimestamp = (Date.now() + 15 * 1000).toString(); // 15 seconds in future
      
      const result = validateTimestamp(slightlyFutureTimestamp);
      
      expect(result.isValid).toBe(true);
    });

    it('should handle custom max age', () => {
      const customMaxAge = 60 * 1000; // 1 minute
      const oldTimestamp = (Date.now() - 90 * 1000).toString(); // 90 seconds ago
      
      const result = validateTimestamp(oldTimestamp, customMaxAge);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Request too old');
    });

    it('should reject invalid timestamp formats', () => {
      const invalidTimestamp = 'not-a-number';
      
      const result = validateTimestamp(invalidTimestamp);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid timestamp format');
    });

    it('should reject missing timestamps', () => {
      const result = validateTimestamp('');
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Missing X-HubSpot-Request-Timestamp header');
    });
  });

  describe('canBypassSecurity', () => {
    it('should allow bypass when all conditions are met', () => {
      process.env.NODE_ENV = 'development';
      process.env.BYPASS_WEBHOOK_SECURITY = 'true';
      mockConfigManager.getCurrentEnvironment.mockReturnValue('dev');
      
      const result = canBypassSecurity();
      
      expect(result).toBe(true);
    });

    it('should not allow bypass in production environment', () => {
      process.env.NODE_ENV = 'production';
      process.env.BYPASS_WEBHOOK_SECURITY = 'true';
      mockConfigManager.getCurrentEnvironment.mockReturnValue('prod');
      
      const result = canBypassSecurity();
      
      expect(result).toBe(false);
    });

    it('should not allow bypass without explicit flag', () => {
      process.env.NODE_ENV = 'development';
      process.env.BYPASS_WEBHOOK_SECURITY = 'false';
      mockConfigManager.getCurrentEnvironment.mockReturnValue('dev');
      
      const result = canBypassSecurity();
      
      expect(result).toBe(false);
    });

    it('should not allow bypass in dev config with production NODE_ENV', () => {
      process.env.NODE_ENV = 'production';
      process.env.BYPASS_WEBHOOK_SECURITY = 'true';
      mockConfigManager.getCurrentEnvironment.mockReturnValue('dev');
      
      const result = canBypassSecurity();
      
      expect(result).toBe(false);
    });

    it('should handle ConfigManager errors gracefully', () => {
      process.env.NODE_ENV = 'development';
      process.env.BYPASS_WEBHOOK_SECURITY = 'true';
      mockConfigManager.getCurrentEnvironment.mockImplementation(() => {
        throw new Error('Config error');
      });
      
      const result = canBypassSecurity();
      
      expect(result).toBe(false);
    });
  });

  describe('validateRequestOrigin', () => {
    it('should accept requests with HubSpot User-Agent', () => {
      const headers = new Headers({
        'User-Agent': 'HubSpot Webhooks'
      });
      
      const result = validateRequestOrigin(headers);
      
      expect(result.isValid).toBe(true);
    });

    it('should accept case-insensitive HubSpot User-Agent', () => {
      const headers = new Headers({
        'User-Agent': 'Mozilla/5.0 hubspot-webhook-client'
      });
      
      const result = validateRequestOrigin(headers);
      
      expect(result.isValid).toBe(true);
    });

    it('should reject requests without HubSpot User-Agent', () => {
      const headers = new Headers({
        'User-Agent': 'Mozilla/5.0 Chrome/91.0'
      });
      
      const result = validateRequestOrigin(headers);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Invalid User-Agent header');
    });

    it('should reject requests with missing User-Agent', () => {
      const headers = new Headers({});
      
      const result = validateRequestOrigin(headers);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Invalid User-Agent header');
    });
  });

  describe('validateHubSpotWebhook', () => {
    function createMockRequest(
      body: string,
      headers: Record<string, string> = {},
      method: string = 'POST',
      url: string = 'https://example.com/webhook'
    ): Request {
      const defaultHeaders = {
        'User-Agent': 'HubSpot Webhooks',
        'Content-Type': 'application/json',
        ...headers
      };
      
      return new Request(url, {
        method,
        headers: new Headers(defaultHeaders),
        body
      });
    }

    function generateValidHeaders(body: string): Record<string, string> {
      const timestamp = Date.now().toString();
      const sourceString = 'POST' + 'https://example.com/webhook' + body + timestamp;
      const signature = createHmac('sha256', testClientSecret)
        .update(sourceString, 'utf8')
        .digest('base64');

      return {
        'X-HubSpot-Signature-v3': signature,
        'X-HubSpot-Request-Timestamp': timestamp
      };
    }

    it('should validate complete valid webhook request', async () => {
      const body = '{"test": "data"}';
      const validHeaders = generateValidHeaders(body);
      const request = createMockRequest(body, validHeaders);

      const result = await validateHubSpotWebhook(request, 'date-formatter');

      expect(result.isValid).toBe(true);
      expect(result.body).toBe(body);
      expect(result.bypassed).toBeUndefined();
    });

    it('should bypass security when conditions are met', async () => {
      process.env.NODE_ENV = 'development';
      process.env.BYPASS_WEBHOOK_SECURITY = 'true';
      mockConfigManager.getCurrentEnvironment.mockReturnValue('dev');

      const body = '{"test": "data"}';
      const request = createMockRequest(body); // No security headers

      const result = await validateHubSpotWebhook(request, 'date-formatter');

      expect(result.isValid).toBe(true);
      expect(result.bypassed).toBe(true);
      expect(result.body).toBe(body);
    });

    it('should reject requests with missing signature header', async () => {
      const body = '{"test": "data"}';
      const headers = {
        'X-HubSpot-Request-Timestamp': Date.now().toString()
      };
      const request = createMockRequest(body, headers);

      const result = await validateHubSpotWebhook(request, 'date-formatter');

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Missing X-HubSpot-Signature-v3 header');
    });

    it('should reject requests with missing timestamp header', async () => {
      const body = '{"test": "data"}';
      const headers = {
        'X-HubSpot-Signature-v3': 'some-signature'
      };
      const request = createMockRequest(body, headers);

      const result = await validateHubSpotWebhook(request, 'date-formatter');

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Missing X-HubSpot-Request-Timestamp header');
    });

    it('should handle different app types', async () => {
      const body = '{"test": "data"}';
      const validHeaders = generateValidHeaders(body);
      const request = createMockRequest(body, validHeaders);

      mockConfigManager.getHubSpotClientSecret.mockImplementation((appType: string) => {
        return `${appType}-secret`;
      });

      // This will fail because the signature was generated with testClientSecret
      const result = await validateHubSpotWebhook(request, 'url-shortener');

      expect(result.isValid).toBe(false);
      expect(mockConfigManager.getHubSpotClientSecret).toHaveBeenCalledWith('url-shortener');
    });

    it('should handle ConfigManager errors', async () => {
      const body = '{"test": "data"}';
      const validHeaders = generateValidHeaders(body);
      const request = createMockRequest(body, validHeaders);

      mockConfigManager.getHubSpotClientSecret.mockImplementation(() => {
        throw new Error('Config error');
      });

      const result = await validateHubSpotWebhook(request, 'date-formatter');

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Configuration error for app type');
    });

    it('should handle request text() errors', async () => {
      const request = {
        text: jest.fn().mockRejectedValue(new Error('Failed to read body')),
        headers: new Headers({ 'User-Agent': 'HubSpot Webhooks' }),
        url: 'https://example.com/webhook'
      } as any;

      const result = await validateHubSpotWebhook(request, 'date-formatter');

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Webhook validation failed');
    });
  });

  describe('createSecurityErrorResponse', () => {
    beforeEach(() => {
      delete process.env.NODE_ENV;
    });

    it('should create basic error response', () => {
      const response = createSecurityErrorResponse('Test error');
      
      expect(response.status).toBe(401);
      expect(response.headers.get('Content-Type')).toBe('application/json');
    });

    it('should include error details in development', () => {
      process.env.NODE_ENV = 'development';
      
      const response = createSecurityErrorResponse('Test error', true);
      
      return response.json().then(data => {
        expect(data.error).toBe('Unauthorized');
        expect(data.message).toBe('Invalid webhook request');
        expect(data.details).toBe('Test error');
      });
    });

    it('should not include error details in production', () => {
      process.env.NODE_ENV = 'production';
      
      const response = createSecurityErrorResponse('Sensitive error', true);
      
      return response.json().then(data => {
        expect(data.error).toBe('Unauthorized');
        expect(data.message).toBe('Invalid webhook request');
        expect(data.details).toBeUndefined();
      });
    });

    it('should not include details when not requested', () => {
      process.env.NODE_ENV = 'development';
      
      const response = createSecurityErrorResponse('Test error', false);
      
      return response.json().then(data => {
        expect(data.error).toBe('Unauthorized');
        expect(data.message).toBe('Invalid webhook request');
        expect(data.details).toBeUndefined();
      });
    });
  });

  describe('Edge cases and security considerations', () => {
    it('should handle very long signatures gracefully', () => {
      const timestamp = Date.now().toString();
      const veryLongSignature = 'a'.repeat(10000);

      const result = verifyHubSpotSignatureV3(
        testMethod,
        testUri,
        testBody,
        timestamp,
        veryLongSignature,
        testClientSecret
      );

      expect(result.isValid).toBe(false);
    });

    it('should handle unicode characters in request body', () => {
      const unicodeBody = '{"emoji": "🚀", "unicode": "ñáéíóú"}';
      const timestamp = Date.now().toString();
      const sourceString = testMethod + testUri + unicodeBody + timestamp;
      const validSignature = createHmac('sha256', testClientSecret)
        .update(sourceString, 'utf8')
        .digest('base64');

      const result = verifyHubSpotSignatureV3(
        testMethod,
        testUri,
        unicodeBody,
        timestamp,
        validSignature,
        testClientSecret
      );

      expect(result.isValid).toBe(true);
    });

    it('should handle empty request bodies', () => {
      const emptyBody = '';
      const timestamp = Date.now().toString();
      const sourceString = testMethod + testUri + emptyBody + timestamp;
      const validSignature = createHmac('sha256', testClientSecret)
        .update(sourceString, 'utf8')
        .digest('base64');

      const result = verifyHubSpotSignatureV3(
        testMethod,
        testUri,
        emptyBody,
        timestamp,
        validSignature,
        testClientSecret
      );

      expect(result.isValid).toBe(true);
    });
  });
});