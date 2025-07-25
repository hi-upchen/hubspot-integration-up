import type { DateFormat } from '../types';

/**
 * Date formatter service for converting dates between different formats
 * Supports various input formats and outputs to multiple target formats
 */

/**
 * Constants used throughout the date formatting system
 */
const DATE_CONSTANTS = {
  MONTH_NAMES: [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ] as const,
  
  SHORT_MONTH_NAMES: [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ] as const,
  
  YEAR_BOUNDARY: 50,
  MIN_TIMESTAMP_LENGTH: 8,
  MAX_UNIX_TIMESTAMP: 4102444800,
  MIN_YEAR: 1000,
  MAX_YEAR: 10000
} as const;

/**
 * Validates that a parsed Date object matches the expected component values
 * This prevents JavaScript Date constructor from silently "correcting" invalid dates
 */
function validateParsedDate(
  date: Date, 
  expectedYear: number, 
  expectedMonth: number, 
  expectedDay: number, 
  formatName: string
): void {
  if (isNaN(date.getTime()) || 
      date.getFullYear() !== expectedYear ||
      date.getMonth() !== expectedMonth - 1 ||
      date.getDate() !== expectedDay) {
    throw new Error(`Invalid date values in ${formatName} format`);
  }
}

/**
 * Validates and sanitizes string input for date parsing
 * Only throws for auto-detection, other formats handle their own empty validation
 */
function validateAndSanitizeInput(input: string, formatName: string): string {
  const trimmed = input.trim();
  
  // Only auto-detection should throw for empty input immediately
  // Other format parsers have their own specific error handling
  if (!trimmed && formatName === 'auto-detection') {
    throw new Error('Unable to auto-detect date format');
  }
  
  return trimmed;
}

/**
 * Converts 2-digit year to 4-digit year following standard conventions
 * 00-49 → 2000-2049, 50-99 → 1950-1999
 */
function parseYear(yearStr: string): number {
  const year = parseInt(yearStr);
  if (year < 100) {
    return year < DATE_CONSTANTS.YEAR_BOUNDARY ? 2000 + year : 1900 + year;
  }
  return year;
}

/**
 * Parses US format date string (MM/DD/YYYY or MM/DD/YY)
 */
function parseUSFormat(dateValue: string): Date {
  const cleanValue = validateAndSanitizeInput(dateValue, 'US');
  
  if (!cleanValue) {
    throw new Error('Invalid US format. Expected MM/DD/YYYY or MM/DD/YY');
  }
  
  // Check for spaces around separators (invalid format like "12 / 25 / 2025")
  if (cleanValue.includes(' /') || cleanValue.includes('/ ')) {
    throw new Error('Invalid US format. Expected MM/DD/YYYY or MM/DD/YY');
  }
  
  const parts = cleanValue.split('/');
  if (parts.length !== 3) {
    throw new Error('Invalid US format. Expected MM/DD/YYYY or MM/DD/YY');
  }
  
  const [monthStr, dayStr, yearStr] = parts;
  const month = parseInt(monthStr);
  const day = parseInt(dayStr);
  const fullYear = parseYear(yearStr);
  
  const date = new Date(fullYear, month - 1, day);
  
  validateParsedDate(date, fullYear, month, day, 'US');
  
  return date;
}

/**
 * Parses UK format date string (DD/MM/YYYY or DD/MM/YY)
 */
function parseUKFormat(dateValue: string): Date {
  const cleanValue = validateAndSanitizeInput(dateValue, 'UK');
  
  if (!cleanValue) {
    throw new Error('Invalid UK format. Expected DD/MM/YYYY or DD/MM/YY');
  }
  
  const parts = cleanValue.split('/');
  if (parts.length !== 3) {
    throw new Error('Invalid UK format. Expected DD/MM/YYYY or DD/MM/YY');
  }
  
  const [dayStr, monthStr, yearStr] = parts;
  const day = parseInt(dayStr);
  const month = parseInt(monthStr);
  const fullYear = parseYear(yearStr);
  
  const date = new Date(fullYear, month - 1, day);
  
  validateParsedDate(date, fullYear, month, day, 'UK');
  
  return date;
}

