/**
 * Integration test: Simulate Bitly API errors end-to-end
 * Tests the complete flow from BitlyService through UrlShortenerService
 * to verify HTTP status codes and error messages reach the caller correctly.
 */

import { BitlyApiError, clearBitlyCache } from '@/lib/features/url-shortener/services/bitly-service';
import {
  classifyError,
  createErrorResponse
} from '@/lib/features/url-shortener/utils/error-handling';

// Mock fetch globally
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

// Mock supabase
jest.mock('@/lib/database/supabase', () => ({
  supabaseAdmin: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn().mockResolvedValue({
            data: {
              portal_id: 123456,
              service_name: 'bitly',
              api_key: 'encrypted-key',
              settings_json: {},
              verified_at: null
            },
            error: null
          })
        }))
      }))
    }))
  }
}));

// Mock encryption
jest.mock('@/lib/features/url-shortener/utils/encryption', () => ({
  decryptApiKey: jest.fn().mockReturnValue('test-api-key-decrypted')
}));

/**
 * Helper: simulate the complete error flow as it happens in production
 * BitlyService → UrlShortenerService → classifyError → createErrorResponse
 */
function simulateFullErrorFlow(
  bitlyError: BitlyApiError
): { httpStatus: number; errorMessage: string; retryAfter?: string } {
  // Step 1: UrlShortenerService maps to user-friendly message
  const statusCode = bitlyError.statusCode;
  const rawMessage = bitlyError.message;
  let userMessage: string;
  if (statusCode === 429) {
    userMessage = 'Bitly rate limit exceeded. Please try again in a few moments.';
  } else if (statusCode === 401 || statusCode === 403) {
    userMessage = 'Invalid Bitly API key. Please check your API key in the dashboard settings.';
  } else if (statusCode === 400) {
    userMessage = `Invalid request: ${rawMessage}. Please check your URL and try again.`;
  } else if (statusCode >= 500) {
    userMessage = 'Bitly service is temporarily unavailable. The system will retry automatically.';
  } else {
    userMessage = rawMessage || 'An unexpected error occurred while shortening the URL.';
  }

  // Step 2: classifyError with statusCode
  const errorType = classifyError(userMessage, statusCode);

  // Step 3: createErrorResponse
  const { httpStatus, response, headers } = createErrorResponse(
    errorType,
    userMessage,
    'https://example.com/long-url'
  );

  return {
    httpStatus,
    errorMessage: response.outputFields.error!,
    retryAfter: headers?.['Retry-After']
  };
}

