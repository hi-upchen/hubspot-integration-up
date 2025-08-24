import { NextRequest, NextResponse } from 'next/server';
import { validateOAuthCallback, HUBSPOT_OAUTH_SCOPES, generateOAuthUrl } from '@/lib/hubspot/auth';
import { exchangeCodeForTokens } from '@/lib/hubspot/tokens';
import { fetchAccessTokenInfo } from '@/lib/hubspot/portal-api';
import { 
  findInstallationByHubIdAndApp, 
  createInstallation,
  updateInstallationTokensForApp 
} from '@/lib/hubspot/installations';

const VALID_APP_TYPES = ['date-formatter', 'url-shortener'] as const;
type AppType = typeof VALID_APP_TYPES[number];

/**
 * Handles HubSpot OAuth callback for specific app types
 * App type is determined from the URL path, eliminating need for state parameter
 * 
 * @param request - NextRequest containing OAuth callback parameters (code, error)
 * @param params - Route params containing appType from URL
 * @returns Redirect to success page, install page, or error page
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ appType: string }> }
) {
  try {
    const { appType } = await context.params;
    
    // Validate app type from URL
    if (!VALID_APP_TYPES.includes(appType as AppType)) {
      return NextResponse.json({
        success: false,
        error: 'invalid_app_type',
        message: `Invalid app type: ${appType}. Valid types are: ${VALID_APP_TYPES.join(', ')}`
      }, { status: 400 });
    }
    
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    
    // Handle OAuth errors from HubSpot
    if (error) {
      const errorDescription = searchParams.get('error_description');
      console.error(`OAuth error for ${appType}:`, error, errorDescription);
      
      // Redirect to install page with error message
      const errorMessage = errorDescription || error;
      const redirectUrl = `/install?error=${encodeURIComponent(errorMessage)}`;
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
    
    // Handle direct access (no OAuth code) - Direct OAuth flow
    if (!code) {
      // Generate app-specific OAuth URL and redirect directly to HubSpot
      const oauthUrl = generateOAuthUrl(appType as AppType);
      return NextResponse.redirect(new URL(oauthUrl));
    }
    
    // Validate the authorization code format
    validateOAuthCallback(code);
    
    // Exchange authorization code for tokens (app type from URL, not state)
    const tokens = await exchangeCodeForTokens(code, appType as AppType);
    
    // Get portal information using the access token
    const tokenInfo = await fetchAccessTokenInfo(tokens.accessToken);
    
    // Store or update installation in database
    const existingInstallation = await findInstallationByHubIdAndApp(
      tokenInfo.hub_id, 
      appType as AppType
    );
    
    if (existingInstallation) {
      // Update existing installation with new tokens for this specific app
      await updateInstallationTokensForApp(tokenInfo.hub_id, appType as AppType, {
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
        appType: appType as AppType
      });
    }
    
    // Redirect to success page (check if app-specific success page exists, otherwise use generic)
    const successUrl = `/install/${appType}/success?portalId=${tokenInfo.hub_id}`;
    return NextResponse.redirect(new URL(successUrl, request.url));
    
  } catch (error) {
    console.error('OAuth callback error:', error);
    
    // Determine error message
    let errorMessage = 'Installation failed. Please try again.';
    if (error instanceof Error) {
      // Extract user-friendly error message
      if (error.message.includes('MISMATCH_REDIRECT_URI')) {
        errorMessage = 'Configuration error: Redirect URI mismatch. Please contact support.';
      } else if (error.message.includes('Token exchange failed')) {
        errorMessage = 'Failed to complete authorization. Please try again.';
      } else if (error.message.includes('Missing HubSpot OAuth configuration')) {
        errorMessage = 'Configuration error. Please contact support.';
      } else {
        errorMessage = error.message;
      }
    }
    
    // Redirect to install page with error message
    const redirectUrl = `/install?error=${encodeURIComponent(errorMessage)}`;
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }
}