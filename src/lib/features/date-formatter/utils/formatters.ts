/**
 * Date format conversion utilities
 * Contains specific format conversion logic extracted from main date formatter
 */

import type { DateFormat } from '../types';

/**
 * Converts Date object to specified format string
 */
export function formatDateToString(date: Date, format: DateFormat, customFormat?: string): string {
  switch (format) {
    case 'US_STANDARD':
      return formatUSStandard(date);
    case 'UK_STANDARD':
      return formatUKStandard(date);
    case 'ISO_STANDARD':
      return formatISOStandard(date);
    case 'US_WRITTEN':
      return formatUSWritten(date);
    case 'EU_WRITTEN':
      return formatEUWritten(date);
    case 'TAIWAN_STANDARD':
      return formatTaiwanStandard(date);
    case 'HONG_KONG_STANDARD':
      return formatHongKongStandard(date);
    case 'KOREA_STANDARD':
      return formatKoreaStandard(date);
    case 'CUSTOM':
      if (!customFormat) {
        throw new Error('Custom format pattern is required');
      }
      return formatCustom(date, customFormat);
    default:
      throw new Error(`Unsupported target format: ${format}`);
  }
}

/**
 * US Standard format: MM/DD/YYYY
 */
function formatUSStandard(date: Date): string {
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const year = date.getFullYear().toString();
  return `${month}/${day}/${year}`;
}

/**
 * UK Standard format: DD/MM/YYYY
 */
function formatUKStandard(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear().toString();
  return `${day}/${month}/${year}`;
}

/**
 * ISO Standard format: YYYY-MM-DD
 */
function formatISOStandard(date: Date): string {
  const year = date.getFullYear().toString();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * US Written format: January 24, 2025
 */
function formatUSWritten(date: Date): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  return `${month} ${day}, ${year}`;
}

/**
 * EU Written format: 24 January 2025
 */
function formatEUWritten(date: Date): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

/**
 * Taiwan Standard format: 2025年01月24日
 */
function formatTaiwanStandard(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}年${month}月${day}日`;
}

/**
 * Hong Kong Standard format: 24/01/2025 (same as UK)
 */
function formatHongKongStandard(date: Date): string {
  return formatUKStandard(date);
}

/**
 * Korea Standard format: 2025년 01월 24일
 */
function formatKoreaStandard(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}년 ${month}월 ${day}일`;
}

/**
 * Custom format using tokens
 */
function formatCustom(date: Date, customFormat: string): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const shortMonths = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  let result = customFormat;

  // Replace tokens with actual values
  result = result.replace(/YYYY/g, year.toString());
  result = result.replace(/YY/g, (year % 100).toString().padStart(2, '0'));
  result = result.replace(/MMMM/g, months[date.getMonth()]);
  result = result.replace(/MMM/g, shortMonths[date.getMonth()]);
  result = result.replace(/MM/g, month.toString().padStart(2, '0'));
  result = result.replace(/M/g, month.toString());
  result = result.replace(/DD/g, day.toString().padStart(2, '0'));
  result = result.replace(/D/g, day.toString());

  return result;
}

/**
 * Parse various date formats into Date object
 */
export function parseStringToDate(dateString: string, sourceFormat: DateFormat): Date {
  if (!dateString || dateString.trim() === '') {
    throw new Error('Date string cannot be empty');
  }

  const trimmed = dateString.trim();

  switch (sourceFormat) {
    case 'AUTO':
      return parseAutoDetect(trimmed);
    case 'HUBSPOT_DATETIME':
      return parseHubSpotDateTime(trimmed);
    case 'ISO_DATE':
      return parseISODate(trimmed);
    case 'US_FORMAT':
      return parseUSFormat(trimmed);
    case 'UK_FORMAT':
      return parseUKFormat(trimmed);
    case 'EU_FORMAT':
      return parseEUFormat(trimmed);
    case 'UNIX_TIMESTAMP':
      return parseUnixTimestamp(trimmed);
    case 'WRITTEN_DATE':
      return parseWrittenDate(trimmed);
    default:
      // For standard formats, try standard Date parsing
      const parsed = new Date(trimmed);
      if (isNaN(parsed.getTime())) {
        throw new Error(`Unable to parse date: ${trimmed}`);
      }
      return parsed;
  }
}

function parseAutoDetect(dateString: string): Date {
  // Try various common formats
  const date = new Date(dateString);
  if (!isNaN(date.getTime())) {
    return date;
  }

  // Try Unix timestamp
  if (/^\d+$/.test(dateString)) {
    return parseUnixTimestamp(dateString);
  }

  // Try US format MM/DD/YYYY
  if (/^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(dateString)) {
    return parseUSFormat(dateString);
  }

  // Try UK format DD/MM/YYYY  
  if (/^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(dateString)) {
    return parseUKFormat(dateString);
  }

  throw new Error(`Unable to auto-detect date format: ${dateString}`);
}

function parseHubSpotDateTime(dateString: string): Date {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid HubSpot datetime format: ${dateString}`);
  }
  return date;
}

function parseISODate(dateString: string): Date {
  const date = new Date(dateString + 'T00:00:00.000Z');
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid ISO date format: ${dateString}`);
  }
  return date;
}

function parseUSFormat(dateString: string): Date {
  const match = dateString.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (!match) {
    throw new Error(`Invalid US date format: ${dateString}`);
  }

  let [, month, day, year] = match;
  
  // Handle 2-digit years: 00-49 → 2000-2049, 50-99 → 1950-1999
  if (year.length === 2) {
    const yearNum = parseInt(year);
    year = (yearNum <= 49 ? 2000 + yearNum : 1900 + yearNum).toString();
  }

  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date values: ${dateString}`);
  }
  return date;
}

function parseUKFormat(dateString: string): Date {
  const match = dateString.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (!match) {
    throw new Error(`Invalid UK date format: ${dateString}`);
  }

  let [, day, month, year] = match;
  
  // Handle 2-digit years
  if (year.length === 2) {
    const yearNum = parseInt(year);
    year = (yearNum <= 49 ? 2000 + yearNum : 1900 + yearNum).toString();
  }

  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date values: ${dateString}`);
  }
  return date;
}

function parseEUFormat(dateString: string): Date {
  const match = dateString.match(/^(\d{1,2})\.(\d{1,2})\.(\d{2,4})$/);
  if (!match) {
    throw new Error(`Invalid EU date format: ${dateString}`);
  }

  let [, day, month, year] = match;
  
  // Handle 2-digit years
  if (year.length === 2) {
    const yearNum = parseInt(year);
    year = (yearNum <= 49 ? 2000 + yearNum : 1900 + yearNum).toString();
  }

  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date values: ${dateString}`);
  }
  return date;
}

function parseUnixTimestamp(dateString: string): Date {
  const timestamp = parseInt(dateString);
  if (isNaN(timestamp)) {
    throw new Error(`Invalid Unix timestamp: ${dateString}`);
  }

  // Handle both seconds and milliseconds timestamps
  const date = timestamp > 9999999999 
    ? new Date(timestamp) // milliseconds
    : new Date(timestamp * 1000); // seconds

  if (isNaN(date.getTime())) {
    throw new Error(`Invalid timestamp: ${dateString}`);
  }
  return date;
}

function parseWrittenDate(dateString: string): Date {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    throw new Error(`Unable to parse written date: ${dateString}`);
  }
  return date;
}