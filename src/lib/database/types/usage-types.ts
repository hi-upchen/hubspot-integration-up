/**
 * Unified Usage Types
 * Types for the unified usage tracking and aggregation system
 */

export type AppType = 'date-formatter' | 'url-shortener';

/**
 * Database record structure for the usage_monthly table
 */
export interface UsageMonthlyRecord {
  id: string;
  portalId: number;
  appType: AppType;
  monthStart: Date; // First day of month (2025-01-01 for January 2025)
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  lastRequestAt?: Date;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Input data for aggregation operations
 */
export interface AggregationInput {
  portalId: number;
  monthStart: Date; // First day of month
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  lastRequestAt?: Date;
  metadata?: Record<string, unknown>;
}

/**
 * Result of an aggregation operation
 */
export interface AggregationResult {
  success: boolean;
  appType: AppType;
  processedCount: number;
  errorCount: number;
  duration: number; // in seconds
  totalRecords: number;
  lastProcessedTimestamp?: Date;
  error?: string;
}

/**
 * Combined result for all app aggregations
 */
export interface UnifiedAggregationResult {
  success: boolean;
  results: Record<AppType, AggregationResult>;
  summary: {
    totalProcessed: number;
    totalErrors: number;
    totalDuration: number; // in seconds
  };
}

/**
 * App-specific metadata interfaces
 */
export interface AppSpecificMetadata {
  'date-formatter': Record<string, never>; // No extra metadata for date formatter
  'url-shortener': {
    unique_domains_used?: number;
  };
}

/**
 * Configuration for each app's aggregation
 */
export interface AppAggregationConfig {
  sourceTable: string;
  timestampColumn: string;
  monthFormat: string;
}

/**
 * Usage statistics for dashboard display
 */
export interface UsageStatistics {
  portalId: number;
  appType: AppType;
  monthStart: Date;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  successRate: number; // percentage
  metadata?: Record<string, unknown>;
}