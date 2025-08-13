/**
 * Dynamic Uninstallation Route
 * Handles app uninstallation webhooks from HubSpot
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/database/supabase';

export const runtime = 'nodejs';

interface RouteParams {
  appType: string;
}

interface UninstallWebhook {
  userId: number;
  portalId: number;
  appId: number;
  eventType: string;
  subscriptionType: string;
  subscriptionId: number;
  portalIds?: number[];
}

/**
 * POST - Handle uninstallation webhook from HubSpot
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<RouteParams> }
) {
  try {
    const params = await context.params;
    const { appType } = params;
    
    // Parse webhook payload
    const body = await request.json() as UninstallWebhook;
    
    if (!body.portalId) {
      return NextResponse.json(
        { error: 'Portal ID is required' },
        { status: 400 }
      );
    }
    
    console.log(`Received uninstall webhook for ${appType}:`, {
      portalId: body.portalId,
      appId: body.appId,
      timestamp: new Date().toISOString()
    });
    
    const supabase = supabaseAdmin;
    
    // Clean up app-specific data
    switch (appType) {
      case 'url-shortener':
        // Remove API keys for this portal
        await supabase
          .from('url_shortener_api_keys')
          .delete()
          .eq('portal_id', body.portalId);
        
        console.log(`Cleaned up URL shortener data for portal ${body.portalId}`);
        break;
        
      case 'date-formatter':
        // Date formatter doesn't store app-specific data besides usage
        console.log(`Received date formatter uninstall for portal ${body.portalId}`);
        break;
        
      default:
        console.log(`Unknown app type ${appType} uninstalled for portal ${body.portalId}`);
    }
    
    // Note: We don't delete the main hubspot_installations record here
    // because portals might have multiple apps installed
    // That should only be deleted when all apps are uninstalled
    
    return NextResponse.json({
      success: true,
      message: `Successfully processed ${appType} uninstallation for portal ${body.portalId}`
    });
    
  } catch (error) {
    console.error('Failed to process uninstallation:', error);
    return NextResponse.json(
      { error: 'Failed to process uninstallation' },
      { status: 500 }
    );
  }
}

/**
 * GET - Health check
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<RouteParams> }
) {
  const params = await context.params;
  const { appType } = params;
  
  return NextResponse.json({
    service: `${appType}-uninstall-webhook`,
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
}