import { NextRequest, NextResponse } from 'next/server';
import { generateOAuthUrl } from '@/lib/hubspot/auth';

/**
 * Initiates HubSpot OAuth flow by redirecting user to HubSpot authorization page
 * 
 * @param request - NextRequest containing optional return_url and required app_type parameter
 * @returns Redirect response to HubSpot OAuth authorization URL
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const returnUrl = searchParams.get('return_url');
    const appType = searchParams.get('app_type') as 'date-formatter' | 'url-shortener';
    
    // Validate app type
    if (!appType || !['date-formatter', 'url-shortener'].includes(appType)) {
      return NextResponse.json(
        { 
          error: 'Missing or invalid app_type parameter',
          message: 'Please specify app_type as "date-formatter" or "url-shortener"',
          example: '/api/auth/hubspot/install?app_type=date-formatter'
        },
        { status: 400 }
      );
    }
    
    const oauthUrl = generateOAuthUrl(appType);
    const response = NextResponse.redirect(oauthUrl);
    
    // Store return URL in cookie if provided
    if (returnUrl) {
      response.cookies.set('hubspot_return_url', returnUrl, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 600 // 10 minutes
      });
    }

    return response;
  } catch (error) {
    console.error('OAuth install error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate OAuth flow' },
      { status: 500 }
    );
  }
}