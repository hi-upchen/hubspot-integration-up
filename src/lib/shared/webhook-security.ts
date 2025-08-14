/**
 * HubSpot Webhook Security Implementation
 * Official v3 signature verification + development utilities
 * 
 * Implements HubSpot's official webhook authentication:
 * - HMAC-SHA256 signature verification using client secret
 * - Timestamp validation (5-minute window)
 * - Environment-conditional bypass for development
 * - Timing-safe comparison to prevent timing attacks
 */

import { createHmac, timingSafeEqual } from 'crypto';
import { ConfigManager } from '@/lib/config/config-manager';

export interface WebhookSecurityValidation {
  isValid: boolean;
  error?: string;
  bypassed?: boolean;
}

export interface WebhookValidationResult {
  isValid: boolean;
  error?: string;
  bypassed?: boolean;
  body?: string;
}

/**
 * Verifies HubSpot webhook request signature using v3 method
 * 
 * HubSpot v3 signature algorithm:
 * 1. Concatenate: method + uri + body + timestamp
 * 2. Generate HMAC-SHA256 using client secret
 * 3. Base64 encode the result
 * 4. Compare with received signature using timing-safe comparison
 * 
 * @param method - HTTP method (typically "POST")
 * @param uri - Full request URI as configured in HubSpot
 * @param body - Raw request body (before JSON parsing)
 * @param timestamp - X-HubSpot-Request-Timestamp header value
 * @param signature - X-HubSpot-Signature-v3 header value
 * @param clientSecret - App client secret from config
 * @returns Validation result
 */
export function verifyHubSpotSignatureV3(
  method: string,
  uri: string,
  body: string,
  timestamp: string,
  signature: string,
  clientSecret: string
): WebhookSecurityValidation {
  try {
    if (!method || !uri || body === null || body === undefined || !timestamp || !signature || !clientSecret) {
      return {
        isValid: false,
        error: 'Missing required parameters for signature verification'
      };
    }

    // Create source string for signature verification
    // HubSpot v3 format: method + uri + body + timestamp
    const sourceString = method + uri + body + timestamp;
    
    // Generate expected signature using HMAC-SHA256
    const expectedSignature = createHmac('sha256', clientSecret)
      .update(sourceString, 'utf8')
      .digest('base64');

    // Remove any prefix from received signature (e.g., "sha256=")
    const receivedSignature = signature.replace(/^sha256=/, '');

    // Convert to buffers for timing-safe comparison
    const expectedBuffer = Buffer.from(expectedSignature, 'base64');
    const receivedBuffer = Buffer.from(receivedSignature, 'base64');

    // Check lengths match (prevents buffer overflow attacks)
    if (expectedBuffer.length !== receivedBuffer.length) {
      return {
        isValid: false,
        error: 'Signature length mismatch'
      };
    }

    // Use timing-safe comparison to prevent timing attacks
    const isValid = timingSafeEqual(expectedBuffer, receivedBuffer);

    if (!isValid) {
      console.warn('[Webhook Security] Invalid signature detected', {
        method,
        uri: uri.replace(/[?&]code=[^&]+/g, '[REDACTED]'), // Hide sensitive query params
        timestampAge: Date.now() - parseInt(timestamp),
        expectedLength: expectedSignature.length,
        receivedLength: receivedSignature.length,
        sourceStringLength: sourceString.length
      });
    }

    return { isValid };

  } catch (error) {
    console.error('[Webhook Security] Signature verification error:', error);
    return {
      isValid: false,
      error: 'Signature verification failed'
    };
  }
}

/**
 * Validates request timestamp to prevent replay attacks
 * HubSpot requirement: reject requests older than 5 minutes
 * 
 * @param timestamp - X-HubSpot-Request-Timestamp header value
 * @param maxAgeMs - Maximum age in milliseconds (default: 5 minutes)
 * @returns Validation result
 */
export function validateTimestamp(
  timestamp: string,
  maxAgeMs: number = 5 * 60 * 1000 // 5 minutes
): WebhookSecurityValidation {
  if (!timestamp) {
    return {
      isValid: false,
      error: 'Missing X-HubSpot-Request-Timestamp header'
    };
  }

  const requestTime = parseInt(timestamp, 10);
  
  if (isNaN(requestTime)) {
    return {
      isValid: false,
      error: 'Invalid timestamp format'
    };
  }

  const now = Date.now();
  const age = now - requestTime;
  
  if (age > maxAgeMs) {
    return {
      isValid: false,
      error: `Request too old (age: ${Math.round(age / 1000)}s, max: ${Math.round(maxAgeMs / 1000)}s)`
    };
  }

  // Also reject timestamps from the future (clock skew protection)
  if (age < -30000) { // Allow 30 seconds clock skew
    return {
      isValid: false,
      error: 'Request timestamp is too far in the future'
    };
  }

  return { isValid: true };
}

/**
 * Checks if webhook security can be bypassed in development
 * 
 * Security bypass conditions (ALL must be true):
 * - Environment is 'dev' (from ConfigManager)
 * - NODE_ENV is 'development' 
 * - BYPASS_WEBHOOK_SECURITY environment variable is explicitly set to 'true'
 * 
 * @returns Whether security can be bypassed
 */
export function canBypassSecurity(): boolean {
  try {
    const isDev = ConfigManager.getCurrentEnvironment() === 'dev';
    const isLocal = process.env.NODE_ENV === 'development';
    const bypassEnabled = process.env.BYPASS_WEBHOOK_SECURITY === 'true';
    
    return isDev && isLocal && bypassEnabled;
  } catch (error) {
    // If config fails, never allow bypass
    console.error('[Webhook Security] Error checking bypass conditions:', error);
    return false;
  }
}

