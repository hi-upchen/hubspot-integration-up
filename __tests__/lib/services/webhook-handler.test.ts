/**
 * @jest-environment node
 */

// Mock external dependencies BEFORE imports
jest.mock('@/lib/features/date-formatter/services/date-formatter');
jest.mock('@/lib/database/supabase');
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

import { processDateFormatterWebhook } from '@/lib/features/date-formatter/services/webhook-handler';
import { formatDate } from '@/lib/features/date-formatter/services/date-formatter';
import type { WorkflowRequest } from '@/lib/types';

const mockFormatDate = formatDate as jest.MockedFunction<typeof formatDate>;

describe('webhook-handler.ts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementations
    mockFormatDate.mockReturnValue('2025-01-26');
  });

  // Helper function to create valid workflow requests
  function createValidWorkflowRequest(overrides: Partial<WorkflowRequest> = {}): WorkflowRequest {
    return {
      callbackId: 'test-callback-123',
      origin: {
        portalId: 12345678,
        actionDefinitionId: 987654321
      },
      inputFields: {
        sourceDateField: '01/26/2025',
        sourceFormat: 'US_STANDARD',
        targetFormat: 'ISO_DATE',
        customTargetFormat: undefined
      },
      ...overrides
    };
  }

  describe('Input Validation Edge Cases', () => {
    describe('Portal ID Validation', () => {
      test('should return 400 error when portalId is null', async () => {
        const request = createValidWorkflowRequest({
          origin: { ...createValidWorkflowRequest().origin!, portalId: null as any }
        });

        const result = await processDateFormatterWebhook(request);

        expect(result).toEqual({
          success: false,
          status: 400,
          data: { error: 'Portal ID is required' }
        });
      });

      test('should return 400 error when portalId is undefined', async () => {
        const request = createValidWorkflowRequest({
          origin: { ...createValidWorkflowRequest().origin!, portalId: undefined as any }
        });

        const result = await processDateFormatterWebhook(request);

        expect(result).toEqual({
          success: false,
          status: 400,
          data: { error: 'Portal ID is required' }
        });
      });

      test('should return 400 error when portalId is 0', async () => {
        const request = createValidWorkflowRequest({
          origin: { ...createValidWorkflowRequest().origin!, portalId: 0 }
        });

        const result = await processDateFormatterWebhook(request);

        expect(result).toEqual({
          success: false,
          status: 400,
          data: { error: 'Portal ID is required' }
        });
      });

      test('should return 400 error when origin is missing', async () => {
        const request = createValidWorkflowRequest({
          origin: undefined as any
        });

        const result = await processDateFormatterWebhook(request);

        expect(result).toEqual({
          success: false,
          status: 400,
          data: { error: 'Portal ID is required' }
        });
      });

      test('should accept large portal IDs', async () => {
        const request = createValidWorkflowRequest({
          origin: { ...createValidWorkflowRequest().origin!, portalId: 999999999999 }
        });

        const result = await processDateFormatterWebhook(request);

        expect(result.success).toBe(true);
        expect(result.status).toBe(200);
      });
    });

    describe('Input Fields Validation', () => {
      test('should return 400 error when inputFields is null', async () => {
        const request = createValidWorkflowRequest({
          inputFields: null as any
        });

        const result = await processDateFormatterWebhook(request);

        expect(result).toEqual({
          success: false,
          status: 400,
          data: { error: 'Source date field is required' }
        });
      });

      test('should return 400 error when inputFields is undefined', async () => {
        const request = createValidWorkflowRequest({
          inputFields: undefined as any
        });

        const result = await processDateFormatterWebhook(request);

        expect(result).toEqual({
          success: false,
          status: 400,
          data: { error: 'Source date field is required' }
        });
      });

      test('should return 400 error when sourceDateField is missing', async () => {
        const request = createValidWorkflowRequest({
          inputFields: {
            sourceFormat: 'US_STANDARD',
            targetFormat: 'ISO_DATE'
          } as any
        });

        const result = await processDateFormatterWebhook(request);

        expect(result).toEqual({
          success: false,
          status: 400,
          data: { error: 'Source date field is required' }
        });
      });

      test('should return 400 error when sourceFormat is missing', async () => {
        const request = createValidWorkflowRequest({
          inputFields: {
            sourceDateField: '01/26/2025',
            targetFormat: 'ISO_DATE'
          } as any
        });

        const result = await processDateFormatterWebhook(request);

        expect(result).toEqual({
          success: false,
          status: 400,
          data: { error: 'Source format is required' }
        });
      });

      test('should return 400 error when targetFormat is missing', async () => {
        const request = createValidWorkflowRequest({
          inputFields: {
            sourceDateField: '01/26/2025',
            sourceFormat: 'US_STANDARD'
          } as any
        });

        const result = await processDateFormatterWebhook(request);

        expect(result).toEqual({
          success: false,
          status: 400,
          data: { error: 'Target format is required' }
        });
      });
    });

    describe('Custom Format Validation', () => {
      test('should return 400 error when targetFormat is CUSTOM but customTargetFormat is missing', async () => {
        const request = createValidWorkflowRequest({
          inputFields: {
            ...createValidWorkflowRequest().inputFields,
            targetFormat: 'CUSTOM',
            customTargetFormat: undefined
          }
        });

        const result = await processDateFormatterWebhook(request);

        expect(result).toEqual({
          success: false,
          status: 400,
          data: { error: 'Custom target format is required when target format is CUSTOM' }
        });
      });

      test('should return 400 error when targetFormat is CUSTOM but customTargetFormat is null', async () => {
        const request = createValidWorkflowRequest({
          inputFields: {
            ...createValidWorkflowRequest().inputFields,
            targetFormat: 'CUSTOM',
            customTargetFormat: null as any
          }
        });

        const result = await processDateFormatterWebhook(request);

        expect(result).toEqual({
          success: false,
          status: 400,
          data: { error: 'Custom target format is required when target format is CUSTOM' }
        });
      });

      test('should return 400 error when targetFormat is CUSTOM but customTargetFormat is empty string', async () => {
        const request = createValidWorkflowRequest({
          inputFields: {
            ...createValidWorkflowRequest().inputFields,
            targetFormat: 'CUSTOM',
            customTargetFormat: ''
          }
        });

        const result = await processDateFormatterWebhook(request);

        expect(result).toEqual({
          success: false,
          status: 400,
          data: { error: 'Custom target format is required when target format is CUSTOM' }
        });
      });

      test('should accept valid custom format when targetFormat is CUSTOM', async () => {
        const request = createValidWorkflowRequest({
          inputFields: {
            ...createValidWorkflowRequest().inputFields,
            targetFormat: 'CUSTOM',
            customTargetFormat: 'YYYY-MM-DD'
          }
        });

        const result = await processDateFormatterWebhook(request);

        expect(result.success).toBe(true);
        expect(mockFormatDate).toHaveBeenCalledWith(
          '01/26/2025',
          'US_STANDARD',
          'CUSTOM',
          'YYYY-MM-DD'
        );
      });
    });
  });

  describe('Empty Date Value Handling', () => {
    test('should treat empty string as missing field (validation error)', async () => {
      const request = createValidWorkflowRequest({
        inputFields: {
          ...createValidWorkflowRequest().inputFields,
          sourceDateField: ''
        }
      });

      const result = await processDateFormatterWebhook(request);

      expect(result).toEqual({
        success: false,
        status: 400,
        data: { error: 'Source date field is required' }
      });
      
      // Should not call formatDate for missing values
      expect(mockFormatDate).not.toHaveBeenCalled();
    });

    test('should handle whitespace-only date gracefully', async () => {
      const request = createValidWorkflowRequest({
        inputFields: {
          ...createValidWorkflowRequest().inputFields,
          sourceDateField: '   \t\n   '
        }
      });

      const result = await processDateFormatterWebhook(request);

      expect(result).toEqual({
        success: true,
        status: 200,
        data: {
          outputFields: {
            formattedDate: '',
            originalDate: '   \t\n   ',
            format: 'ISO_DATE',
            error: 'Source date field is empty'
          }
        }
      });
      
      expect(mockFormatDate).not.toHaveBeenCalled();
    });

    test('should treat null date value as missing field (validation error)', async () => {
      const request = createValidWorkflowRequest({
        inputFields: {
          ...createValidWorkflowRequest().inputFields,
          sourceDateField: null as any
        }
      });

      const result = await processDateFormatterWebhook(request);

      expect(result).toEqual({
        success: false,
        status: 400,
        data: { error: 'Source date field is required' }
      });
    });
  });

  describe('Date Formatting Error Handling', () => {
    test('should handle Error instances from formatDate', async () => {
      mockFormatDate.mockImplementation(() => {
        throw new Error('Invalid date format');
      });
      const request = createValidWorkflowRequest();

      const result = await processDateFormatterWebhook(request);

      expect(result).toEqual({
        success: true,  // Workflow continues with error in output
        status: 200,
        data: {
          outputFields: {
            formattedDate: '01/26/2025', // Original date preserved
            originalDate: '01/26/2025',
            format: 'ISO_DATE',
            error: 'Invalid date format'
          }
        }
      });
    });

    test('should handle non-Error objects from formatDate', async () => {
      mockFormatDate.mockImplementation(() => {
        throw 'String error thrown';
      });
      const request = createValidWorkflowRequest();

      const result = await processDateFormatterWebhook(request);

      expect(result).toEqual({
        success: true,
        status: 200,
        data: {
          outputFields: {
            formattedDate: '01/26/2025',
            originalDate: '01/26/2025',
            format: 'ISO_DATE',
            error: 'Date formatting failed'
          }
        }
      });
    });

    test('should handle null/undefined thrown from formatDate', async () => {
      mockFormatDate.mockImplementation(() => {
        throw null;
      });
      const request = createValidWorkflowRequest();

      const result = await processDateFormatterWebhook(request);

      expect(result).toEqual({
        success: true,
        status: 200,
        data: {
          outputFields: {
            formattedDate: '01/26/2025',
            originalDate: '01/26/2025',
            format: 'ISO_DATE',
            error: 'Date formatting failed'
          }
        }
      });
    });

    test('should preserve original date when formatting fails', async () => {
      mockFormatDate.mockImplementation(() => {
        throw new Error('Parse error');
      });
      const request = createValidWorkflowRequest({
        inputFields: {
          ...createValidWorkflowRequest().inputFields,
          sourceDateField: 'invalid-date-123'
        }
      });

      const result = await processDateFormatterWebhook(request);

      expect(result.data).toMatchObject({
        outputFields: {
          formattedDate: 'invalid-date-123',
          originalDate: 'invalid-date-123'
        }
      });
    });

    test('should handle custom format errors correctly', async () => {
      mockFormatDate.mockImplementation(() => {
        throw new Error('Invalid custom format: XYZ');
      });
      const request = createValidWorkflowRequest({
        inputFields: {
          ...createValidWorkflowRequest().inputFields,
          targetFormat: 'CUSTOM',
          customTargetFormat: 'INVALID_PATTERN'
        }
      });

      const result = await processDateFormatterWebhook(request);

      expect(result.data).toMatchObject({
        outputFields: {
          format: 'CUSTOM',
          error: 'Invalid custom format: XYZ'
        }
      });
    });
  });

  describe('Response Structure Consistency', () => {
    test('should return consistent success response structure', async () => {
      mockFormatDate.mockReturnValue('2025-01-26');
      const request = createValidWorkflowRequest();

      const result = await processDateFormatterWebhook(request);

      expect(result).toEqual({
        success: true,
        status: 200,
        data: {
          outputFields: {
            formattedDate: '2025-01-26',
            originalDate: '01/26/2025',
            format: 'ISO_DATE'
          }
        }
      });
    });

    test('should include all required WebhookResult properties', async () => {
      const request = createValidWorkflowRequest();

      const result = await processDateFormatterWebhook(request);

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('data');
      expect(typeof result.success).toBe('boolean');
      expect(typeof result.status).toBe('number');
      expect(typeof result.data).toBe('object');
    });

    test('should return consistent error response structure', async () => {
      const request = createValidWorkflowRequest({
        origin: { ...createValidWorkflowRequest().origin!, portalId: null as any }
      });

      const result = await processDateFormatterWebhook(request);

      expect(result).toHaveProperty('success', false);
      expect(result).toHaveProperty('status', 400);
      expect(result).toHaveProperty('data');
      expect(result.data).toHaveProperty('error');
    });

    test('should use proper HTTP status codes', async () => {
      // Test 400 (validation error)
      const badRequest = createValidWorkflowRequest({
        inputFields: { ...createValidWorkflowRequest().inputFields, sourceFormat: undefined as any }
      });
      let result = await processDateFormatterWebhook(badRequest);
      expect(result.status).toBe(400);

      // Test validation error (400)
      const invalidRequest = createValidWorkflowRequest({ inputFields: {} });
      result = await processDateFormatterWebhook(invalidRequest);
      expect(result.status).toBe(400);

      // Test 200 (success)
      const successRequest = createValidWorkflowRequest();
      result = await processDateFormatterWebhook(successRequest);
      expect(result.status).toBe(200);
    });
  });

  describe('Edge Cases & Boundaries', () => {
    test('should handle very long date strings', async () => {
      const longDate = 'A'.repeat(1000);
      const request = createValidWorkflowRequest({
        inputFields: {
          ...createValidWorkflowRequest().inputFields,
          sourceDateField: longDate
        }
      });

      const result = await processDateFormatterWebhook(request);

      expect(mockFormatDate).toHaveBeenCalledWith(longDate, 'US_STANDARD', 'ISO_DATE', undefined);
    });

    test('should handle special characters in dates', async () => {
      const specialDate = '2025/01/26 测试-日期@#$%^&*()';
      const request = createValidWorkflowRequest({
        inputFields: {
          ...createValidWorkflowRequest().inputFields,
          sourceDateField: specialDate
        }
      });

      const result = await processDateFormatterWebhook(request);

      expect(mockFormatDate).toHaveBeenCalledWith(specialDate, 'US_STANDARD', 'ISO_DATE', undefined);
    });

    test('should handle all required parameters to formatDate', async () => {
      const request = createValidWorkflowRequest({
        inputFields: {
          sourceDateField: '2025-01-26',
          sourceFormat: 'ISO_DATE',
          targetFormat: 'CUSTOM',
          customTargetFormat: 'MM/DD/YYYY'
        }
      });

      await processDateFormatterWebhook(request);

      expect(mockFormatDate).toHaveBeenCalledWith(
        '2025-01-26',
        'ISO_DATE',
        'CUSTOM',
        'MM/DD/YYYY'
      );
    });

    test('should handle empty format fields properly', async () => {
      const request = createValidWorkflowRequest({
        inputFields: {
          sourceDateField: '01/26/2025',
          sourceFormat: '',
          targetFormat: 'ISO_DATE'
        } as any
      });

      const result = await processDateFormatterWebhook(request);

      expect(result).toEqual({
        success: false,
        status: 400,
        data: { error: 'Source format is required' }
      });
    });
  });

  describe('Integration Points', () => {
    test('should pass correct parameters to formatDate in typical workflow', async () => {
      const request = createValidWorkflowRequest({
        inputFields: {
          sourceDateField: '12/25/2024',
          sourceFormat: 'US_STANDARD',
          targetFormat: 'UK_STANDARD',
          customTargetFormat: undefined
        }
      });

      await processDateFormatterWebhook(request);

      expect(mockFormatDate).toHaveBeenCalledTimes(1);
      expect(mockFormatDate).toHaveBeenCalledWith(
        '12/25/2024',
        'US_STANDARD',
        'UK_STANDARD',
        undefined
      );
    });

    test('should call formatDate for valid requests', async () => {
      const request = createValidWorkflowRequest();

      await processDateFormatterWebhook(request);

      expect(mockFormatDate).toHaveBeenCalledTimes(1);
    });

    test('should not call formatDate if validation fails', async () => {
      const request = createValidWorkflowRequest({ inputFields: {} });

      await processDateFormatterWebhook(request);

      expect(mockFormatDate).not.toHaveBeenCalled();
    });

    test('should not call formatDate if portal ID is invalid', async () => {
      const request = createValidWorkflowRequest({
        origin: { ...createValidWorkflowRequest().origin!, portalId: null as any }
      });

      await processDateFormatterWebhook(request);

      expect(mockFormatDate).not.toHaveBeenCalled();
    });
  });
});