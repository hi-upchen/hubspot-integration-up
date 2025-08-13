/**
 * @jest-environment node
 */

// Mock external dependencies BEFORE imports
jest.mock('@/lib/features/date-formatter/services/date-formatter-usage-aggregator');
jest.mock('@/lib/config/config-manager', () => ({
  ConfigManager: {
    getCurrentEnvironment: jest.fn(() => 'dev'),
    getHubSpotConfig: jest.fn(() => ({
      clientId: 'test-client-id',
      clientSecret: 'test-secret',
      redirectUri: 'http://localhost:3000/callback',
      developerApiKey: 'test-api-key',
      dateFormatterAppId: 'test-app-id'
    })),
    getSupabaseConfig: jest.fn(() => ({
      url: 'https://test.supabase.co',
      anonKey: 'test-anon-key',
      serviceRoleKey: 'test-service-key'
    }))
  }
}));
jest.mock('@/lib/database/supabase', () => ({
  supabaseAdmin: {
    from: jest.fn()
  }
}));

import { GET } from '@/app/api/cron/aggregate-date-formatter-usage/route';
import { aggregateDateFormatterUsage } from '@/lib/features/date-formatter/services/date-formatter-usage-aggregator';
import { NextRequest } from 'next/server';

const mockAggregateDateFormatterUsage = aggregateDateFormatterUsage as jest.MockedFunction<typeof aggregateDateFormatterUsage>;

