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

export interface DateFormatterResponse {
  formattedDate: string;
  originalDate: string;
  format: string;
  error?: string;
}