/**
 * Parses EU format date string (DD.MM.YYYY or DD.MM.YY)
 */
function parseEUFormat(dateValue: string): Date {
  const cleanValue = validateAndSanitizeInput(dateValue, 'EU');
  
  const parts = cleanValue.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid EU format. Expected DD.MM.YYYY or DD.MM.YY');
  }
  
  const [dayStr, monthStr, yearStr] = parts;
  const day = parseInt(dayStr);
  const month = parseInt(monthStr);
  const fullYear = parseYear(yearStr);
  
  const date = new Date(fullYear, month - 1, day);
  
  validateParsedDate(date, fullYear, month, day, 'EU');
  
  return date;
}


/**
 * Auto-detects date format and parses accordingly
 * Optimized with early pattern matching to reduce expensive parsing attempts
 */
function autoDetectAndParse(dateValue: string): Date {
  const cleanValue = validateAndSanitizeInput(dateValue, 'auto-detection');
  
  // Early pattern-based detection for common formats to avoid expensive parsing
  
  // ISO DateTime format: contains T or YYYY-MM pattern
  if (cleanValue.includes('T') || /^\d{4}-\d{1,2}/.test(cleanValue)) {
    const date = new Date(cleanValue);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }
  
  // Unix timestamp: pure numeric string with length constraints
  if (/^\d+$/.test(cleanValue)) {
    const timestamp = parseInt(cleanValue);
    if ((timestamp === 0 || cleanValue.length >= DATE_CONSTANTS.MIN_TIMESTAMP_LENGTH) && 
        timestamp >= 0 && 
        timestamp <= DATE_CONSTANTS.MAX_UNIX_TIMESTAMP) {
      return new Date(timestamp * 1000);
    }
  }
  
  // Try format-specific parsers for ambiguous patterns
  const formatAttempts = [
    () => parseUSFormat(cleanValue),   // US format MM/DD/YYYY
    () => parseUKFormat(cleanValue),   // UK format DD/MM/YYYY  
    () => parseEUFormat(cleanValue),   // EU format DD.MM.YYYY
    () => {
      // Fallback to generic Date constructor with strict validation
      if (/^\d{1,4}$/.test(cleanValue) || /^-\d+$/.test(cleanValue) || cleanValue.length < 4) {
        throw new Error('Not a valid date format');
      }
      if (!/[\s\/\.\,\:]/.test(cleanValue) && !/\d+\-\d+/.test(cleanValue)) {
        throw new Error('Not a valid date format');
      }
      if (/^\d{1,2}\/\d{1,2}$/.test(cleanValue) || /^\d{1,2}\.\d{1,2}$/.test(cleanValue)) {
        throw new Error('Incomplete date format');
      }
      const date = new Date(cleanValue);
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date');
      }
      return date;
    }
  ];
  
  for (const formatFn of formatAttempts) {
    try {
      const date = formatFn();
      if (!isNaN(date.getTime()) && 
          date.getFullYear() > DATE_CONSTANTS.MIN_YEAR && 
          date.getFullYear() < DATE_CONSTANTS.MAX_YEAR) {
        return date;
      }
    } catch {
      continue;
    }
  }
  
  throw new Error('Unable to auto-detect date format');
}

/**
 * Parses source date string according to specified format
 * 
 * @param dateValue - Source date string
 * @param sourceFormat - Format of the source date
 * @returns Parsed Date object
 * @throws Error if parsing fails
 */
