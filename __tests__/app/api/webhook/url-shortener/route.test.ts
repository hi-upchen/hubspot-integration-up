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
import { validateHubSpotWebhook } from '@/lib/shared/webhook-security';

const mockGetUrlShortenerService = getUrlShortenerService as jest.MockedFunction<typeof getUrlShortenerService>;
const mockTrackUrlShortenerUsage = trackUrlShortenerUsage as jest.MockedFunction<typeof trackUrlShortenerUsage>;
const mockSupabaseAdmin = supabaseAdmin as jest.Mocked<typeof supabaseAdmin>;
const mockValidateHubSpotWebhook = validateHubSpotWebhook as jest.MockedFunction<typeof validateHubSpotWebhook>;

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
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUrlShortenerService.mockReturnValue(mockService as any);
    mockTrackUrlShortenerUsage.mockResolvedValue(undefined);
    mockService.shortenUrl.mockClear();
    
    // Mock webhook security validation to pass by default
    mockValidateHubSpotWebhook.mockResolvedValue({
      isValid: true,
      body: JSON.stringify({
        origin: { portalId: 123456 },
        inputFields: { urlToShorten: 'https://example.com' }
      })
    });
    
    // Setup default Supabase mock behavior with proper chaining
    const mockEqChain = {
      eq: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: { hub_id: 123456, app_type: 'url-shortener' },
          error: null
        })
      }),
      single: jest.fn().mockResolvedValue({
        data: { hub_id: 123456, app_type: 'url-shortener' },
        error: null
      })
    };

    (mockSupabaseAdmin as any).from = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue(mockEqChain)
      })
    });
  });

  describe('POST', () => {
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

    it('should successfully shorten URL', async () => {
      // Portal authorization is already mocked in beforeEach

      // Mock successful URL shortening
      mockService.shortenUrl.mockResolvedValue({
        success: true,
        shortUrl: 'https://bit.ly/abc123',
        longUrl: 'https://example.com/very-long-url',
        domain: 'bit.ly',
        createdAt: '2025-01-28T12:00:00Z'
      });

      const request = createMockRequest({
        origin: { portalId: 123456 },
        inputFields: {
          urlToShorten: 'https://example.com/very-long-url',
          customDomain: ''
        }
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.outputFields).toEqual({
        shortUrl: 'https://bit.ly/abc123',
        longUrl: 'https://example.com/very-long-url',
        customDomain: 'bit.ly',
        createdAt: '2025-01-28T12:00:00Z',
        hs_execution_state: 'SUCCESS'
      });

      expect(mockService.shortenUrl).toHaveBeenCalledWith({
        portalId: 123456,
        longUrl: 'https://example.com/very-long-url',
        customDomain: ''
      });

      expect(mockTrackUrlShortenerUsage).toHaveBeenCalledWith(
        expect.objectContaining({
          portalId: 123456,
          longUrl: 'https://example.com/very-long-url',
          shortUrl: 'https://bit.ly/abc123',
          success: true
        })
      );
    });

    it('should handle URL shortening failure', async () => {
      // Portal authorization is already mocked in beforeEach

      // Mock URL shortening failure
      mockService.shortenUrl.mockResolvedValue({
        success: false,
        error: 'Invalid URL format'
      });

      const request = createMockRequest({
        origin: { portalId: 123456 },
        inputFields: {
          urlToShorten: 'invalid-url',
          customDomain: ''
        }
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.outputFields).toEqual({
        error: 'Invalid URL format',
        longUrl: 'invalid-url',
        hs_execution_state: 'ERROR'
      });

      expect(mockTrackUrlShortenerUsage).toHaveBeenCalledWith(
        expect.objectContaining({
          portalId: 123456,
          longUrl: 'invalid-url',
          success: false,
          errorMessage: 'Invalid URL format'
        })
      );
    });

    it('should reject requests with missing body', async () => {
      const request = {
        json: () => Promise.resolve(null)
      } as NextRequest;

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData.outputFields.error).toBe('An unexpected error occurred. Please try again later.');
      expect(responseData.outputFields.hs_execution_state).toBe('ERROR');
    });

    it('should reject requests with missing origin', async () => {
      const request = createMockRequest({
        inputFields: { urlToShorten: 'https://example.com' }
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.outputFields.error).toBe('Origin is required');
    });

    it('should reject requests with invalid portal ID', async () => {
      const request = createMockRequest({
        origin: { portalId: 'invalid' },
        inputFields: { urlToShorten: 'https://example.com' }
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.outputFields.error).toBe('Valid portal ID is required');
    });

    it('should reject requests with missing URL', async () => {
      const request = createMockRequest({
        origin: { portalId: 123456 },
        inputFields: {}
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.outputFields.error).toBe('URL to shorten is required');
    });

    it('should reject unauthorized portals', async () => {
      // Override the default mock to simulate unauthorized portal
      const mockUnauthorizedChain = {
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: { code: 'PGRST116' }
          })
        }),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST116' }
        })
      };

      (mockSupabaseAdmin as any).from = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue(mockUnauthorizedChain)
        })
      });

      const request = createMockRequest({
        origin: { portalId: 123456 },
        inputFields: {
          urlToShorten: 'https://example.com'
        }
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(401);
      expect(responseData.outputFields.error).toContain('Portal not authorized');

      expect(mockTrackUrlShortenerUsage).toHaveBeenCalledWith(
        expect.objectContaining({
          portalId: 123456,
          success: false,
          errorMessage: 'Portal not authorized'
        })
      );
    });

    it('should handle custom domain requests', async () => {
      // Portal authorization is already mocked in beforeEach

      // Mock successful URL shortening with custom domain
      mockService.shortenUrl.mockResolvedValue({
        success: true,
        shortUrl: 'https://yourbrand.co/abc123',
        longUrl: 'https://example.com/very-long-url',
        domain: 'yourbrand.co',
        createdAt: '2025-01-28T12:00:00Z'
      });

      const request = createMockRequest({
        origin: { portalId: 123456 },
        inputFields: {
          urlToShorten: 'https://example.com/very-long-url',
          customDomain: 'yourbrand.co'
        }
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.outputFields.customDomain).toBe('yourbrand.co');
      expect(responseData.outputFields.hs_execution_state).toBe('SUCCESS');

      expect(mockService.shortenUrl).toHaveBeenCalledWith({
        portalId: 123456,
        longUrl: 'https://example.com/very-long-url',
        customDomain: 'yourbrand.co'
      });
    });

    it('should handle service errors gracefully', async () => {
      // Portal authorization is already mocked in beforeEach

      // Mock service throwing error
      mockService.shortenUrl.mockRejectedValue(new Error('Service unavailable'));

      const request = createMockRequest({
        origin: { portalId: 123456 },
        inputFields: {
          urlToShorten: 'https://example.com'
        }
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData.outputFields.error).toBe('An unexpected error occurred. Please try again later.');

      expect(mockTrackUrlShortenerUsage).toHaveBeenCalledWith(
        expect.objectContaining({
          portalId: 123456,
          success: false,
          errorMessage: 'Service unavailable'
        })
      );
    });

    it('should reject requests that fail security validation', async () => {
      // Mock security validation failure
      mockValidateHubSpotWebhook.mockResolvedValue({
        isValid: false,
        error: 'Invalid webhook signature'
      });

      const request = createMockRequest({
        origin: { portalId: 123456 },
        inputFields: {
          urlToShorten: 'https://example.com'
        }
      }, { bypassSecurity: false });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(401);
      expect(responseData.error).toBe('Unauthorized');
      expect(responseData.message).toBe('Invalid webhook request');

      // Should not call the URL shortener service
      expect(mockService.shortenUrl).not.toHaveBeenCalled();
    });

    it('should validate security with correct parameters', async () => {
      const requestBody = {
        origin: { portalId: 123456 },
        inputFields: {
          urlToShorten: 'https://example.com'
        }
      };

      const request = createMockRequest(requestBody);

      await POST(request);

      expect(mockValidateHubSpotWebhook).toHaveBeenCalledWith(
        expect.objectContaining({
          url: 'https://localhost:3000/api/webhook/url-shortener',
          headers: expect.any(Headers)
        }),
        'url-shortener',
        'https://localhost:3000/api/webhook/url-shortener'
      );
    });
  });

  describe('GET', () => {
    it('should return health check response', async () => {
      const response = await GET();
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData).toEqual({
        service: 'url-shortener-webhook',
        status: 'healthy',
        timestamp: expect.any(String)
      });
    });
  });
});