/**
 * Date Formatter Feature Types
 */

import type { BaseUsageTrackingData } from '@/lib/shared/types';

// Date formatter specific usage tracking
export interface DateFormatterUsageData extends BaseUsageTrackingData {
  sourceDate?: string;
  sourceFormat?: string;
  targetFormat?: string;
  customTargetFormat?: string;
  formattedDate?: string;
  [key: string]: unknown; // Add index signature for compatibility
}

export type DateFormat = 
  | 'AUTO'
  | 'HUBSPOT_DATETIME' 
  | 'ISO_DATE'
  | 'US_FORMAT'
  | 'UK_FORMAT' 
  | 'EU_FORMAT'
  | 'UNIX_TIMESTAMP'
  | 'WRITTEN_DATE'
  | 'US_STANDARD'
  | 'UK_STANDARD'
  | 'ISO_STANDARD'
  | 'US_WRITTEN'
  | 'EU_WRITTEN'
  | 'TAIWAN_STANDARD'
  | 'HONG_KONG_STANDARD'
  | 'KOREA_STANDARD'
  | 'CUSTOM';

export interface DateFormatterRequest {
  sourceDateField: string;
  sourceFormat: string;
  targetFormat: DateFormat;
  customTargetFormat?: string;
}

// Error codes for date formatting failures
export enum DateFormatterErrorCode {
  MISSING_SOURCE_DATE = 'MISSING_SOURCE_DATE',
  MISSING_SOURCE_FORMAT = 'MISSING_SOURCE_FORMAT',
  MISSING_TARGET_FORMAT = 'MISSING_TARGET_FORMAT', 
  MISSING_CUSTOM_FORMAT = 'MISSING_CUSTOM_FORMAT',
  INVALID_DATE_FORMAT = 'INVALID_DATE_FORMAT',
  EMPTY_DATE_FIELD = 'EMPTY_DATE_FIELD',
  INTERNAL_ERROR = 'INTERNAL_ERROR'
}

export interface DateFormatterResponse {
  hs_execution_state: 'SUCCESS' | 'FAIL_CONTINUE';
  formattedDate: string;
  originalDate: string;
  format: string;
  errorCode?: DateFormatterErrorCode;
  errorMessage?: string;
}