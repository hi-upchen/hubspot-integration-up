import { NextRequest, NextResponse } from 'next/server';
import { generateOAuthUrl } from '@/lib/hubspot/auth';

/**
 * Initiates HubSpot OAuth flow by redirecting user to HubSpot authorization page
 * 
 * @param request - NextRequest containing optional return_url parameter
 * @returns Redirect response to HubSpot OAuth authorization URL
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const returnUrl = searchParams.get('return_url');
    
    const oauthUrl = generateOAuthUrl();
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