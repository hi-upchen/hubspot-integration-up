import { NextRequest, NextResponse } from 'next/server';
import { formatDate } from '@/lib/services/date-formatter';
import { hubspotClientManager } from '@/lib/hubspot/client';
import type { WorkflowRequest, WorkflowResponse, DateFormat } from '@/lib/types';

/**
 * HubSpot Workflow Activity endpoint for date formatting
 * Receives workflow execution requests and returns formatted dates
 * 
 * @param request - NextRequest containing workflow activity data
 * @returns JSON response with formatted date or error
 */
export async function POST(request: NextRequest) {
  try {
    // Parse the workflow request from HubSpot
    const workflowRequest: WorkflowRequest = await request.json();
    
    const {
      origin,
      inputFields
    } = workflowRequest;
    
    // Extract portalId from origin (HubSpot's actual structure)
    const portalId = origin?.portalId;

    // Validate required fields
    if (!portalId) {
      return NextResponse.json({
        error: 'Portal ID is required'
      }, { status: 400 });
    }

    if (!inputFields?.sourceDateField) {
      return NextResponse.json({
        error: 'Source date field is required'
      }, { status: 400 });
    }

    if (!inputFields?.sourceFormat) {
      return NextResponse.json({
        error: 'Source format is required'
      }, { status: 400 });
    }

    if (!inputFields?.targetFormat) {
      return NextResponse.json({
        error: 'Target format is required'
      }, { status: 400 });
    }

    // Validate custom format if needed
    if (inputFields.targetFormat === 'CUSTOM' && !inputFields.customTargetFormat) {
      return NextResponse.json({
        error: 'Custom target format is required when target format is CUSTOM'
      }, { status: 400 });
    }

    // Authenticate with HubSpot (verify portal has valid installation)
    try {
      await hubspotClientManager.getClient(portalId);
    } catch {
      return NextResponse.json({
        error: 'Portal not authorized or installation not found',
        details: 'Please reinstall the app for this HubSpot portal'
      }, { status: 401 });
    }

    // Get date value directly from inputFields (HubSpot pre-resolves the value)
    const dateValue = inputFields.sourceDateField;
    
    // Note: HubSpot workflow actions receive pre-resolved values, 
    // no need to resolve dynamic tokens like {{contact.createdate}}

    // Check if date value is empty
    if (!dateValue || dateValue.trim() === '') {
      return NextResponse.json({
        outputFields: {
          formattedDate: '',
          originalDate: dateValue,
          format: inputFields.targetFormat,
          error: 'Source date field is empty'
        }
      });
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
      // Return error in output fields so workflow can continue
      return NextResponse.json({
        outputFields: {
          formattedDate: dateValue, // Return original value on error
          originalDate: dateValue,
          format: inputFields.targetFormat,
          error: error instanceof Error ? error.message : 'Date formatting failed'
        }
      });
    }

    // Return successful response
    const response: WorkflowResponse = {
      outputFields: {
        formattedDate,
        originalDate: dateValue,
        format: inputFields.targetFormat
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Date formatter webhook error:', error);
    
    // Return workflow-compatible error response
    return NextResponse.json({
      outputFields: {
        formattedDate: '',
        originalDate: '',
        format: 'ERROR',
        error: 'Internal server error occurred during date formatting'
      }
    }, { status: 500 });
  }
}

/**
 * Health check endpoint for HubSpot to verify the webhook is available
 */
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    service: 'date-formatter',
    timestamp: new Date().toISOString()
  });
}