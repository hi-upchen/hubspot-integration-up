/**
 * API Key Management Endpoint
 * Handles saving, retrieving, and validating Bitly API keys
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUrlShortenerService } from '@/lib/features/url-shortener/services/url-shortener';
import { encryptApiKey } from '@/lib/shared/encryption';

export const runtime = 'nodejs';
export const maxDuration = 30;

/**
 * GET - Check if portal has an API key and if it's verified
 */
export async function GET(request: NextRequest) {
  try {
    const portalId = request.headers.get('x-portal-id');
    
    if (!portalId) {
      return NextResponse.json(
        { error: 'Portal ID header is required' },
        { status: 400 }
      );
    }
    
    const urlShortenerService = getUrlShortenerService();
    const apiKey = await urlShortenerService.getApiKey(parseInt(portalId));
    
    return NextResponse.json({
      hasKey: !!apiKey,
      verified: apiKey?.verified_at !== null
    });
    
  } catch (error) {
    console.error('Failed to get API key status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST - Save and validate a new API key
 */
export async function POST(request: NextRequest) {
  try {
    const portalId = request.headers.get('x-portal-id');
    
    if (!portalId) {
      return NextResponse.json(
        { error: 'Portal ID header is required' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    const { apiKey } = body;
    
    if (!apiKey || typeof apiKey !== 'string') {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 400 }
      );
    }
    
    // Basic validation
    if (apiKey.length < 10) {
      return NextResponse.json(
        { error: 'API key appears to be too short' },
        { status: 400 }
      );
    }
    
    const urlShortenerService = getUrlShortenerService();
    
    // Validate the API key with Bitly
    const isValid = await urlShortenerService.validateApiKey(apiKey);
    
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid API key. Please check your Bitly token.' },
        { status: 400 }
      );
    }
    
    // Encrypt the API key
    const encryptedKey = encryptApiKey(apiKey);
    
    // Save the API key
    const saved = await urlShortenerService.saveApiKey(
      parseInt(portalId),
      encryptedKey,
      true // Mark as verified since we just validated it
    );
    
    if (!saved) {
      return NextResponse.json(
        { error: 'Failed to save API key' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      verified: true,
      message: 'API key saved and verified successfully'
    });
    
  } catch (error) {
    console.error('Failed to save API key:', error);
    
    if ((error as Error).message.includes('ENCRYPTION_KEY')) {
      return NextResponse.json(
        { error: 'Server configuration error. Please contact support.' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to save API key. Please try again.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Remove the API key for a portal
 */
export async function DELETE(request: NextRequest) {
  try {
    const portalId = request.headers.get('x-portal-id');
    
    if (!portalId) {
      return NextResponse.json(
        { error: 'Portal ID header is required' },
        { status: 400 }
      );
    }
    
    const urlShortenerService = getUrlShortenerService();
    const deleted = await urlShortenerService.deleteApiKey(parseInt(portalId));
    
    if (!deleted) {
      return NextResponse.json(
        { error: 'Failed to delete API key' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'API key deleted successfully'
    });
    
  } catch (error) {
    console.error('Failed to delete API key:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}