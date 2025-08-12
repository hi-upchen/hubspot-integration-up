/**
 * Test Connection Endpoint
 * Tests if the saved API key works with Bitly
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUrlShortenerService } from '@/lib/features/url-shortener/services/url-shortener';
import { decryptApiKey } from '@/lib/shared/encryption';

export const runtime = 'nodejs';
export const maxDuration = 30;

/**
 * POST - Test the API key connection
 * Can test either a provided API key or a saved one
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
    
    const urlShortenerService = getUrlShortenerService();
    
    // Check if an API key was provided in the request body
    let body;
    try {
      body = await request.json();
    } catch {
      body = {};
    }
    
    let apiKeyToTest: string;
    let isStoredKey = false;
    
    if (body.apiKey) {
      // Test the provided API key without saving
      apiKeyToTest = body.apiKey;
    } else {
      // Fall back to testing the stored API key
      const apiKeyRecord = await urlShortenerService.getApiKey(parseInt(portalId));
      
      if (!apiKeyRecord) {
        return NextResponse.json({
          valid: false,
          error: 'No API key provided or found. Please enter a Bitly API key to test.'
        });
      }
      
      // Decrypt the stored API key
      try {
        apiKeyToTest = decryptApiKey(apiKeyRecord.api_key);
        isStoredKey = true;
      } catch (error) {
        console.error('Failed to decrypt API key:', error);
        return NextResponse.json({
          valid: false,
          error: 'Failed to decrypt stored API key. Please re-enter your API key.'
        });
      }
    }
    
    // Test the API key
    const isValid = await urlShortenerService.validateApiKey(apiKeyToTest);
    
    if (isValid) {
      // Only update verified timestamp if testing a stored key
      if (isStoredKey) {
        const apiKeyRecord = await urlShortenerService.getApiKey(parseInt(portalId));
        if (apiKeyRecord) {
          await urlShortenerService.saveApiKey(
            parseInt(portalId),
            apiKeyRecord.api_key,
            true
          );
        }
      }
      
      return NextResponse.json({
        valid: true,
        message: 'Connection successful! Your Bitly API key is working correctly.'
      });
    } else {
      return NextResponse.json({
        valid: false,
        error: 'Connection failed. Your API key may be invalid or expired.'
      });
    }
    
  } catch (error) {
    console.error('Connection test failed:', error);
    
    const errorMessage = (error as Error).message;
    
    if (errorMessage.includes('Rate limit')) {
      return NextResponse.json({
        valid: false,
        error: 'Rate limit exceeded. Please try again in a few moments.'
      });
    }
    
    if (errorMessage.includes('ENCRYPTION_KEY')) {
      return NextResponse.json({
        valid: false,
        error: 'Server configuration error. Please contact support.'
      });
    }
    
    return NextResponse.json({
      valid: false,
      error: 'Connection test failed. Please try again.'
    });
  }
}