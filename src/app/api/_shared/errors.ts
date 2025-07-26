/**
 * API Error handling utilities
 */

export const API_ERROR_CODES = {
  INVALID_PORTAL_ID: 'INVALID_PORTAL_ID',
  PORTAL_NOT_FOUND: 'PORTAL_NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  HUBSPOT_API_ERROR: 'HUBSPOT_API_ERROR'
} as const;

export type ApiErrorCode = typeof API_ERROR_CODES[keyof typeof API_ERROR_CODES];

export interface ApiError {
  error: {
    code: ApiErrorCode;
    message: string;
    details?: string;
  };
}

export class ValidationError extends Error {
  constructor(message: string, public details?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class PortalNotFoundError extends Error {
  constructor(public portalId: number) {
    super(`Portal ${portalId} not found`);
    this.name = 'PortalNotFoundError';
  }
}

/**
 * Maps service layer errors to API error responses
 */
export function mapServiceError(error: unknown): ApiError {
  if (error instanceof ValidationError) {
    return {
      error: {
        code: API_ERROR_CODES.VALIDATION_ERROR,
        message: error.message,
        details: error.details
      }
    };
  }
  
  if (error instanceof PortalNotFoundError) {
    return {
      error: {
        code: API_ERROR_CODES.PORTAL_NOT_FOUND,
        message: 'Portal not found',
        details: `Portal ID ${error.portalId} does not exist`
      }
    };
  }
  
  if (error instanceof Error && error.message.includes('HubSpot')) {
    return {
      error: {
        code: API_ERROR_CODES.HUBSPOT_API_ERROR,
        message: 'HubSpot API error',
        details: error.message
      }
    };
  }
  
  // Default internal error
  console.error('Unexpected API error:', error);
  return {
    error: {
      code: API_ERROR_CODES.INTERNAL_ERROR,
      message: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  };
}