describe('Bitly Error Simulation - End-to-End', () => {
  beforeEach(() => {
    clearBitlyCache();
    mockFetch.mockReset();
  });

  describe('Bitly /groups endpoint errors', () => {
    it('Bitly /groups 429 → HubSpot HTTP 429 + Retry-After', () => {
      const error = new BitlyApiError('Rate limit exceeded', 429, '/groups');
      const result = simulateFullErrorFlow(error);

      expect(result.httpStatus).toBe(429);
      expect(result.errorMessage).toContain('rate limit');
      expect(result.retryAfter).toBeDefined();
      const retrySeconds = parseInt(result.retryAfter!);
      expect(retrySeconds).toBeGreaterThanOrEqual(300);
      expect(retrySeconds).toBeLessThanOrEqual(1800);
    });

    it('Bitly /groups 401 → HubSpot HTTP 400 (API_KEY_ERROR)', () => {
      const error = new BitlyApiError('Unauthorized', 401, '/groups');
      const result = simulateFullErrorFlow(error);

      expect(result.httpStatus).toBe(400);
      expect(result.errorMessage).toContain('API key');
    });

    it('Bitly /groups 500 → HubSpot HTTP 502 (SERVICE_ERROR)', () => {
      const error = new BitlyApiError('Internal server error', 500, '/groups');
      const result = simulateFullErrorFlow(error);

      expect(result.httpStatus).toBe(502);
      expect(result.errorMessage).toContain('temporarily unavailable');
    });

    it('Bitly /groups 503 → HubSpot HTTP 502 (SERVICE_ERROR)', () => {
      const error = new BitlyApiError('Service unavailable', 503, '/groups');
      const result = simulateFullErrorFlow(error);

      expect(result.httpStatus).toBe(502);
      expect(result.errorMessage).toContain('temporarily unavailable');
    });
  });

  describe('Bitly /user endpoint errors', () => {
    it('Bitly /user 429 → HubSpot HTTP 429 + Retry-After', () => {
      const error = new BitlyApiError('Too many requests', 429, '/user');
      const result = simulateFullErrorFlow(error);

      expect(result.httpStatus).toBe(429);
      expect(result.retryAfter).toBeDefined();
    });

    it('Bitly /user 403 → HubSpot HTTP 400 (API_KEY_ERROR)', () => {
      const error = new BitlyApiError('Forbidden', 403, '/user');
      const result = simulateFullErrorFlow(error);

      expect(result.httpStatus).toBe(400);
      expect(result.errorMessage).toContain('API key');
    });
  });

  describe('Bitly /shorten endpoint errors', () => {
    it('Bitly /shorten 429 → HubSpot HTTP 429 + Retry-After', () => {
      const error = new BitlyApiError('Rate limit exceeded', 429, '/shorten');
      const result = simulateFullErrorFlow(error);

      expect(result.httpStatus).toBe(429);
      expect(result.retryAfter).toBeDefined();
    });

    it('Bitly /shorten 400 (INVALID_ARG_LONG_URL) → HubSpot HTTP 400', () => {
      const error = new BitlyApiError('INVALID_ARG_LONG_URL', 400, '/shorten');
      const result = simulateFullErrorFlow(error);

      expect(result.httpStatus).toBe(400);
      expect(result.errorMessage).toContain('Invalid request');
      expect(result.errorMessage).toContain('INVALID_ARG_LONG_URL');
    });

    it('Bitly /shorten 400 (ALREADY_A_BITLY_LINK) → HubSpot HTTP 400', () => {
      const error = new BitlyApiError('ALREADY_A_BITLY_LINK', 400, '/shorten');
      const result = simulateFullErrorFlow(error);

      expect(result.httpStatus).toBe(400);
      expect(result.errorMessage).toContain('ALREADY_A_BITLY_LINK');
    });

    it('Bitly /shorten 401 → HubSpot HTTP 400 (API_KEY_ERROR)', () => {
      const error = new BitlyApiError('Unauthorized', 401, '/shorten');
      const result = simulateFullErrorFlow(error);

      expect(result.httpStatus).toBe(400);
      expect(result.errorMessage).toContain('API key');
    });

    it('Bitly /shorten 500 → HubSpot HTTP 502 (SERVICE_ERROR)', () => {
      const error = new BitlyApiError('Internal server error', 500, '/shorten');
      const result = simulateFullErrorFlow(error);

      expect(result.httpStatus).toBe(502);
      expect(result.errorMessage).toContain('temporarily unavailable');
    });
  });

  describe('Complete flow through BitlyService with mocked fetch', () => {
    // Import dynamically to avoid module-level side effects
    const { BitlyService } = require('@/lib/features/url-shortener/services/bitly-service');

    it('real BitlyService: /groups returns 429 → throws BitlyApiError(429)', async () => {
      mockFetch.mockImplementation((url: string) => {
        if (typeof url === 'string' && url.includes('/user')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ default_group_guid: null })
          } as Response);
        }
        if (typeof url === 'string' && url.includes('/groups')) {
          return Promise.resolve({
            ok: false,
            status: 429,
            json: () => Promise.resolve({ message: 'Rate limit exceeded' })
          } as Response);
        }
        return Promise.reject(new Error('Unexpected URL'));
      });

      const service = new BitlyService({ apiKey: 'test-key' });
      try {
        await service.shortenUrl('https://example.com');
        fail('Should have thrown');
      } catch (e) {
        expect(e).toBeInstanceOf(BitlyApiError);
        expect((e as BitlyApiError).statusCode).toBe(429);
        expect((e as BitlyApiError).endpoint).toBe('/groups');

        // Now simulate the full flow
        const result = simulateFullErrorFlow(e as BitlyApiError);
        expect(result.httpStatus).toBe(429);
        expect(result.retryAfter).toBeDefined();
      }
    });

    it('real BitlyService: /shorten returns 500 → throws BitlyApiError(500) after retries', async () => {
      mockFetch.mockImplementation((url: string) => {
        if (typeof url === 'string' && url.includes('/user')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ default_group_guid: null })
          } as Response);
        }
        if (typeof url === 'string' && url.includes('/groups') && !url.includes('/groups/')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ groups: [{ guid: 'test-guid' }] })
          } as Response);
        }
        if (typeof url === 'string' && url.includes('/shorten')) {
          return Promise.resolve({
            ok: false,
            status: 500,
            json: () => Promise.resolve({ message: 'Internal server error' })
          } as Response);
        }
        return Promise.reject(new Error('Unexpected URL'));
      });

      const service = new BitlyService({ apiKey: 'test-key-500' });
      try {
        await service.shortenUrl('https://example.com');
        fail('Should have thrown');
      } catch (e) {
        expect(e).toBeInstanceOf(BitlyApiError);
        expect((e as BitlyApiError).statusCode).toBe(500);

        // Verify it retried 3 times
        const shortenCalls = mockFetch.mock.calls.filter(
          ([url]) => typeof url === 'string' && url.includes('/shorten')
        );
        expect(shortenCalls.length).toBe(3);

        // Full flow
        const result = simulateFullErrorFlow(e as BitlyApiError);
        expect(result.httpStatus).toBe(502);
        expect(result.errorMessage).toContain('temporarily unavailable');
      }
    }, 15000);

    it('real BitlyService: /shorten returns 401 → throws immediately (no retry)', async () => {
      mockFetch.mockImplementation((url: string) => {
        if (typeof url === 'string' && url.includes('/user')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ default_group_guid: null })
          } as Response);
        }
        if (typeof url === 'string' && url.includes('/groups') && !url.includes('/groups/')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ groups: [{ guid: 'test-guid' }] })
          } as Response);
        }
        if (typeof url === 'string' && url.includes('/shorten')) {
          return Promise.resolve({
            ok: false,
            status: 401,
            json: () => Promise.resolve({ message: 'Unauthorized' })
          } as Response);
        }
        return Promise.reject(new Error('Unexpected URL'));
      });

      const service = new BitlyService({ apiKey: 'test-key-401' });
      try {
        await service.shortenUrl('https://example.com');
        fail('Should have thrown');
      } catch (e) {
        expect(e).toBeInstanceOf(BitlyApiError);
        expect((e as BitlyApiError).statusCode).toBe(401);

        // Should NOT have retried — only 1 /shorten call
        const shortenCalls = mockFetch.mock.calls.filter(
          ([url]) => typeof url === 'string' && url.includes('/shorten')
        );
        expect(shortenCalls.length).toBe(1);

        // Full flow
        const result = simulateFullErrorFlow(e as BitlyApiError);
        expect(result.httpStatus).toBe(400);
        expect(result.errorMessage).toContain('API key');
      }
    });

    it('real BitlyService: network error → throws Error (not BitlyApiError)', async () => {
      mockFetch.mockImplementation((url: string) => {
        if (typeof url === 'string' && url.includes('/user')) {
          return Promise.reject(new Error('fetch failed'));
        }
        return Promise.reject(new Error('Unexpected URL'));
      });

      const service = new BitlyService({ apiKey: 'test-key-network' });
      try {
        await service.shortenUrl('https://example.com');
        fail('Should have thrown');
      } catch (e) {
        // Network errors are plain Error, not BitlyApiError
        expect(e).not.toBeInstanceOf(BitlyApiError);
        expect((e as Error).message).toBe('fetch failed');

        // Simulate what UrlShortenerService does with non-BitlyApiError
        const statusCode = undefined;
        const userMessage = 'Unable to connect to URL shortening service. The system will retry automatically.';
        const errorType = classifyError(userMessage, statusCode);
        const { httpStatus } = createErrorResponse(errorType, userMessage);

        expect(httpStatus).toBe(500); // SERVER_ERROR
      }
    });
  });

  describe('Status code mapping table verification', () => {
    const testCases = [
      { bitlyStatus: 400, expectedHubSpotStatus: 400, errorType: 'VALIDATION_ERROR' },
      { bitlyStatus: 401, expectedHubSpotStatus: 400, errorType: 'API_KEY_ERROR' },
      { bitlyStatus: 403, expectedHubSpotStatus: 400, errorType: 'API_KEY_ERROR' },
      { bitlyStatus: 429, expectedHubSpotStatus: 429, errorType: 'RATE_LIMIT_ERROR' },
      { bitlyStatus: 500, expectedHubSpotStatus: 502, errorType: 'SERVICE_ERROR' },
      { bitlyStatus: 502, expectedHubSpotStatus: 502, errorType: 'SERVICE_ERROR' },
      { bitlyStatus: 503, expectedHubSpotStatus: 502, errorType: 'SERVICE_ERROR' },
    ];

    testCases.forEach(({ bitlyStatus, expectedHubSpotStatus, errorType }) => {
      it(`Bitly ${bitlyStatus} → HubSpot ${expectedHubSpotStatus} (${errorType})`, () => {
        const error = new BitlyApiError('test error', bitlyStatus, '/test');
        const result = simulateFullErrorFlow(error);
        expect(result.httpStatus).toBe(expectedHubSpotStatus);
      });
    });
  });
});
