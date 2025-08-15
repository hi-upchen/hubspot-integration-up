/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server';
import { GET } from '@/app/api/cron/aggregate-usage/route';
import { UnifiedUsageAggregator } from '@/lib/shared/services/unified-usage-aggregator';
import { ConfigManager } from '@/lib/config/config-manager';

// Mock dependencies
jest.mock('@/lib/shared/services/unified-usage-aggregator');
jest.mock('@/lib/config/config-manager');

const mockUnifiedUsageAggregator = UnifiedUsageAggregator as jest.MockedClass<typeof UnifiedUsageAggregator>;
const mockConfigManager = ConfigManager as jest.Mocked<typeof ConfigManager>;

describe('/api/cron/aggregate-usage', () => {
  let mockAggregator: jest.Mocked<InstanceType<typeof UnifiedUsageAggregator>>;
  const mockCronSecret = 'test-cron-secret-123';

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create mock aggregator instance
    mockAggregator = {
      aggregateApp: jest.fn(),
      aggregateAll: jest.fn()
    } as any;
    
    mockUnifiedUsageAggregator.mockImplementation(() => mockAggregator);
    
    // Mock config
    mockConfigManager.getConfig.mockReturnValue({
      hubspot: {} as any,
      supabase: {} as any,
      application: {
        nextjsUrl: 'http://localhost:3000',
        encryptionKey: 'test-key',
        nextAuthSecret: 'test-secret',
        cronSecret: mockCronSecret
      }
    });
    
    mockConfigManager.getCurrentEnvironment.mockReturnValue('dev');
    
    // Mock console methods
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Authentication', () => {
    it('should reject requests without authorization header', async () => {
      const request = new NextRequest('http://localhost:3000/api/cron/aggregate-usage', {
        headers: new Headers()
      });
      
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should reject requests with invalid cron secret', async () => {
      const request = new NextRequest('http://localhost:3000/api/cron/aggregate-usage', {
        headers: new Headers({
          'authorization': 'Bearer invalid-secret'
        })
      });
      
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should accept requests with valid cron secret', async () => {
      mockAggregator.aggregateAll.mockResolvedValue({
        success: true,
        results: {
          'date-formatter': {
            success: true,
            appType: 'date-formatter',
            processedCount: 10,
            errorCount: 0,
            duration: 2,
            totalRecords: 10
          },
          'url-shortener': {
            success: true,
            appType: 'url-shortener',
            processedCount: 5,
            errorCount: 0,
            duration: 1,
            totalRecords: 5
          }
        },
        summary: {
          totalProcessed: 15,
          totalErrors: 0,
          totalDuration: 3
        }
      });
      
      const request = new NextRequest('http://localhost:3000/api/cron/aggregate-usage', {
        headers: new Headers({
          'authorization': `Bearer ${mockCronSecret}`
        })
      });
      
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.ok).toBe(true);
      expect(data.success).toBe(true);
    });
  });

  describe('Aggregation', () => {
    const createRequest = (params?: URLSearchParams) => {
      const url = params 
        ? `http://localhost:3000/api/cron/aggregate-usage?${params.toString()}`
        : 'http://localhost:3000/api/cron/aggregate-usage';
      
      return new NextRequest(url, {
        headers: new Headers({
          'authorization': `Bearer ${mockCronSecret}`
        })
      });
    };

    it('should perform incremental aggregation by default', async () => {
      mockAggregator.aggregateAll.mockResolvedValue({
        success: true,
        results: {
          'date-formatter': {
            success: true,
            appType: 'date-formatter',
            processedCount: 10,
            errorCount: 0,
            duration: 2,
            totalRecords: 10,
            lastProcessedTimestamp: new Date('2025-01-20T12:00:00Z')
          },
          'url-shortener': {
            success: true,
            appType: 'url-shortener',
            processedCount: 5,
            errorCount: 0,
            duration: 1,
            totalRecords: 5,
            lastProcessedTimestamp: new Date('2025-01-20T12:00:00Z')
          }
        },
        summary: {
          totalProcessed: 15,
          totalErrors: 0,
          totalDuration: 3
        }
      });
      
      const request = createRequest();
      const response = await GET(request);
      const data = await response.json();
      
      expect(mockAggregator.aggregateAll).toHaveBeenCalledWith(false);
      expect(response.status).toBe(200);
      expect(data).toEqual({
        ok: true,
        success: true,
        jobName: 'aggregateUsage',
        timestamp: expect.any(String),
        fullRebuild: false,
        environment: 'dev',
        metrics: {
          totalProcessed: 15,
          totalErrors: 0,
          totalDuration: 3
        },
        details: expect.objectContaining({
          'date-formatter': expect.objectContaining({
            success: true,
            processedCount: 10
          }),
          'url-shortener': expect.objectContaining({
            success: true,
            processedCount: 5
          })
        })
      });
    });

    it('should perform full rebuild when requested', async () => {
      mockAggregator.aggregateAll.mockResolvedValue({
        success: true,
        results: {
          'date-formatter': {
            success: true,
            appType: 'date-formatter',
            processedCount: 100,
            errorCount: 0,
            duration: 10,
            totalRecords: 100
          },
          'url-shortener': {
            success: true,
            appType: 'url-shortener',
            processedCount: 50,
            errorCount: 0,
            duration: 5,
            totalRecords: 50
          }
        },
        summary: {
          totalProcessed: 150,
          totalErrors: 0,
          totalDuration: 15
        }
      });
      
      const params = new URLSearchParams({ full: 'true' });
      const request = createRequest(params);
      const response = await GET(request);
      const data = await response.json();
      
      expect(mockAggregator.aggregateAll).toHaveBeenCalledWith(true);
      expect(data.fullRebuild).toBe(true);
      expect(data.metrics.totalProcessed).toBe(150);
    });

    it('should handle partial failures', async () => {
      mockAggregator.aggregateAll.mockResolvedValue({
        success: false,
        results: {
          'date-formatter': {
            success: true,
            appType: 'date-formatter',
            processedCount: 10,
            errorCount: 0,
            duration: 2,
            totalRecords: 10
          },
          'url-shortener': {
            success: false,
            appType: 'url-shortener',
            processedCount: 0,
            errorCount: 1,
            duration: 1,
            totalRecords: 0,
            error: 'Database connection failed'
          }
        },
        summary: {
          totalProcessed: 10,
          totalErrors: 1,
          totalDuration: 3
        }
      });
      
      const request = createRequest();
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(500);
      expect(data.ok).toBe(false);
      expect(data.success).toBe(false);
      expect(data.metrics.totalErrors).toBe(1);
      expect(data.details['url-shortener'].error).toBe('Database connection failed');
    });

    it('should handle complete failure', async () => {
      mockAggregator.aggregateAll.mockResolvedValue({
        success: false,
        results: {
          'date-formatter': {
            success: false,
            appType: 'date-formatter',
            processedCount: 0,
            errorCount: 1,
            duration: 0,
            totalRecords: 0,
            error: 'Connection timeout'
          },
          'url-shortener': {
            success: false,
            appType: 'url-shortener',
            processedCount: 0,
            errorCount: 1,
            duration: 0,
            totalRecords: 0,
            error: 'Connection timeout'
          }
        },
        summary: {
          totalProcessed: 0,
          totalErrors: 2,
          totalDuration: 0
        }
      });
      
      const request = createRequest();
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(500);
      expect(data.ok).toBe(false);
      expect(data.success).toBe(false);
      expect(data.metrics.totalErrors).toBe(2);
    });
  });

  describe('Error Handling', () => {
    const createRequest = () => {
      return new NextRequest('http://localhost:3000/api/cron/aggregate-usage', {
        headers: new Headers({
          'authorization': `Bearer ${mockCronSecret}`
        })
      });
    };

    it('should handle unexpected errors gracefully', async () => {
      const error = new Error('Unexpected error occurred');
      mockAggregator.aggregateAll.mockRejectedValue(error);
      
      const request = createRequest();
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(500);
      expect(data.ok).toBe(false);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Unexpected error occurred');
      expect(console.error).toHaveBeenCalledWith(
        '💥 Unexpected error in unified aggregation:',
        error
      );
    });

    it('should handle non-Error exceptions', async () => {
      mockAggregator.aggregateAll.mockRejectedValue('String error');
      
      const request = createRequest();
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(500);
      expect(data.ok).toBe(false);
      expect(data.error).toBe('Unknown error');
    });
  });

  describe('Logging', () => {
    const createRequest = () => {
      return new NextRequest('http://localhost:3000/api/cron/aggregate-usage', {
        headers: new Headers({
          'authorization': `Bearer ${mockCronSecret}`
        })
      });
    };

    it('should log successful aggregation', async () => {
      mockAggregator.aggregateAll.mockResolvedValue({
        success: true,
        results: {
          'date-formatter': {
            success: true,
            appType: 'date-formatter',
            processedCount: 10,
            errorCount: 0,
            duration: 2,
            totalRecords: 10
          },
          'url-shortener': {
            success: true,
            appType: 'url-shortener',
            processedCount: 5,
            errorCount: 0,
            duration: 1,
            totalRecords: 5
          }
        },
        summary: {
          totalProcessed: 15,
          totalErrors: 0,
          totalDuration: 3
        }
      });
      
      const request = createRequest();
      await GET(request);
      
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Starting unified usage aggregation (DEV)')
      );
      
      expect(console.log).toHaveBeenCalledWith(
        '✅ Unified aggregation completed successfully:',
        expect.objectContaining({
          job: 'aggregate-usage',
          environment: 'dev',
          success: true
        })
      );
    });

    it('should log failed aggregation', async () => {
      mockAggregator.aggregateAll.mockResolvedValue({
        success: false,
        results: {
          'date-formatter': {
            success: false,
            appType: 'date-formatter',
            processedCount: 0,
            errorCount: 1,
            duration: 0,
            totalRecords: 0,
            error: 'Database error'
          },
          'url-shortener': {
            success: false,
            appType: 'url-shortener',
            processedCount: 0,
            errorCount: 1,
            duration: 0,
            totalRecords: 0,
            error: 'Database error'
          }
        },
        summary: {
          totalProcessed: 0,
          totalErrors: 2,
          totalDuration: 0
        }
      });
      
      const request = createRequest();
      await GET(request);
      
      expect(console.error).toHaveBeenCalledWith(
        '❌ Unified aggregation failed:',
        expect.objectContaining({
          job: 'aggregate-usage',
          environment: 'dev',
          success: false
        })
      );
    });
  });
});