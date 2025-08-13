/**
 * @jest-environment node
 */

// Mock Supabase before imports
jest.mock('@/lib/database/supabase', () => ({
  supabaseAdmin: {
    from: jest.fn(() => ({
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn()
        }))
      })),
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            limit: jest.fn()
          })),
          single: jest.fn()
        }))
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            limit: jest.fn(() => ({
              select: jest.fn(() => ({
                single: jest.fn()
              }))
            }))
          })),
          select: jest.fn(() => ({
            single: jest.fn()
          }))
        }))
      })),
      delete: jest.fn(() => ({
        eq: jest.fn()
      }))
    }))
  }
}));

import {
  createInstallation,
  findInstallationByHubId,
  findInstallationByHubIdAndApp,
  updateInstallationTokens,
  updateInstallationTokensForApp,
  deleteInstallation,
  deleteInstallationByApp
} from '@/lib/hubspot/installations';
import { supabaseAdmin } from '@/lib/database/supabase';
import type { HubSpotInstallation } from '@/lib/hubspot/types';

const mockSupabaseAdmin = supabaseAdmin as jest.Mocked<typeof supabaseAdmin>;

describe('HubSpot Installation Functions', () => {
  const mockInstallationData = {
    hubId: 12345678,
    accessToken: 'test-access-token',
    refreshToken: 'test-refresh-token',
    expiresAt: '2025-12-31T23:59:59Z',
    scope: ['oauth'],
    appType: 'date-formatter' as const
  };

  const mockDatabaseRecord = {
    id: 'test-id-123',
    hub_id: 12345678,
    access_token: 'test-access-token',
    refresh_token: 'test-refresh-token',
    expires_at: '2025-12-31T23:59:59Z',
    scope: ['oauth'],
    app_type: 'date-formatter',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  };

  const expectedInstallation: HubSpotInstallation = {
    id: 'test-id-123',
    hubId: 12345678,
    accessToken: 'test-access-token',
    refreshToken: 'test-refresh-token',
    expiresAt: '2025-12-31T23:59:59Z',
    scope: ['oauth'],
    appType: 'date-formatter',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createInstallation', () => {
    beforeEach(() => {
      const mockChain = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockDatabaseRecord, error: null })
      };
      mockSupabaseAdmin.from.mockReturnValue(mockChain as any);
    });

    it('should create a new installation successfully', async () => {
      const result = await createInstallation(mockInstallationData);

      expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('hubspot_installations');
      expect(result).toEqual(expectedInstallation);
    });

    it('should transform camelCase to snake_case for database', async () => {
      await createInstallation(mockInstallationData);

      const insertCall = mockSupabaseAdmin.from().insert;
      expect(insertCall).toHaveBeenCalledWith({
        hub_id: mockInstallationData.hubId,
        access_token: mockInstallationData.accessToken,
        refresh_token: mockInstallationData.refreshToken,
        expires_at: mockInstallationData.expiresAt,
        scope: mockInstallationData.scope,
        app_type: mockInstallationData.appType
      });
    });

    it('should throw error when database operation fails', async () => {
      const mockChain = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ 
          data: null, 
          error: { message: 'Database connection failed' } 
        })
      };
      mockSupabaseAdmin.from.mockReturnValue(mockChain as any);

      await expect(createInstallation(mockInstallationData))
        .rejects.toThrow('Failed to create installation: Database connection failed');
    });

    it('should handle different app types', async () => {
      const urlShortenerData = { ...mockInstallationData, appType: 'url-shortener' as const };
      
      await createInstallation(urlShortenerData);

      const insertCall = mockSupabaseAdmin.from().insert;
      expect(insertCall).toHaveBeenCalledWith(
        expect.objectContaining({ app_type: 'url-shortener' })
      );
    });
  });

  describe('findInstallationByHubId', () => {
    it('should find installation by hub ID successfully', async () => {
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({ data: [mockDatabaseRecord], error: null })
      };
      mockSupabaseAdmin.from.mockReturnValue(mockChain as any);

      const result = await findInstallationByHubId(12345678);

      expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('hubspot_installations');
      expect(mockChain.eq).toHaveBeenCalledWith('hub_id', 12345678);
      expect(mockChain.order).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(mockChain.limit).toHaveBeenCalledWith(1);
      expect(result).toEqual(expectedInstallation);
    });

    it('should return null when no installation found', async () => {
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({ data: [], error: null })
      };
      mockSupabaseAdmin.from.mockReturnValue(mockChain as any);

      const result = await findInstallationByHubId(99999999);

      expect(result).toBeNull();
    });

    it('should handle empty data array', async () => {
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({ data: null, error: null })
      };
      mockSupabaseAdmin.from.mockReturnValue(mockChain as any);

      const result = await findInstallationByHubId(12345678);

      expect(result).toBeNull();
    });

    it('should throw error on database failure', async () => {
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({ 
          data: null, 
          error: { message: 'Connection timeout' } 
        })
      };
      mockSupabaseAdmin.from.mockReturnValue(mockChain as any);

      await expect(findInstallationByHubId(12345678))
        .rejects.toThrow('Failed to find installation: Connection timeout');
    });
  });

  describe('findInstallationByHubIdAndApp', () => {
    it('should find installation by hub ID and app type', async () => {
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockDatabaseRecord, error: null })
      };
      
      // Mock the chaining properly
      mockChain.eq.mockImplementation((field) => {
        if (field === 'hub_id') return mockChain;
        if (field === 'app_type') return mockChain;
        return mockChain;
      });
      
      mockSupabaseAdmin.from.mockReturnValue(mockChain as any);

      const result = await findInstallationByHubIdAndApp(12345678, 'date-formatter');

      expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('hubspot_installations');
      expect(mockChain.eq).toHaveBeenCalledWith('hub_id', 12345678);
      expect(mockChain.eq).toHaveBeenCalledWith('app_type', 'date-formatter');
      expect(result).toEqual(expectedInstallation);
    });

    it('should return null when installation not found (PGRST116 error)', async () => {
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ 
          data: null, 
          error: { code: 'PGRST116', message: 'No rows found' } 
        })
      };
      mockChain.eq.mockReturnValue(mockChain);
      mockSupabaseAdmin.from.mockReturnValue(mockChain as any);

      const result = await findInstallationByHubIdAndApp(99999999, 'date-formatter');

      expect(result).toBeNull();
    });

    it('should throw error for other database errors', async () => {
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ 
          data: null, 
          error: { code: 'PGRST500', message: 'Internal server error' } 
        })
      };
      mockChain.eq.mockReturnValue(mockChain);
      mockSupabaseAdmin.from.mockReturnValue(mockChain as any);

      await expect(findInstallationByHubIdAndApp(12345678, 'date-formatter'))
        .rejects.toThrow('Failed to find installation: Internal server error');
    });

    it('should handle url-shortener app type', async () => {
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockDatabaseRecord, error: null })
      };
      mockChain.eq.mockReturnValue(mockChain);
      mockSupabaseAdmin.from.mockReturnValue(mockChain as any);

      await findInstallationByHubIdAndApp(12345678, 'url-shortener');

      expect(mockChain.eq).toHaveBeenCalledWith('app_type', 'url-shortener');
    });
  });

  describe('updateInstallationTokens', () => {
    const tokenUpdateData = {
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
      expiresAt: '2025-12-31T23:59:59Z'
    };

    it('should update tokens successfully', async () => {
      const updatedRecord = { ...mockDatabaseRecord, access_token: 'new-access-token' };
      const mockChain = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: updatedRecord, error: null })
      };
      mockSupabaseAdmin.from.mockReturnValue(mockChain as any);

      const result = await updateInstallationTokens(12345678, tokenUpdateData);

      expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('hubspot_installations');
      expect(mockChain.update).toHaveBeenCalledWith({
        access_token: tokenUpdateData.accessToken,
        refresh_token: tokenUpdateData.refreshToken,
        expires_at: tokenUpdateData.expiresAt,
        updated_at: expect.any(String)
      });
      expect(mockChain.eq).toHaveBeenCalledWith('hub_id', 12345678);
      expect(result.accessToken).toBe('new-access-token');
    });

    it('should handle database errors', async () => {
      const mockChain = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ 
          data: null, 
          error: { message: 'Update failed' } 
        })
      };
      mockSupabaseAdmin.from.mockReturnValue(mockChain as any);

      await expect(updateInstallationTokens(12345678, tokenUpdateData))
        .rejects.toThrow('Failed to update tokens: Update failed');
    });

    it('should order by created_at descending and limit to 1', async () => {
      const mockChain = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockDatabaseRecord, error: null })
      };
      mockSupabaseAdmin.from.mockReturnValue(mockChain as any);

      await updateInstallationTokens(12345678, tokenUpdateData);

      expect(mockChain.order).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(mockChain.limit).toHaveBeenCalledWith(1);
    });
  });

  describe('updateInstallationTokensForApp', () => {
    const tokenUpdateData = {
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token', 
      expiresAt: '2025-12-31T23:59:59Z'
    };

    it('should update tokens for specific app', async () => {
      const updatedRecord = { ...mockDatabaseRecord, access_token: 'new-access-token' };
      const mockChain = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: updatedRecord, error: null })
      };
      mockChain.eq.mockReturnValue(mockChain);
      mockSupabaseAdmin.from.mockReturnValue(mockChain as any);

      const result = await updateInstallationTokensForApp(12345678, 'date-formatter', tokenUpdateData);

      expect(mockChain.eq).toHaveBeenCalledWith('hub_id', 12345678);
      expect(mockChain.eq).toHaveBeenCalledWith('app_type', 'date-formatter');
      expect(result.accessToken).toBe('new-access-token');
    });

    it('should handle url-shortener app type', async () => {
      const mockChain = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockDatabaseRecord, error: null })
      };
      mockChain.eq.mockReturnValue(mockChain);
      mockSupabaseAdmin.from.mockReturnValue(mockChain as any);

      await updateInstallationTokensForApp(12345678, 'url-shortener', tokenUpdateData);

      expect(mockChain.eq).toHaveBeenCalledWith('app_type', 'url-shortener');
    });

    it('should throw descriptive error with app type', async () => {
      const mockChain = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ 
          data: null, 
          error: { message: 'Access denied' } 
        })
      };
      mockChain.eq.mockReturnValue(mockChain);
      mockSupabaseAdmin.from.mockReturnValue(mockChain as any);

      await expect(updateInstallationTokensForApp(12345678, 'url-shortener', tokenUpdateData))
        .rejects.toThrow('Failed to update tokens for url-shortener: Access denied');
    });
  });

  describe('deleteInstallation', () => {
    it('should delete installation successfully', async () => {
      const mockChain = {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: null })
      };
      mockSupabaseAdmin.from.mockReturnValue(mockChain as any);

      await deleteInstallation(12345678);

      expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('hubspot_installations');
      expect(mockChain.delete).toHaveBeenCalled();
      expect(mockChain.eq).toHaveBeenCalledWith('hub_id', 12345678);
    });

    it('should throw error on database failure', async () => {
      const mockChain = {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ 
          error: { message: 'Permission denied' } 
        })
      };
      mockSupabaseAdmin.from.mockReturnValue(mockChain as any);

      await expect(deleteInstallation(12345678))
        .rejects.toThrow('Failed to delete installation: Permission denied');
    });
  });

  describe('deleteInstallationByApp', () => {
    it('should delete installation by app type', async () => {
      const mockChain = {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis()
      };
      // Set up the chain to return itself for the first eq call, then resolve for the second
      mockChain.eq.mockReturnValueOnce(mockChain).mockResolvedValueOnce({ error: null });
      mockSupabaseAdmin.from.mockReturnValue(mockChain as any);

      await deleteInstallationByApp(12345678, 'date-formatter');

      expect(mockChain.eq).toHaveBeenCalledWith('hub_id', 12345678);
      expect(mockChain.eq).toHaveBeenCalledWith('app_type', 'date-formatter');
    });

    it('should throw descriptive error with app type', async () => {
      const mockChain = {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis()
      };
      // Set up the chain to return itself for the first eq call, then resolve with error for the second
      mockChain.eq.mockReturnValueOnce(mockChain).mockResolvedValueOnce({ 
        error: { message: 'Not found' } 
      });
      mockSupabaseAdmin.from.mockReturnValue(mockChain as any);

      await expect(deleteInstallationByApp(12345678, 'url-shortener'))
        .rejects.toThrow('Failed to delete url-shortener installation: Not found');
    });
  });

  describe('transformInstallationRecord helper', () => {
    it('should transform all database fields correctly', async () => {
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({ data: [mockDatabaseRecord], error: null })
      };
      mockSupabaseAdmin.from.mockReturnValue(mockChain as any);

      const result = await findInstallationByHubId(12345678);

      expect(result).toEqual({
        id: mockDatabaseRecord.id,
        hubId: mockDatabaseRecord.hub_id,
        accessToken: mockDatabaseRecord.access_token,
        refreshToken: mockDatabaseRecord.refresh_token,
        expiresAt: mockDatabaseRecord.expires_at,
        scope: mockDatabaseRecord.scope,
        appType: mockDatabaseRecord.app_type,
        createdAt: mockDatabaseRecord.created_at,
        updatedAt: mockDatabaseRecord.updated_at
      });
    });
  });

  describe('Edge cases and error scenarios', () => {
    it('should handle null/undefined data gracefully', async () => {
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({ data: undefined, error: null })
      };
      mockSupabaseAdmin.from.mockReturnValue(mockChain as any);

      const result = await findInstallationByHubId(12345678);

      expect(result).toBeNull();
    });

    it('should handle very large hub IDs', async () => {
      const largeHubId = 999999999999999;
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({ data: [], error: null })
      };
      mockSupabaseAdmin.from.mockReturnValue(mockChain as any);

      await findInstallationByHubId(largeHubId);

      expect(mockChain.eq).toHaveBeenCalledWith('hub_id', largeHubId);
    });

    it('should handle malformed database responses', async () => {
      const malformedRecord = {
        id: 'test-id',
        hub_id: 'not-a-number', // Should be number but isn't
        access_token: null,
        refresh_token: undefined
      };

      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({ data: [malformedRecord], error: null })
      };
      mockSupabaseAdmin.from.mockReturnValue(mockChain as any);

      const result = await findInstallationByHubId(12345678);

      // Should still transform even with malformed data
      expect(result).toBeDefined();
      expect(result?.hubId).toBe('not-a-number');
    });
  });
});