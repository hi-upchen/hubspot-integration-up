import { NextRequest, NextResponse } from 'next/server';
import { validateOAuthCallback } from '@/lib/hubspot/auth';
import { exchangeCodeForTokens, getPortalInfo } from '@/lib/hubspot/tokens';
import { HubSpotInstallationService } from '@/lib/supabase/client';
import { HUBSPOT_OAUTH_SCOPES } from '@/lib/hubspot/auth';

/**
 * Handles HubSpot OAuth callback after user authorizes the app
 * Exchanges authorization code for access tokens and stores installation data
 * 
 * @param request - NextRequest containing OAuth callback parameters (code, error)
 * @returns Redirect to success page or JSON error response
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    // Handle OAuth errors from HubSpot
    if (error) {
      const errorDescription = searchParams.get('error_description');
      console.error('OAuth error:', error, errorDescription);
      return NextResponse.json({
        success: false,
        error: error,
        errorDescription: errorDescription
      }, { status: 400 });
    }

    // Validate required authorization code
    if (!code) {
      return NextResponse.json({
        success: false,
        error: 'missing_code',
        message: 'Authorization code is required'
      }, { status: 400 });
    }

    // Validate the authorization code format
    validateOAuthCallback(code);

    // Exchange authorization code for access and refresh tokens
    const tokens = await exchangeCodeForTokens(code);
    
    // Get portal information using the access token
    const portalInfo = await getPortalInfo(tokens.accessToken);

    // Store or update installation in database
    const installationService = new HubSpotInstallationService();
    const existingInstallation = await installationService.findByHubId(portalInfo.portalId);
    
    if (existingInstallation) {
      // Update existing installation with new tokens
      await installationService.updateTokens(portalInfo.portalId, {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt: new Date(Date.now() + tokens.expiresIn * 1000).toISOString()
      });
    } else {
      // Create new installation record
      await installationService.create({
        hubId: portalInfo.portalId,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt: new Date(Date.now() + tokens.expiresIn * 1000).toISOString(),
        scope: HUBSPOT_OAUTH_SCOPES
      });
    }

    // Get return URL from cookie or default to success page
    const returnUrl = request.cookies.get('hubspot_return_url')?.value;
    const redirectUrl = returnUrl || '/install?success=true';

    const response = NextResponse.redirect(new URL(redirectUrl, request.url));
    
    // Clean up OAuth cookies
    response.cookies.delete('hubspot_return_url');

    return response;

  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.json({
      success: false,
      error: 'callback_failed',
      message: 'OAuth callback processing failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}