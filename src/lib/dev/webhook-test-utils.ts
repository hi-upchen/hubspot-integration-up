/**
 * Development Testing Utilities
 * Generate valid HubSpot webhook signatures and requests for testing
 * 
 * These utilities allow developers to:
 * - Generate valid HubSpot v3 signatures for testing
 * - Create complete webhook requests with proper headers
 * - Test signature verification logic without bypassing security
 * - Mock HubSpot requests for Jest tests
 */

import { createHmac } from 'crypto';
import { ConfigManager } from '@/lib/config/config-manager';

export interface TestWebhookRequest {
  body: string;
  headers: Record<string, string>;
  method: string;
  url: string;
}

export interface TestWebhookOptions {
  portalId: number;
  inputFields: Record<string, unknown>;
  appType: 'date-formatter' | 'url-shortener';
  timestamp?: number;
  method?: string;
  baseUrl?: string;
  callbackId?: string;
  actionDefinitionId?: number;
}

export interface TestSignatureOptions {
  method: string;
  uri: string;
  body: string;
  clientSecret: string;
  timestamp?: number;
}

export interface TestSignatureResult {
  signature: string;
  timestamp: string;
  sourceString: string;
}

/**
 * Generates a valid HubSpot v3 signature for testing
 * 
 * Uses the same algorithm as HubSpot:
 * 1. Concatenate: method + uri + body + timestamp
 * 2. Generate HMAC-SHA256 using client secret
 * 3. Base64 encode the result
 * 
 * @param options - Signature generation options
 * @returns Generated signature with metadata
 */
export function generateTestSignature(options: TestSignatureOptions): TestSignatureResult {
  const timestamp = options.timestamp?.toString() || Date.now().toString();
  
  // Create source string (same as HubSpot v3 algorithm)
  const sourceString = options.method + options.uri + options.body + timestamp;
  
  // Generate HMAC-SHA256 signature
  const signature = createHmac('sha256', options.clientSecret)
    .update(sourceString, 'utf8')
    .digest('base64');

  return {
    signature,
    timestamp,
    sourceString
  };
}

/**
 * Generates a complete test webhook request with valid HubSpot headers
 * 
 * Creates a realistic webhook request that will pass signature verification:
 * - Proper request body structure
 * - Valid X-HubSpot-Signature-v3 header
 * - Valid X-HubSpot-Request-Timestamp header  
 * - Appropriate User-Agent and Content-Type
 * 
 * @param options - Request generation options
 * @returns Complete test request object
 */
export function generateTestWebhookRequest(options: TestWebhookOptions): TestWebhookRequest {
  const {
    portalId,
    inputFields,
    appType,
    method = 'POST',
    baseUrl = 'https://localhost:3000',
    callbackId = `test-callback-${Date.now()}`,
    actionDefinitionId = Math.floor(Math.random() * 1000000),
    timestamp = Date.now()
  } = options;

  // Create webhook request body (matches HubSpot structure)
  const webhookBody = {
    callbackId,
    origin: {
      portalId,
      actionDefinitionId
    },
    inputFields
  };

  const body = JSON.stringify(webhookBody);
  const uri = `${baseUrl}/api/webhook/${appType}`;

  // Get client secret for signature generation
  let clientSecret: string;
  try {
    clientSecret = ConfigManager.getHubSpotClientSecret(appType);
  } catch (error) {
    console.warn(`[Test Utils] Using fallback client secret for ${appType}:`, error);
    // Fallback for tests when config might not be available
    clientSecret = `test-${appType}-client-secret`;
  }

  // Generate valid signature
  const signatureResult = generateTestSignature({
    method,
    uri,
    body,
    clientSecret,
    timestamp
  });

  // Create complete request with headers
  return {
    body,
    method,
    url: uri,
    headers: {
      'X-HubSpot-Signature-v3': signatureResult.signature,
      'X-HubSpot-Request-Timestamp': signatureResult.timestamp,
      'User-Agent': 'HubSpot Webhooks',
      'Content-Type': 'application/json'
    }
  };
}

/**
 * Creates a mock Request object for Jest tests
 * 
 * Generates a realistic Next.js Request object that can be used
 * in Jest tests to verify webhook security logic
 * 
 * @param testRequest - Test request data
 * @returns Mock Request object
 */
export function createMockHubSpotRequest(testRequest: TestWebhookRequest): Request {
  const headers = new Headers(testRequest.headers);
  
  return new Request(testRequest.url, {
    method: testRequest.method,
    headers,
    body: testRequest.body
  });
}

