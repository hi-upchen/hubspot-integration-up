import { NextRequest, NextResponse } from 'next/server';
import { refreshAccessToken } from '@/lib/hubspot/tokens';
import { HubSpotInstallationService } from '@/lib/supabase/client';

export async function POST(request: NextRequest) {
  try {
    const { hubId } = await request.json();

    if (!hubId) {
      return NextResponse.json(
        { error: 'Hub ID is required' },
        { status: 400 }
      );
    }

    const installationService = new HubSpotInstallationService();
    const installation = await installationService.findByHubId(hubId);

    if (!installation) {
      return NextResponse.json(
        { error: 'Installation not found' },
        { status: 404 }
      );
    }

    // Use the stored app_type from the installation record
    const refreshedTokens = await refreshAccessToken(installation.refreshToken, installation.appType);
    
    const updatedInstallation = await installationService.updateTokens(hubId, {
      accessToken: refreshedTokens.accessToken,
      refreshToken: refreshedTokens.refreshToken,
      expiresAt: new Date(Date.now() + refreshedTokens.expiresIn * 1000).toISOString()
    });

    return NextResponse.json({
      success: true,
      accessToken: updatedInstallation.accessToken,
      expiresAt: updatedInstallation.expiresAt
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { error: 'Failed to refresh token' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const hubId = searchParams.get('hubId');

  if (!hubId) {
    return NextResponse.json(
      { error: 'Hub ID is required' },
      { status: 400 }
    );
  }

  try {
    const installationService = new HubSpotInstallationService();
    const installation = await installationService.findByHubId(parseInt(hubId));

    if (!installation) {
      return NextResponse.json(
        { error: 'Installation not found' },
        { status: 404 }
      );
    }

    const now = new Date();
    const expiresAt = new Date(installation.expiresAt);
    const isExpired = now >= expiresAt;

    return NextResponse.json({
      hubId: installation.hubId,
      isExpired,
      expiresAt: installation.expiresAt,
      scope: installation.scope
    });

  } catch (error) {
    console.error('Token status check error:', error);
    return NextResponse.json(
      { error: 'Failed to check token status' },
      { status: 500 }
    );
  }
}