import { formatDate } from './date-formatter';
import { trackUsage } from '@/lib/database/usage';
import type { WorkflowRequest, WorkflowResponse } from '@/lib/hubspot/types';
import type { DateFormat, DateFormatterUsageData } from '../types';

export interface WebhookResult {
  success: boolean;
  status: number;
  data: WorkflowResponse | { error: string; details?: string };
}

/**
 * Track usage with proper error handling
 * Note: We must await this in Vercel serverless functions or the write will be killed
 */
async function trackUsageWithErrorHandling(data: DateFormatterUsageData): Promise<void> {
  try {
    await trackUsage(data);
  } catch (error) {
    // Log error but don't throw - we don't want tracking failures to break the webhook
    console.error('Usage tracking failed:', error);
  }
}

/**
 * Defensive helper function to build consistent tracking data
 */
function buildTrackingData(
  portalId: number,
  inputFields: Record<string, unknown> | null | undefined = {},
  success: boolean,
  errorMessage?: string,
  formattedDate?: string
): DateFormatterUsageData {
  const fields = inputFields || {};
  return {
    portalId,
    sourceDate: (fields.sourceDateField as string) || '',
    sourceFormat: (fields.sourceFormat as string) || '',
    targetFormat: (fields.targetFormat as string) || '',
    customTargetFormat: fields.customTargetFormat as string | undefined,
    success,
    errorMessage,
    formattedDate
  };
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
      await trackUsageWithErrorHandling(buildTrackingData(portalId, inputFields, false, 'Source date field is required'));
      return {
        success: true,
        status: 200,
        data: {
          outputFields: {
            hs_execution_state: 'FAIL_CONTINUE',
            errorCode: 'MISSING_SOURCE_DATE',
            errorMessage: 'Source date field is required',
            formattedDate: '',
            originalDate: '',
            format: 'ERROR'
          }
        }
      };
    }

    if (!inputFields?.sourceFormat) {
      console.error('Validation error: Source format is required', { portalId, inputFields });
      await trackUsageWithErrorHandling(buildTrackingData(portalId, inputFields, false, 'Source format is required'));
      return {
        success: true,
        status: 200,
        data: {
          outputFields: {
            hs_execution_state: 'FAIL_CONTINUE',
            errorCode: 'MISSING_SOURCE_FORMAT',
            errorMessage: 'Source format is required',
            formattedDate: '',
            originalDate: '',
            format: 'ERROR'
          }
        }
      };
    }

    if (!inputFields?.targetFormat) {
      console.error('Validation error: Target format is required', { portalId, inputFields });
      await trackUsageWithErrorHandling(buildTrackingData(portalId, inputFields, false, 'Target format is required'));
      return {
        success: true,
        status: 200,
        data: {
          outputFields: {
            hs_execution_state: 'FAIL_CONTINUE',
            errorCode: 'MISSING_TARGET_FORMAT',
            errorMessage: 'Target format is required',
            formattedDate: '',
            originalDate: '',
            format: 'ERROR'
          }
        }
      };
    }

    // Validate custom format if needed
    if (inputFields.targetFormat === 'CUSTOM' && !inputFields.customTargetFormat) {
      console.error('Validation error: Custom target format is required when target format is CUSTOM', { portalId, inputFields });
      await trackUsageWithErrorHandling(buildTrackingData(portalId, inputFields, false, 'Custom target format is required when target format is CUSTOM'));
      return {
        success: true,
        status: 200,
        data: {
          outputFields: {
            hs_execution_state: 'FAIL_CONTINUE',
            errorCode: 'MISSING_CUSTOM_FORMAT',
            errorMessage: 'Custom target format is required when target format is CUSTOM',
            formattedDate: '',
            originalDate: '',
            format: 'ERROR'
          }
        }
      };
    }

    // Get date value directly from inputFields (HubSpot pre-resolves the value)
    const dateValue = inputFields.sourceDateField as string;
    
    // Note: HubSpot workflow actions receive pre-resolved values, 
    // no need to resolve dynamic tokens like {{contact.createdate}}

    // Check if date value is empty
    if (!dateValue || (typeof dateValue === 'string' && dateValue.trim() === '')) {
      console.warn('Empty date value received', { portalId, dateValue, inputFields });
      await trackUsageWithErrorHandling(buildTrackingData(portalId, inputFields, false, 'Source date field is empty', ''));
      return {
        success: true,
        status: 200,
        data: {
          outputFields: {
            hs_execution_state: 'FAIL_CONTINUE',
            errorCode: 'EMPTY_DATE_FIELD',
            errorMessage: 'Source date field is empty',
            formattedDate: '',
            originalDate: dateValue,
            format: inputFields.targetFormat
          }
        }
      };
    }

    // Format the date
    let formattedDate: string;
    try {
      formattedDate = formatDate(
        dateValue,
        inputFields.sourceFormat as string,
        inputFields.targetFormat as DateFormat,
        inputFields.customTargetFormat as string | undefined
      );
    } catch (error) {
      console.error('Date formatting error:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        portalId,
        dateValue,
        sourceFormat: inputFields.sourceFormat,
        targetFormat: inputFields.targetFormat,
        customTargetFormat: inputFields.customTargetFormat
      });
      
      await trackUsageWithErrorHandling(buildTrackingData(portalId, inputFields, false, error instanceof Error ? error.message : 'Date formatting failed', dateValue));
      
      // Return error in output fields so workflow can continue
      return {
        success: true,
        status: 200,
        data: {
          outputFields: {
            hs_execution_state: 'FAIL_CONTINUE',
            errorCode: 'INVALID_DATE_FORMAT',
            errorMessage: error instanceof Error ? error.message : 'Date formatting failed',
            formattedDate: dateValue, // Return original value on error
            originalDate: dateValue,
            format: inputFields.targetFormat
          }
        }
      };
    }

    // Track successful processing with the formatted date
    await trackUsageWithErrorHandling(buildTrackingData(portalId, inputFields, true, undefined, formattedDate));

    // Return successful response
    const response: WorkflowResponse = {
      outputFields: {
        hs_execution_state: 'SUCCESS',
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
      portalId: workflowRequest?.origin?.portalId,
      inputFields: workflowRequest?.inputFields,
      timestamp: new Date().toISOString()
    });
    
    // Track unexpected errors if we have portal context
    if (workflowRequest?.origin?.portalId) {
      await trackUsageWithErrorHandling(buildTrackingData(
        workflowRequest.origin.portalId,
        workflowRequest.inputFields || {},
        false,
        'Internal server error'
      ));
    }
    
    // Return workflow-compatible error response
    return {
      success: false,
      status: 500,
      data: {
        outputFields: {
          hs_execution_state: 'FAIL_CONTINUE',
          errorCode: 'INTERNAL_ERROR',
          errorMessage: 'Internal server error occurred during date formatting',
          formattedDate: '',
          originalDate: '',
          format: 'ERROR'
        }
      }
    };
  }
}