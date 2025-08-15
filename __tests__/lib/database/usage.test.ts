/**
 * @jest-environment node
 */

// Mock Supabase before imports
jest.mock('@/lib/database/supabase', () => ({
  supabaseAdmin: {
    from: jest.fn(() => ({
      insert: jest.fn(),
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn()
        }))
      }))
    })),
    rpc: jest.fn()
  }
}));

// Mock Date to have consistent timestamps
const mockDate = new Date('2025-01-26T10:30:00Z');

// Mock the Date constructor and static methods
jest.useFakeTimers();
jest.setSystemTime(mockDate);

import {
  trackUsage,
  trackUsageAsync,
  getUsageStats,
  usageService,
  type UsageTrackingData
} from '@/lib/database/usage';
import { supabaseAdmin } from '@/lib/database/supabase';
import type { UsageStats, TrackingResult } from '@/lib/database/types';

const mockSupabaseAdmin = supabaseAdmin as jest.Mocked<typeof supabaseAdmin>;

describe('Database Usage Operations', () => {
  const validUsageData: UsageTrackingData = {
    portalId: 12345678,
    sourceDate: '01/26/2025',
    sourceFormat: 'US_STANDARD',
    targetFormat: 'ISO_STANDARD',
    customTargetFormat: undefined,
    formattedDate: '2025-01-26',
    success: true,
    errorMessage: undefined
  };

  // Mock data for unified usage_monthly table (last 3 months structure)
  const mockUnifiedUsageData = [
    {
      portal_id: 12345678,
      app_type: 'date-formatter',
      month_start: '2025-01-01',
      total_requests: 100,
      successful_requests: 95,
      failed_requests: 5,
      last_request_at: '2025-01-26T10:30:00Z',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-26T10:30:00Z'
    },
    {
      portal_id: 12345678,
      app_type: 'url-shortener',
      month_start: '2025-01-01',
      total_requests: 50,
      successful_requests: 47,
      failed_requests: 3,
      last_request_at: '2025-01-26T10:30:00Z',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-26T10:30:00Z'
    },
    {
      portal_id: 12345678,
      app_type: 'date-formatter',
      month_start: '2024-12-01',
      total_requests: 60,
      successful_requests: 55,
      failed_requests: 5,
      last_request_at: '2024-12-31T23:59:59Z',
      created_at: '2024-12-01T00:00:00Z',
      updated_at: '2024-12-31T23:59:59Z'
    },
    {
      portal_id: 12345678,
      app_type: 'url-shortener',
      month_start: '2024-12-01',
      total_requests: 35,
      successful_requests: 33,
      failed_requests: 2,
      last_request_at: '2024-12-31T23:59:59Z',
      created_at: '2024-12-01T00:00:00Z',
      updated_at: '2024-12-31T23:59:59Z'
    },
    {
      portal_id: 12345678,
      app_type: 'date-formatter',
      month_start: '2024-11-01',
      total_requests: 80,
      successful_requests: 75,
      failed_requests: 5,
      last_request_at: '2024-11-30T23:59:59Z',
      created_at: '2024-11-01T00:00:00Z',
      updated_at: '2024-11-30T23:59:59Z'
    },
    {
      portal_id: 12345678,
      app_type: 'url-shortener',
      month_start: '2024-11-01',
      total_requests: 25,
      successful_requests: 22,
      failed_requests: 3,
      last_request_at: '2024-11-30T23:59:59Z',
      created_at: '2024-11-01T00:00:00Z',
      updated_at: '2024-11-30T23:59:59Z'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset console mocks
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe('trackUsage', () => {
    beforeEach(() => {
      const mockFromChain = {
        insert: jest.fn().mockResolvedValue({ error: null })
      };
      mockSupabaseAdmin.from.mockReturnValue(mockFromChain as any);
      mockSupabaseAdmin.rpc.mockResolvedValue({ error: null });
    });

    it('should track usage successfully with all fields', async () => {
      const result = await trackUsage(validUsageData);

      expect(result).toEqual({
        success: true,
        message: 'Usage tracked successfully'
      });

      expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('date_formatter_usage');
      expect(mockSupabaseAdmin.from().insert).toHaveBeenCalledWith({
        portal_id: 12345678,
        source_date: '01/26/2025',
        source_format: 'US_STANDARD',
        target_format: 'ISO_STANDARD',
        custom_target_format: null,
        formatted_date: '2025-01-26',
        success: true,
        error_message: null,
        request_timestamp: '2025-01-26T10:30:00.000Z',
        created_at: '2025-01-26T10:30:00.000Z'
      });

      expect(mockSupabaseAdmin.rpc).toHaveBeenCalledWith('upsert_monthly_usage', {
        p_portal_id: 12345678,
        p_month_year: '2025-01',
        p_success: true
      });
    });

    it('should track failed request with error message', async () => {
      const failedData: UsageTrackingData = {
        ...validUsageData,
        success: false,
        errorMessage: 'Invalid date format',
        formattedDate: undefined
      };

      const result = await trackUsage(failedData);

      expect(result.success).toBe(true);
      expect(mockSupabaseAdmin.from().insert).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error_message: 'Invalid date format',
          formatted_date: null
        })
      );

      expect(mockSupabaseAdmin.rpc).toHaveBeenCalledWith('upsert_monthly_usage', {
        p_portal_id: 12345678,
        p_month_year: '2025-01',
        p_success: false
      });
    });

    it('should track minimal data with only portal ID and success', async () => {
      const minimalData: UsageTrackingData = {
        portalId: 12345678,
        success: false
      };

      const result = await trackUsage(minimalData);

      expect(result.success).toBe(true);
      expect(mockSupabaseAdmin.from().insert).toHaveBeenCalledWith({
        portal_id: 12345678,
        source_date: null,
        source_format: null,
        target_format: null,
        custom_target_format: null,
        formatted_date: null,
        success: false,
        error_message: null,
        request_timestamp: '2025-01-26T10:30:00.000Z',
        created_at: '2025-01-26T10:30:00.000Z'
      });
    });

    it('should validate portal ID is required', async () => {
      const invalidData = { ...validUsageData, portalId: 0 };

      const result = await trackUsage(invalidData);

      expect(result).toEqual({
        success: false,
        message: 'Valid portal ID is required for tracking',
        error: expect.any(Error)
      });

      expect(mockSupabaseAdmin.from).not.toHaveBeenCalled();
    });

    it('should handle missing portal ID', async () => {
      const invalidData = { ...validUsageData };
      delete (invalidData as any).portalId;

      const result = await trackUsage(invalidData);

      expect(result).toEqual({
        success: false,
        message: 'Valid portal ID is required for tracking',
        error: expect.any(Error)
      });
    });

    it('should handle negative portal ID', async () => {
      const invalidData = { ...validUsageData, portalId: -123 };

      const result = await trackUsage(invalidData);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Valid portal ID is required for tracking');
    });

    it('should handle database insert failure', async () => {
      const mockFromChain = {
        insert: jest.fn().mockResolvedValue({ 
          error: { message: 'Database connection failed' } 
        })
      };
      mockSupabaseAdmin.from.mockReturnValue(mockFromChain as any);

      const result = await trackUsage(validUsageData);

      expect(result).toEqual({
        success: false,
        message: 'Failed to insert usage record: Database connection failed',
        error: expect.any(Error)
      });
    });

    it('should continue if monthly aggregation fails but log error', async () => {
      const mockFromChain = {
        insert: jest.fn().mockResolvedValue({ error: null })
      };
      mockSupabaseAdmin.from.mockReturnValue(mockFromChain as any);
      mockSupabaseAdmin.rpc.mockResolvedValue({ 
        error: { message: 'RPC function failed' } 
      });

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = await trackUsage(validUsageData);

      expect(result.success).toBe(true); // Should still succeed
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to update monthly aggregates:',
        { message: 'RPC function failed' }
      );

      consoleErrorSpy.mockRestore();
    });

    it('should generate correct month-year for different dates', async () => {
      // Test with December date
      const decemberDate = new Date('2024-12-15T14:30:00Z');
      jest.setSystemTime(decemberDate);

      await trackUsage(validUsageData);

      expect(mockSupabaseAdmin.rpc).toHaveBeenCalledWith('upsert_monthly_usage', {
        p_portal_id: 12345678,
        p_month_year: '2024-12',
        p_success: true
      });

      // Reset to original mock
      jest.setSystemTime(mockDate);
    });

    it('should handle additional custom fields in usage data', async () => {
      const customData: UsageTrackingData = {
        ...validUsageData,
        customField1: 'value1',
        customField2: 123,
        customField3: { nested: 'object' }
      };

      const result = await trackUsage(customData);

      expect(result.success).toBe(true);
      // Should still insert standard fields only
      expect(mockSupabaseAdmin.from().insert).toHaveBeenCalledWith(
        expect.objectContaining({
          portal_id: 12345678,
          success: true
        })
      );
    });
  });

  describe('getUsageStats', () => {
    beforeEach(() => {
      const mockSelectChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        in: jest.fn().mockResolvedValue({ data: mockUnifiedUsageData, error: null }),
        order: jest.fn().mockResolvedValue({ data: mockUnifiedUsageData, error: null })
      };
      mockSupabaseAdmin.from.mockReturnValue(mockSelectChain as any);
    });

    it('should return app-specific usage data for last 3 months', async () => {
      const result = await getUsageStats(12345678);

      expect(result).toEqual({
        portalId: 12345678,
        apps: [
          {
            appType: 'date-formatter',
            monthlyData: [
              {
                month: '2025-01',
                successfulRequests: 95,
                failedRequests: 5,
                isCurrentMonth: true
              },
              {
                month: '2024-12',
                successfulRequests: 55,
                failedRequests: 5,
                isCurrentMonth: false
              },
              {
                month: '2024-11',
                successfulRequests: 75,
                failedRequests: 5,
                isCurrentMonth: false
              }
            ]
          },
          {
            appType: 'url-shortener',
            monthlyData: [
              {
                month: '2025-01',
                successfulRequests: 47,
                failedRequests: 3,
                isCurrentMonth: true
              },
              {
                month: '2024-12',
                successfulRequests: 33,
                failedRequests: 2,
                isCurrentMonth: false
              },
              {
                month: '2024-11',
                successfulRequests: 22,
                failedRequests: 3,
                isCurrentMonth: false
              }
            ]
          }
        ]
      });

      expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('usage_monthly');
      expect(mockSupabaseAdmin.from().select).toHaveBeenCalledWith('month_start, app_type, successful_requests, failed_requests');
      expect(mockSupabaseAdmin.from().eq).toHaveBeenCalledWith('portal_id', 12345678);
    });

    it('should return zero stats when no data found', async () => {
      const mockSelectChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        in: jest.fn().mockResolvedValue({ data: [], error: null })
      };
      mockSupabaseAdmin.from.mockReturnValue(mockSelectChain as any);

      const result = await getUsageStats(99999999);

      expect(result).toEqual({
        portalId: 99999999,
        apps: [
          {
            appType: 'date-formatter',
            monthlyData: [
              { month: '2025-01', successfulRequests: 0, failedRequests: 0, isCurrentMonth: true },
              { month: '2024-12', successfulRequests: 0, failedRequests: 0, isCurrentMonth: false },
              { month: '2024-11', successfulRequests: 0, failedRequests: 0, isCurrentMonth: false }
            ]
          },
          {
            appType: 'url-shortener',
            monthlyData: [
              { month: '2025-01', successfulRequests: 0, failedRequests: 0, isCurrentMonth: true },
              { month: '2024-12', successfulRequests: 0, failedRequests: 0, isCurrentMonth: false },
              { month: '2024-11', successfulRequests: 0, failedRequests: 0, isCurrentMonth: false }
            ]
          }
        ]
      });
    });

    it('should return zero stats when data is null', async () => {
      const mockSelectChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        in: jest.fn().mockResolvedValue({ data: null, error: null })
      };
      mockSupabaseAdmin.from.mockReturnValue(mockSelectChain as any);

      const result = await getUsageStats(12345678);

      expect(result.portalId).toBe(12345678);
      expect(result.apps).toHaveLength(2);
      expect(result.apps[0].appType).toBe('date-formatter');
      expect(result.apps[1].appType).toBe('url-shortener');
    });

    it('should validate portal ID', async () => {
      await expect(getUsageStats(0))
        .rejects.toThrow('Valid portal ID is required');

      await expect(getUsageStats(-123))
        .rejects.toThrow('Valid portal ID is required');
    });

    it('should handle database query errors', async () => {
      const mockSelectChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        in: jest.fn().mockResolvedValue({ 
          data: null, 
          error: { message: 'Permission denied' } 
        })
      };
      mockSupabaseAdmin.from.mockReturnValue(mockSelectChain as any);

      await expect(getUsageStats(12345678))
        .rejects.toThrow('Failed to get usage stats: Permission denied');
    });

    it('should handle partial month data correctly', async () => {
      // Test with data that only has current month
      const currentMonthOnly = [mockUnifiedUsageData[0], mockUnifiedUsageData[1]]; // Only 2025-01 data
      
      const mockSelectChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        in: jest.fn().mockResolvedValue({ data: currentMonthOnly, error: null })
      };
      mockSupabaseAdmin.from.mockReturnValue(mockSelectChain as any);

      const result = await getUsageStats(12345678);

      expect(result.apps[0].monthlyData[0]).toEqual({
        month: '2025-01',
        successfulRequests: 95,
        failedRequests: 5,
        isCurrentMonth: true
      });
      expect(result.apps[0].monthlyData[1]).toEqual({
        month: '2024-12',
        successfulRequests: 0, // Missing data
        failedRequests: 0,
        isCurrentMonth: false
      });
    });

    it('should correctly identify current month', async () => {
      const result = await getUsageStats(12345678);

      // Current month (2025-01) should be marked as current
      expect(result.apps[0].monthlyData[0].isCurrentMonth).toBe(true);
      expect(result.apps[0].monthlyData[0].month).toBe('2025-01');
      
      // Previous months should not be current
      expect(result.apps[0].monthlyData[1].isCurrentMonth).toBe(false);
      expect(result.apps[0].monthlyData[2].isCurrentMonth).toBe(false);
    });

    it('should handle zero successful requests', async () => {
      const noSuccessData = [{
        portal_id: 12345678,
        app_type: 'date-formatter',
        month_start: '2025-01-01',
        total_requests: 100,
        successful_requests: 0,
        failed_requests: 100, // All requests failed
        last_request_at: '2025-01-26T10:30:00Z',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-26T10:30:00Z'
      }];

      const mockSelectChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        in: jest.fn().mockResolvedValue({ data: noSuccessData, error: null })
      };
      mockSupabaseAdmin.from.mockReturnValue(mockSelectChain as any);

      const result = await getUsageStats(12345678);

      expect(result.apps[0].monthlyData[0].successfulRequests).toBe(0);
      expect(result.apps[0].monthlyData[0].failedRequests).toBe(100);
    });

    it('should handle single app type data', async () => {
      // Test portal with only date-formatter data
      const dateFormatterOnly = [mockUnifiedUsageData[0], mockUnifiedUsageData[2], mockUnifiedUsageData[4]]; // Only date-formatter records
      
      const mockSelectChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        in: jest.fn().mockResolvedValue({ data: dateFormatterOnly, error: null })
      };
      mockSupabaseAdmin.from.mockReturnValue(mockSelectChain as any);

      const result = await getUsageStats(12345678);

      // Date formatter should have data
      expect(result.apps[0].monthlyData[0].successfulRequests).toBe(95);
      expect(result.apps[0].monthlyData[1].successfulRequests).toBe(55);
      expect(result.apps[0].monthlyData[2].successfulRequests).toBe(75);
      
      // URL shortener should have zeros
      expect(result.apps[1].monthlyData[0].successfulRequests).toBe(0);
      expect(result.apps[1].monthlyData[1].successfulRequests).toBe(0);
      expect(result.apps[1].monthlyData[2].successfulRequests).toBe(0);
    });

    it('should handle mixed months across app types', async () => {
      // Test where different apps have different month coverage
      const mixedData = [
        mockUnifiedUsageData[0], // date-formatter 2025-01
        mockUnifiedUsageData[3]  // url-shortener 2024-12
      ];
      
      const mockSelectChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        in: jest.fn().mockResolvedValue({ data: mixedData, error: null })
      };
      mockSupabaseAdmin.from.mockReturnValue(mockSelectChain as any);

      const result = await getUsageStats(12345678);

      // Date formatter should have current month data
      expect(result.apps[0].monthlyData[0].successfulRequests).toBe(95);
      expect(result.apps[0].monthlyData[1].successfulRequests).toBe(0); // No Dec data
      
      // URL shortener should have last month data only
      expect(result.apps[1].monthlyData[0].successfulRequests).toBe(0); // No Jan data
      expect(result.apps[1].monthlyData[1].successfulRequests).toBe(33); // Dec data
    });
  });

  describe('getUsageStats query behavior', () => {
    it('should query last 3 months only', async () => {
      const mockSelectChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        in: jest.fn().mockResolvedValue({ data: mockUnifiedUsageData, error: null })
      };
      mockSupabaseAdmin.from.mockReturnValue(mockSelectChain as any);

      await getUsageStats(12345678);

      expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('usage_monthly');
      expect(mockSupabaseAdmin.from().select).toHaveBeenCalledWith('month_start, app_type, successful_requests, failed_requests');
      expect(mockSupabaseAdmin.from().eq).toHaveBeenCalledWith('portal_id', 12345678);
      expect(mockSupabaseAdmin.from().in).toHaveBeenCalledWith('month_start', [
        '2025-01-01',
        '2024-12-01', 
        '2024-11-01'
      ]);
    });
  });

  describe('trackUsageAsync', () => {
    it('should track usage without throwing errors', async () => {
      const mockFromChain = {
        insert: jest.fn().mockResolvedValue({ error: null })
      };
      mockSupabaseAdmin.from.mockReturnValue(mockFromChain as any);
      mockSupabaseAdmin.rpc.mockResolvedValue({ error: null });

      // Should not throw
      await expect(trackUsageAsync(validUsageData)).resolves.toBeUndefined();

      expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('date_formatter_usage');
    });

    it('should log errors but not throw them', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const mockFromChain = {
        insert: jest.fn().mockResolvedValue({ 
          error: { message: 'Database error' } 
        })
      };
      mockSupabaseAdmin.from.mockReturnValue(mockFromChain as any);

      // Should not throw even with database error
      await expect(trackUsageAsync(validUsageData)).resolves.toBeUndefined();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Usage tracking failed:',
        expect.objectContaining({
          error: 'Failed to insert usage record: Database error',
          data: expect.objectContaining({ portalId: 12345678 }),
          timestamp: '2025-01-26T10:30:00.000Z'
        })
      );

      consoleErrorSpy.mockRestore();
    });

    it('should handle validation errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const invalidData = { ...validUsageData, portalId: 0 };

      await expect(trackUsageAsync(invalidData)).resolves.toBeUndefined();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Usage tracking failed:',
        expect.objectContaining({
          error: 'Valid portal ID is required for tracking',
          data: expect.objectContaining({ portalId: 0 }),
          timestamp: '2025-01-26T10:30:00.000Z'
        })
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('UsageService class', () => {
    it('should provide track method', async () => {
      const mockFromChain = {
        insert: jest.fn().mockResolvedValue({ error: null })
      };
      mockSupabaseAdmin.from.mockReturnValue(mockFromChain as any);
      mockSupabaseAdmin.rpc.mockResolvedValue({ error: null });

      const result = await usageService.track(validUsageData);

      expect(result.success).toBe(true);
      expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('date_formatter_usage');
    });

    it('should provide getStats method', async () => {
      const mockSelectChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        in: jest.fn().mockResolvedValue({ data: mockUnifiedUsageData, error: null })
      };
      mockSupabaseAdmin.from.mockReturnValue(mockSelectChain as any);

      const result = await usageService.getStats(12345678);

      expect(result.portalId).toBe(12345678);
      expect(result.apps).toHaveLength(2);
      expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('usage_monthly');
    });

    it('should provide trackAsync method', async () => {
      const mockFromChain = {
        insert: jest.fn().mockResolvedValue({ error: null })
      };
      mockSupabaseAdmin.from.mockReturnValue(mockFromChain as any);
      mockSupabaseAdmin.rpc.mockResolvedValue({ error: null });

      await expect(usageService.trackAsync(validUsageData)).resolves.toBeUndefined();

      expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('date_formatter_usage');
    });
  });

  describe('Edge cases and boundary conditions', () => {
    it('should handle extremely large portal IDs', async () => {
      const mockFromChain = {
        insert: jest.fn().mockResolvedValue({ error: null })
      };
      mockSupabaseAdmin.from.mockReturnValue(mockFromChain as any);
      mockSupabaseAdmin.rpc.mockResolvedValue({ error: null });

      const largePortalId = 999999999999999;
      const data = { ...validUsageData, portalId: largePortalId };

      const result = await trackUsage(data);

      expect(result.success).toBe(true);
      expect(mockSupabaseAdmin.from().insert).toHaveBeenCalledWith(
        expect.objectContaining({ portal_id: largePortalId })
      );
    });

    it('should handle very long strings in usage data', async () => {
      const mockFromChain = {
        insert: jest.fn().mockResolvedValue({ error: null })
      };
      mockSupabaseAdmin.from.mockReturnValue(mockFromChain as any);
      mockSupabaseAdmin.rpc.mockResolvedValue({ error: null });

      const longString = 'x'.repeat(10000);
      const data: UsageTrackingData = {
        ...validUsageData,
        sourceDate: longString,
        errorMessage: longString
      };

      const result = await trackUsage(data);

      expect(result.success).toBe(true);
      expect(mockSupabaseAdmin.from().insert).toHaveBeenCalledWith(
        expect.objectContaining({
          source_date: longString,
          error_message: longString
        })
      );
    });

    it('should handle malformed date objects', async () => {
      const mockSelectChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        in: jest.fn().mockResolvedValue({ 
          data: [{
            portal_id: 12345678,
            app_type: 'date-formatter',
            month_start: 'invalid-date',
            total_requests: 'not-a-number',
            successful_requests: null,
            failed_requests: 0
          }], 
          error: null 
        })
      };
      mockSupabaseAdmin.from.mockReturnValue(mockSelectChain as any);

      const result = await getUsageStats(12345678);

      // Should handle malformed data gracefully
      expect(result.portalId).toBe(12345678);
      expect(result.apps).toHaveLength(2); // Should still return app structure
    });
  });
});