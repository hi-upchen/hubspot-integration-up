/**
 * URL Shortener Feature Types
 */

import type { BaseUsageTrackingData } from '@/lib/shared/types';

export interface UrlShortenerRequest {
  urlToShorten: string;
  customDomain?: string;
}

export interface UrlShortenerResponse {
  shortUrl: string;
  longUrl: string;
  customDomain?: string;
  createdAt?: string;
  error?: string;
}

export interface BitlyApiKey {
  id: string;
  portalId: number;
  encryptedApiKey: string;
  createdAt: string;
  updatedAt: string;
  lastUsed?: string;
}

export interface BitlyApiResponse {
  created_at: string;
  id: string;
  link: string;
  custom_bitlinks?: string[];
  long_url: string;
  archived: boolean;
  tags: string[];
  deeplinks: unknown[];
  references: {
    group: string;
  };
}

export interface BitlyErrorResponse {
  message: string;
  resource: string;
  field: string;
  code: string;
  description?: string;
}

export type ErrorType = 
  | 'VALIDATION_ERROR'      // Invalid input (missing URL, etc.)
  | 'AUTHORIZATION_ERROR'   // Portal not authorized
  | 'API_KEY_ERROR'         // Missing/invalid Bitly API key
  | 'RATE_LIMIT_ERROR'      // Bitly rate limiting → Random 5-30min delay
  | 'SERVICE_ERROR'         // Bitly service issues
  | 'SERVER_ERROR';         // Internal server errors

export interface UrlShortenerResult {
  success: boolean;
  shortUrl?: string;
  longUrl?: string;
  domain?: string;
  createdAt?: string;
  error?: string;
}

// URL Shortener specific usage tracking
export interface UrlShortenerUsageData extends BaseUsageTrackingData {
  longUrl?: string;
  shortUrl?: string;
  customDomain?: string;
  responseTimeMs?: number;
  [key: string]: unknown; // Add index signature for compatibility
}

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