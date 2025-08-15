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
          single: jest.fn()
        }))
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
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
  findInstallationByHubIdAndApp,
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
    scope: 'crm.objects.contacts.read',
    appType: 'date-formatter' as const
  };

  const mockDatabaseRecord = {
    id: 'test-id',
    hub_id: 12345678,
    access_token: 'test-access-token',
    refresh_token: 'test-refresh-token',
    expires_at: '2025-12-31T23:59:59Z',
    scope: 'crm.objects.contacts.read',
    app_type: 'date-formatter',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  };

  const expectedInstallation: HubSpotInstallation = {
    id: 'test-id',
    hubId: 12345678,
    accessToken: 'test-access-token',
    refreshToken: 'test-refresh-token',
    expiresAt: '2025-12-31T23:59:59Z',
    scope: 'crm.objects.contacts.read',
    appType: 'date-formatter',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createInstallation', () => {
    it('should create a new installation successfully', async () => {
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockDatabaseRecord, error: null })
      };
      const insertMockChain = {
        insert: jest.fn().mockReturnValue(mockChain)
      };
      mockSupabaseAdmin.from.mockReturnValue(insertMockChain as any);

      const result = await createInstallation(mockInstallationData);

      expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('hubspot_installations');
      expect(result).toEqual(expectedInstallation);
    });

    it('should throw error when database operation fails', async () => {
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: { message: 'Insert failed' } })
      };
      const insertMockChain = {
        insert: jest.fn().mockReturnValue(mockChain)
      };
      mockSupabaseAdmin.from.mockReturnValue(insertMockChain as any);

      await expect(createInstallation(mockInstallationData))
        .rejects.toThrow('Failed to create installation: Insert failed');
    });
  });

  describe('findInstallationByHubIdAndApp', () => {
    it('should find installation by hub ID and app type', async () => {
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockDatabaseRecord, error: null })
      };
      mockSupabaseAdmin.from.mockReturnValue(mockChain as any);

      const result = await findInstallationByHubIdAndApp(12345678, 'date-formatter');

      expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('hubspot_installations');
      expect(mockChain.eq).toHaveBeenCalledWith('hub_id', 12345678);
      expect(mockChain.eq).toHaveBeenCalledWith('app_type', 'date-formatter');
      expect(result).toEqual(expectedInstallation);
    });

    it('should return null when installation not found', async () => {
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } })
      };
      mockSupabaseAdmin.from.mockReturnValue(mockChain as any);

      const result = await findInstallationByHubIdAndApp(99999999, 'date-formatter');

      expect(result).toBeNull();
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
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: updatedRecord, error: null })
      };
      const updateMockChain = {
        update: jest.fn().mockReturnValue(mockChain)
      };
      mockSupabaseAdmin.from.mockReturnValue(updateMockChain as any);

      const result = await updateInstallationTokensForApp(12345678, 'date-formatter', tokenUpdateData);

      expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('hubspot_installations');
      expect(result.accessToken).toBe('new-access-token');
    });
  });

  describe('deleteInstallation', () => {
    it('should delete installation successfully', async () => {
      const mockChain = {
        eq: jest.fn().mockResolvedValue({ data: null, error: null })
      };
      const deleteMockChain = {
        delete: jest.fn().mockReturnValue(mockChain)
      };
      mockSupabaseAdmin.from.mockReturnValue(deleteMockChain as any);

      await deleteInstallation(12345678);

      expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('hubspot_installations');
      expect(mockChain.eq).toHaveBeenCalledWith('hub_id', 12345678);
    });
  });

  describe('deleteInstallationByApp', () => {
    it('should delete installation by app type', async () => {
      const mockChain = {
        eq: jest.fn().mockReturnThis()
      };
      // Set up the final return value for the last eq call
      mockChain.eq.mockReturnValueOnce(mockChain).mockReturnValueOnce({ error: null });
      
      const deleteMockChain = {
        delete: jest.fn().mockReturnValue(mockChain)
      };
      mockSupabaseAdmin.from.mockReturnValue(deleteMockChain as any);

      await deleteInstallationByApp(12345678, 'date-formatter');

      expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('hubspot_installations');
      expect(mockChain.eq).toHaveBeenCalledWith('hub_id', 12345678);
      expect(mockChain.eq).toHaveBeenCalledWith('app_type', 'date-formatter');
    });
  });
});