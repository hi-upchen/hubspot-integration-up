/**
 * Response formatting utilities for API endpoints
 */

import { NextResponse } from 'next/server';
import { mapServiceError, type ApiError } from './errors';

export interface ApiResponse<T> {
  data: T;
  meta?: {
    portalId?: number;
    timestamp: string;
  };
}

/**
 * Formats successful API response
 */
export function formatSuccessResponse<T>(data: T, portalId?: number): ApiResponse<T> {
  return {
    data,
    meta: {
      ...(portalId && { portalId }),
      timestamp: new Date().toISOString()
    }
  };
}

/**
 * Handles API errors and returns appropriate HTTP response
 */
export function handleApiError(error: unknown): NextResponse {
  const apiError = mapServiceError(error);
  
  // Determine HTTP status code based on error type
  const statusCode = getStatusCodeForError(apiError);
  
  return NextResponse.json(apiError, { status: statusCode });
}

/**
 * Maps API error codes to HTTP status codes
 */
function getStatusCodeForError(apiError: ApiError): number {
  switch (apiError.error.code) {
    case 'INVALID_PORTAL_ID':
    case 'VALIDATION_ERROR':
      return 400; // Bad Request
    
    case 'PORTAL_NOT_FOUND':
      return 404; // Not Found
    
    case 'HUBSPOT_API_ERROR':
      return 502; // Bad Gateway
    
    case 'INTERNAL_ERROR':
    default:
      return 500; // Internal Server Error
  }
}