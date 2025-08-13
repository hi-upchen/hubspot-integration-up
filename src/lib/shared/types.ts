/**
 * Truly shared types used across multiple features
 * Only put types here that are used by 2+ different domains
 */

// App type is truly shared - used by config, hubspot, and features
export type AppType = 'date-formatter' | 'url-shortener';

// Base tracking interface - extended by features
export interface BaseUsageTrackingData {
  portalId: number;
  success: boolean;
  errorMessage?: string;
  timestamp?: Date;
}

// Generic result type
export interface Result<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

// Generic paginated response
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}