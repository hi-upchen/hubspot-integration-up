/**
 * @jest-environment node
 */

/**
 * Tests for Date Formatter Webhook API Route
 * Focuses on security integration and API-level behavior
 */

import { NextRequest } from 'next/server';
import { POST, GET } from '@/app/api/webhook/date-formatter/route';

// Mock the dependencies
jest.mock('@/lib/features/date-formatter/services/webhook-handler');
jest.mock('@/lib/shared/webhook-security');

import { processDateFormatterWebhook } from '@/lib/features/date-formatter/services/webhook-handler';
import { validateHubSpotWebhook } from '@/lib/shared/webhook-security';

const mockProcessDateFormatterWebhook = processDateFormatterWebhook as jest.MockedFunction<typeof processDateFormatterWebhook>;
const mockValidateHubSpotWebhook = validateHubSpotWebhook as jest.MockedFunction<typeof validateHubSpotWebhook>;

describe('/api/webhook/date-formatter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock successful security validation by default
    mockValidateHubSpotWebhook.mockResolvedValue({
      isValid: true,
      body: JSON.stringify({
        origin: { portalId: 123456 },
        inputFields: {
          sourceDateField: '01/15/2025',
          sourceFormat: 'US_STANDARD',
          targetFormat: 'UK_STANDARD'
        }
      })
    });

    // Mock successful webhook processing by default
    mockProcessDateFormatterWebhook.mockResolvedValue({
      status: 200,
      data: {
        outputFields: {
          formattedDate: '15/01/2025',
          originalDate: '01/15/2025',
          format: 'UK_STANDARD'
        }
      }
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
        url: 'https://localhost:3000/api/webhook/date-formatter',
        headers: new Headers({
          'User-Agent': 'HubSpot Webhooks',
          'Content-Type': 'application/json'
        })
      } as NextRequest;
    };

    it('should successfully process date formatting request', async () => {
      const requestBody = {
        origin: { portalId: 123456 },
        inputFields: {
          sourceDateField: '01/15/2025',
          sourceFormat: 'US_STANDARD',
          targetFormat: 'UK_STANDARD'
        }
      };

      const request = createMockRequest(requestBody);

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.outputFields.formattedDate).toBe('15/01/2025');

      // Verify security validation was called
      expect(mockValidateHubSpotWebhook).toHaveBeenCalledWith(
        expect.objectContaining({
          url: 'https://localhost:3000/api/webhook/date-formatter',
          headers: expect.any(Headers)
        }),
        'date-formatter',
        'https://localhost:3000/api/webhook/date-formatter'
      );

      // Verify webhook handler was called with parsed body
      expect(mockProcessDateFormatterWebhook).toHaveBeenCalledWith(requestBody);
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
          sourceDateField: '01/15/2025',
          sourceFormat: 'US_STANDARD',
          targetFormat: 'UK_STANDARD'
        }
      }, { bypassSecurity: false });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(401);
      expect(responseData.error).toBe('Unauthorized');
      expect(responseData.message).toBe('Invalid webhook request');

      // Should not call the webhook handler
      expect(mockProcessDateFormatterWebhook).not.toHaveBeenCalled();
    });

    it('should handle security bypass in development', async () => {
      // Mock security validation with bypass
      mockValidateHubSpotWebhook.mockResolvedValue({
        isValid: true,
        bypassed: true,
        body: JSON.stringify({
          origin: { portalId: 123456 },
          inputFields: {
            sourceDateField: '01/15/2025',
            sourceFormat: 'US_STANDARD',
            targetFormat: 'UK_STANDARD'
          }
        })
      });

      const requestBody = {
        origin: { portalId: 123456 },
        inputFields: {
          sourceDateField: '01/15/2025',
          sourceFormat: 'US_STANDARD',
          targetFormat: 'UK_STANDARD'
        }
      };

      const request = createMockRequest(requestBody);

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.outputFields.formattedDate).toBe('15/01/2025');

      // Should still process the request
      expect(mockProcessDateFormatterWebhook).toHaveBeenCalledWith(requestBody);
    });

    it('should handle JSON parsing errors after security validation', async () => {
      // Mock security validation to return invalid JSON
      mockValidateHubSpotWebhook.mockResolvedValue({
        isValid: true,
        body: 'invalid-json-content'
      });

      const request = createMockRequest({});

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.outputFields.error).toBe('Invalid JSON request body');
      expect(responseData.outputFields.format).toBe('ERROR');
    });

    it('should handle webhook handler errors gracefully', async () => {
      // Mock webhook handler to throw error
      mockProcessDateFormatterWebhook.mockRejectedValue(new Error('Processing failed'));

      const requestBody = {
        origin: { portalId: 123456 },
        inputFields: {
          sourceDateField: '01/15/2025',
          sourceFormat: 'US_STANDARD',
          targetFormat: 'UK_STANDARD'
        }
      };

      const request = createMockRequest(requestBody);

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData.outputFields.error).toBe('Internal server error occurred during date formatting');
      expect(responseData.outputFields.format).toBe('ERROR');
    });

    it('should validate security with correct app type', async () => {
      const requestBody = {
        origin: { portalId: 123456 },
        inputFields: {
          sourceDateField: '01/15/2025',
          sourceFormat: 'US_STANDARD',
          targetFormat: 'UK_STANDARD'
        }
      };

      const request = createMockRequest(requestBody);

      await POST(request);

      expect(mockValidateHubSpotWebhook).toHaveBeenCalledWith(
        expect.objectContaining({
          url: 'https://localhost:3000/api/webhook/date-formatter',
          headers: expect.any(Headers)
        }),
        'date-formatter', // Should specify correct app type
        'https://localhost:3000/api/webhook/date-formatter'
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
        service: 'date-formatter',
        timestamp: expect.any(String)
      });
    });
  });

  describe('Security Integration', () => {
    it('should log security validation results in development', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const requestBody = {
        origin: { portalId: 123456 },
        inputFields: {
          sourceDateField: '01/15/2025',
          sourceFormat: 'US_STANDARD', 
          targetFormat: 'UK_STANDARD'
        }
      };

      const request = createMockRequest(requestBody);

      await POST(request);

      expect(consoleSpy).toHaveBeenCalledWith(
        '[Date Formatter Webhook] Security validation passed',
        expect.objectContaining({
          bypassed: expect.any(Boolean),
          timestamp: expect.any(String)
        })
      );

      consoleSpy.mockRestore();
      process.env.NODE_ENV = originalEnv;
    });

    it('should log security validation failures', async () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      // Mock security validation failure
      mockValidateHubSpotWebhook.mockResolvedValue({
        isValid: false,
        error: 'Invalid signature'
      });

      const request = createMockRequest({}, { bypassSecurity: false });

      await POST(request);

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '[Date Formatter Webhook] Security validation failed:',
        expect.objectContaining({
          error: 'Invalid signature',
          timestamp: expect.any(String),
          url: 'https://localhost:3000/api/webhook/date-formatter'
        })
      );

      consoleWarnSpy.mockRestore();
    });
  });
});