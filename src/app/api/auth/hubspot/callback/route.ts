import { NextRequest, NextResponse } from 'next/server';
import { validateOAuthCallback, HUBSPOT_OAUTH_SCOPES } from '@/lib/hubspot/auth';
import { exchangeCodeForTokens } from '@/lib/hubspot/tokens';
import { fetchAccessTokenInfo } from '@/lib/hubspot/portal-api';
import { 
  findInstallationByHubIdAndApp, 
  createInstallation,
  updateInstallationTokensForApp 
} from '@/lib/hubspot/installations';

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
    const state = searchParams.get('state'); // App type identifier

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

    // Handle direct access (no OAuth code) - HubSpot validates this endpoint
    if (!code) {
      return NextResponse.json({
        success: true,
        message: 'OAuth callback endpoint is ready',
        endpoint: 'https://www.integration-up.com/api/auth/hubspot/callback',
        note: 'This endpoint processes HubSpot OAuth callbacks'
      }, { status: 200 });
    }

    // Validate the authorization code format
    validateOAuthCallback(code);

    // Validate app type from state parameter
    if (!state || !['date-formatter', 'url-shortener'].includes(state)) {
      return NextResponse.json({
        success: false,
        error: 'invalid_state',
        message: 'Invalid or missing app type in OAuth state'
      }, { status: 400 });
    }

    // Exchange authorization code for access and refresh tokens
    const tokens = await exchangeCodeForTokens(code, state as 'date-formatter' | 'url-shortener');
    
    // Get portal information using the access token
    const tokenInfo = await fetchAccessTokenInfo(tokens.accessToken);

    // Store or update installation in database (app-specific)
    const appType = state as 'date-formatter' | 'url-shortener';
    const existingInstallation = await findInstallationByHubIdAndApp(tokenInfo.hub_id, appType);
    
    if (existingInstallation) {
      // Update existing installation with new tokens for this specific app
      await updateInstallationTokensForApp(tokenInfo.hub_id, appType, {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt: new Date(Date.now() + tokens.expiresIn * 1000).toISOString()
      });
    } else {
      // Create new installation record for this specific app
      await createInstallation({
        hubId: tokenInfo.hub_id,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt: new Date(Date.now() + tokens.expiresIn * 1000).toISOString(),
        scope: HUBSPOT_OAUTH_SCOPES.join(' '),
        appType: appType
      });
    }

    // Determine redirect URL based on app type (state parameter)
    let redirectUrl = '/install?success=true'; // Default fallback
    
    if (state && ['date-formatter', 'url-shortener'].includes(state)) {
      redirectUrl = `/install/${state}/success?portalId=${tokenInfo.hub_id}`;
    } else {
      // Check for custom return URL in cookies
      const returnUrl = request.cookies.get('hubspot_return_url')?.value;
      if (returnUrl) {
        redirectUrl = returnUrl;
      }
    }

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