export function parseSourceDate(dateValue: string, sourceFormat: string): Date {
  switch (sourceFormat) {
    case 'AUTO':
      return autoDetectAndParse(dateValue);
    case 'HUBSPOT_DATETIME':
      return new Date(dateValue);
    case 'ISO_DATE':
    case 'ISO_STANDARD': // ISO_STANDARD produces YYYY-MM-DD format, same as ISO_DATE
      return new Date(dateValue + 'T00:00:00Z');
    case 'US_FORMAT':
    case 'US_STANDARD': // US_STANDARD produces MM/DD/YYYY format, same as US_FORMAT
      return parseUSFormat(dateValue);
    case 'UK_FORMAT':
    case 'UK_STANDARD': // UK_STANDARD produces DD/MM/YYYY format, same as UK_FORMAT
    case 'HONG_KONG_STANDARD': // HONG_KONG_STANDARD also produces DD/MM/YYYY format
      return parseUKFormat(dateValue);
    case 'EU_FORMAT':
      return parseEUFormat(dateValue);
    case 'UNIX_TIMESTAMP':
      return new Date(parseInt(dateValue) * 1000);
    case 'WRITTEN_DATE':
    case 'US_WRITTEN': // US_WRITTEN produces "Month DD, YYYY" format
    case 'EU_WRITTEN': // EU_WRITTEN produces "DD Month YYYY" format
      return new Date(dateValue);
    default:
      throw new Error(`Unsupported source format: ${sourceFormat}`);
  }
}

/**
 * Applies custom format pattern to date
 * 
 * @param date - Date object to format
 * @param pattern - Custom format pattern (e.g., 'DD-MM-YYYY')
 * @returns Formatted date string
 */
function applyCustomFormat(date: Date, pattern: string): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  // Process tokens in order from longest to shortest to avoid conflicts
  // This prevents 'D' from matching inside 'DD' or 'Date'
  return pattern
    .replace(/YYYY/g, year.toString())
    .replace(/MMMM/g, DATE_CONSTANTS.MONTH_NAMES[month - 1])
    .replace(/MMM/g, DATE_CONSTANTS.SHORT_MONTH_NAMES[month - 1])
    .replace(/MM/g, month.toString().padStart(2, '0'))
    .replace(/\bM\b/g, month.toString()) // Single M token (non-padded month)
    .replace(/DD/g, day.toString().padStart(2, '0'))
    .replace(/YY/g, year.toString().slice(-2))
    .replace(/\bD\b/g, day.toString()); // Use word boundaries to avoid replacing 'D' in 'Date'
}

/**
 * Applies predefined format to date
 * 
 * @param date - Date object to format
 * @param format - Predefined format type
 * @returns Formatted date string
 */
function applyPredefinedFormat(date: Date, format: DateFormat): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  switch (format) {
    case 'US_STANDARD':
      return `${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}/${year}`;
    case 'UK_STANDARD':
      return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
    case 'ISO_STANDARD':
      return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    case 'US_WRITTEN':
      return `${DATE_CONSTANTS.MONTH_NAMES[month - 1]} ${day}, ${year}`;
    case 'EU_WRITTEN':
      return `${day} ${DATE_CONSTANTS.MONTH_NAMES[month - 1]} ${year}`;
    case 'TAIWAN_STANDARD':
      return `${year}年${month.toString().padStart(2, '0')}月${day.toString().padStart(2, '0')}日`;
    case 'HONG_KONG_STANDARD':
      return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
    case 'KOREA_STANDARD':
      return `${year}년 ${month.toString().padStart(2, '0')}월 ${day.toString().padStart(2, '0')}일`;
    default:
      throw new Error(`Unsupported target format: ${format}`);
  }
}

/**
 * Main date formatting function
 * 
 * @param inputDate - Source date string
 * @param sourceFormat - Format of the source date
 * @param targetFormat - Desired output format
 * @param customFormat - Custom format pattern (required if targetFormat is 'CUSTOM')
 * @returns Formatted date string
 * @throws Error if formatting fails
 */
export function formatDate(
  inputDate: string, 
  sourceFormat: string, 
  targetFormat: DateFormat, 
  customFormat?: string
): string {
  // Parse the input date
  const date = parseSourceDate(inputDate, sourceFormat);
  
  // Apply target formatting
  if (targetFormat === 'CUSTOM' && customFormat) {
    return applyCustomFormat(date, customFormat);
  }
  
  return applyPredefinedFormat(date, targetFormat);
}