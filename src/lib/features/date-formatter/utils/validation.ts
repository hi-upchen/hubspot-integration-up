/**
 * Date validation utilities for date formatter feature
 */

import type { DateFormat } from '../types';

/**
 * Validates if a string is a valid date
 */
export function isValidDate(dateString: string): boolean {
  if (!dateString || typeof dateString !== 'string') {
    return false;
  }

  const trimmed = dateString.trim();
  if (trimmed === '') {
    return false;
  }

  const date = new Date(trimmed);
  return !isNaN(date.getTime());
}

/**
 * Validates date format enum values
 */
export function isValidDateFormat(format: string): format is DateFormat {
  const validFormats: DateFormat[] = [
    'AUTO', 'HUBSPOT_DATETIME', 'ISO_DATE', 'US_FORMAT', 'UK_FORMAT', 
    'EU_FORMAT', 'UNIX_TIMESTAMP', 'WRITTEN_DATE', 'US_STANDARD', 
    'UK_STANDARD', 'ISO_STANDARD', 'US_WRITTEN', 'EU_WRITTEN',
    'TAIWAN_STANDARD', 'HONG_KONG_STANDARD', 'KOREA_STANDARD', 'CUSTOM'
  ];
  
  return validFormats.includes(format as DateFormat);
}

/**
 * Validates custom format pattern tokens
 */
export function isValidCustomFormat(customFormat: string): boolean {
  if (!customFormat || typeof customFormat !== 'string') {
    return false;
  }

  // Valid tokens: YYYY, YY, MM, M, MMM, MMMM, DD, D
  const validTokens = ['YYYY', 'YY', 'MMMM', 'MMM', 'MM', 'M', 'DD', 'D'];
  
  // Check if format contains at least one valid token
  return validTokens.some(token => customFormat.includes(token));
}

/**
 * Validates if a date string matches expected format patterns
 */
export function validateDateFormatMatch(dateString: string, expectedFormat: DateFormat): boolean {
  if (!dateString || !expectedFormat) {
    return false;
  }

  const trimmed = dateString.trim();
  
  switch (expectedFormat) {
    case 'US_FORMAT':
    case 'US_STANDARD':
      // MM/DD/YYYY or M/D/YYYY
      return /^(0?[1-9]|1[0-2])\/(0?[1-9]|[12]\d|3[01])\/(\d{2}|\d{4})$/.test(trimmed);
      
    case 'UK_FORMAT':
    case 'UK_STANDARD':
      // DD/MM/YYYY or D/M/YYYY
      return /^(0?[1-9]|[12]\d|3[01])\/(0?[1-9]|1[0-2])\/(\d{2}|\d{4})$/.test(trimmed);
      
    case 'EU_FORMAT':
      // DD.MM.YYYY or D.M.YYYY
      return /^(0?[1-9]|[12]\d|3[01])\.(0?[1-9]|1[0-2])\.(\d{2}|\d{4})$/.test(trimmed);
      
    case 'ISO_DATE':
    case 'ISO_STANDARD':
      // YYYY-MM-DD
      return /^\d{4}-\d{2}-\d{2}$/.test(trimmed);
      
    case 'UNIX_TIMESTAMP':
      // Numeric timestamp
      return /^\d+$/.test(trimmed) && !isNaN(parseInt(trimmed));
      
    case 'HUBSPOT_DATETIME':
      // ISO datetime format
      return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/.test(trimmed);
      
    default:
      // For other formats, just check if it's a valid date
      return isValidDate(trimmed);
  }
}

/**
 * Validates complete date formatter request
 */
export function validateDateFormatterRequest(data: {
  sourceDateField?: string;
  sourceFormat?: string;
  targetFormat?: string;
  customTargetFormat?: string;
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.sourceDateField) {
    errors.push('Source date field is required');
  }

  if (!data.sourceFormat) {
    errors.push('Source format is required');
  } else if (!isValidDateFormat(data.sourceFormat)) {
    errors.push('Invalid source format');
  }

  if (!data.targetFormat) {
    errors.push('Target format is required');
  } else if (!isValidDateFormat(data.targetFormat)) {
    errors.push('Invalid target format');
  }

  if (data.targetFormat === 'CUSTOM' && !data.customTargetFormat) {
    errors.push('Custom target format is required when target format is CUSTOM');
  }

  if (data.customTargetFormat && !isValidCustomFormat(data.customTargetFormat)) {
    errors.push('Invalid custom format pattern');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}