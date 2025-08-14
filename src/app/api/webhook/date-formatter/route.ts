import { NextRequest, NextResponse } from 'next/server';
import { processDateFormatterWebhook } from '@/lib/features/date-formatter/services/webhook-handler';
import { validateHubSpotWebhook, createSecurityErrorResponse } from '@/lib/shared/webhook-security';
import type { WorkflowRequest } from '@/lib/hubspot/types';

/**
 * HubSpot Workflow Activity endpoint for date formatting
 * Receives workflow execution requests and returns formatted dates
 * 
 * Security: All requests are validated using HubSpot v3 signature verification
 * to ensure they originate from HubSpot and haven't been tampered with.
 * 
 * @param request - NextRequest containing workflow activity data
 * @returns JSON response with formatted date or error
 */
export async function POST(request: NextRequest) {
  // === SECURITY VALIDATION ===
  // Validate webhook request using HubSpot official v3 signature verification
  const securityValidation = await validateHubSpotWebhook(
    request, 
    'date-formatter'
  );

  if (!securityValidation.isValid) {
    console.warn('[Date Formatter Webhook] Security validation failed:', {
      error: securityValidation.error,
      bypassed: securityValidation.bypassed,
      timestamp: new Date().toISOString(),
      url: request.url,
      userAgent: request.headers.get('user-agent')
    });
    
    return createSecurityErrorResponse(
      securityValidation.error || 'Unauthorized request',
      true // Include details in dev mode
    );
  }

  // Log successful security validation (but not in production to reduce noise)
  if (process.env.NODE_ENV === 'development' || securityValidation.bypassed) {
    console.log('[Date Formatter Webhook] Security validation passed', {
      bypassed: securityValidation.bypassed,
      timestamp: new Date().toISOString()
    });
  }

  // === REQUEST PROCESSING ===
  let workflowRequest: WorkflowRequest;
  
  try {
    // Parse the workflow request from HubSpot (body already extracted during security validation)
    workflowRequest = JSON.parse(securityValidation.body!);
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