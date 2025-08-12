/**
 * URL Shortener Webhook Handler
 * Processes HubSpot workflow action requests for URL shortening
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUrlShortenerService } from '@/lib/features/url-shortener/services/url-shortener';
import { trackUrlShortenerUsage } from '@/lib/features/url-shortener/services/usage-tracker';
import { supabaseAdmin } from '@/lib/supabase/client';
import { 
  classifyError, 
  createErrorResponse, 
  createSuccessResponse
} from '@/lib/features/url-shortener/utils/error-handling';

export const runtime = 'nodejs';
export const maxDuration = 30;

interface WorkflowRequest {
  callbackId?: string;
  origin: {
    portalId: number;
    actionDefinitionId?: number;
  };
  inputFields?: {
    urlToShorten?: string;
    customDomain?: string;
  };
  [key: string]: unknown;
}


/**
 * Validates the incoming request
 */
function validateRequest(body: WorkflowRequest): { valid: boolean; error?: string } {
  if (!body) {
    return { valid: false, error: 'Request body is required' };
  }
  
  if (!body.origin) {
    return { valid: false, error: 'Origin is required' };
  }
  
  if (!body.origin.portalId || typeof body.origin.portalId !== 'number') {
    return { valid: false, error: 'Valid portal ID is required' };
  }
  
  if (!body.inputFields) {
    return { valid: false, error: 'Input fields are required' };
  }
  
  if (!body.inputFields.urlToShorten) {
    return { valid: false, error: 'URL to shorten is required' };
  }
  
  return { valid: true };
}

/**
 * Checks if the portal has a valid installation for URL shortener
 */
async function checkPortalAuthorization(portalId: number): Promise<boolean> {
  const supabase = supabaseAdmin;
  
  try {
    
    // Check for URL shortener app installation specifically
    const { data, error } = await supabase
      .from('hubspot_installations')
      .select('hub_id, app_type')
      .eq('hub_id', portalId)
      .eq('app_type', 'url-shortener')
      .single();
    
    if (error) {
      return false;
    }
    
    const isAuthorized = data !== null;
    return isAuthorized;
  } catch (err) {
    console.error(`[URL Shortener Webhook] Unexpected error checking authorization for portal ${portalId}:`, err);
    return false;
  }
}

/**
 * Handles POST requests from HubSpot workflows
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let portalId: number | undefined;
  let urlToShorten: string | undefined;
  
  try {
    // Parse request body
    const body = await request.json() as WorkflowRequest;
    
    
    // Extract values for tracking
    portalId = body.origin?.portalId;
    urlToShorten = body.inputFields?.urlToShorten;
    
    // Validate request
    const validation = validateRequest(body);
    if (!validation.valid) {
      // Track failed validation
      if (portalId) {
        await trackUrlShortenerUsage({
          portalId,
          longUrl: urlToShorten,
          success: false,
          errorMessage: validation.error,
          responseTimeMs: Date.now() - startTime
        });
      }
      
      const { response, httpStatus, headers } = createErrorResponse(
        'VALIDATION_ERROR',
        validation.error!,
        false, // Smart default: Always stop workflow for user config errors
        urlToShorten
      );
      
      const responseOptions = { status: httpStatus, headers };
      
      return NextResponse.json(response, responseOptions);
    }
    
    // Check portal authorization
    const isAuthorized = await checkPortalAuthorization(portalId!);
    if (!isAuthorized) {
      // Track unauthorized attempt
      await trackUrlShortenerUsage({
        portalId: portalId!,
        longUrl: urlToShorten,
        success: false,
        errorMessage: 'Portal not authorized',
        responseTimeMs: Date.now() - startTime
      });
      
      const { response, httpStatus, headers } = createErrorResponse(
        'AUTHORIZATION_ERROR',
        'Portal not authorized. Please install the Integration Up URL Shortener app.',
        false, // Smart default: Always stop workflow for user config errors
        urlToShorten
      );
      
      const responseOptions = { status: httpStatus, headers };
      
      return NextResponse.json(response, responseOptions);
    }
    
    // Get the URL shortener service
    const urlShortenerService = getUrlShortenerService();
    
    // Shorten the URL
    const result = await urlShortenerService.shortenUrl({
      portalId: portalId!,
      longUrl: urlToShorten!,
      customDomain: body.inputFields?.customDomain
    });
    
    // Track usage (MUST AWAIT in Vercel Functions)
    await trackUrlShortenerUsage({
      portalId: portalId!,
      longUrl: urlToShorten,
      shortUrl: result.shortUrl,
      customDomain: result.domain,
      success: result.success,
      errorMessage: result.error,
      responseTimeMs: Date.now() - startTime
    });
    
    // Return appropriate response
    if (result.success) {
      const successResponse = createSuccessResponse(
        result.shortUrl!,
        result.longUrl!,
        result.domain,
        result.createdAt
      );
      return NextResponse.json(successResponse);
    } else {
      // Classify the error and create appropriate response
      const errorType = classifyError(result.error || 'Unknown error');
      const shouldContinue = false; // Smart default: Always stop workflow for errors
      
      const { response, httpStatus, headers } = createErrorResponse(
        errorType,
        result.error || 'URL shortening failed',
        shouldContinue,
        urlToShorten
      );
      
      const responseOptions = { status: httpStatus, headers };
      
      return NextResponse.json(response, responseOptions);
    }
    
  } catch (error) {
    console.error('URL shortener webhook error:', {
      error,
      portalId,
      timestamp: new Date().toISOString()
    });
    
    // Track error (if we have portal ID)
    if (portalId) {
      await trackUrlShortenerUsage({
        portalId,
        longUrl: urlToShorten,
        success: false,
        errorMessage: (error as Error).message || 'Internal server error',
        responseTimeMs: Date.now() - startTime
      });
    }
    
    // Always treat unexpected errors as server errors
    const { response, httpStatus } = createErrorResponse(
      'SERVER_ERROR',
      'An unexpected error occurred. Please try again later.',
      false
    );
    
    return NextResponse.json(response, { status: httpStatus });
  }
}

/**
 * Handles GET requests (for health check)
 */
export async function GET() {
  return NextResponse.json({
    service: 'url-shortener-webhook',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
}