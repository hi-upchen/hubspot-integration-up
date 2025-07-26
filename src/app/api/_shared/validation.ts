/**
 * Input validation utilities for API endpoints
 */

import { ValidationError } from './errors';

/**
 * Validates and extracts portal ID from URL search parameters
 */
export function validatePortalId(searchParams: URLSearchParams): number {
  const portalIdParam = searchParams.get('portalId');
  
  if (!portalIdParam) {
    throw new ValidationError('Portal ID is required', 'portalId query parameter is missing');
  }
  
  const portalId = Number(portalIdParam);
  
  if (isNaN(portalId) || portalId <= 0) {
    throw new ValidationError('Valid portal ID is required', 'portalId must be a positive integer');
  }
  
  return portalId;
}

/**
 * Request body interface for updating portal info
 */
export interface UpdatePortalRequest {
  portalId: number;
  userName: string;
  organizationName: string;
}

/**
 * Validates update portal request body
 */
export function validateUpdatePortalRequest(body: any): UpdatePortalRequest {
  if (!body || typeof body !== 'object') {
    throw new ValidationError('Request body is required', 'JSON request body must be provided');
  }
  
  const { portalId, userName, organizationName } = body;
  
  // Validate portal ID
  if (!portalId || typeof portalId !== 'number' || portalId <= 0) {
    throw new ValidationError('Valid portal ID is required', 'portalId must be a positive integer');
  }
  
  // Validate user name
  if (!userName || typeof userName !== 'string' || userName.trim().length === 0) {
    throw new ValidationError('User name is required', 'userName must be a non-empty string');
  }
  
  // Validate organization name
  if (!organizationName || typeof organizationName !== 'string' || organizationName.trim().length === 0) {
    throw new ValidationError('Organization name is required', 'organizationName must be a non-empty string');
  }
  
  return {
    portalId,
    userName: userName.trim(),
    organizationName: organizationName.trim()
  };
}