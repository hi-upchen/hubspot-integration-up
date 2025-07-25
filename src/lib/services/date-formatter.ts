import type { DateFormat } from '../types';

/**
 * Date formatter service for converting dates between different formats
 * Supports various input formats and outputs to multiple target formats
 */


/**
 * Converts 2-digit year to 4-digit year following standard conventions
 * 00-49 → 2000-2049, 50-99 → 1950-1999
 */
function parseYear(yearStr: string): number {
  const year = parseInt(yearStr);
  if (year < 100) {
    return year < 50 ? 2000 + year : 1900 + year;
  }
  return year;
}

/**
 * Parses US format date string (MM/DD/YYYY or MM/DD/YY)
 */
function parseUSFormat(dateValue: string): Date {
  const parts = dateValue.split('/');
  if (parts.length !== 3) {
    throw new Error('Invalid US format. Expected MM/DD/YYYY or MM/DD/YY');
  }
  
  const [month, day, year] = parts;
  const fullYear = parseYear(year);
  const date = new Date(fullYear, parseInt(month) - 1, parseInt(day));
  
  if (isNaN(date.getTime())) {
    throw new Error('Invalid date values in US format');
  }
  
  return date;
}

/**
 * Parses UK format date string (DD/MM/YYYY or DD/MM/YY)
 */
function parseUKFormat(dateValue: string): Date {
  const parts = dateValue.split('/');
  if (parts.length !== 3) {
    throw new Error('Invalid UK format. Expected DD/MM/YYYY or DD/MM/YY');
  }
  
  const [day, month, year] = parts;
  const fullYear = parseYear(year);
  const date = new Date(fullYear, parseInt(month) - 1, parseInt(day));
  
  if (isNaN(date.getTime())) {
    throw new Error('Invalid date values in UK format');
  }
  
  return date;
}

/**
 * Parses EU format date string (DD.MM.YYYY or DD.MM.YY)
 */
function parseEUFormat(dateValue: string): Date {
  const parts = dateValue.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid EU format. Expected DD.MM.YYYY or DD.MM.YY');
  }
  
  const [day, month, year] = parts;
  const fullYear = parseYear(year);
  const date = new Date(fullYear, parseInt(month) - 1, parseInt(day));
  
  if (isNaN(date.getTime())) {
    throw new Error('Invalid date values in EU format');
  }
  
  return date;
}

/**
 * Parses Taiwan format date string (YYYY年MM月DD日)
 */
function parseTaiwanFormat(dateValue: string): Date {
  const match = dateValue.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
  if (!match) {
    throw new Error('Invalid Taiwan format. Expected YYYY年MM月DD日');
  }
  
  const [, year, month, day] = match;
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  
  if (isNaN(date.getTime())) {
    throw new Error('Invalid date values in Taiwan format');
  }
  
  return date;
}

/**
 * Parses Korea format date string (YYYY년 MM월 DD일)
 */
function parseKoreaFormat(dateValue: string): Date {
  const match = dateValue.match(/(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/);
  if (!match) {
    throw new Error('Invalid Korea format. Expected YYYY년 MM월 DD일');
  }
  
  const [, year, month, day] = match;
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  
  if (isNaN(date.getTime())) {
    throw new Error('Invalid date values in Korea format');
  }
  
  return date;
}

/**
 * Auto-detects date format and parses accordingly
 */
function autoDetectAndParse(dateValue: string): Date {
  const formats = [
    // ISO DateTime formats
    () => new Date(dateValue),
    // US format MM/DD/YYYY
    () => parseUSFormat(dateValue),
    // UK format DD/MM/YYYY  
    () => parseUKFormat(dateValue),
    // EU format DD.MM.YYYY
    () => parseEUFormat(dateValue),
    // Unix timestamp
    () => new Date(parseInt(dateValue) * 1000),
    // Taiwan format
    () => parseTaiwanFormat(dateValue),
    // Korea format
    () => parseKoreaFormat(dateValue)
  ];
  
  for (const formatFn of formats) {
    try {
      const date = formatFn();
      if (!isNaN(date.getTime())) {
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
      return new Date(dateValue + 'T00:00:00Z');
    case 'US_FORMAT':
      return parseUSFormat(dateValue);
    case 'UK_FORMAT':
      return parseUKFormat(dateValue);
    case 'EU_FORMAT':
      return parseEUFormat(dateValue);
    case 'UNIX_TIMESTAMP':
      return new Date(parseInt(dateValue) * 1000);
    case 'WRITTEN_DATE':
      return new Date(dateValue);
    case 'TAIWAN_FORMAT':
      return parseTaiwanFormat(dateValue);
    case 'KOREA_FORMAT':
      return parseKoreaFormat(dateValue);
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
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const shortMonthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  
  return pattern
    .replace(/YYYY/g, year.toString())
    .replace(/YY/g, year.toString().slice(-2))
    .replace(/MMMM/g, monthNames[month - 1])
    .replace(/MMM/g, shortMonthNames[month - 1])
    .replace(/MM/g, month.toString().padStart(2, '0'))
    .replace(/DD/g, day.toString().padStart(2, '0'))
    .replace(/D/g, day.toString());
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
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  switch (format) {
    case 'US_STANDARD':
      return `${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}/${year}`;
    case 'UK_STANDARD':
      return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
    case 'ISO_STANDARD':
      return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    case 'US_WRITTEN':
      return `${monthNames[month - 1]} ${day}, ${year}`;
    case 'EU_WRITTEN':
      return `${day} ${monthNames[month - 1]} ${year}`;
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