/**
 * Dynamic Installation Route
 * Handles OAuth initiation for different app types
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateOAuthUrl } from '@/lib/hubspot/auth';

export const runtime = 'nodejs';

interface RouteParams {
  appType: string;
}


/**
 * GET - Initiate HubSpot OAuth installation flow (Direct Redirect)
 * When users click "Install to HubSpot" buttons, they're redirected directly to HubSpot
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<RouteParams> }
) {
  try {
    const params = await context.params;
    const { appType } = params;
    
    // Validate app type
    const validAppTypes = ['date-formatter', 'url-shortener'];
    if (!validAppTypes.includes(appType)) {
      // Redirect to install page with error instead of JSON response
      const errorUrl = `/install?error=${encodeURIComponent(`Invalid app type: ${appType}`)}`;
      return NextResponse.redirect(new URL(errorUrl, request.url));
    }
    
    // Generate OAuth URL and redirect user directly to HubSpot
    const authUrl = generateOAuthUrl(appType as 'date-formatter' | 'url-shortener');
    
    return NextResponse.redirect(new URL(authUrl));
    
  } catch (error) {
    console.error('Failed to initiate OAuth:', error);
    // Redirect to install page with error message for better UX
    const errorUrl = `/install?error=${encodeURIComponent('Failed to initiate installation. Please try again.')}`;
    return NextResponse.redirect(new URL(errorUrl, request.url));
  }
}