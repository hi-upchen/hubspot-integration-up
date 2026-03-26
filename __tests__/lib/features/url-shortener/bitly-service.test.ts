/**
 * Tests for Bitly Service
 */

import { BitlyService, BitlyApiError, clearBitlyCache, createBitlyService } from '@/lib/features/url-shortener/services/bitly-service';

// Mock fetch globally
global.fetch = jest.fn();

const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('BitlyService', () => {
  let bitlyService: BitlyService;
  const mockApiKey = 'test-api-key';

  beforeEach(() => {
    bitlyService = new BitlyService({ apiKey: mockApiKey });
    mockFetch.mockClear();
    clearBitlyCache();
  });

  afterEach(() => {
    mockFetch.mockReset();
  });

  describe('constructor', () => {
    it('should create service with API key', () => {
      expect(() => new BitlyService({ apiKey: mockApiKey })).not.toThrow();
    });

    it('should throw error without API key', () => {
      expect(() => new BitlyService({ apiKey: '' })).toThrow('Bitly API key is required');
    });
  });

  describe('shortenUrl', () => {
    const mockLongUrl = 'https://example.com/very-long-url-here';
    const mockBitlyResponse = {
      link: 'https://bit.ly/3ABC123',
      long_url: mockLongUrl,
      created_at: '2025-01-28T12:00:00Z',
      id: 'bit.ly/3ABC123'
    };

    beforeEach(() => {
      // Mock successful user request
      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ default_group_guid: null })
        } as Response)
      );

      // Mock successful groups request
      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ groups: [{ guid: 'test-group-guid' }] })
        } as Response)
      );

      // Mock successful shorten request
      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockBitlyResponse)
        } as Response)
      );
    });

    it('should successfully shorten a URL', async () => {
      const result = await bitlyService.shortenUrl(mockLongUrl);

      expect(result).toEqual({
        shortUrl: 'https://bit.ly/3ABC123',
        longUrl: mockLongUrl,
        domain: 'bit.ly',
        createdAt: '2025-01-28T12:00:00Z',
        id: 'bit.ly/3ABC123'
      });

      expect(mockFetch).toHaveBeenCalledTimes(3);
    });

    it('should handle custom domain', async () => {
      const customDomain = 'example.co';
      
      mockFetch.mockReset();
      
      // Mock groups request for getDefaultGroupGuid
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ groups: [{ guid: 'test-group-guid' }] })
      } as Response);
      
      // Mock successful shorten request
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockBitlyResponse)
      } as Response);
      
      await bitlyService.shortenUrl(mockLongUrl, customDomain);

      // Check that the shorten request was made with custom domain
      expect(mockFetch).toHaveBeenLastCalledWith(
        'https://api-ssl.bitly.com/v4/shorten',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockApiKey}`,
            'Content-Type': 'application/json'
          }),
          body: expect.stringContaining(`"domain":"${customDomain}"`)
        })
      );
    });

    it('should handle rate limit errors', async () => {
      mockFetch.mockReset();
      
      // Use a custom implementation that tracks call order
      let callCount = 0;
      mockFetch.mockImplementation((url: string) => {
        callCount++;
        
        if (url.includes('/user')) {
          // getUserDefaultDomain call
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ default_group_guid: null })
          } as Response);
        } else if (url.includes('/groups')) {
          // getDefaultGroupGuid call
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ groups: [{ guid: 'test-group-guid' }] })
          } as Response);
        } else if (url.includes('/shorten')) {
          // shorten call - return 429 error
          return Promise.resolve({
            ok: false,
            status: 429,
            json: () => Promise.resolve({ message: 'Rate limit exceeded' })
          } as Response);
        }
        
        return Promise.reject(new Error('Unexpected URL: ' + url));
      });

      try {
        await bitlyService.shortenUrl(mockLongUrl);
        fail('Should have thrown');
      } catch (e) {
        expect(e).toBeInstanceOf(BitlyApiError);
        const err = e as BitlyApiError;
        expect(err.statusCode).toBe(429);
        expect(err.endpoint).toBe('/shorten');
      }
    });

    it('should handle invalid API key', async () => {
      mockFetch.mockReset();

      // Mock successful user request
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ default_group_guid: null })
      } as Response);

      // Mock successful groups request
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ groups: [{ guid: 'test-group-guid' }] })
      } as Response);

      // Mock 403 error on shorten request
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: () => Promise.resolve({ message: 'Forbidden' })
      } as Response);

      try {
        await bitlyService.shortenUrl(mockLongUrl);
        fail('Should have thrown');
      } catch (e) {
        expect(e).toBeInstanceOf(BitlyApiError);
        const err = e as BitlyApiError;
        expect(err.statusCode).toBe(403);
        expect(err.endpoint).toBe('/shorten');
      }
    });

    it('should handle invalid URL errors', async () => {
      mockFetch.mockReset();

      // Mock successful user request
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ default_group_guid: null })
      } as Response);

      // Mock successful groups request
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ groups: [{ guid: 'test-group-guid' }] })
      } as Response);

      // Mock 400 error with invalid URL on shorten request
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ message: 'INVALID_ARG_LONG_URL' })
      } as Response);

      try {
        await bitlyService.shortenUrl(mockLongUrl);
        fail('Should have thrown');
      } catch (e) {
        expect(e).toBeInstanceOf(BitlyApiError);
        const err = e as BitlyApiError;
        expect(err.statusCode).toBe(400);
        expect(err.endpoint).toBe('/shorten');
      }
    });

    it('should handle invalid domain errors', async () => {
      mockFetch.mockReset();

      // Mock successful groups request for getDefaultGroupGuid
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ groups: [{ guid: 'test-group-guid' }] })
      } as Response);

      // Mock 400 error with invalid domain on shorten request
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ message: 'INVALID_ARG_DOMAIN' })
      } as Response);

      try {
        await bitlyService.shortenUrl(mockLongUrl, 'invalid-domain');
        fail('Should have thrown');
      } catch (e) {
        expect(e).toBeInstanceOf(BitlyApiError);
        const err = e as BitlyApiError;
        expect(err.statusCode).toBe(400);
        expect(err.endpoint).toBe('/shorten');
      }
    });

    it('should retry on network errors', async () => {
      mockFetch.mockClear();
      
      // Mock successful user request (not used but expected by sequence)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ default_group_guid: null })
      } as Response);
      
      // Mock successful groups request (happens first)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ groups: [{ guid: 'test-group-guid' }] })
      } as Response);
      
      // First shorten attempt fails with network error
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      
      // Second shorten attempt succeeds (retry)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockBitlyResponse)
      } as Response);

      const result = await bitlyService.shortenUrl(mockLongUrl);
      expect(result.shortUrl).toBe('https://bit.ly/3ABC123');
    });
  });

  describe('validateApiKey', () => {
    it('should return true for valid API key', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ login: 'testuser' })
      } as Response);

      const isValid = await bitlyService.validateApiKey();
      expect(isValid).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api-ssl.bitly.com/v4/user',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockApiKey}`
          })
        })
      );
    });

    it('should return false for invalid API key', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 403
      } as Response);

      const isValid = await bitlyService.validateApiKey();
      expect(isValid).toBe(false);
    });

    it('should return false on network error', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const isValid = await bitlyService.validateApiKey();
      expect(isValid).toBe(false);
    });
  });

  describe('BitlyApiError', () => {
    it('should carry statusCode and endpoint', () => {
      const error = new BitlyApiError('Rate limit exceeded', 429, '/groups');
      expect(error.message).toBe('Rate limit exceeded');
      expect(error.statusCode).toBe(429);
      expect(error.endpoint).toBe('/groups');
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe('getDefaultGroupGuid caching and error passthrough', () => {
    it('should cache group_guid after first successful call', async () => {
      mockFetch.mockReset();
      mockFetch.mockImplementation((url: string) => {
        if (url.includes('/user')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ default_group_guid: null })
          } as Response);
        }
        if (url.includes('/groups')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ groups: [{ guid: 'cached-guid' }] })
          } as Response);
        }
        if (url.includes('/shorten')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              link: 'https://bit.ly/abc',
              long_url: 'https://example.com',
              created_at: '2025-01-01T00:00:00Z',
              id: 'bit.ly/abc'
            })
          } as Response);
        }
        return Promise.reject(new Error('Unexpected URL'));
      });

      await bitlyService.shortenUrl('https://example.com');

      mockFetch.mockClear();
      mockFetch.mockImplementation((url: string) => {
        if (url.includes('/groups')) {
          throw new Error('Should not call /groups again');
        }
        if (url.includes('/user')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ default_group_guid: null })
          } as Response);
        }
        if (url.includes('/shorten')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              link: 'https://bit.ly/def',
              long_url: 'https://example.com/2',
              created_at: '2025-01-01T00:00:00Z',
              id: 'bit.ly/def'
            })
          } as Response);
        }
        return Promise.reject(new Error('Unexpected URL'));
      });

      const result = await bitlyService.shortenUrl('https://example.com/2');
      expect(result.shortUrl).toBe('https://bit.ly/def');
      const groupsCalls = mockFetch.mock.calls.filter(
        ([url]) => typeof url === 'string' && url.includes('/groups')
      );
      expect(groupsCalls).toHaveLength(0);
    });

    it('should throw BitlyApiError with status code when /groups fails', async () => {
      mockFetch.mockReset();
      mockFetch.mockImplementation((url: string) => {
        if (url.includes('/user')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ default_group_guid: null })
          } as Response);
        }
        if (url.includes('/groups')) {
          return Promise.resolve({
            ok: false,
            status: 429,
            json: () => Promise.resolve({ message: 'Rate limit exceeded' })
          } as Response);
        }
        return Promise.reject(new Error('Unexpected URL'));
      });

      try {
        await bitlyService.shortenUrl('https://example.com');
        fail('Should have thrown');
      } catch (e) {
        expect(e).toBeInstanceOf(BitlyApiError);
        const err = e as BitlyApiError;
        expect(err.statusCode).toBe(429);
        expect(err.endpoint).toBe('/groups');
      }
    });

    it('should throw BitlyApiError with 401 when /groups returns unauthorized', async () => {
      mockFetch.mockReset();
      mockFetch.mockImplementation((url: string) => {
        if (url.includes('/user')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ default_group_guid: null })
          } as Response);
        }
        if (url.includes('/groups')) {
          return Promise.resolve({
            ok: false,
            status: 401,
            json: () => Promise.resolve({ message: 'Unauthorized' })
          } as Response);
        }
        return Promise.reject(new Error('Unexpected URL'));
      });

      try {
        await bitlyService.shortenUrl('https://example.com');
        fail('Should have thrown');
      } catch (e) {
        expect(e).toBeInstanceOf(BitlyApiError);
        const err = e as BitlyApiError;
        expect(err.statusCode).toBe(401);
        expect(err.endpoint).toBe('/groups');
      }
    });
  });

  describe('shortenUrl BitlyApiError passthrough', () => {
    it('should throw BitlyApiError with 429 status on rate limit', async () => {
      mockFetch.mockReset();
      mockFetch.mockImplementation((url: string) => {
        if (url.includes('/user')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ default_group_guid: null })
          } as Response);
        }
        if (url.includes('/groups') && !url.includes('/groups/')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ groups: [{ guid: 'test-guid' }] })
          } as Response);
        }
        if (url.includes('/shorten')) {
          return Promise.resolve({
            ok: false,
            status: 429,
            json: () => Promise.resolve({ message: 'Rate limit exceeded' })
          } as Response);
        }
        return Promise.reject(new Error('Unexpected URL'));
      });

      try {
        await bitlyService.shortenUrl('https://example.com');
        fail('Should have thrown');
      } catch (e) {
        expect(e).toBeInstanceOf(BitlyApiError);
        const err = e as BitlyApiError;
        expect(err.statusCode).toBe(429);
        expect(err.endpoint).toBe('/shorten');
        expect(err.message).toBe('Rate limit exceeded');
      }
    });

    it('should throw BitlyApiError with 401 status on auth failure', async () => {
      mockFetch.mockReset();
      mockFetch.mockImplementation((url: string) => {
        if (url.includes('/user')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ default_group_guid: null })
          } as Response);
        }
        if (url.includes('/groups') && !url.includes('/groups/')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ groups: [{ guid: 'test-guid' }] })
          } as Response);
        }
        if (url.includes('/shorten')) {
          return Promise.resolve({
            ok: false,
            status: 401,
            json: () => Promise.resolve({ message: 'Unauthorized' })
          } as Response);
        }
        return Promise.reject(new Error('Unexpected URL'));
      });

      try {
        await bitlyService.shortenUrl('https://example.com');
        fail('Should have thrown');
      } catch (e) {
        expect(e).toBeInstanceOf(BitlyApiError);
        const err = e as BitlyApiError;
        expect(err.statusCode).toBe(401);
        expect(err.endpoint).toBe('/shorten');
      }
    });
  });

  describe('cache TTL expiration', () => {
    it('should re-fetch after cache expires', async () => {
      const now = Date.now();
      jest.spyOn(Date, 'now').mockReturnValue(now);

      mockFetch.mockReset();
      mockFetch.mockImplementation((url: string) => {
        if (url.includes('/user')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ default_group_guid: null })
          } as Response);
        }
        if (url.includes('/groups') && !url.includes('/groups/')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ groups: [{ guid: 'test-guid' }] })
          } as Response);
        }
        if (url.includes('/shorten')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              link: 'https://bit.ly/abc',
              long_url: 'https://example.com',
              created_at: '2025-01-01T00:00:00Z',
              id: 'bit.ly/abc'
            })
          } as Response);
        }
        return Promise.reject(new Error('Unexpected URL'));
      });

      // First call populates cache
      await bitlyService.shortenUrl('https://example.com');
      const firstCallCount = mockFetch.mock.calls.filter(
        ([url]) => typeof url === 'string' && url.includes('/groups')
      ).length;
      expect(firstCallCount).toBe(1);

      // Second call within TTL - should use cache
      mockFetch.mockClear();
      mockFetch.mockImplementation((url: string) => {
        if (url.includes('/user')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ default_group_guid: null })
          } as Response);
        }
        if (url.includes('/shorten')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              link: 'https://bit.ly/def',
              long_url: 'https://example.com/2',
              created_at: '2025-01-01T00:00:00Z',
              id: 'bit.ly/def'
            })
          } as Response);
        }
        if (url.includes('/groups')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ groups: [{ guid: 'new-guid' }] })
          } as Response);
        }
        return Promise.reject(new Error('Unexpected URL'));
      });

      await bitlyService.shortenUrl('https://example.com/2');
      const cachedGroupsCalls = mockFetch.mock.calls.filter(
        ([url]) => typeof url === 'string' && url.includes('/groups')
      ).length;
      expect(cachedGroupsCalls).toBe(0); // Cache hit

      // Advance time past TTL (31 minutes)
      jest.spyOn(Date, 'now').mockReturnValue(now + 31 * 60 * 1000);

      mockFetch.mockClear();
      mockFetch.mockImplementation((url: string) => {
        if (url.includes('/user')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ default_group_guid: null })
          } as Response);
        }
        if (url.includes('/groups') && !url.includes('/groups/')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ groups: [{ guid: 'refreshed-guid' }] })
          } as Response);
        }
        if (url.includes('/shorten')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              link: 'https://bit.ly/ghi',
              long_url: 'https://example.com/3',
              created_at: '2025-01-01T00:00:00Z',
              id: 'bit.ly/ghi'
            })
          } as Response);
        }
        return Promise.reject(new Error('Unexpected URL'));
      });

      await bitlyService.shortenUrl('https://example.com/3');
      const expiredGroupsCalls = mockFetch.mock.calls.filter(
        ([url]) => typeof url === 'string' && url.includes('/groups')
      ).length;
      expect(expiredGroupsCalls).toBe(1); // Cache expired, re-fetched

      jest.restoreAllMocks();
    });
  });

  describe('getUserDefaultDomain', () => {
    it('should return bit.ly when user has no default group', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ default_group_guid: null })
      } as Response);

      const domain = await bitlyService.getUserDefaultDomain();
      expect(domain).toBe('bit.ly');
    });

    it('should throw BitlyApiError on API error', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 403,
        json: () => Promise.resolve({ message: 'Forbidden' })
      } as Response);

      await expect(bitlyService.getUserDefaultDomain())
        .rejects
        .toThrow(BitlyApiError);
    });
  });

  describe('getUserDefaultDomain caching and error passthrough', () => {
    it('should cache default domain after first successful call', async () => {
      mockFetch.mockReset();
      mockFetch.mockImplementation((url: string) => {
        if (url === 'https://api-ssl.bitly.com/v4/user') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ default_group_guid: 'group-123' })
          } as Response);
        }
        if (url.includes('/groups/group-123')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ bsds: [{ domain: 'act.gp' }] })
          } as Response);
        }
        return Promise.reject(new Error('Unexpected URL: ' + url));
      });

      const domain1 = await bitlyService.getUserDefaultDomain();
      expect(domain1).toBe('act.gp');

      mockFetch.mockClear();
      const domain2 = await bitlyService.getUserDefaultDomain();
      expect(domain2).toBe('act.gp');
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should throw BitlyApiError when /user returns error', async () => {
      mockFetch.mockReset();
      mockFetch.mockResolvedValue({
        ok: false,
        status: 429,
        json: () => Promise.resolve({ message: 'Too many requests' })
      } as Response);

      try {
        await bitlyService.getUserDefaultDomain();
        fail('Should have thrown');
      } catch (e) {
        expect(e).toBeInstanceOf(BitlyApiError);
        const err = e as BitlyApiError;
        expect(err.statusCode).toBe(429);
        expect(err.endpoint).toBe('/user');
      }
    });
  });
});

describe('createBitlyService', () => {
  it('should create BitlyService instance', () => {
    const service = createBitlyService('test-key');
    expect(service).toBeInstanceOf(BitlyService);
  });
});