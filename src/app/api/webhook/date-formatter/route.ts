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
      stack: parseError instanceof Error ? parseError.stack : undefined,
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
    
    // Only log errors, not successful requests
    if (!result.success) {
      console.log('Date formatter webhook request:', JSON.stringify({
        portalId: workflowRequest.origin?.portalId,
        inputFields: workflowRequest.inputFields,
        timestamp: new Date().toISOString()
      }, null, 2));
      console.log(`Date formatter webhook result: ${result.status} - ${JSON.stringify(result.data)}`);
    }
    
    return NextResponse.json(result.data, { status: result.status });

  } catch (error) {
    console.error('Date formatter webhook error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace available');
    
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