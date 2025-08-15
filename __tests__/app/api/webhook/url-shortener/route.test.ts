/**
 * @jest-environment node
 */

/**
 * Tests for URL Shortener Webhook Handler
 */

import { NextRequest } from 'next/server';
import { POST, GET } from '@/app/api/webhook/url-shortener/route';

// Mock the dependencies
jest.mock('@/lib/features/url-shortener/services/url-shortener');
jest.mock('@/lib/features/url-shortener/services/usage-tracker');
jest.mock('@/lib/database/supabase');
jest.mock('@/lib/shared/webhook-security');

import { getUrlShortenerService } from '@/lib/features/url-shortener/services/url-shortener';
import { trackUrlShortenerUsage } from '@/lib/features/url-shortener/services/usage-tracker';
import { supabaseAdmin } from '@/lib/database/supabase';
import { validateHubSpotWebhook, createSecurityErrorResponse } from '@/lib/shared/webhook-security';

const mockGetUrlShortenerService = getUrlShortenerService as jest.MockedFunction<typeof getUrlShortenerService>;
const mockTrackUrlShortenerUsage = trackUrlShortenerUsage as jest.MockedFunction<typeof trackUrlShortenerUsage>;
const mockSupabaseAdmin = supabaseAdmin as jest.Mocked<typeof supabaseAdmin>;
const mockValidateHubSpotWebhook = validateHubSpotWebhook as jest.MockedFunction<typeof validateHubSpotWebhook>;
const mockCreateSecurityErrorResponse = createSecurityErrorResponse as jest.MockedFunction<typeof createSecurityErrorResponse>;

// Mock service instance
const mockService = {
  shortenUrl: jest.fn()
};

// Mock Supabase client
const mockSupabaseClient = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn()
      }))
    }))
  }))
};

