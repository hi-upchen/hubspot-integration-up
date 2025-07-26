import { formatDate } from './date-formatter';
import { hubspotClientManager } from '@/lib/hubspot/client';
import type { WorkflowRequest, WorkflowResponse, DateFormat } from '@/lib/types';

export interface WebhookResult {
  success: boolean;
  status: number;
  data: WorkflowResponse | { error: string; details?: string };
}

/**
 * Core business logic for processing HubSpot workflow date formatter requests
 * Extracted from API route for better testability and separation of concerns
 */
export async function processDateFormatterWebhook(workflowRequest: WorkflowRequest): Promise<WebhookResult> {
  try {
    const {
      origin,
      inputFields
    } = workflowRequest;
    
    // Extract portalId from origin (HubSpot's actual structure)
    const portalId = origin?.portalId;

    // Validate required fields
    if (!portalId) {
      console.error('Validation error: Portal ID is required', { workflowRequest });
      return {
        success: false,
        status: 400,
        data: { error: 'Portal ID is required' }
      };
    }

    if (!inputFields?.sourceDateField) {
      console.error('Validation error: Source date field is required', { portalId, inputFields });
      return {
        success: false,
        status: 400,
        data: { error: 'Source date field is required' }
      };
    }

    if (!inputFields?.sourceFormat) {
      console.error('Validation error: Source format is required', { portalId, inputFields });
      return {
        success: false,
        status: 400,
        data: { error: 'Source format is required' }
      };
    }

    if (!inputFields?.targetFormat) {
      console.error('Validation error: Target format is required', { portalId, inputFields });
      return {
        success: false,
        status: 400,
        data: { error: 'Target format is required' }
      };
    }

    // Validate custom format if needed
    if (inputFields.targetFormat === 'CUSTOM' && !inputFields.customTargetFormat) {
      console.error('Validation error: Custom target format is required when target format is CUSTOM', { portalId, inputFields });
      return {
        success: false,
        status: 400,
        data: { error: 'Custom target format is required when target format is CUSTOM' }
      };
    }

    // Authenticate with HubSpot (verify portal has valid installation)
    try {
      await hubspotClientManager.getClient(portalId);
    } catch (authError) {
      console.error(`Authentication failed for portal ${portalId}:`, authError);
      return {
        success: false,
        status: 401,
        data: {
          error: 'Portal not authorized or installation not found',
          details: 'Please reinstall the app for this HubSpot portal'
        }
      };
    }

    // Get date value directly from inputFields (HubSpot pre-resolves the value)
    const dateValue = inputFields.sourceDateField;
    
    // Note: HubSpot workflow actions receive pre-resolved values, 
    // no need to resolve dynamic tokens like {{contact.createdate}}

    // Check if date value is empty
    if (!dateValue || dateValue.trim() === '') {
      console.warn('Empty date value received', { portalId, dateValue, inputFields });
      return {
        success: true,
        status: 200,
        data: {
          outputFields: {
            formattedDate: '',
            originalDate: dateValue,
            format: inputFields.targetFormat,
            error: 'Source date field is empty'
          }
        }
      };
    }

    // Format the date
    let formattedDate: string;
    try {
      formattedDate = formatDate(
        dateValue,
        inputFields.sourceFormat,
        inputFields.targetFormat as DateFormat,
        inputFields.customTargetFormat
      );
    } catch (error) {
      console.error('Date formatting error:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        portalId,
        dateValue,
        sourceFormat: inputFields.sourceFormat,
        targetFormat: inputFields.targetFormat,
        customTargetFormat: inputFields.customTargetFormat
      });
      
      // Return error in output fields so workflow can continue
      return {
        success: true,
        status: 200,
        data: {
          outputFields: {
            formattedDate: dateValue, // Return original value on error
            originalDate: dateValue,
            format: inputFields.targetFormat,
            error: error instanceof Error ? error.message : 'Date formatting failed'
          }
        }
      };
    }

    // Return successful response
    const response: WorkflowResponse = {
      outputFields: {
        formattedDate,
        originalDate: dateValue,
        format: inputFields.targetFormat
      }
    };

    return {
      success: true,
      status: 200,
      data: response
    };

  } catch (error) {
    console.error('Date formatter webhook error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      portalId: workflowRequest?.origin?.portalId,
      inputFields: workflowRequest?.inputFields,
      timestamp: new Date().toISOString()
    });
    
    // Return workflow-compatible error response
    return {
      success: false,
      status: 500,
      data: {
        outputFields: {
          formattedDate: '',
          originalDate: '',
          format: 'ERROR',
          error: 'Internal server error occurred during date formatting'
        }
      }
    };
  }
}