/**
 * Validates that a test signature was generated correctly
 * 
 * Useful for debugging signature generation issues
 * 
 * @param signature - Generated signature
 * @param method - HTTP method
 * @param uri - Request URI
 * @param body - Request body
 * @param timestamp - Request timestamp
 * @param clientSecret - Client secret used
 * @returns Whether the signature is valid
 */
export function validateTestSignature(
  signature: string,
  method: string,
  uri: string,
  body: string,
  timestamp: string,
  clientSecret: string
): boolean {
  try {
    const expectedSignature = generateTestSignature({
      method,
      uri,
      body,
      clientSecret,
      timestamp: parseInt(timestamp)
    });

    return signature === expectedSignature.signature;
  } catch (error) {
    console.error('[Test Utils] Signature validation error:', error);
    return false;
  }
}

/**
 * Creates test data for common webhook scenarios
 * 
 * Pre-built test cases for different webhook types and scenarios
 */
export const testScenarios = {
  dateFormatter: {
    valid: {
      portalId: 123456,
      inputFields: {
        sourceDateField: '01/15/2025',
        sourceFormat: 'US_STANDARD',
        targetFormat: 'UK_STANDARD'
      },
      appType: 'date-formatter' as const
    },
    withCustomFormat: {
      portalId: 123456,
      inputFields: {
        sourceDateField: '2025-01-15',
        sourceFormat: 'ISO_DATE',
        targetFormat: 'CUSTOM',
        customTargetFormat: 'MM/DD/YYYY'
      },
      appType: 'date-formatter' as const
    },
    emptyDate: {
      portalId: 123456,
      inputFields: {
        sourceDateField: '',
        sourceFormat: 'AUTO',
        targetFormat: 'US_STANDARD'
      },
      appType: 'date-formatter' as const
    }
  },
  urlShortener: {
    valid: {
      portalId: 789012,
      inputFields: {
        urlToShorten: 'https://example.com/very-long-url-that-needs-shortening',
        customDomain: ''
      },
      appType: 'url-shortener' as const
    },
    withCustomDomain: {
      portalId: 789012,
      inputFields: {
        urlToShorten: 'https://example.com/another-long-url',
        customDomain: 'yourbrand.co'
      },
      appType: 'url-shortener' as const
    },
    invalidUrl: {
      portalId: 789012,
      inputFields: {
        urlToShorten: 'not-a-valid-url',
        customDomain: ''
      },
      appType: 'url-shortener' as const
    }
  }
};

/**
 * Helper function to create test requests for all scenarios
 * 
 * @param scenarioName - Name of the scenario to generate
 * @returns Test request object
 */
export function createTestScenario(scenarioName: keyof typeof testScenarios): Record<string, TestWebhookRequest> {
  const scenarios = testScenarios[scenarioName];
  const result: Record<string, TestWebhookRequest> = {};

  for (const [name, options] of Object.entries(scenarios)) {
    result[name] = generateTestWebhookRequest(options);
  }

  return result;
}

/**
 * Development helper: Pretty-print test request for debugging
 * 
 * @param testRequest - Test request to display
 */
export function debugTestRequest(testRequest: TestWebhookRequest): void {
  console.log('\n=== Test Webhook Request Debug ===');
  console.log('Method:', testRequest.method);
  console.log('URL:', testRequest.url);
  console.log('Headers:');
  Object.entries(testRequest.headers).forEach(([key, value]) => {
    console.log(`  ${key}: ${value}`);
  });
  console.log('Body:');
  console.log(JSON.stringify(JSON.parse(testRequest.body), null, 2));
  console.log('================================\n');
}

/**
 * Development helper: Generate curl command for testing
 * 
 * @param testRequest - Test request to convert to curl
 * @param targetUrl - Override URL for curl command
 * @returns Curl command string
 */
export function generateCurlCommand(testRequest: TestWebhookRequest, targetUrl?: string): string {
  const url = targetUrl || testRequest.url;
  const headerFlags = Object.entries(testRequest.headers)
    .map(([key, value]) => `-H "${key}: ${value}"`)
    .join(' ');
  
  return `curl -X ${testRequest.method} ${url} ${headerFlags} -d '${testRequest.body}'`;
}

/**
 * Jest helper: Create mock functions with valid signatures
 * 
 * Sets up Jest mocks that return valid HubSpot webhook data
 */
export function setupValidWebhookMocks() {
  // Mock ConfigManager to return test client secrets
  jest.mock('@/lib/config/config-manager', () => ({
    ConfigManager: {
      getHubSpotClientSecret: jest.fn((appType: string) => `test-${appType}-client-secret`),
      getCurrentEnvironment: jest.fn(() => 'dev')
    }
  }));

  return {
    dateFormatterSecret: 'test-date-formatter-client-secret',
    urlShortenerSecret: 'test-url-shortener-client-secret'
  };
}