describe('/api/webhook/url-shortener', () => {
  // Define createMockRequest at the top level so all tests can access it
  const createMockRequest = (body: any, options: { bypassSecurity?: boolean } = {}) => {
    // Update security validation mock for this specific request
    if (options.bypassSecurity !== false) {
      mockValidateHubSpotWebhook.mockResolvedValue({
        isValid: true,
        body: JSON.stringify(body)
      });
    }
    
    return {
      json: () => Promise.resolve(body),
      text: () => Promise.resolve(JSON.stringify(body)),
      url: 'https://localhost:3000/api/webhook/url-shortener',
      headers: new Headers({
        'User-Agent': 'HubSpot Webhooks',
        'Content-Type': 'application/json'
      })
    } as NextRequest;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUrlShortenerService.mockReturnValue(mockService as any);
    mockTrackUrlShortenerUsage.mockResolvedValue(undefined);
    mockService.shortenUrl.mockClear();
    
    // Mock successful security validation by default
    mockValidateHubSpotWebhook.mockResolvedValue({
      isValid: true,
      body: JSON.stringify({
        origin: { portalId: 123456 },
        inputFields: {
          urlToShorten: 'https://example.com/very-long-url',
          customDomain: ''
        }
      })
    });
    
    // Mock Supabase authorization check (success by default)
    const mockSelectChain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { portal_id: 123456 },
        error: null
      })
    };
    mockSupabaseAdmin.from.mockReturnValue(mockSelectChain as any);
    
    // Mock successful URL shortening by default
    mockService.shortenUrl.mockResolvedValue({
      success: true,
      shortUrl: 'https://bit.ly/short123',
      longUrl: 'https://example.com/very-long-url',
      domain: 'bit.ly'
    });
  });

  describe('POST', () => {
    it('should successfully shorten URL', async () => {
      const requestBody = {
        origin: { portalId: 123456 },
        inputFields: {
          urlToShorten: 'https://example.com/very-long-url',
          customDomain: ''
        }
      };

      const request = createMockRequest(requestBody);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.outputFields.shortUrl).toBe('https://bit.ly/short123');
      expect(responseData.outputFields.longUrl).toBe('https://example.com/very-long-url');
      expect(responseData.outputFields.hs_execution_state).toBe('SUCCESS');

      expect(mockService.shortenUrl).toHaveBeenCalledWith({
        portalId: 123456,
        longUrl: 'https://example.com/very-long-url',
        customDomain: ''
      });
    });

    it('should handle URL shortening failure', async () => {
      mockService.shortenUrl.mockResolvedValue({
        success: false,
        error: 'Invalid URL format. Please provide a valid HTTP or HTTPS URL.'
      });

      const requestBody = {
        origin: { portalId: 123456 },
        inputFields: {
          urlToShorten: 'invalid-url',
          customDomain: ''
        }
      };

      const request = createMockRequest(requestBody);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.outputFields.error).toBe('Invalid URL format. Please provide a valid HTTP or HTTPS URL.');
      expect(responseData.outputFields.hs_execution_state).toBe('ERROR');
    });

    it('should reject requests with missing body', async () => {
      // Mock security validation to return invalid JSON
      mockValidateHubSpotWebhook.mockResolvedValue({
        isValid: true,
        body: 'invalid-json-content'
      });

      const request = createMockRequest({});
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.outputFields.error).toBe('Origin is required');
      expect(responseData.outputFields.hs_execution_state).toBe('ERROR');
    });

    it('should reject requests with missing origin', async () => {
      const requestBody = {
        inputFields: {
          urlToShorten: 'https://example.com/test',
          customDomain: ''
        }
      };

      const request = createMockRequest(requestBody);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.outputFields.error).toBe('Origin is required');
      expect(responseData.outputFields.hs_execution_state).toBe('ERROR');
    });

    it('should reject requests with invalid portal ID', async () => {
      const requestBody = {
        origin: { portalId: 0 },
        inputFields: {
          urlToShorten: 'https://example.com/test',
          customDomain: ''
        }
      };

      const request = createMockRequest(requestBody);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.outputFields.error).toBe('Valid portal ID is required');
      expect(responseData.outputFields.hs_execution_state).toBe('ERROR');
    });

    it('should reject requests with missing URL', async () => {
      const requestBody = {
        origin: { portalId: 123456 },
        inputFields: {
          customDomain: ''
        }
      };

      const request = createMockRequest(requestBody);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.outputFields.error).toBe('URL to shorten is required');
      expect(responseData.outputFields.hs_execution_state).toBe('ERROR');
    });

    it('should reject unauthorized portals', async () => {
      // Mock the URL shortener service to return authorization error
      mockService.shortenUrl.mockResolvedValue({
        success: false,
        error: 'Portal not authorized for URL shortening service'
      });

      const requestBody = {
        origin: { portalId: 123456 },
        inputFields: {
          urlToShorten: 'https://example.com/test',
          customDomain: ''
        }
      };

      const request = createMockRequest(requestBody);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(401);
      expect(responseData.outputFields.error).toBe('Portal not authorized for URL shortening service');
      expect(responseData.outputFields.hs_execution_state).toBe('ERROR');
    });

    it('should handle custom domain requests', async () => {
      const requestBody = {
        origin: { portalId: 123456 },
        inputFields: {
          urlToShorten: 'https://example.com/very-long-url',
          customDomain: 'yourbrand.co'
        }
      };

      const request = createMockRequest(requestBody);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(mockService.shortenUrl).toHaveBeenCalledWith({
        portalId: 123456,
        longUrl: 'https://example.com/very-long-url',
        customDomain: 'yourbrand.co'
      });
    });

    it('should handle service errors gracefully', async () => {
      mockService.shortenUrl.mockRejectedValue(new Error('Service unavailable'));

      const requestBody = {
        origin: { portalId: 123456 },
        inputFields: {
          urlToShorten: 'https://example.com/test',
          customDomain: ''
        }
      };

      const request = createMockRequest(requestBody);
      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData.outputFields.error).toBe('An unexpected error occurred. Please try again later.');
      expect(responseData.outputFields.hs_execution_state).toBe('ERROR');
    });

    it('should reject requests that fail security validation', async () => {
      // Mock security validation failure
      mockValidateHubSpotWebhook.mockResolvedValue({
        isValid: false,
        error: 'Invalid webhook signature'
      });

      // Mock the security error response
      const mockErrorResponse = new Response(
        JSON.stringify({ error: 'Unauthorized', message: 'Invalid webhook request' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
      mockCreateSecurityErrorResponse.mockReturnValue(mockErrorResponse);

      const request = createMockRequest({
        origin: { portalId: 123456 },
        inputFields: {
          urlToShorten: 'https://example.com/test',
          customDomain: ''
        }
      }, { bypassSecurity: false });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(401);
      expect(responseData.error).toBe('Unauthorized');
      expect(responseData.message).toBe('Invalid webhook request');
    });

    it('should validate security with correct parameters', async () => {
      const requestBody = {
        origin: { portalId: 123456 },
        inputFields: {
          urlToShorten: 'https://example.com/test',
          customDomain: ''
        }
      };

      const request = createMockRequest(requestBody);
      await POST(request);

      expect(mockValidateHubSpotWebhook).toHaveBeenCalledWith(
        expect.objectContaining({
          url: 'https://localhost:3000/api/webhook/url-shortener',
          headers: expect.any(Headers)
        }),
        'url-shortener'
      );
    });
  });

  describe('GET', () => {
    it('should return health check response', async () => {
      const response = await GET();
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData).toEqual({
        status: 'healthy',
        service: 'url-shortener-webhook',
        timestamp: expect.any(String)
      });
    });
  });
});