import { classifyError, createErrorResponse, createSuccessResponse } from '@/lib/features/url-shortener/utils/error-handling';

describe('createErrorResponse', () => {
  it('should return HTTP 429 with Retry-After header for RATE_LIMIT_ERROR', () => {
    const result = createErrorResponse('RATE_LIMIT_ERROR', 'Rate limit exceeded', 'https://example.com');
    expect(result.httpStatus).toBe(429);
    expect(result.headers).toBeDefined();
    expect(result.headers!['Retry-After']).toBeDefined();
    const retryAfterSeconds = parseInt(result.headers!['Retry-After']);
    expect(retryAfterSeconds).toBeGreaterThanOrEqual(300); // 5 minutes
    expect(retryAfterSeconds).toBeLessThanOrEqual(1800); // 30 minutes
    expect(result.response.outputFields.hs_execution_state).toBe('ERROR');
    expect(result.response.outputFields.error).toContain('Rate limit exceeded');
    expect(result.response.outputFields.error).toContain('Please try again in');
  });

  it('should return HTTP 400 for VALIDATION_ERROR', () => {
    const result = createErrorResponse('VALIDATION_ERROR', 'Invalid URL', 'bad-url');
    expect(result.httpStatus).toBe(400);
    expect(result.headers).toBeUndefined();
    expect(result.response.outputFields.error).toBe('Invalid URL');
    expect(result.response.outputFields.longUrl).toBe('bad-url');
    expect(result.response.outputFields.hs_execution_state).toBe('ERROR');
  });

  it('should return HTTP 400 for API_KEY_ERROR', () => {
    const result = createErrorResponse('API_KEY_ERROR', 'Invalid API key');
    expect(result.httpStatus).toBe(400);
    expect(result.response.outputFields.hs_execution_state).toBe('ERROR');
  });

  it('should return HTTP 401 for AUTHORIZATION_ERROR', () => {
    const result = createErrorResponse('AUTHORIZATION_ERROR', 'Not authorized');
    expect(result.httpStatus).toBe(401);
  });

  it('should return HTTP 502 for SERVICE_ERROR', () => {
    const result = createErrorResponse('SERVICE_ERROR', 'Bitly down');
    expect(result.httpStatus).toBe(502);
  });

  it('should return HTTP 500 for SERVER_ERROR', () => {
    const result = createErrorResponse('SERVER_ERROR', 'Internal error');
    expect(result.httpStatus).toBe(500);
  });
});

describe('createSuccessResponse', () => {
  it('should return SUCCESS with all fields', () => {
    const result = createSuccessResponse('https://bit.ly/abc', 'https://example.com', 'bit.ly', '2025-01-01');
    expect(result.outputFields.hs_execution_state).toBe('SUCCESS');
    expect(result.outputFields.shortUrl).toBe('https://bit.ly/abc');
    expect(result.outputFields.longUrl).toBe('https://example.com');
    expect(result.outputFields.customDomain).toBe('bit.ly');
    expect(result.outputFields.createdAt).toBe('2025-01-01');
  });
});

describe('classifyError', () => {
  describe('with statusCode (primary classification)', () => {
    it('should classify 429 as RATE_LIMIT_ERROR regardless of message', () => {
      expect(classifyError('some random message', 429)).toBe('RATE_LIMIT_ERROR');
    });

    it('should classify 401 as API_KEY_ERROR', () => {
      expect(classifyError('anything', 401)).toBe('API_KEY_ERROR');
    });

    it('should classify 403 as API_KEY_ERROR', () => {
      expect(classifyError('anything', 403)).toBe('API_KEY_ERROR');
    });

    it('should classify 400 as VALIDATION_ERROR', () => {
      expect(classifyError('anything', 400)).toBe('VALIDATION_ERROR');
    });

    it('should classify 500 as SERVICE_ERROR', () => {
      expect(classifyError('anything', 500)).toBe('SERVICE_ERROR');
    });

    it('should classify 502 as SERVICE_ERROR', () => {
      expect(classifyError('anything', 502)).toBe('SERVICE_ERROR');
    });

    it('should classify 503 as SERVICE_ERROR', () => {
      expect(classifyError('anything', 503)).toBe('SERVICE_ERROR');
    });
  });

  describe('without statusCode (fallback to string matching)', () => {
    it('should classify rate limit message', () => {
      expect(classifyError('Rate limit exceeded')).toBe('RATE_LIMIT_ERROR');
    });

    it('should classify api key message', () => {
      expect(classifyError('Invalid API key')).toBe('API_KEY_ERROR');
    });

    it('should classify authorization message', () => {
      expect(classifyError('Portal not authorized')).toBe('AUTHORIZATION_ERROR');
    });

    it('should default to SERVER_ERROR for unknown messages', () => {
      expect(classifyError('Failed to get default group: Failed to get groups')).toBe('SERVER_ERROR');
    });
  });
});
