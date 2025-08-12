import { NextRequest, NextResponse } from 'next/server';
import { getUsageAnalytics } from '@/lib/shared/usage-tracker';
import { validatePortalId } from '../../_shared/validation';
import { formatSuccessResponse, handleApiError } from '../../_shared/responses';

/**
 * GET /api/usage/analytics?portalId=123
 * Returns 12-month historical usage data for dashboard charts
 */
export async function GET(request: NextRequest) {
  try {
    // Validate and extract portal ID
    const portalId = validatePortalId(request.nextUrl.searchParams);
    
    // Get usage analytics from service
    const analytics = await getUsageAnalytics(portalId);
    
    // Return formatted response
    return NextResponse.json(formatSuccessResponse(analytics, portalId));
    
  } catch (error) {
    return handleApiError(error);
  }
}