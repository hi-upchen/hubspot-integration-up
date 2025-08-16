/**
 * Dynamic Installation Route
 * Handles OAuth initiation for different app types
 */

import { NextRequest, NextResponse } from 'next/server';
import { ConfigManager } from '@/lib/config/config-manager';

export const runtime = 'nodejs';

interface RouteParams {
  appType: string;
}

/**
 * POST - Initiate OAuth flow for specific app type
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<RouteParams> }
) {
  try {
    const params = await context.params;
    const { appType } = params;
    
    // Validate app type
    const validAppTypes = ['date-formatter', 'url-shortener'];
    if (!validAppTypes.includes(appType)) {
      return NextResponse.json(
        { error: `Invalid app type: ${appType}` },
        { status: 400 }
      );
    }
    
    // Get config for the specific app
    let clientId: string;
    let scope: string;
    
    switch (appType) {
      case 'date-formatter':
        clientId = ConfigManager.getHubSpotClientId('date-formatter');
        scope = 'oauth'; // Basic OAuth scope
        break;
      case 'url-shortener':
        clientId = ConfigManager.getHubSpotClientId('url-shortener');
        scope = 'oauth';
        break;
      default:
        return NextResponse.json(
          { error: `Unsupported app type: ${appType}` },
          { status: 400 }
        );
    }
    
    // Build OAuth URL using configured redirect URI
    const redirectUri = ConfigManager.getHubSpotRedirectUri();
    
    const authUrl = new URL('https://app.hubspot.com/oauth/authorize');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('scope', scope);
    authUrl.searchParams.set('state', appType); // Use app type as state
    
    return NextResponse.json({
      authUrl: authUrl.toString(),
      appType,
      clientId: clientId.substring(0, 8) + '...' // Partial for debugging
    });
    
  } catch (error) {
    console.error('Failed to initiate OAuth:', error);
    return NextResponse.json(
      { error: 'Failed to initiate installation' },
      { status: 500 }
    );
  }
}

/**
 * GET - Get installation status for app type
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<RouteParams> }
) {
  try {
    const params = await context.params;
    const { appType } = params;
    
    return NextResponse.json({
      appType,
      status: 'available',
      message: `${appType} app is available for installation`
    });
    
  } catch (error) {
    console.error('Failed to get installation status:', error);
    return NextResponse.json(
      { error: 'Failed to get installation status' },
      { status: 500 }
    );
  }
}