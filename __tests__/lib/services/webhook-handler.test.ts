/**
 * @jest-environment node
 */

// Mock external dependencies BEFORE imports
jest.mock('@/lib/services/date-formatter');
jest.mock('@/lib/hubspot/client');
jest.mock('@/lib/supabase/client');
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

import { processDateFormatterWebhook } from '@/lib/services/webhook-handler';
import { formatDate } from '@/lib/services/date-formatter';
import { hubspotClientManager } from '@/lib/hubspot/client';
import type { WorkflowRequest } from '@/lib/types';

const mockFormatDate = formatDate as jest.MockedFunction<typeof formatDate>;
const mockHubspotClientManager = hubspotClientManager as jest.Mocked<typeof hubspotClientManager>;

describe('webhook-handler.ts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementations
    mockFormatDate.mockReturnValue('2025-01-26');
    mockHubspotClientManager.getClient.mockResolvedValue({} as any);
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
        expect(mockHubspotClientManager.getClient).toHaveBeenCalledWith(999999999999);
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

  describe('Authentication Failure Scenarios', () => {
    test('should return 401 error when HubSpot client authentication fails', async () => {
      mockHubspotClientManager.getClient.mockRejectedValue(new Error('Authentication failed'));
      const request = createValidWorkflowRequest();

      const result = await processDateFormatterWebhook(request);

      expect(result).toEqual({
        success: false,
        status: 401,
        data: {
          error: 'Portal not authorized or installation not found',
          details: 'Please reinstall the app for this HubSpot portal'
        }
      });
    });

    test('should return 401 error when HubSpot client throws any error', async () => {
      mockHubspotClientManager.getClient.mockRejectedValue(new Error('Token refresh failed'));
      const request = createValidWorkflowRequest();

      const result = await processDateFormatterWebhook(request);

      expect(result).toEqual({
        success: false,
        status: 401,
        data: {
          error: 'Portal not authorized or installation not found',
          details: 'Please reinstall the app for this HubSpot portal'
        }
      });
    });

    test('should return 401 error when HubSpot client throws non-Error object', async () => {
      mockHubspotClientManager.getClient.mockRejectedValue('String error');
      const request = createValidWorkflowRequest();

      const result = await processDateFormatterWebhook(request);

      expect(result).toEqual({
        success: false,
        status: 401,
        data: {
          error: 'Portal not authorized or installation not found',
          details: 'Please reinstall the app for this HubSpot portal'
        }
      });
    });

    test('should return 401 error when HubSpot client throws null', async () => {
      mockHubspotClientManager.getClient.mockRejectedValue(null);
      const request = createValidWorkflowRequest();

      const result = await processDateFormatterWebhook(request);

      expect(result).toEqual({
        success: false,
        status: 401,
        data: {
          error: 'Portal not authorized or installation not found',
          details: 'Please reinstall the app for this HubSpot portal'
        }
      });
    });

    test('should call getClient with correct portal ID', async () => {
      const request = createValidWorkflowRequest({
        origin: { ...createValidWorkflowRequest().origin!, portalId: 555666777 }
      });

      await processDateFormatterWebhook(request);

      expect(mockHubspotClientManager.getClient).toHaveBeenCalledWith(555666777);
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

      // Test 401 (auth error)
      mockHubspotClientManager.getClient.mockRejectedValue(new Error('Auth failed'));
      const authRequest = createValidWorkflowRequest();
      result = await processDateFormatterWebhook(authRequest);
      expect(result.status).toBe(401);

      // Test 200 (success)
      mockHubspotClientManager.getClient.mockResolvedValue({} as any);
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

    test('should call hubspotClientManager.getClient exactly once per request', async () => {
      const request = createValidWorkflowRequest();

      await processDateFormatterWebhook(request);

      expect(mockHubspotClientManager.getClient).toHaveBeenCalledTimes(1);
    });

    test('should not call formatDate if authentication fails', async () => {
      mockHubspotClientManager.getClient.mockRejectedValue(new Error('Auth failed'));
      const request = createValidWorkflowRequest();

      await processDateFormatterWebhook(request);

      expect(mockFormatDate).not.toHaveBeenCalled();
    });

    test('should not call getClient if validation fails', async () => {
      const request = createValidWorkflowRequest({
        origin: { ...createValidWorkflowRequest().origin!, portalId: null as any }
      });

      await processDateFormatterWebhook(request);

      expect(mockHubspotClientManager.getClient).not.toHaveBeenCalled();
    });
  });

  describe('Global Error Handling', () => {
    test('should handle authentication errors as 401 responses', async () => {
      // Mock an error in the authentication step
      mockHubspotClientManager.getClient.mockRejectedValue(new Error('Unexpected system error'));
      
      const request = createValidWorkflowRequest();
      const result = await processDateFormatterWebhook(request);

      expect(result).toEqual({
        success: false,
        status: 401,
        data: {
          error: 'Portal not authorized or installation not found',
          details: 'Please reinstall the app for this HubSpot portal'
        }
      });
    });

    test('should handle all authentication errors consistently', async () => {
      // Different types of auth errors should all return 401
      const authErrors = [
        new Error('Token expired'),
        new Error('Invalid client'),
        'String error',
        null,
        undefined
      ];

      for (const error of authErrors) {
        mockHubspotClientManager.getClient.mockRejectedValue(error);
        
        const request = createValidWorkflowRequest();
        const result = await processDateFormatterWebhook(request);

        expect(result.success).toBe(false);
        expect(result.status).toBe(401);
        expect(result.data).toHaveProperty('error', 'Portal not authorized or installation not found');
      }
    });
  });
});