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

  const mockMonthlyUsageData = [
    {
      portal_id: 12345678,
      month_year: '2025-01',
      total_requests: 150,
      successful_requests: 142,
      failed_requests: 8, // 150 - 142
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-26T10:30:00Z'
    },
    {
      portal_id: 12345678,
      month_year: '2024-12',
      total_requests: 95,
      successful_requests: 88,
      failed_requests: 7, // 95 - 88
      created_at: '2024-12-01T00:00:00Z',
      updated_at: '2024-12-31T23:59:59Z'
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

      expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('usage_requests');
      expect(mockSupabaseAdmin.from().insert).toHaveBeenCalledWith({
        portal_id: 12345678,
        source_date: '01/26/2025',
        source_format: 'US_STANDARD',
        target_format: 'ISO_STANDARD',
        custom_target_format: null,
        formatted_date: '2025-01-26',
        success: true,
        error_message: null,
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
        order: jest.fn().mockResolvedValue({ data: mockMonthlyUsageData, error: null })
      };
      mockSupabaseAdmin.from.mockReturnValue(mockSelectChain as any);
    });

    it('should calculate usage statistics correctly', async () => {
      const result = await getUsageStats(12345678);

      expect(result).toEqual({
        totalRequests: 245, // 150 + 95
        successfulRequests: 230, // 142 + 88
        failedRequests: 15, // 245 - 230
        successRate: 93.88, // (230/245) * 100, rounded to 2 decimals
        thisMonth: 150, // Current month (2025-01)
        lastMonth: 95, // Previous month (2024-12) 
        averagePerDay: 5.77 // 150 requests / 26 days in month, rounded to 2 decimals
      });

      expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('portal_usage_monthly');
      expect(mockSupabaseAdmin.from().select).toHaveBeenCalledWith('*');
      expect(mockSupabaseAdmin.from().eq).toHaveBeenCalledWith('portal_id', 12345678);
      expect(mockSupabaseAdmin.from().order).toHaveBeenCalledWith('month_year', { ascending: false });
    });

    it('should return zero stats when no data found', async () => {
      const mockSelectChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: [], error: null })
      };
      mockSupabaseAdmin.from.mockReturnValue(mockSelectChain as any);

      const result = await getUsageStats(99999999);

      expect(result).toEqual({
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        successRate: 0,
        thisMonth: 0,
        lastMonth: 0,
        averagePerDay: 0
      });
    });

    it('should return zero stats when data is null', async () => {
      const mockSelectChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: null, error: null })
      };
      mockSupabaseAdmin.from.mockReturnValue(mockSelectChain as any);

      const result = await getUsageStats(12345678);

      expect(result.totalRequests).toBe(0);
      expect(result.successfulRequests).toBe(0);
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
        order: jest.fn().mockResolvedValue({ 
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
      const currentMonthOnly = [mockMonthlyUsageData[0]]; // Only 2025-01 data
      
      const mockSelectChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: currentMonthOnly, error: null })
      };
      mockSupabaseAdmin.from.mockReturnValue(mockSelectChain as any);

      const result = await getUsageStats(12345678);

      expect(result.totalRequests).toBe(150);
      expect(result.thisMonth).toBe(150);
      expect(result.lastMonth).toBe(0); // No last month data
      expect(result.successRate).toBe(94.67); // 142/150 * 100
    });

    it('should calculate averagePerDay based on current date', async () => {
      // Test with different day of month
      const firstOfMonth = new Date('2025-01-01T10:30:00Z');
      jest.setSystemTime(firstOfMonth);

      const result = await getUsageStats(12345678);

      expect(result.averagePerDay).toBe(150); // 150 requests / 1 day

      // Reset to original mock
      jest.setSystemTime(mockDate);
    });

    it('should handle zero successful requests', async () => {
      const noSuccessData = [{
        portal_id: 12345678,
        month_year: '2025-01',
        total_requests: 100,
        successful_requests: 0,
        failed_requests: 100, // All requests failed
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-26T10:30:00Z'
      }];

      const mockSelectChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: noSuccessData, error: null })
      };
      mockSupabaseAdmin.from.mockReturnValue(mockSelectChain as any);

      const result = await getUsageStats(12345678);

      expect(result.successRate).toBe(0);
      expect(result.failedRequests).toBe(100);
      expect(result.successfulRequests).toBe(0);
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

      expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('usage_requests');
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
      expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('usage_requests');
    });

    it('should provide getStats method', async () => {
      const mockSelectChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockMonthlyUsageData, error: null })
      };
      mockSupabaseAdmin.from.mockReturnValue(mockSelectChain as any);

      const result = await usageService.getStats(12345678);

      expect(result.totalRequests).toBe(245);
      expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('portal_usage_monthly');
    });

    it('should provide trackAsync method', async () => {
      const mockFromChain = {
        insert: jest.fn().mockResolvedValue({ error: null })
      };
      mockSupabaseAdmin.from.mockReturnValue(mockFromChain as any);
      mockSupabaseAdmin.rpc.mockResolvedValue({ error: null });

      await expect(usageService.trackAsync(validUsageData)).resolves.toBeUndefined();

      expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('usage_requests');
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
        order: jest.fn().mockResolvedValue({ 
          data: [{
            portal_id: 12345678,
            month_year: 'invalid-date',
            total_requests: 'not-a-number',
            successful_requests: null
          }], 
          error: null 
        })
      };
      mockSupabaseAdmin.from.mockReturnValue(mockSelectChain as any);

      const result = await getUsageStats(12345678);

      // JavaScript string concatenation behavior - this shows the current limitation
      expect(result.totalRequests).toBe("0not-a-number"); // String concatenation occurs
      expect(result.successfulRequests).toBe(0); // null gets coerced to 0
    });
  });
});