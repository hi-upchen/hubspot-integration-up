/**
 * Integration tests for the date formatter webhook business logic
 * Tests the core functionality that HubSpot workflows will use
 */

import { processDateFormatterWebhook } from '@/lib/services/webhook-handler'
import type { WorkflowRequest } from '@/lib/types'

// Mock the HubSpot client to avoid ES module dependencies
jest.mock('@/lib/hubspot/client', () => ({
  hubspotClientManager: {
    getClient: jest.fn().mockResolvedValue({
      // Mock HubSpot client
    })
  }
}))

describe('Date Formatter Webhook Integration', () => {
  describe('processDateFormatterWebhook', () => {
    test('should process valid HubSpot webhook payload', async () => {
      const mockPayload: WorkflowRequest = {
        callbackId: 'test-callback-123',
        origin: {
          portalId: 243404981,
          actionDefinitionId: 218240898
        },
        inputFields: {
          sourceDateField: '7/25/25',
          sourceFormat: 'US_FORMAT',
          targetFormat: 'TAIWAN_STANDARD'
        }
      }

      const result = await processDateFormatterWebhook(mockPayload)

      expect(result.success).toBe(true)
      expect(result.status).toBe(200)
      expect(result.data).toHaveProperty('outputFields')
      
      const data = result.data as any
      expect(data.outputFields).toHaveProperty('formattedDate')
      expect(data.outputFields.formattedDate).toBe('2025年07月25日')
    })

    test('should handle custom format requests', async () => {
      const mockPayload: WorkflowRequest = {
        callbackId: 'test-callback-456',
        origin: {
          portalId: 243404981,
          actionDefinitionId: 218240898
        },
        inputFields: {
          sourceDateField: '12/25/2025',
          sourceFormat: 'US_FORMAT',
          targetFormat: 'CUSTOM',
          customTargetFormat: 'DD-MM-YYYY'
        }
      }

      const result = await processDateFormatterWebhook(mockPayload)

      expect(result.success).toBe(true)
      expect(result.status).toBe(200)
      
      const data = result.data as any
      expect(data.outputFields.formattedDate).toBe('25-12-2025')
    })

    test('should handle auto-detection format', async () => {
      const mockPayload: WorkflowRequest = {
        callbackId: 'test-callback-789',
        origin: {
          portalId: 243404981,
          actionDefinitionId: 218240898
        },
        inputFields: {
          sourceDateField: '2025-07-25',
          sourceFormat: 'AUTO',
          targetFormat: 'US_WRITTEN'
        }
      }

      const result = await processDateFormatterWebhook(mockPayload)

      expect(result.success).toBe(true)
      expect(result.status).toBe(200)
      
      const data = result.data as any
      expect(data.outputFields.formattedDate).toBe('July 25, 2025')
    })

    test('should return error for invalid date format', async () => {
      const mockPayload: WorkflowRequest = {
        callbackId: 'test-callback-error',
        origin: {
          portalId: 243404981,
          actionDefinitionId: 218240898
        },
        inputFields: {
          sourceDateField: 'invalid-date',
          sourceFormat: 'US_FORMAT',
          targetFormat: 'ISO_STANDARD'
        }
      }

      const result = await processDateFormatterWebhook(mockPayload)

      expect(result.success).toBe(true) // Still returns success for workflow compatibility
      expect(result.status).toBe(200)
      
      const data = result.data as any
      expect(data.outputFields).toHaveProperty('error')
      expect(data.outputFields.error).toContain('Invalid')
    })

    test('should handle missing required fields gracefully', async () => {
      const mockPayload: WorkflowRequest = {
        callbackId: 'test-callback-missing',
        origin: {
          portalId: 243404981,
          actionDefinitionId: 218240898
        },
        inputFields: {
          // Missing sourceDateField
          sourceFormat: 'US_FORMAT',
          targetFormat: 'ISO_STANDARD'
        } as any
      }

      const result = await processDateFormatterWebhook(mockPayload)

      expect(result.success).toBe(false)
      expect(result.status).toBe(400)
    })

    test('should handle missing portal ID', async () => {
      const mockPayload: WorkflowRequest = {
        callbackId: 'test-no-portal',
        origin: {
          // Missing portalId
          actionDefinitionId: 218240898
        } as any,
        inputFields: {
          sourceDateField: '07/25/2025',
          sourceFormat: 'US_FORMAT',
          targetFormat: 'ISO_STANDARD'
        }
      }

      const result = await processDateFormatterWebhook(mockPayload)

      expect(result.success).toBe(false)
      expect(result.status).toBe(400)
      
      const data = result.data as any
      expect(data.error).toContain('Portal ID is required')
    })
  })

  describe('Real-world HubSpot scenarios', () => {
    test('should handle typical HubSpot contact property date', async () => {
      const mockPayload: WorkflowRequest = {
        callbackId: 'hubspot-contact-date',
        origin: {
          portalId: 243404981,
          actionDefinitionId: 218240898
        },
        inputFields: {
          sourceDateField: '1/15/24', // Typical HubSpot format
          sourceFormat: 'AUTO',
          targetFormat: 'KOREA_STANDARD'
        }
      }

      const result = await processDateFormatterWebhook(mockPayload)

      expect(result.success).toBe(true)
      expect(result.status).toBe(200)
      
      const data = result.data as any
      expect(data.outputFields.formattedDate).toBe('2024년 01월 15일')
    })

    test('should handle HubSpot deal close date', async () => {
      const mockPayload: WorkflowRequest = {
        callbackId: 'hubspot-deal-close',
        origin: {
          portalId: 243404981,
          actionDefinitionId: 218240898
        },
        inputFields: {
          sourceDateField: '12/31/99', // Y2K boundary
          sourceFormat: 'US_FORMAT',
          targetFormat: 'EU_WRITTEN'
        }
      }

      const result = await processDateFormatterWebhook(mockPayload)

      expect(result.success).toBe(true)
      expect(result.status).toBe(200)
      
      const data = result.data as any
      expect(data.outputFields.formattedDate).toBe('31 December 1999')
    })

    test('should handle HubSpot timestamp format', async () => {
      const mockPayload: WorkflowRequest = {
        callbackId: 'hubspot-timestamp',
        origin: {
          portalId: 243404981,
          actionDefinitionId: 218240898
        },
        inputFields: {
          sourceDateField: '2025-07-25T10:30:00.000Z',
          sourceFormat: 'HUBSPOT_DATETIME',
          targetFormat: 'CUSTOM',
          customTargetFormat: 'MMMM D, YYYY'
        }
      }

      const result = await processDateFormatterWebhook(mockPayload)

      expect(result.success).toBe(true)
      expect(result.status).toBe(200)
      
      const data = result.data as any
      expect(data.outputFields.formattedDate).toBe('July 25, 2025')
    })
  })

  describe('Error handling and validation', () => {
    test('should validate portal ID presence', async () => {
      const mockPayload: WorkflowRequest = {
        callbackId: 'test-no-portal',
        origin: {
          // Missing portalId
          actionDefinitionId: 218240898
        } as any,
        inputFields: {
          sourceDateField: '07/25/2025',
          sourceFormat: 'US_FORMAT',
          targetFormat: 'ISO_STANDARD'
        }
      }

      const result = await processDateFormatterWebhook(mockPayload)

      expect(result.success).toBe(false)
      expect(result.status).toBe(400)
      
      const data = result.data as any
      expect(data.error).toContain('Portal ID is required')
    })

    test('should handle edge case date values', async () => {
      const edgeCases = [
        {
          date: '02/29/20', // Leap year
          expected: '2020년 02월 29일'
        },
        {
          date: '01/01/00', // Y2K
          expected: '2000년 01월 01일'
        },
        {
          date: '12/31/49', // Boundary year
          expected: '2049년 12월 31일'
        }
      ]

      for (const testCase of edgeCases) {
        const mockPayload: WorkflowRequest = {
          callbackId: `edge-case-${testCase.date}`,
          origin: {
            portalId: 243404981,
            actionDefinitionId: 218240898
          },
          inputFields: {
            sourceDateField: testCase.date,
            sourceFormat: 'US_FORMAT',
            targetFormat: 'KOREA_STANDARD'
          }
        }

        const result = await processDateFormatterWebhook(mockPayload)

        expect(result.success).toBe(true)
        expect(result.status).toBe(200)
        
        const data = result.data as any
        expect(data.outputFields.formattedDate).toBe(testCase.expected)
      }
    })
  })
})