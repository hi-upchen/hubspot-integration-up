/**
 * @jest-environment node
 */

// Mock Supabase before imports
jest.mock('@/lib/database/supabase', () => ({
  supabaseAdmin: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn()
        }))
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
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

// Mock Date for consistent timestamps
const mockDate = new Date('2025-01-26T10:30:00Z');
jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
Date.now = jest.fn(() => mockDate.getTime());

import {
  getPortalInfoRecord,
  createPortalInfoRecord,
  updatePortalInfoRecord,
  deletePortalInfoRecord,
  type PortalInfoRecord
} from '@/lib/database/portal-info';
import { supabaseAdmin } from '@/lib/database/supabase';

const mockSupabaseAdmin = supabaseAdmin as jest.Mocked<typeof supabaseAdmin>;

describe('Portal Info Database Operations', () => {
  const mockPortalInfoRecord: PortalInfoRecord = {
    portal_id: 12345678,
    name: 'Test Portal',
    domain: 'test-portal.hubspot.com',
    user_email: 'user@example.com',
    user_name: 'John Doe',
    organization: 'Test Organization',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-26T10:30:00Z'
  };

  const mockCreateData = {
    portal_id: 12345678,
    name: 'Test Portal',
    domain: 'test-portal.hubspot.com',
    user_email: 'user@example.com',
    user_name: 'John Doe',
    organization: 'Test Organization'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getPortalInfoRecord', () => {
    it('should get portal info record successfully', async () => {
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockPortalInfoRecord, error: null })
      };
      mockSupabaseAdmin.from.mockReturnValue(mockChain as any);

      const result = await getPortalInfoRecord(12345678);

      expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('portal_info');
      expect(mockChain.select).toHaveBeenCalledWith('*');
      expect(mockChain.eq).toHaveBeenCalledWith('portal_id', 12345678);
      expect(mockChain.single).toHaveBeenCalled();
      expect(result).toEqual(mockPortalInfoRecord);
    });

    it('should return null when portal not found (PGRST116)', async () => {
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ 
          data: null, 
          error: { code: 'PGRST116', message: 'No rows found' } 
        })
      };
      mockSupabaseAdmin.from.mockReturnValue(mockChain as any);

      const result = await getPortalInfoRecord(99999999);

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
      mockSupabaseAdmin.from.mockReturnValue(mockChain as any);

      await expect(getPortalInfoRecord(12345678))
        .rejects.toEqual({ code: 'PGRST500', message: 'Internal server error' });
    });

    it('should handle very large portal IDs', async () => {
      const largePortalId = 999999999999999;
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockPortalInfoRecord, error: null })
      };
      mockSupabaseAdmin.from.mockReturnValue(mockChain as any);

      await getPortalInfoRecord(largePortalId);

      expect(mockChain.eq).toHaveBeenCalledWith('portal_id', largePortalId);
    });

    it('should handle network timeout errors', async () => {
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockRejectedValue(new Error('Network timeout'))
      };
      mockSupabaseAdmin.from.mockReturnValue(mockChain as any);

      await expect(getPortalInfoRecord(12345678))
        .rejects.toThrow('Network timeout');
    });
  });

  describe('createPortalInfoRecord', () => {
    it('should create portal info record successfully', async () => {
      const mockChain = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockPortalInfoRecord, error: null })
      };
      mockSupabaseAdmin.from.mockReturnValue(mockChain as any);

      const result = await createPortalInfoRecord(mockCreateData);

      expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('portal_info');
      expect(mockChain.insert).toHaveBeenCalledWith(mockCreateData);
      expect(mockChain.select).toHaveBeenCalled();
      expect(mockChain.single).toHaveBeenCalled();
      expect(result).toEqual(mockPortalInfoRecord);
    });

    it('should create record with minimal required fields', async () => {
      const minimalData = {
        portal_id: 12345678,
        name: 'Minimal Portal',
        domain: 'minimal.hubspot.com',
        user_email: null,
        user_name: null,
        organization: null
      };

      const expectedRecord = {
        ...minimalData,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-26T10:30:00Z'
      };

      const mockChain = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: expectedRecord, error: null })
      };
      mockSupabaseAdmin.from.mockReturnValue(mockChain as any);

      const result = await createPortalInfoRecord(minimalData);

      expect(mockChain.insert).toHaveBeenCalledWith(minimalData);
      expect(result).toEqual(expectedRecord);
    });

    it('should handle duplicate portal ID error', async () => {
      const mockChain = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ 
          data: null, 
          error: { 
            code: '23505', 
            message: 'duplicate key value violates unique constraint "portal_info_pkey"' 
          } 
        })
      };
      mockSupabaseAdmin.from.mockReturnValue(mockChain as any);

      await expect(createPortalInfoRecord(mockCreateData))
        .rejects.toEqual(expect.objectContaining({
          code: '23505',
          message: expect.stringContaining('duplicate key')
        }));
    });

    it('should handle required field validation errors', async () => {
      const mockChain = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ 
          data: null, 
          error: { 
            code: '23502', 
            message: 'null value in column "name" violates not-null constraint' 
          } 
        })
      };
      mockSupabaseAdmin.from.mockReturnValue(mockChain as any);

      const invalidData = { ...mockCreateData, name: null as any };

      await expect(createPortalInfoRecord(invalidData))
        .rejects.toEqual(expect.objectContaining({
          code: '23502'
        }));
    });

    it('should handle very long string fields', async () => {
      const longString = 'x'.repeat(10000);
      const dataWithLongStrings = {
        ...mockCreateData,
        name: longString,
        domain: longString,
        organization: longString
      };

      const mockChain = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockPortalInfoRecord, error: null })
      };
      mockSupabaseAdmin.from.mockReturnValue(mockChain as any);

      await createPortalInfoRecord(dataWithLongStrings);

      expect(mockChain.insert).toHaveBeenCalledWith(dataWithLongStrings);
    });

    it('should handle special characters in fields', async () => {
      const dataWithSpecialChars = {
        ...mockCreateData,
        name: "Portal with 'quotes' and \"double quotes\"",
        user_email: 'test+special@example.com',
        organization: 'Org & Co. (2025)'
      };

      const mockChain = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockPortalInfoRecord, error: null })
      };
      mockSupabaseAdmin.from.mockReturnValue(mockChain as any);

      await createPortalInfoRecord(dataWithSpecialChars);

      expect(mockChain.insert).toHaveBeenCalledWith(dataWithSpecialChars);
    });
  });

  describe('updatePortalInfoRecord', () => {
    it('should update portal info record successfully', async () => {
      const updates = {
        user_name: 'Jane Smith',
        organization: 'Updated Organization'
      };

      const updatedRecord = {
        ...mockPortalInfoRecord,
        ...updates,
        updated_at: '2025-01-26T10:30:00.000Z'
      };

      const mockChain = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: updatedRecord, error: null })
      };
      mockSupabaseAdmin.from.mockReturnValue(mockChain as any);

      const result = await updatePortalInfoRecord(12345678, updates);

      expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('portal_info');
      expect(mockChain.update).toHaveBeenCalledWith({
        ...updates,
        updated_at: '2025-01-26T10:30:00.000Z'
      });
      expect(mockChain.eq).toHaveBeenCalledWith('portal_id', 12345678);
      expect(result).toEqual(updatedRecord);
    });

    it('should update single field', async () => {
      const updates = { user_email: 'newemail@example.com' };

      const mockChain = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockPortalInfoRecord, error: null })
      };
      mockSupabaseAdmin.from.mockReturnValue(mockChain as any);

      await updatePortalInfoRecord(12345678, updates);

      expect(mockChain.update).toHaveBeenCalledWith({
        user_email: 'newemail@example.com',
        updated_at: '2025-01-26T10:30:00.000Z'
      });
    });

    it('should handle updating with null values', async () => {
      const updates = {
        user_name: null,
        organization: null
      };

      const mockChain = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockPortalInfoRecord, error: null })
      };
      mockSupabaseAdmin.from.mockReturnValue(mockChain as any);

      await updatePortalInfoRecord(12345678, updates);

      expect(mockChain.update).toHaveBeenCalledWith({
        user_name: null,
        organization: null,
        updated_at: '2025-01-26T10:30:00.000Z'
      });
    });

    it('should automatically set updated_at timestamp', async () => {
      const updates = { user_name: 'Test User' };

      const mockChain = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockPortalInfoRecord, error: null })
      };
      mockSupabaseAdmin.from.mockReturnValue(mockChain as any);

      await updatePortalInfoRecord(12345678, updates);

      expect(mockChain.update).toHaveBeenCalledWith({
        user_name: 'Test User',
        updated_at: '2025-01-26T10:30:00.000Z'
      });
    });

    it('should handle portal not found error', async () => {
      const mockChain = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ 
          data: null, 
          error: { code: 'PGRST116', message: 'No rows found' } 
        })
      };
      mockSupabaseAdmin.from.mockReturnValue(mockChain as any);

      await expect(updatePortalInfoRecord(99999999, { user_name: 'Test' }))
        .rejects.toEqual(expect.objectContaining({
          code: 'PGRST116'
        }));
    });

    it('should handle constraint violation errors', async () => {
      const mockChain = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ 
          data: null, 
          error: { 
            code: '23502', 
            message: 'null value in column "name" violates not-null constraint' 
          } 
        })
      };
      mockSupabaseAdmin.from.mockReturnValue(mockChain as any);

      await expect(updatePortalInfoRecord(12345678, { name: null as any }))
        .rejects.toEqual(expect.objectContaining({
          code: '23502'
        }));
    });

    it('should handle empty updates object', async () => {
      const mockChain = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockPortalInfoRecord, error: null })
      };
      mockSupabaseAdmin.from.mockReturnValue(mockChain as any);

      await updatePortalInfoRecord(12345678, {});

      expect(mockChain.update).toHaveBeenCalledWith({
        updated_at: '2025-01-26T10:30:00.000Z'
      });
    });

    it('should handle concurrent updates', async () => {
      const mockChain = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ 
          data: null, 
          error: { 
            code: '40001', 
            message: 'could not serialize access due to concurrent update' 
          } 
        })
      };
      mockSupabaseAdmin.from.mockReturnValue(mockChain as any);

      await expect(updatePortalInfoRecord(12345678, { user_name: 'Test' }))
        .rejects.toEqual(expect.objectContaining({
          code: '40001'
        }));
    });
  });

  describe('deletePortalInfoRecord', () => {
    it('should delete portal info record successfully', async () => {
      const mockChain = {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: null })
      };
      mockSupabaseAdmin.from.mockReturnValue(mockChain as any);

      await deletePortalInfoRecord(12345678);

      expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('portal_info');
      expect(mockChain.delete).toHaveBeenCalled();
      expect(mockChain.eq).toHaveBeenCalledWith('portal_id', 12345678);
    });

    it('should handle deletion of non-existent portal', async () => {
      const mockChain = {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: null })
      };
      mockSupabaseAdmin.from.mockReturnValue(mockChain as any);

      // Should not throw even if portal doesn't exist
      await expect(deletePortalInfoRecord(99999999)).resolves.toBeUndefined();
    });

    it('should handle database errors during deletion', async () => {
      const mockChain = {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ 
          error: { 
            code: '23503', 
            message: 'update or delete on table "portal_info" violates foreign key constraint' 
          } 
        })
      };
      mockSupabaseAdmin.from.mockReturnValue(mockChain as any);

      await expect(deletePortalInfoRecord(12345678))
        .rejects.toEqual(expect.objectContaining({
          code: '23503'
        }));
    });

    it('should handle permission errors', async () => {
      const mockChain = {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ 
          error: { 
            code: '42501', 
            message: 'permission denied for table portal_info' 
          } 
        })
      };
      mockSupabaseAdmin.from.mockReturnValue(mockChain as any);

      await expect(deletePortalInfoRecord(12345678))
        .rejects.toEqual(expect.objectContaining({
          code: '42501'
        }));
    });

    it('should handle network errors', async () => {
      const mockChain = {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockRejectedValue(new Error('Network error'))
      };
      mockSupabaseAdmin.from.mockReturnValue(mockChain as any);

      await expect(deletePortalInfoRecord(12345678))
        .rejects.toThrow('Network error');
    });

    it('should handle very large portal IDs', async () => {
      const largePortalId = 999999999999999;
      const mockChain = {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: null })
      };
      mockSupabaseAdmin.from.mockReturnValue(mockChain as any);

      await deletePortalInfoRecord(largePortalId);

      expect(mockChain.eq).toHaveBeenCalledWith('portal_id', largePortalId);
    });
  });

  describe('Edge cases and boundary conditions', () => {
    it('should handle malformed database responses', async () => {
      const malformedResponse = {
        portal_id: 'not-a-number',
        name: null,
        domain: undefined,
        created_at: 'invalid-date'
      };

      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: malformedResponse, error: null })
      };
      mockSupabaseAdmin.from.mockReturnValue(mockChain as any);

      const result = await getPortalInfoRecord(12345678);

      // Should return the malformed data as-is (let caller handle validation)
      expect(result).toEqual(malformedResponse);
    });

    it('should handle unicode characters in text fields', async () => {
      const unicodeData = {
        portal_id: 12345678,
        name: '测试门户 Portal 🚀',
        domain: 'test-portal.hubspot.com',
        user_email: 'test@测试.com',
        user_name: 'João da Silva',
        organization: 'Société Générale & Co. ©️'
      };

      const mockChain = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockPortalInfoRecord, error: null })
      };
      mockSupabaseAdmin.from.mockReturnValue(mockChain as any);

      await createPortalInfoRecord(unicodeData);

      expect(mockChain.insert).toHaveBeenCalledWith(unicodeData);
    });

    it('should handle SQL injection attempts safely', async () => {
      const maliciousData = {
        portal_id: 12345678,
        name: "'; DROP TABLE portal_info; --",
        domain: '"><script>alert("xss")</script>',
        user_email: "admin'; UPDATE users SET password='hacked' WHERE 1=1; --",
        user_name: null,
        organization: null
      };

      const mockChain = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockPortalInfoRecord, error: null })
      };
      mockSupabaseAdmin.from.mockReturnValue(mockChain as any);

      // Should handle safely (Supabase handles parameterized queries)
      await createPortalInfoRecord(maliciousData);

      expect(mockChain.insert).toHaveBeenCalledWith(maliciousData);
    });

    it('should handle extremely long email addresses', async () => {
      const veryLongEmail = 'a'.repeat(100) + '@' + 'b'.repeat(100) + '.com';
      const updates = { user_email: veryLongEmail };

      const mockChain = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockPortalInfoRecord, error: null })
      };
      mockSupabaseAdmin.from.mockReturnValue(mockChain as any);

      await updatePortalInfoRecord(12345678, updates);

      expect(mockChain.update).toHaveBeenCalledWith({
        user_email: veryLongEmail,
        updated_at: '2025-01-26T10:30:00.000Z'
      });
    });

    it('should handle zero portal ID', async () => {
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } })
      };
      mockSupabaseAdmin.from.mockReturnValue(mockChain as any);

      const result = await getPortalInfoRecord(0);

      expect(mockChain.eq).toHaveBeenCalledWith('portal_id', 0);
      expect(result).toBeNull();
    });

    it('should handle negative portal ID', async () => {
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } })
      };
      mockSupabaseAdmin.from.mockReturnValue(mockChain as any);

      const result = await getPortalInfoRecord(-123);

      expect(mockChain.eq).toHaveBeenCalledWith('portal_id', -123);
      expect(result).toBeNull();
    });
  });
});