/**
 * HubSpot-compliant error handling utilities for URL shortener webhook
 */

export type ErrorType = 
  | 'VALIDATION_ERROR'      // Invalid input (missing URL, etc.)
  | 'AUTHORIZATION_ERROR'   // Portal not authorized
  | 'API_KEY_ERROR'         // Missing/invalid Bitly API key
  | 'RATE_LIMIT_ERROR'      // Bitly rate limiting → Random 5-30min delay
  | 'SERVICE_ERROR'         // Bitly service issues
  | 'SERVER_ERROR';         // Internal server errors

export interface HubSpotWorkflowResponse {
  outputFields: {
    shortUrl?: string;
    longUrl?: string;
    customDomain?: string;
    createdAt?: string;
    error?: string;
    hs_execution_state: 'SUCCESS' | 'ERROR';
  };
}

export interface ErrorResponseResult {
  response: HubSpotWorkflowResponse;
  httpStatus: number;
  headers?: Record<string, string>;
}

// HTTP status codes for different error types (controls HubSpot retry behavior)
export const ERROR_HTTP_MAPPING = {
  VALIDATION_ERROR: 400,     // Bad Request - User fix needed
  AUTHORIZATION_ERROR: 401,  // Unauthorized - User fix needed  
  API_KEY_ERROR: 400,        // Bad Request - User fix needed
  RATE_LIMIT_ERROR: 429,     // Rate Limited - System will retry
  SERVICE_ERROR: 502,        // Bad Gateway - System will retry
  SERVER_ERROR: 500          // Server Error - System will retry
} as const;

const ERROR_HANDLING_MAP = {
  VALIDATION_ERROR: { 
    httpStatus: 400, 
    executionState: 'ERROR', 
    retry: false,
    reason: 'User configuration error - no retry needed'
  },
  AUTHORIZATION_ERROR: { 
    httpStatus: 401, 
    executionState: 'ERROR', 
    retry: false,
    reason: 'User needs to reinstall app - no retry needed'
  },
  API_KEY_ERROR: { 
    httpStatus: 400, 
    executionState: 'ERROR', 
    retry: false,
    reason: 'User needs to configure API key - no retry needed'
  },
  RATE_LIMIT_ERROR: { 
    httpStatus: 429, 
    executionState: 'ERROR', 
    retry: true,
    delayGenerator: generateRandomRateLimitDelay,
    reason: 'Rate limited - system will retry with delay'
  },
  SERVICE_ERROR: { 
    httpStatus: 502, 
    executionState: 'ERROR', 
    retry: true,
    reason: 'External service issue - system will retry'
  },
  SERVER_ERROR: { 
    httpStatus: 500, 
    executionState: 'ERROR', 
    retry: true,
    reason: 'Internal server error - system will retry'
  }
} as const;

/**
 * Generates a random delay between 5 and 30 minutes for rate limit errors
 * HubSpot respects Retry-After header and retries for up to 3 days
 */
function generateRandomRateLimitDelay(): number {
  const minMinutes = 5;   // Minimum 5 minutes
  const maxMinutes = 30;  // Maximum 30 minutes
  const randomMinutes = Math.floor(Math.random() * (maxMinutes - minMinutes + 1)) + minMinutes;
  return randomMinutes * 60; // Convert to seconds for Retry-After header
}

/**
 * Classifies errors based on error message content
 */
export function classifyError(errorMessage: string): ErrorType {
  const message = errorMessage.toLowerCase();
  
  // Rate limiting errors (system should retry)
  if (message.includes('rate limit') || message.includes('too many requests')) {
    return 'RATE_LIMIT_ERROR';
  }
  
  // API key errors (user configuration)
  if (message.includes('unauthorized') || message.includes('invalid api key') || message.includes('api key')) {
    return 'API_KEY_ERROR';
  }
  
  // Authorization errors (user needs to reinstall)
  if (message.includes('portal not authorized') || message.includes('not authorized')) {
    return 'AUTHORIZATION_ERROR';
  }
  
  // Validation errors (user configuration - including domain errors)
  if (message.includes('required') || 
      message.includes('invalid url') || 
      message.includes('invalid domain') ||
      message.includes('domain') ||
      message.includes('check your') ||
      message.includes('please ')) {
    return 'VALIDATION_ERROR';
  }
  
  // External service errors (system should retry)
  if (message.includes('service unavailable') || 
      message.includes('bitly') || 
      message.includes('timeout') ||
      message.includes('connection')) {
    return 'SERVICE_ERROR';
  }
  
  // Default to server error (system should retry)
  return 'SERVER_ERROR';
}

/**
 * Creates HubSpot-compliant error response with proper HTTP status codes and headers
 * Uses HTTP status codes to control retry behavior, hs_execution_state to control workflow flow
 * Implements smart default behavior without user configuration options
 */
export function createErrorResponse(
  errorType: ErrorType, 
  errorMessage: string, 
  shouldContinue: boolean, // Kept for API compatibility, but ignored
  longUrl?: string
): ErrorResponseResult {
  
  const config = ERROR_HANDLING_MAP[errorType];
  
  // Smart default: All errors stop the workflow
  // HTTP status code controls retry behavior (user config errors won't retry)
  const executionState: 'SUCCESS' | 'ERROR' = 'ERROR';

  const result: ErrorResponseResult = {
    response: {
      outputFields: {
        error: errorMessage,
        longUrl: longUrl,
        hs_execution_state: executionState
      }
    },
    httpStatus: config.httpStatus
  };

  // Add random delay for rate limit errors
  if (errorType === 'RATE_LIMIT_ERROR' && config.delayGenerator) {
    const delaySeconds = config.delayGenerator();
    const delayMinutes = Math.floor(delaySeconds / 60);
    
    return {
      ...result,
      headers: { 
        'Retry-After': delaySeconds.toString()
      },
      response: {
        outputFields: {
          ...result.response.outputFields,
          error: `${errorMessage} Please try again in ${delayMinutes} minutes.`
        }
      }
    };
  }

  return result;
}

/**
 * Creates a success response with proper HubSpot format
 */
export function createSuccessResponse(
  shortUrl: string,
  longUrl: string,
  customDomain?: string,
  createdAt?: string
): HubSpotWorkflowResponse {
  return {
    outputFields: {
      shortUrl,
      longUrl,
      customDomain,
      createdAt,
      hs_execution_state: 'SUCCESS'
    }
  };
}