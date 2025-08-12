/**
 * Tests for Bitly Service
 */

import { BitlyService, createBitlyService } from '@/lib/features/url-shortener/services/bitly-service';

// Mock fetch globally
global.fetch = jest.fn();

const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('BitlyService', () => {
  let bitlyService: BitlyService;
  const mockApiKey = 'test-api-key';

  beforeEach(() => {
    bitlyService = new BitlyService({ apiKey: mockApiKey });
    mockFetch.mockClear();
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
      
      // Mock rate limit error on shorten request
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: () => Promise.resolve({ message: 'Rate limit exceeded' })
      } as Response);

      await expect(bitlyService.shortenUrl(mockLongUrl))
        .rejects
        .toThrow('Rate limit exceeded. Please try again later.');
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

      await expect(bitlyService.shortenUrl(mockLongUrl))
        .rejects
        .toThrow('Invalid Bitly API key. Please check your configuration.');
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

      await expect(bitlyService.shortenUrl(mockLongUrl))
        .rejects
        .toThrow('Invalid URL format. Please provide a valid URL.');
    });

    it('should handle invalid domain errors', async () => {
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
      
      // Mock 400 error with invalid domain on shorten request
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ message: 'INVALID_ARG_DOMAIN' })
      } as Response);

      await expect(bitlyService.shortenUrl(mockLongUrl, 'invalid-domain'))
        .rejects
        .toThrow('Invalid domain: invalid-domain. Please check your custom domain setting.');
    });

    it('should retry on network errors', async () => {
      mockFetch.mockReset();
      
      // First attempt fails
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      
      // Second attempt succeeds
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ default_group_guid: null })
      } as Response);
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ groups: [{ guid: 'test-group-guid' }] })
      } as Response);
      
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

  describe('getUserDefaultDomain', () => {
    it('should return bit.ly as default', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ default_group_guid: null })
      } as Response);

      const domain = await bitlyService.getUserDefaultDomain();
      expect(domain).toBe('bit.ly');
    });

    it('should return bit.ly on error', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 403
      } as Response);

      const domain = await bitlyService.getUserDefaultDomain();
      expect(domain).toBe('bit.ly');
    });
  });
});

describe('createBitlyService', () => {
  it('should create BitlyService instance', () => {
    const service = createBitlyService('test-key');
    expect(service).toBeInstanceOf(BitlyService);
  });
});