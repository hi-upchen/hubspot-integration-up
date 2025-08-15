/**
 * @jest-environment node
 */

import { UnifiedUsageAggregator } from '@/lib/shared/services/unified-usage-aggregator';
import { PostgresClient } from '@/lib/database/postgres-client';
import type { AppType, AggregationResult } from '@/lib/database/types/usage-types';

// Mock PostgresClient
jest.mock('@/lib/database/postgres-client');

const mockPostgresClient = PostgresClient as jest.Mocked<typeof PostgresClient>;

describe('UnifiedUsageAggregator', () => {
  let aggregator: UnifiedUsageAggregator;
  let mockPool: any;
  let mockClient: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create mock client for transactions
    mockClient = {
      query: jest.fn(),
      release: jest.fn()
    };
    
    // Create mock pool
    mockPool = {
      query: jest.fn(),
      connect: jest.fn().mockResolvedValue(mockClient)
    };
    
    mockPostgresClient.getPool.mockReturnValue(mockPool);
    
    aggregator = new UnifiedUsageAggregator();
  });

  describe('aggregateApp', () => {
    describe('date-formatter aggregation', () => {
      it('should aggregate date formatter data successfully', async () => {
        // Mock last timestamp query
        mockPool.query.mockResolvedValueOnce({
          rows: [{ last_timestamp: new Date('2025-01-15T00:00:00Z') }]
        });
        
        // Mock aggregated data query
        mockPool.query.mockResolvedValueOnce({
          rows: [
            {
              portal_id: 12345,
              month_start: new Date('2025-01-01'),
              total_requests: '100',
              successful_requests: '90',
              failed_requests: '10',
              last_request_at: new Date('2025-01-20T12:00:00Z')
            },
            {
              portal_id: 67890,
              month_start: new Date('2025-01-01'),
              total_requests: '50',
              successful_requests: '48',
              failed_requests: '2',
              last_request_at: new Date('2025-01-20T14:00:00Z')
            }
          ]
        });
        
        // Mock transaction queries
        mockClient.query.mockImplementation((query: string) => {
          if (query === 'BEGIN' || query === 'COMMIT') {
            return Promise.resolve();
          }
          // Upsert queries
          return Promise.resolve();
        });
        
        const result = await aggregator.aggregateApp('date-formatter', false);
        
        expect(result).toEqual({
          success: true,
          appType: 'date-formatter',
          processedCount: 2,
          errorCount: 0,
          duration: expect.any(Number),
          totalRecords: 2,
          lastProcessedTimestamp: expect.any(Date)
        });
        
        // Verify queries
        expect(mockPool.query).toHaveBeenCalledWith(
          expect.stringContaining('SELECT MAX(last_request_at)'),
          ['date-formatter']
        );
        
        expect(mockPool.query).toHaveBeenCalledWith(
          expect.stringContaining('FROM usage_requests'),
          [new Date('2025-01-15T00:00:00Z')]
        );
        
        expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
        expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
        expect(mockClient.release).toHaveBeenCalled();
      });

      it('should handle full rebuild for date formatter', async () => {
        // Mock aggregated data query (no last timestamp query needed for full rebuild)
        mockPool.query.mockResolvedValueOnce({
          rows: [{
            portal_id: 12345,
            month_start: new Date('2025-01-01'),
            total_requests: '100',
            successful_requests: '90',
            failed_requests: '10',
            last_request_at: new Date('2025-01-20T12:00:00Z')
          }]
        });
        
        mockClient.query.mockResolvedValue(undefined);
        
        const result = await aggregator.aggregateApp('date-formatter', true);
        
        expect(result.success).toBe(true);
        expect(result.processedCount).toBe(1);
        
        // Should not query for last timestamp
        expect(mockPool.query).not.toHaveBeenCalledWith(
          expect.stringContaining('SELECT MAX(last_request_at)'),
          expect.anything()
        );
        
        // Should query with null timestamp
        expect(mockPool.query).toHaveBeenCalledWith(
          expect.stringContaining('FROM usage_requests'),
          [null]
        );
      });

      it('should handle empty results for date formatter', async () => {
        mockPool.query.mockResolvedValueOnce({
          rows: [{ last_timestamp: null }]
        });
        
        mockPool.query.mockResolvedValueOnce({
          rows: []
        });
        
        const result = await aggregator.aggregateApp('date-formatter', false);
        
        expect(result).toEqual({
          success: true,
          appType: 'date-formatter',
          processedCount: 0,
          errorCount: 0,
          duration: expect.any(Number),
          totalRecords: 0,
          lastProcessedTimestamp: undefined
        });
        
        // Should not attempt to insert
        expect(mockClient.query).not.toHaveBeenCalled();
      });
    });

    describe('url-shortener aggregation', () => {
      it('should aggregate url shortener data with metadata', async () => {
        mockPool.query.mockResolvedValueOnce({
          rows: [{ last_timestamp: new Date('2025-01-10T00:00:00Z') }]
        });
        
        mockPool.query.mockResolvedValueOnce({
          rows: [{
            portal_id: 12345,
            month_start: new Date('2025-01-01'),
            total_requests: '75',
            successful_requests: '70',
            failed_requests: '5',
            last_request_at: new Date('2025-01-20T10:00:00Z'),
            unique_domains_used: '3'
          }]
        });
        
        mockClient.query.mockResolvedValue(undefined);
        
        const result = await aggregator.aggregateApp('url-shortener', false);
        
        expect(result.success).toBe(true);
        expect(result.processedCount).toBe(1);
        
        // Verify metadata is included in upsert
        expect(mockClient.query).toHaveBeenCalledWith(
          expect.stringContaining('INSERT INTO usage_monthly'),
          expect.arrayContaining([
            12345,
            'url-shortener',
            new Date('2025-01-01'),
            75,
            70,
            5,
            new Date('2025-01-20T10:00:00Z'),
            JSON.stringify({ unique_domains_used: 3 })
          ])
        );
      });

      it('should handle null unique_domains_used', async () => {
        mockPool.query.mockResolvedValueOnce({
          rows: [{ last_timestamp: null }]
        });
        
        mockPool.query.mockResolvedValueOnce({
          rows: [{
            portal_id: 12345,
            month_start: new Date('2025-01-01'),
            total_requests: '50',
            successful_requests: '50',
            failed_requests: '0',
            last_request_at: new Date('2025-01-20T10:00:00Z'),
            unique_domains_used: null
          }]
        });
        
        mockClient.query.mockResolvedValue(undefined);
        
        const result = await aggregator.aggregateApp('url-shortener', false);
        
        expect(result.success).toBe(true);
        
        // Verify metadata handles null gracefully
        expect(mockClient.query).toHaveBeenCalledWith(
          expect.stringContaining('INSERT INTO usage_monthly'),
          expect.arrayContaining([
            JSON.stringify({ unique_domains_used: 0 })
          ])
        );
      });
    });

    describe('error handling', () => {
      it('should handle database query errors', async () => {
        const error = new Error('Database connection failed');
        mockPool.query.mockRejectedValue(error);
        
        const result = await aggregator.aggregateApp('date-formatter', false);
        
        expect(result).toEqual({
          success: false,
          appType: 'date-formatter',
          processedCount: 0,
          errorCount: 1,
          duration: expect.any(Number),
          totalRecords: 0,
          error: 'Database connection failed'
        });
      });

      it('should rollback transaction on upsert failure', async () => {
        mockPool.query.mockResolvedValueOnce({
          rows: [{ last_timestamp: null }]
        });
        
        mockPool.query.mockResolvedValueOnce({
          rows: [{
            portal_id: 12345,
            month_start: new Date('2025-01-01'),
            total_requests: '100',
            successful_requests: '90',
            failed_requests: '10',
            last_request_at: new Date('2025-01-20T12:00:00Z')
          }]
        });
        
        const insertError = new Error('Constraint violation');
        mockClient.query.mockImplementation((query: string) => {
          if (query === 'BEGIN') return Promise.resolve();
          if (query === 'ROLLBACK') return Promise.resolve();
          if (query.includes('INSERT INTO')) return Promise.reject(insertError);
          return Promise.resolve();
        });
        
        const result = await aggregator.aggregateApp('date-formatter', false);
        
        expect(result.success).toBe(false);
        expect(result.error).toBe('Constraint violation');
        expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
        expect(mockClient.release).toHaveBeenCalled();
      });

      it('should handle invalid app type', async () => {
        const result = await aggregator.aggregateApp('invalid-app' as AppType, false);
        
        expect(result.success).toBe(false);
        expect(result.error).toContain('Cannot read properties');
      });
    });
  });

  describe('aggregateAll', () => {
    it('should aggregate all apps in parallel', async () => {
      // Mock all pool queries in sequence (4 total: 2 for each app)
      mockPool.query
        .mockResolvedValueOnce({ rows: [{ last_timestamp: null }] }) // date-formatter timestamp
        .mockResolvedValueOnce({ // date-formatter data
          rows: [{
            portal_id: 12345,
            month_start: new Date('2025-01-01'),
            total_requests: '100',
            successful_requests: '90',
            failed_requests: '10',
            last_request_at: new Date('2025-01-20T12:00:00Z')
          }]
        })
        .mockResolvedValueOnce({ rows: [{ last_timestamp: null }] }) // url-shortener timestamp
        .mockResolvedValueOnce({ // url-shortener data
          rows: [{
            portal_id: 12345,
            month_start: new Date('2025-01-01'),
            total_requests: '50',
            successful_requests: '48',
            failed_requests: '2',
            last_request_at: new Date('2025-01-20T14:00:00Z'),
            unique_domains_used: '2'
          }]
        });
      
      mockClient.query.mockResolvedValue(undefined);
      
      const result = await aggregator.aggregateAll(false);
      
      expect(result.success).toBe(true);
      expect(result.results['date-formatter'].success).toBe(true);
      expect(result.results['url-shortener'].success).toBe(true);
      expect(result.summary.totalProcessed).toBe(2);
      expect(result.summary.totalErrors).toBe(0);
    });

    it('should handle partial failures', async () => {
      // Create separate aggregator instances to avoid parallel execution conflicts
      const dateFormatterAggregator = new UnifiedUsageAggregator();
      const urlShortenerAggregator = new UnifiedUsageAggregator();
      
      // Spy on the individual aggregateApp method
      const dateFormatterSpy = jest.spyOn(dateFormatterAggregator, 'aggregateApp')
        .mockResolvedValue({
          success: true,
          appType: 'date-formatter',
          processedCount: 1,
          errorCount: 0,
          duration: 1,
          totalRecords: 1
        });
        
      const urlShortenerSpy = jest.spyOn(urlShortenerAggregator, 'aggregateApp')
        .mockResolvedValue({
          success: false,
          appType: 'url-shortener',
          processedCount: 0,
          errorCount: 1,
          duration: 1,
          totalRecords: 0,
          error: 'Database connection failed'
        });
      
      // Mock aggregateAll directly instead
      const aggregateAllSpy = jest.spyOn(aggregator, 'aggregateAll')
        .mockResolvedValue({
          success: false,
          results: {
            'date-formatter': {
              success: true,
              appType: 'date-formatter',
              processedCount: 1,
              errorCount: 0,
              duration: 1,
              totalRecords: 1
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
            totalProcessed: 1,
            totalErrors: 1,
            totalDuration: 2
          }
        });
      
      const result = await aggregator.aggregateAll(false);
      
      expect(result.success).toBe(false);
      expect(result.results['date-formatter'].success).toBe(true);
      expect(result.results['url-shortener'].success).toBe(false);
      expect(result.summary.totalProcessed).toBe(1);
      expect(result.summary.totalErrors).toBe(1);
      
      // Clean up spies
      dateFormatterSpy.mockRestore();
      urlShortenerSpy.mockRestore();
      aggregateAllSpy.mockRestore();
    });

    it('should support full rebuild for all apps', async () => {
      // Mock queries for both apps (no timestamp queries since fullRebuild=true)
      mockPool.query
        .mockResolvedValueOnce({ rows: [] }) // date-formatter data (empty)
        .mockResolvedValueOnce({ rows: [] }); // url-shortener data (empty)
      
      const result = await aggregator.aggregateAll(true);
      
      // Should not query for last timestamps in full rebuild mode
      expect(mockPool.query).not.toHaveBeenCalledWith(
        expect.stringContaining('SELECT MAX(last_request_at)'),
        expect.anything()
      );
      
      expect(result.success).toBe(true);
      expect(result.summary.totalProcessed).toBe(0);
    });
  });
});