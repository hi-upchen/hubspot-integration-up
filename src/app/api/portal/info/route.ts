import { NextRequest, NextResponse } from 'next/server';
import { getPortalInfoRecord, updatePortalInfoRecord } from '@/lib/database/portal-info';
import { validatePortalId, validateUpdatePortalRequest } from '../../_shared/validation';
import { formatSuccessResponse, handleApiError } from '../../_shared/responses';
import { PortalNotFoundError } from '../../_shared/errors';

/**
 * GET /api/portal/info?portalId=123
 * Returns portal information (HubSpot data + user profile)
 */
export async function GET(request: NextRequest) {
  try {
    // Validate and extract portal ID
    const portalId = validatePortalId(request.nextUrl.searchParams);
    
    // Get portal information from service
    const portalInfo = await getPortalInfoRecord(portalId);
    
    if (!portalInfo) {
      throw new PortalNotFoundError(portalId);
    }
    
    // Return formatted response
    return NextResponse.json(formatSuccessResponse(portalInfo, portalId));
    
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PUT /api/portal/info
 * Updates user-provided portal information (userName and organizationName only)
 */
export async function PUT(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedRequest = validateUpdatePortalRequest(body);
    
    // Update portal user information
    const updatedInfo = await updatePortalInfoRecord(validatedRequest.portalId, {
      user_name: validatedRequest.userName,
      organization_name: validatedRequest.organizationName
    });
    
    if (!updatedInfo) {
      throw new PortalNotFoundError(validatedRequest.portalId);
    }
    
    // Return formatted response
    return NextResponse.json(formatSuccessResponse(updatedInfo, validatedRequest.portalId));
    
  } catch (error) {
    return handleApiError(error);
  }
}