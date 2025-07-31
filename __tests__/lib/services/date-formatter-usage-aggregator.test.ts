/**
 * @jest-environment node
 */

// Mock external dependencies BEFORE imports
jest.mock('@/lib/supabase/client', () => ({
  supabaseAdmin: {
    from: jest.fn(() => ({
      select: jest.fn(),
      upsert: jest.fn()
    }))
  }
}));
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

import { aggregateDateFormatterUsage } from '@/lib/services/date-formatter-usage-aggregator';
import { supabaseAdmin } from '@/lib/supabase/client';
import { ConfigManager } from '@/lib/config/config-manager';

const mockSupabaseAdmin = supabaseAdmin as jest.Mocked<typeof supabaseAdmin>;
const mockConfigManager = ConfigManager as jest.Mocked<typeof ConfigManager>;

describe('Date Formatter Usage Aggregator Service', () => {
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;
  let dateNowSpy: jest.SpyInstance;

  beforeEach(() => {
    // Setup console spies
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    
    // Mock Date.now for consistent timing tests
    dateNowSpy = jest.spyOn(Date.prototype, 'getTime');
    
    // Clear all mocks
    jest.clearAllMocks();
    
    // Setup default mocks
    mockConfigManager.getCurrentEnvironment.mockReturnValue('dev');
    
    // Reset and setup default Supabase mock
    const defaultSelectMock = jest.fn().mockResolvedValue({ data: [], error: null });
    const defaultUpsertMock = jest.fn().mockResolvedValue({ data: [], error: null });
    
    mockSupabaseAdmin.from.mockReturnValue({
      select: defaultSelectMock,
      upsert: defaultUpsertMock
    } as any);
  });

  afterEach(() => {
    // Restore spies
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    dateNowSpy.mockRestore();
  });

  // Helper function to create mock usage request data
  function createMockUsageData(overrides: Array<Partial<{
    portal_id: number;
    month_year: string;
    success: boolean;
  }>> = []): any[] {
    const defaults = [
      { portal_id: 12345, month_year: '2025-01', success: true },
      { portal_id: 12345, month_year: '2025-01', success: false },
      { portal_id: 67890, month_year: '2025-01', success: true }
    ];
    
    return overrides.length > 0 
      ? overrides.map((override, index) => ({ ...defaults[index] || defaults[0], ...override }))
      : defaults;
  }

  // Helper function to setup Supabase select mock
  function setupSupabaseSelectMock(data: any[], error: any = null) {
    const selectMock = jest.fn().mockResolvedValue({ data, error });
    const upsertMock = jest.fn().mockResolvedValue({ data: [], error: null });
    
    mockSupabaseAdmin.from.mockReturnValue({
      select: selectMock,
      upsert: upsertMock
    } as any);
    return selectMock;
  }

  // Helper function to setup Supabase upsert mock
  function setupSupabaseUpsertMock(error: any = null) {
    const selectMock = jest.fn().mockResolvedValue({ data: [], error: null });
    const upsertMock = jest.fn().mockResolvedValue({ data: [], error });
    
    mockSupabaseAdmin.from.mockReturnValue({
      select: selectMock,
      upsert: upsertMock
    } as any);
    return upsertMock;
  }

  // Helper function to setup complete Supabase mock with both select and upsert
  function setupSupabaseMocks(selectData: any[], selectError: any = null, upsertError: any = null) {
    const selectMock = jest.fn().mockResolvedValue({ data: selectData, error: selectError });
    const upsertMock = jest.fn().mockResolvedValue({ data: [], error: upsertError });
    
    mockSupabaseAdmin.from.mockReturnValue({
      select: selectMock,
      upsert: upsertMock
    } as any);
    
    return { selectMock, upsertMock };
  }

  describe('Environment Detection', () => {
    test('should call ConfigManager.getCurrentEnvironment', async () => {
      await aggregateDateFormatterUsage();

      expect(mockConfigManager.getCurrentEnvironment).toHaveBeenCalledTimes(1);
    });

    test('should include environment in result', async () => {
      mockConfigManager.getCurrentEnvironment.mockReturnValue('production');

      const result = await aggregateDateFormatterUsage();

      expect(result.environment).toBe('production');
    });
  });

  describe('Database Operations - Fetch', () => {
    test('should fetch data from usage_requests table with correct columns', async () => {
      const selectMock = setupSupabaseSelectMock([]);

      await aggregateDateFormatterUsage();

      expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('usage_requests');
      expect(selectMock).toHaveBeenCalledWith('portal_id, month_year, success');
    });

    test('should handle successful data fetch', async () => {
      const mockData = createMockUsageData();
      setupSupabaseSelectMock(mockData);

      const result = await aggregateDateFormatterUsage();

      expect(result.success).toBe(true);
      expect(result.totalRecords).toBe(3);
    });

    test('should handle database fetch error', async () => {
      setupSupabaseSelectMock(null, { message: 'Database connection failed' });

      const result = await aggregateDateFormatterUsage();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to fetch usage requests: Database connection failed');
      expect(consoleErrorSpy).toHaveBeenCalledWith('💥 Fatal error during usage aggregation:', expect.any(String));
    });

    test('should handle null data response', async () => {
      setupSupabaseSelectMock(null);

      const result = await aggregateDateFormatterUsage();

      expect(result.success).toBe(true);
      expect(result.totalRecords).toBe(0);
      expect(result.processedCount).toBe(0);
    });

    test('should handle empty data array', async () => {
      setupSupabaseSelectMock([]);

      const result = await aggregateDateFormatterUsage();

      expect(result.success).toBe(true);
      expect(result.totalRecords).toBe(0);
      expect(result.processedCount).toBe(0);
      expect(consoleLogSpy).toHaveBeenCalledWith('✅ No requests to aggregate');
    });

    test('should handle large datasets', async () => {
      const largeDataset = Array.from({ length: 10000 }, (_, i) => ({
        portal_id: Math.floor(i / 100) + 1,
        month_year: `2025-${String(Math.floor(i / 1000) + 1).padStart(2, '0')}`,
        success: i % 2 === 0
      }));
      setupSupabaseSelectMock(largeDataset);

      const result = await aggregateDateFormatterUsage();

      expect(result.success).toBe(true);
      expect(result.totalRecords).toBe(10000);
      expect(result.processedCount).toBeGreaterThan(0);
    });

    test('should handle malformed data gracefully', async () => {
      const malformedData = [
        { portal_id: null, month_year: '2025-01', success: true },
        { portal_id: 123, month_year: null, success: false },
        { portal_id: 456, month_year: '2025-01', success: null }
      ];
      setupSupabaseSelectMock(malformedData);

      const result = await aggregateDateFormatterUsage();

      expect(result.success).toBe(true);
      expect(result.totalRecords).toBe(3);
    });
  });

  describe('Database Operations - Upsert', () => {
    test('should upsert aggregated data with correct structure', async () => {
      const mockData = createMockUsageData();
      setupSupabaseSelectMock(mockData);
      
      const upsertMock = jest.fn().mockResolvedValue({ data: [], error: null });
      mockSupabaseAdmin.from.mockReturnValue({
        select: jest.fn().mockResolvedValue({ data: mockData, error: null }),
        upsert: upsertMock
      } as any);

      await aggregateDateFormatterUsage();

      expect(upsertMock).toHaveBeenCalledWith(
        expect.objectContaining({
          portal_id: expect.any(Number),
          month_year: expect.any(String),
          request_count: expect.any(Number),
          success_count: expect.any(Number),
          error_count: expect.any(Number),
          last_request_at: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
          updated_at: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
        }),
        { onConflict: 'portal_id,month_year' }
      );
    });

    test('should handle upsert errors for individual records', async () => {
      const mockData = createMockUsageData();
      setupSupabaseSelectMock(mockData);
      
      const upsertMock = jest.fn()
        .mockResolvedValueOnce({ data: [], error: null }) // First upsert succeeds
        .mockResolvedValueOnce({ data: [], error: { message: 'Constraint violation' } }); // Second fails
      
      mockSupabaseAdmin.from.mockReturnValue({
        select: jest.fn().mockResolvedValue({ data: mockData, error: null }),
        upsert: upsertMock
      } as any);

      const result = await aggregateDateFormatterUsage();

      expect(result.success).toBe(true);
      expect(result.processedCount).toBe(1);
      expect(result.errorCount).toBe(1);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('❌ Error processing'),
        expect.stringContaining('Constraint violation')
      );
    });

    test('should use correct conflict resolution strategy', async () => {
      const mockData = createMockUsageData([
        { portal_id: 123, month_year: '2025-01', success: true }
      ]);
      
      const { upsertMock } = setupSupabaseMocks(mockData);

      await aggregateDateFormatterUsage();

      expect(upsertMock).toHaveBeenCalledWith(
        expect.any(Object),
        { onConflict: 'portal_id,month_year' }
      );
    });
  });

  describe('Data Processing Logic', () => {
    test('should correctly aggregate data by portal_id and month_year', async () => {
      const mockData = [
        { portal_id: 123, month_year: '2025-01', success: true },
        { portal_id: 123, month_year: '2025-01', success: false },
        { portal_id: 123, month_year: '2025-01', success: true },
        { portal_id: 456, month_year: '2025-01', success: true }
      ];
      
      const { upsertMock } = setupSupabaseMocks(mockData);

      await aggregateDateFormatterUsage();

      // Should create 2 aggregated records (one for each portal)
      expect(upsertMock).toHaveBeenCalledTimes(2);
      
      // Check first portal aggregation (123:2025-01)
      expect(upsertMock).toHaveBeenCalledWith(
        expect.objectContaining({
          portal_id: 123,
          month_year: '2025-01',
          request_count: 3,
          success_count: 2,
          error_count: 1
        }),
        expect.objectContaining({ onConflict: 'portal_id,month_year' })
      );
      
      // Check second portal aggregation (456:2025-01)
      expect(upsertMock).toHaveBeenCalledWith(
        expect.objectContaining({
          portal_id: 456,
          month_year: '2025-01',
          request_count: 1,
          success_count: 1,
          error_count: 0
        }),
        expect.objectContaining({ onConflict: 'portal_id,month_year' })
      );
    });

    test('should handle multiple months for same portal', async () => {
      const mockData = [
        { portal_id: 123, month_year: '2025-01', success: true },
        { portal_id: 123, month_year: '2025-02', success: false },
        { portal_id: 123, month_year: '2025-01', success: true }
      ];
      
      const { upsertMock } = setupSupabaseMocks(mockData);

      await aggregateDateFormatterUsage();

      expect(upsertMock).toHaveBeenCalledTimes(2);
      
      // Should create separate records for each month
      expect(upsertMock).toHaveBeenCalledWith(
        expect.objectContaining({
          portal_id: 123,
          month_year: '2025-01',
          request_count: 2,
          success_count: 2,
          error_count: 0
        }),
        expect.objectContaining({ onConflict: 'portal_id,month_year' })
      );
      
      expect(upsertMock).toHaveBeenCalledWith(
        expect.objectContaining({
          portal_id: 123,
          month_year: '2025-02',
          request_count: 1,
          success_count: 0,
          error_count: 1
        }),
        expect.objectContaining({ onConflict: 'portal_id,month_year' })
      );
    });

    test('should handle boolean success values correctly', async () => {
      const mockData = [
        { portal_id: 123, month_year: '2025-01', success: true },
        { portal_id: 123, month_year: '2025-01', success: false },
        { portal_id: 123, month_year: '2025-01', success: null }, // Falsy
        { portal_id: 123, month_year: '2025-01', success: undefined }, // Falsy
      ];
      
      const { upsertMock } = setupSupabaseMocks(mockData);

      await aggregateDateFormatterUsage();

      expect(upsertMock).toHaveBeenCalledWith(
        expect.objectContaining({
          portal_id: 123,
          month_year: '2025-01',
          request_count: 4,
          success_count: 1, // Only true value counts as success
          error_count: 3 // false, null, undefined count as errors
        }),
        expect.any(Object)
      );
    });

    test('should log aggregation progress', async () => {
      const mockData = createMockUsageData();
      setupSupabaseSelectMock(mockData);

      await aggregateDateFormatterUsage();

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('📊 Processing 3 requests into 2 portal-month combinations')
      );
    });
  });

  describe('Return Value Structure', () => {
    test('should return correct AggregationResult structure for success', async () => {
      const mockData = createMockUsageData();
      setupSupabaseSelectMock(mockData);

      const result = await aggregateDateFormatterUsage();

      expect(result).toEqual({
        success: true,
        processedCount: expect.any(Number),
        errorCount: expect.any(Number),
        duration: expect.any(Number),
        totalRecords: 3,
        environment: 'dev'
      });
      
      expect(result).not.toHaveProperty('error');
    });

    test('should return correct AggregationResult structure for failure', async () => {
      setupSupabaseSelectMock(null, { message: 'Database error' });

      const result = await aggregateDateFormatterUsage();

      expect(result).toEqual({
        success: false,
        processedCount: 0,
        errorCount: 0,
        duration: expect.any(Number),
        totalRecords: 0,
        environment: 'dev',
        error: 'Failed to fetch usage requests: Database error'
      });
    });

    test('should include all required fields in result', async () => {
      const result = await aggregateDateFormatterUsage();

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('processedCount');
      expect(result).toHaveProperty('errorCount');
      expect(result).toHaveProperty('duration');
      expect(result).toHaveProperty('totalRecords');
      expect(result).toHaveProperty('environment');
      
      expect(typeof result.success).toBe('boolean');
      expect(typeof result.processedCount).toBe('number');
      expect(typeof result.errorCount).toBe('number');
      expect(typeof result.duration).toBe('number');
      expect(typeof result.totalRecords).toBe('number');
      expect(typeof result.environment).toBe('string');
    });
  });

  describe('Performance & Timing', () => {

    test('should handle zero duration', async () => {
      const sameTime = 1000;
      
      dateNowSpy
        .mockReturnValueOnce(sameTime)
        .mockReturnValueOnce(sameTime);

      const result = await aggregateDateFormatterUsage();

      expect(result.duration).toBe(0);
    });

    test('should log performance warning', async () => {
      await aggregateDateFormatterUsage();

      expect(consoleLogSpy).toHaveBeenCalledWith(
        '⚠️  WARNING: Fetching ALL historical data - optimize for production use'
      );
    });
  });

  describe('Logging Behavior', () => {
    test('should log execution start with environment and timestamp', async () => {
      mockConfigManager.getCurrentEnvironment.mockReturnValue('production');

      await aggregateDateFormatterUsage();

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringMatching(/🔄 Starting usage aggregation \(PRODUCTION\) at \d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/)
      );
    });

    test('should log successful completion', async () => {
      const mockData = createMockUsageData();
      setupSupabaseSelectMock(mockData);

      await aggregateDateFormatterUsage();

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringMatching(/✅ Aggregation completed: \d+ processed, \d+ errors, \d+s/)
      );
    });

    test('should log no data scenario', async () => {
      setupSupabaseSelectMock([]);

      await aggregateDateFormatterUsage();

      expect(consoleLogSpy).toHaveBeenCalledWith('✅ No requests to aggregate');
    });

    test('should log fatal errors with stack trace', async () => {
      const error = new Error('Fatal database error');
      setupSupabaseSelectMock(null, error);

      await aggregateDateFormatterUsage();

      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    test('should log individual record processing errors', async () => {
      const mockData = createMockUsageData([
        { portal_id: 123, month_year: '2025-01', success: true }
      ]);
      setupSupabaseSelectMock(mockData);
      
      const upsertMock = jest.fn().mockResolvedValue({ 
        data: [], 
        error: { message: 'Record processing failed' } 
      });
      
      mockSupabaseAdmin.from.mockReturnValue({
        select: jest.fn().mockResolvedValue({ data: mockData, error: null }),
        upsert: upsertMock
      } as any);

      await aggregateDateFormatterUsage();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('❌ Error processing 123:2025-01:'),
        expect.any(String)
      );
    });

    test('should handle non-Error objects in logging', async () => {
      const stringError = 'String error message';
      setupSupabaseSelectMock(null, { message: stringError });

      await aggregateDateFormatterUsage();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('💥 Fatal error during usage aggregation:'),
        expect.any(String)
      );
    });
  });

  describe('Edge Cases & Boundaries', () => {

    test('should handle unusual month_year formats', async () => {
      const mockData = [
        { portal_id: 123, month_year: '2025-13', success: true }, // Invalid month
        { portal_id: 123, month_year: '2025-00', success: true }, // Invalid month
        { portal_id: 123, month_year: 'invalid-date', success: true } // Invalid format
      ];
      setupSupabaseSelectMock(mockData);

      const result = await aggregateDateFormatterUsage();

      expect(result.success).toBe(true);
      expect(result.totalRecords).toBe(3);
    });

    test('should handle ConfigManager throwing error', async () => {
      mockConfigManager.getCurrentEnvironment.mockImplementation(() => {
        throw new Error('Config error');
      });

      const result = await aggregateDateFormatterUsage();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Config error');
      expect(result.environment).toBe('dev'); // Should still have default
    });

    test('should handle Supabase client being null', async () => {
      (mockSupabaseAdmin.from as jest.Mock).mockImplementation(() => {
        throw new TypeError('Cannot read property of null');
      });

      const result = await aggregateDateFormatterUsage();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Cannot read property of null');
    });

    test('should handle memory-intensive aggregation', async () => {
      // Simulate large dataset with many unique portal-month combinations
      const largeDataset = Array.from({ length: 50000 }, (_, i) => ({
        portal_id: i + 1, // Each record has unique portal_id
        month_year: '2025-01',
        success: i % 2 === 0
      }));
      setupSupabaseSelectMock(largeDataset);

      const result = await aggregateDateFormatterUsage();

      expect(result.success).toBe(true);
      expect(result.totalRecords).toBe(50000);
      expect(result.processedCount).toBe(50000); // Should process all unique combinations
    });
  });
});