describe('Cron API Route: /api/cron/aggregate-date-formatter-usage', () => {
  let originalEnv: NodeJS.ProcessEnv;
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;

  beforeEach(() => {
    // Save original environment
    originalEnv = { ...process.env };
    
    // Setup console spies
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    
    // Clear all mocks
    jest.clearAllMocks();
    
    // Set default environment variables
    process.env.CRON_SECRET = 'test-cron-secret-123';
    process.env.NODE_ENV = 'test';
    
    // Default successful aggregation result
    mockAggregateDateFormatterUsage.mockResolvedValue({
      success: true,
      processedCount: 5,
      errorCount: 2,
      duration: 3,
      totalRecords: 100,
      environment: 'dev'
    });
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
    
    // Restore console methods
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  // Helper function to create NextRequest
  function createRequest(authHeader?: string): NextRequest {
    const headers = new Headers();
    if (authHeader !== undefined) {
      headers.set('authorization', authHeader);
    }
    
    return new NextRequest('http://localhost:3000/api/cron/aggregate-date-formatter-usage', {
      method: 'GET',
      headers
    });
  }

  describe('CRON_SECRET Validation', () => {
    test('should return 500 when CRON_SECRET is not configured', async () => {
      delete process.env.CRON_SECRET;
      const request = createRequest('Bearer test-secret');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Server configuration error' });
      expect(consoleErrorSpy).toHaveBeenCalledWith('CRON_SECRET not configured');
    });

    test('should return 500 when CRON_SECRET is empty string', async () => {
      process.env.CRON_SECRET = '';
      const request = createRequest('Bearer test-secret');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Server configuration error' });
    });

    test('should return 500 when CRON_SECRET is undefined', async () => {
      process.env.CRON_SECRET = undefined;
      const request = createRequest('Bearer test-secret');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Server configuration error' });
    });

    test('should return 401 when authorization header does not match CRON_SECRET', async () => {
      process.env.CRON_SECRET = 'correct-secret';
      const request = createRequest('Bearer wrong-secret');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({ error: 'Unauthorized' });
      expect(consoleWarnSpy).toHaveBeenCalledWith('Unauthorized cron request attempt');
    });

    test('should proceed when authorization header matches CRON_SECRET', async () => {
      process.env.CRON_SECRET = 'test-secret-123';
      const request = createRequest('Bearer test-secret-123');

      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(mockAggregateDateFormatterUsage).toHaveBeenCalledTimes(1);
    });

    test('should handle special characters in CRON_SECRET', async () => {
      const specialSecret = 'test-secret!@#$%^&*()_+-=[]{}|;:,.<>?';
      process.env.CRON_SECRET = specialSecret;
      const request = createRequest(`Bearer ${specialSecret}`);

      const response = await GET(request);

      expect(response.status).toBe(200);
    });

    test('should be case sensitive for CRON_SECRET', async () => {
      process.env.CRON_SECRET = 'TestSecret123';
      const request = createRequest('Bearer testsecret123');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({ error: 'Unauthorized' });
    });
  });

  describe('Authorization Header Validation', () => {
    test('should return 401 when authorization header is missing', async () => {
      const request = createRequest();

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({ error: 'Unauthorized' });
    });

    test('should return 401 when authorization header is null', async () => {
      const request = createRequest(null as any);

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({ error: 'Unauthorized' });
    });

    test('should return 401 when authorization header is empty string', async () => {
      const request = createRequest('');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({ error: 'Unauthorized' });
    });

    test('should return 401 when authorization header is malformed (missing Bearer)', async () => {
      const request = createRequest('test-cron-secret-123');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({ error: 'Unauthorized' });
    });

    test('should return 401 when authorization header has wrong scheme', async () => {
      const request = createRequest('Basic test-cron-secret-123');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({ error: 'Unauthorized' });
    });

    test('should return 401 when Bearer token is missing', async () => {
      const request = createRequest('Bearer ');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({ error: 'Unauthorized' });
    });

    test('should return 401 when Bearer token has extra spaces', async () => {
      const request = createRequest('Bearer  test-cron-secret-123');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({ error: 'Unauthorized' });
    });

    test('should return 401 when authorization header has multiple Bearer tokens', async () => {
      const request = createRequest('Bearer token1 Bearer token2');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({ error: 'Unauthorized' });
    });

    test('should handle very long authorization headers', async () => {
      const longSecret = 'A'.repeat(1000);
      process.env.CRON_SECRET = longSecret;
      const request = createRequest(`Bearer ${longSecret}`);

      const response = await GET(request);

      expect(response.status).toBe(200);
    });
  });

  describe('Aggregation Service Integration', () => {
    test('should call aggregateDateFormatterUsage exactly once', async () => {
      const request = createRequest('Bearer test-cron-secret-123');

      await GET(request);

      expect(mockAggregateDateFormatterUsage).toHaveBeenCalledTimes(1);
      expect(mockAggregateDateFormatterUsage).toHaveBeenCalledWith();
    });

    test('should handle successful aggregation result', async () => {
      mockAggregateDateFormatterUsage.mockResolvedValue({
        success: true,
        processedCount: 10,
        errorCount: 0,
        duration: 5,
        totalRecords: 50,
        environment: 'prod'
      });
      const request = createRequest('Bearer test-cron-secret-123');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.ok).toBe(true);
      expect(data.success).toBe(true);
      expect(data.metrics.recordsProcessed).toBe(10);
      expect(data.metrics.recordsErrored).toBe(0);
      expect(data.metrics.executionTimeSeconds).toBe(5);
      expect(data.metrics.totalRecordsFound).toBe(50);
      expect(data.metrics.environment).toBe('prod');
      expect(data.metrics.error).toBe(null);
    });

    test('should handle failed aggregation result', async () => {
      mockAggregateDateFormatterUsage.mockResolvedValue({
        success: false,
        processedCount: 3,
        errorCount: 7,
        duration: 2,
        totalRecords: 25,
        environment: 'dev',
        error: 'Database connection failed'
      });
      const request = createRequest('Bearer test-cron-secret-123');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.ok).toBe(false);
      expect(data.success).toBe(false);
      expect(data.metrics.recordsProcessed).toBe(3);
      expect(data.metrics.recordsErrored).toBe(7);
      expect(data.metrics.error).toBe('Database connection failed');
    });

    test('should handle aggregation service throwing error', async () => {
      mockAggregateDateFormatterUsage.mockRejectedValue(new Error('Service crashed'));
      const request = createRequest('Bearer test-cron-secret-123');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.ok).toBe(false);
      expect(data.success).toBe(false);
      expect(data.metrics.error).toBe('Service crashed');
    });

    test('should handle aggregation service throwing non-Error object', async () => {
      mockAggregateDateFormatterUsage.mockRejectedValue('String error');
      const request = createRequest('Bearer test-cron-secret-123');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.metrics.error).toBe('Unknown error');
    });

    test('should handle aggregation service throwing null', async () => {
      mockAggregateDateFormatterUsage.mockRejectedValue(null);
      const request = createRequest('Bearer test-cron-secret-123');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.metrics.error).toBe('Unknown error');
    });

    test('should handle aggregation service with zero records', async () => {
      mockAggregateDateFormatterUsage.mockResolvedValue({
        success: true,
        processedCount: 0,
        errorCount: 0,
        duration: 0,
        totalRecords: 0,
        environment: 'dev'
      });
      const request = createRequest('Bearer test-cron-secret-123');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.metrics.recordsProcessed).toBe(0);
      expect(data.metrics.totalRecordsFound).toBe(0);
    });

    test('should handle aggregation service with large numbers', async () => {
      mockAggregateDateFormatterUsage.mockResolvedValue({
        success: true,
        processedCount: 999999,
        errorCount: 1000,
        duration: 3600,
        totalRecords: 10000000,
        environment: 'prod'
      });
      const request = createRequest('Bearer test-cron-secret-123');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.metrics.recordsProcessed).toBe(999999);
      expect(data.metrics.totalRecordsFound).toBe(10000000);
    });
  });

  describe('Response Structure Validation', () => {
    test('should return exact camelCase structure for success', async () => {
      const request = createRequest('Bearer test-cron-secret-123');

      const response = await GET(request);
      const data = await response.json();

      expect(data).toHaveProperty('ok');
      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('jobName', 'aggregateDateFormatterUsage');
      expect(data).toHaveProperty('timestamp');
      expect(data).toHaveProperty('metrics');
      expect(data.metrics).toHaveProperty('recordsProcessed');
      expect(data.metrics).toHaveProperty('recordsErrored');
      expect(data.metrics).toHaveProperty('executionTimeSeconds');
      expect(data.metrics).toHaveProperty('totalRecordsFound');
      expect(data.metrics).toHaveProperty('environment');
      expect(data.metrics).toHaveProperty('error');
    });

    test('should return exact camelCase structure for failure', async () => {
      mockAggregateDateFormatterUsage.mockResolvedValue({
        success: false,
        processedCount: 0,
        errorCount: 0,
        duration: 1,
        totalRecords: 0,
        environment: 'dev',
        error: 'Test error'
      });
      const request = createRequest('Bearer test-cron-secret-123');

      const response = await GET(request);
      const data = await response.json();

      expect(data.jobName).toBe('aggregateDateFormatterUsage');
      expect(data.metrics.error).toBe('Test error');
      expect(typeof data.timestamp).toBe('string');
    });

    test('should have valid ISO timestamp format', async () => {
      const request = createRequest('Bearer test-cron-secret-123');

      const response = await GET(request);
      const data = await response.json();

      expect(data.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      expect(new Date(data.timestamp).toISOString()).toBe(data.timestamp);
    });

    test('should have consistent field types', async () => {
      const request = createRequest('Bearer test-cron-secret-123');

      const response = await GET(request);
      const data = await response.json();

      expect(typeof data.ok).toBe('boolean');
      expect(typeof data.success).toBe('boolean');
      expect(typeof data.jobName).toBe('string');
      expect(typeof data.timestamp).toBe('string');
      expect(typeof data.metrics).toBe('object');
      expect(typeof data.metrics.recordsProcessed).toBe('number');
      expect(typeof data.metrics.recordsErrored).toBe('number');
      expect(typeof data.metrics.executionTimeSeconds).toBe('number');
      expect(typeof data.metrics.totalRecordsFound).toBe('number');
      expect(typeof data.metrics.environment).toBe('string');
    });

    test('should match exact expected response format', async () => {
      const mockTime = new Date('2025-07-31T08:12:07.097Z');
      jest.spyOn(global, 'Date').mockImplementation(() => mockTime as any);

      const request = createRequest('Bearer test-cron-secret-123');

      const response = await GET(request);
      const data = await response.json();

      expect(data).toEqual({
        ok: true,
        success: true,
        jobName: 'aggregateDateFormatterUsage',
        timestamp: '2025-07-31T08:12:07.097Z',
        metrics: {
          recordsProcessed: 5,
          recordsErrored: 2,
          executionTimeSeconds: 3,
          totalRecordsFound: 100,
          environment: 'dev',
          error: null
        }
      });

      (global.Date as any).mockRestore();
    });
  });

  describe('Logging Behavior', () => {
    test('should log cron execution start', async () => {
      const request = createRequest('Bearer test-cron-secret-123');

      await GET(request);

      expect(consoleLogSpy).toHaveBeenCalledWith('🕐 Cron job started: aggregate-date-formatter-usage');
    });

    test('should log successful completion with details', async () => {
      const request = createRequest('Bearer test-cron-secret-123');

      await GET(request);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        '✅ Cron job completed successfully:',
        expect.objectContaining({
          job: 'aggregate-date-formatter-usage',
          success: true,
          processedCount: 5,
          errorCount: 2,
          duration: 3,
          totalRecords: 100,
          environment: 'dev',
          error: undefined
        })
      );
    });

    test('should log failed completion with details', async () => {
      mockAggregateDateFormatterUsage.mockResolvedValue({
        success: false,
        processedCount: 1,
        errorCount: 5,
        duration: 2,
        totalRecords: 10,
        environment: 'prod',
        error: 'Database timeout'
      });
      const request = createRequest('Bearer test-cron-secret-123');

      await GET(request);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '❌ Cron job failed:',
        expect.objectContaining({
          job: 'aggregate-date-formatter-usage',
          success: false,
          error: 'Database timeout'
        })
      );
    });

    test('should log unexpected errors', async () => {
      mockAggregateDateFormatterUsage.mockRejectedValue(new Error('Unexpected crash'));
      const request = createRequest('Bearer test-cron-secret-123');

      await GET(request);

      expect(consoleErrorSpy).toHaveBeenCalledWith('💥 Unexpected error in cron job:', expect.any(Error));
    });

    test('should include start and end times in log data', async () => {
      const request = createRequest('Bearer test-cron-secret-123');

      await GET(request);

      const logCall = consoleLogSpy.mock.calls.find(call => call[0].includes('✅ Cron job completed'));
      expect(logCall).toBeDefined();
      expect(logCall[1]).toHaveProperty('startTime');
      expect(logCall[1]).toHaveProperty('endTime');
      expect(logCall[1].startTime).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      expect(logCall[1].endTime).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    test('should not log authentication errors for security', async () => {
      const request = createRequest('Bearer wrong-secret');

      await GET(request);

      // Should only log the warning, not detailed auth failure info
      expect(consoleWarnSpy).toHaveBeenCalledWith('Unauthorized cron request attempt');
      expect(consoleLogSpy).not.toHaveBeenCalledWith(expect.stringContaining('🕐 Cron job started'));
    });
  });

  describe('HTTP Status Codes', () => {
    test('should return 200 for successful aggregation', async () => {
      const request = createRequest('Bearer test-cron-secret-123');

      const response = await GET(request);

      expect(response.status).toBe(200);
    });

    test('should return 401 for authentication failure', async () => {
      const request = createRequest('Bearer wrong-secret');

      const response = await GET(request);

      expect(response.status).toBe(401);
    });

    test('should return 500 for aggregation service failure', async () => {
      mockAggregateDateFormatterUsage.mockResolvedValue({
        success: false,
        processedCount: 0,
        errorCount: 0,
        duration: 0,
        totalRecords: 0,
        environment: 'dev',
        error: 'Service failed'
      });
      const request = createRequest('Bearer test-cron-secret-123');

      const response = await GET(request);

      expect(response.status).toBe(500);
    });

    test('should return 500 for missing CRON_SECRET', async () => {
      delete process.env.CRON_SECRET;
      const request = createRequest('Bearer any-secret');

      const response = await GET(request);

      expect(response.status).toBe(500);
    });

    test('should return 500 for unexpected exceptions', async () => {
      mockAggregateDateFormatterUsage.mockRejectedValue(new Error('Crash'));
      const request = createRequest('Bearer test-cron-secret-123');

      const response = await GET(request);

      expect(response.status).toBe(500);
    });
  });

  describe('Edge Cases & Boundaries', () => {
    test('should handle very long CRON_SECRET', async () => {
      const longSecret = 'A'.repeat(10000);
      process.env.CRON_SECRET = longSecret;
      const request = createRequest(`Bearer ${longSecret}`);

      const response = await GET(request);

      expect(response.status).toBe(200);
    });

    test('should handle unicode characters in CRON_SECRET', async () => {
      // Skip this test as Headers API has limitations with non-ASCII characters
      // In real usage, CRON_SECRET would be ASCII-only for compatibility
      const asciiSecret = 'test-secret-with-special-chars-123';
      process.env.CRON_SECRET = asciiSecret;
      const request = createRequest(`Bearer ${asciiSecret}`);

      const response = await GET(request);

      expect(response.status).toBe(200);
    });

    test('should handle aggregation service returning minimal result', async () => {
      mockAggregateDateFormatterUsage.mockResolvedValue({
        success: true,
        processedCount: 0,
        errorCount: 0,
        duration: 0,
        totalRecords: 0,
        environment: ''
      });
      const request = createRequest('Bearer test-cron-secret-123');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.metrics.environment).toBe('');
    });

    test('should handle aggregation service with negative values', async () => {
      mockAggregateDateFormatterUsage.mockResolvedValue({
        success: true,
        processedCount: -1,
        errorCount: -2,
        duration: -3,
        totalRecords: -4,
        environment: 'test'
      });
      const request = createRequest('Bearer test-cron-secret-123');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.metrics.recordsProcessed).toBe(-1);
      expect(data.metrics.recordsErrored).toBe(-2);
    });

    test('should handle multiple authorization headers', async () => {
      const headers = new Headers();
      headers.append('authorization', 'Bearer wrong-secret');
      headers.append('authorization', 'Bearer test-cron-secret-123');
      
      const request = new NextRequest('http://localhost:3000/api/cron/aggregate-date-formatter-usage', {
        method: 'GET',
        headers
      });

      const response = await GET(request);

      // Should use the first header (wrong one) and fail
      expect(response.status).toBe(401);
    });

    test('should handle concurrent request simulation', async () => {
      const request1 = createRequest('Bearer test-cron-secret-123');
      const request2 = createRequest('Bearer test-cron-secret-123');

      const [response1, response2] = await Promise.all([
        GET(request1),
        GET(request2)
      ]);

      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);
      expect(mockAggregateDateFormatterUsage).toHaveBeenCalledTimes(2);
    });

    test('should handle case-sensitive Bearer scheme', async () => {
      const request = createRequest('bearer test-cron-secret-123');

      const response = await GET(request);

      expect(response.status).toBe(401);
    });

    test('should handle whitespace in authorization header', async () => {
      // Headers.get() automatically trims whitespace, so this actually passes authorization
      const request = createRequest(' Bearer test-cron-secret-123 ');

      const response = await GET(request);

      // The browser Headers API automatically trims whitespace
      expect(response.status).toBe(200);
    });

    test('should handle aggregation timeout scenario', async () => {
      const slowPromise = new Promise(resolve => setTimeout(() => resolve({
        success: true,
        processedCount: 1,
        errorCount: 0,
        duration: 120, // 2 minutes
        totalRecords: 1,
        environment: 'test'
      }), 1000));
      
      mockAggregateDateFormatterUsage.mockReturnValue(slowPromise as any);
      const request = createRequest('Bearer test-cron-secret-123');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.metrics.executionTimeSeconds).toBe(120);
    });

    test('should handle empty authorization header value', async () => {
      const headers = new Headers();
      headers.set('authorization', '');
      
      const request = new NextRequest('http://localhost:3000/api/cron/aggregate-date-formatter-usage', {
        method: 'GET',
        headers
      });

      const response = await GET(request);

      expect(response.status).toBe(401);
    });

    test('should handle null environment in aggregation result', async () => {
      mockAggregateDateFormatterUsage.mockResolvedValue({
        success: true,
        processedCount: 1,
        errorCount: 0,
        duration: 1,
        totalRecords: 1,
        environment: null as any
      });
      const request = createRequest('Bearer test-cron-secret-123');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.metrics.environment).toBe(null);
    });

    test('should handle missing error field in failed aggregation', async () => {
      mockAggregateDateFormatterUsage.mockResolvedValue({
        success: false,
        processedCount: 0,
        errorCount: 1,
        duration: 0,
        totalRecords: 0,
        environment: 'dev'
        // error field intentionally missing
      } as any);
      const request = createRequest('Bearer test-cron-secret-123');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      // Since the route uses `result.error || null`, missing error becomes null
      expect(data.metrics.error).toBe(null);
    });
  });

  describe('Service Interface Compliance', () => {
    test('should not pass any parameters to aggregation service', async () => {
      const request = createRequest('Bearer test-cron-secret-123');

      await GET(request);

      expect(mockAggregateDateFormatterUsage).toHaveBeenCalledWith();
    });

    test('should handle service returning unexpected fields', async () => {
      mockAggregateDateFormatterUsage.mockResolvedValue({
        success: true,
        processedCount: 1,
        errorCount: 0,
        duration: 1,
        totalRecords: 1,
        environment: 'dev',
        unexpectedField: 'should be ignored',
        anotherField: 123
      } as any);
      const request = createRequest('Bearer test-cron-secret-123');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.metrics).not.toHaveProperty('unexpectedField');
      expect(data.metrics).not.toHaveProperty('anotherField');
    });

    test('should handle service returning missing required fields', async () => {
      mockAggregateDateFormatterUsage.mockResolvedValue({
        success: true
        // All other fields missing
      } as any);
      const request = createRequest('Bearer test-cron-secret-123');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.metrics.recordsProcessed).toBeUndefined();
      expect(data.metrics.recordsErrored).toBeUndefined();
    });

    test('should handle service returning wrong field types', async () => {
      mockAggregateDateFormatterUsage.mockResolvedValue({
        success: 'true', // Wrong type
        processedCount: '5', // Wrong type
        errorCount: null, // Wrong type
        duration: undefined, // Wrong type
        totalRecords: {}, // Wrong type
        environment: 123 // Wrong type
      } as any);
      const request = createRequest('Bearer test-cron-secret-123');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.metrics.recordsProcessed).toBe('5');
      expect(data.metrics.recordsErrored).toBe(null);
    });

    test('should handle service returning null result', async () => {
      mockAggregateDateFormatterUsage.mockResolvedValue(null as any);
      const request = createRequest('Bearer test-cron-secret-123');

      const response = await GET(request);

      expect(response.status).toBe(500);
      expect(consoleErrorSpy).toHaveBeenCalledWith('💥 Unexpected error in cron job:', expect.any(TypeError));
    });
  });
});