import { NextRequest, NextResponse } from 'next/server';
import { processDateFormatterWebhook } from '@/lib/services/webhook-handler';
import type { WorkflowRequest } from '@/lib/types';

/**
 * HubSpot Workflow Activity endpoint for date formatting
 * Receives workflow execution requests and returns formatted dates
 * 
 * @param request - NextRequest containing workflow activity data
 * @returns JSON response with formatted date or error
 */
export async function POST(request: NextRequest) {
  let workflowRequest: WorkflowRequest;
  
  try {
    // Parse the workflow request from HubSpot
    workflowRequest = await request.json();
  } catch (parseError) {
    console.error('JSON parsing error:', {
      error: parseError instanceof Error ? parseError.message : 'Unknown parsing error',
      contentType: request.headers.get('content-type'),
      timestamp: new Date().toISOString()
    });
    
    return NextResponse.json({
      outputFields: {
        formattedDate: '',
        originalDate: '',
        format: 'ERROR',
        error: 'Invalid JSON request body'
      }
    }, { status: 400 });
  }

  try {
    // Process the request using extracted business logic
    const result = await processDateFormatterWebhook(workflowRequest);
    
    // Errors are already logged in webhook-handler.ts
    
    return NextResponse.json(result.data, { status: result.status });

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