/**
 * Validates request origin by checking User-Agent and other headers
 * Additional security layer beyond signature verification
 * 
 * @param headers - Request headers
 * @returns Validation result
 */
export function validateRequestOrigin(headers: Headers): WebhookSecurityValidation {
  const userAgent = headers.get('user-agent') || '';
  
  // Check for HubSpot User-Agent pattern
  if (!userAgent.toLowerCase().includes('hubspot')) {
    return {
      isValid: false,
      error: 'Invalid User-Agent header - requests must come from HubSpot'
    };
  }

  return { isValid: true };
}

/**
 * Comprehensive HubSpot webhook validation
 * 
 * Validates webhook requests using HubSpot's official v3 signature method:
 * 1. Checks for development bypass conditions
 * 2. Validates request headers and origin
 * 3. Verifies timestamp (prevents replay attacks)
 * 4. Verifies HMAC-SHA256 signature
 * 
 * @param request - Next.js Request object
 * @param appType - App type for getting correct client secret
 * @param requestUri - Full webhook URI as configured in HubSpot
 * @returns Validation result with body if successful
 */
export async function validateHubSpotWebhook(
  request: Request,
  appType: 'date-formatter' | 'url-shortener' = 'date-formatter',
  requestUri?: string
): Promise<WebhookValidationResult> {
  try {
    // Check if security can be bypassed in development
    const bypassEnabled = canBypassSecurity();
    
    if (bypassEnabled) {
      console.warn('🚨 WEBHOOK SECURITY BYPASSED - DEV MODE ONLY');
      console.warn(`Environment: ${ConfigManager.getCurrentEnvironment()}, NODE_ENV: ${process.env.NODE_ENV}`);
      console.warn('Set BYPASS_WEBHOOK_SECURITY=false to test real security');
      
      const body = await request.text();
      return {
        isValid: true,
        bypassed: true,
        body
      };
    }

    // Get raw body for signature verification (must be done before any parsing)
    const body = await request.text();
    
    // Extract required security headers
    const signature = request.headers.get('x-hubspot-signature-v3');
    const timestamp = request.headers.get('x-hubspot-request-timestamp');

    // Check for required headers
    if (!signature) {
      return {
        isValid: false,
        error: 'Missing X-HubSpot-Signature-v3 header'
      };
    }

    if (!timestamp) {
      return {
        isValid: false,
        error: 'Missing X-HubSpot-Request-Timestamp header'
      };
    }

    // Validate request origin (additional security layer)
    const originValidation = validateRequestOrigin(request.headers);
    if (!originValidation.isValid) {
      return {
        isValid: false,
        error: originValidation.error
      };
    }

    // Validate timestamp (prevent replay attacks)
    const timestampValidation = validateTimestamp(timestamp);
    if (!timestampValidation.isValid) {
      return {
        isValid: false,
        error: timestampValidation.error
      };
    }

    // Get client secret for the specified app type
    let clientSecret: string;
    try {
      clientSecret = ConfigManager.getHubSpotClientSecret(appType);
    } catch (error) {
      console.error(`[Webhook Security] Failed to get client secret for app type: ${appType}`, error);
      return {
        isValid: false,
        error: `Configuration error for app type: ${appType}`
      };
    }

    // Construct request URI - MUST match what HubSpot registered
    // Use provided URI or fall back to request URL
    let uri: string;
    if (requestUri) {
      uri = requestUri;
    } else {
      // For localhost development, we need to use the ngrok URL that was registered with HubSpot
      // because HubSpot generates signatures based on the registered URL, not the actual request URL
      if (request.url.includes('localhost')) {
        try {
          const fs = await import('fs');
          const path = await import('path');
          const configPath = path.join(process.cwd(), 'config', 'credentials', 'dev.json');
          const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
          const nextjsUrl = config.application.nextjsUrl;
          
          if (nextjsUrl && nextjsUrl.includes('ngrok')) {
            // Replace localhost with the registered ngrok URL
            uri = request.url.replace(/https?:\/\/localhost:\d+/, nextjsUrl);
          } else {
            uri = new URL(request.url).href;
          }
        } catch {
          // Fallback to request URL if config loading fails
          uri = new URL(request.url).href;
        }
      } else {
        // Production: Use actual request URL directly (no file I/O needed)
        uri = new URL(request.url).href;
      }
    }
    const method = request.method || 'POST';

    // Verify signature using HubSpot v3 method
    const signatureValidation = verifyHubSpotSignatureV3(
      method,
      uri,
      body,
      timestamp,
      signature,
      clientSecret
    );

    if (!signatureValidation.isValid) {
      return {
        isValid: false,
        error: signatureValidation.error || 'Invalid webhook signature'
      };
    }

    // All validation passed
    return {
      isValid: true,
      body
    };

  } catch (error) {
    console.error('[Webhook Security] Validation error:', error);
    return {
      isValid: false,
      error: 'Webhook validation failed'
    };
  }
}

/**
 * Creates a standardized error response for security failures
 * Returns 401 Unauthorized for all security validation failures
 * 
 * @param error - Error message
 * @param includeDetails - Whether to include error details in response (dev only)
 * @returns Response object
 */
export function createSecurityErrorResponse(
  error: string,
  includeDetails: boolean = false
): Response {
  const isDev = process.env.NODE_ENV === 'development';
  
  const response = {
    error: 'Unauthorized',
    message: 'Invalid webhook request',
    ...(isDev && includeDetails && { details: error })
  };

  return new Response(JSON.stringify(response), {
    status: 401,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}