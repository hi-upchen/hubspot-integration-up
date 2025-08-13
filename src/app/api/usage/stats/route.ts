import { NextRequest, NextResponse } from 'next/server';
import { getUsageStats } from '@/lib/database/usage';
import { validatePortalId } from '../../_shared/validation';
import { formatSuccessResponse, handleApiError } from '../../_shared/responses';

/**
 * GET /api/usage/stats?portalId=123
 * Returns current month usage statistics for a specific portal
 */
export async function GET(request: NextRequest) {
  try {
    // Validate and extract portal ID
    const portalId = validatePortalId(request.nextUrl.searchParams);
    
    // Get usage statistics from service
    const stats = await getUsageStats(portalId);
    
    // Return formatted response
    return NextResponse.json(formatSuccessResponse(stats, portalId));
    
  } catch (error) {
    return handleApiError(error);
  }
}