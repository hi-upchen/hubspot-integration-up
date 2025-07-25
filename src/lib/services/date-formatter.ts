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
  const cleanValue = dateValue.trim();
  
  // Check for spaces around separators (invalid format like "12 / 25 / 2025")
  if (cleanValue.includes(' /') || cleanValue.includes('/ ')) {
    throw new Error('Invalid US format. Expected MM/DD/YYYY or MM/DD/YY');
  }
  
  const parts = cleanValue.split('/');
  if (parts.length !== 3) {
    throw new Error('Invalid US format. Expected MM/DD/YYYY or MM/DD/YY');
  }
  
  const [month, day, year] = parts;
  
  const fullYear = parseYear(year);
  const date = new Date(fullYear, parseInt(month) - 1, parseInt(day));
  
  // Strict validation: ensure the Date constructor didn't "correct" invalid values
  if (isNaN(date.getTime()) || 
      date.getFullYear() !== fullYear ||
      date.getMonth() !== parseInt(month) - 1 ||
      date.getDate() !== parseInt(day)) {
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
  
  // Strict validation: ensure the Date constructor didn't "correct" invalid values
  if (isNaN(date.getTime()) || 
      date.getFullYear() !== fullYear ||
      date.getMonth() !== parseInt(month) - 1 ||
      date.getDate() !== parseInt(day)) {
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
  
  // Strict validation: ensure the Date constructor didn't "correct" invalid values
  if (isNaN(date.getTime()) || 
      date.getFullYear() !== fullYear ||
      date.getMonth() !== parseInt(month) - 1 ||
      date.getDate() !== parseInt(day)) {
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
  const fullYear = parseInt(year);
  const date = new Date(fullYear, parseInt(month) - 1, parseInt(day));
  
  // Strict validation: ensure the Date constructor didn't "correct" invalid values
  if (isNaN(date.getTime()) || 
      date.getFullYear() !== fullYear ||
      date.getMonth() !== parseInt(month) - 1 ||
      date.getDate() !== parseInt(day)) {
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
  const fullYear = parseInt(year);
  const date = new Date(fullYear, parseInt(month) - 1, parseInt(day));
  
  // Strict validation: ensure the Date constructor didn't "correct" invalid values
  if (isNaN(date.getTime()) || 
      date.getFullYear() !== fullYear ||
      date.getMonth() !== parseInt(month) - 1 ||
      date.getDate() !== parseInt(day)) {
    throw new Error('Invalid date values in Korea format');
  }
  
  return date;
}

/**
 * Auto-detects date format and parses accordingly
 */
function autoDetectAndParse(dateValue: string): Date {
  // Trim whitespace from input
  const cleanValue = dateValue.trim();
  
  if (!cleanValue) {
    throw new Error('Unable to auto-detect date format');
  }
  
  const formats = [
    // Taiwan format - check first to avoid Unix timestamp confusion
    () => parseTaiwanFormat(cleanValue),
    // Korea format - check early to avoid Unix timestamp confusion
    () => parseKoreaFormat(cleanValue),
    // ISO DateTime formats (includes ISO dates like 2025-01-01)
    () => {
      const date = new Date(cleanValue);
      // Validate that it's a reasonable ISO format (contains dashes or T, but not just a negative number)
      // Must have either T for datetime or at least YYYY-MM pattern for dates
      if (!isNaN(date.getTime()) && 
          (cleanValue.includes('T') || /^\d{4}-\d{1,2}/.test(cleanValue))) {
        return date;
      }
      throw new Error('Not ISO format');
    },
    // US format MM/DD/YYYY
    () => parseUSFormat(cleanValue),
    // UK format DD/MM/YYYY  
    () => parseUKFormat(cleanValue),
    // EU format DD.MM.YYYY
    () => parseEUFormat(cleanValue),
    // Unix timestamp - check last and be more strict
    () => {
      // Only consider pure numeric strings as potential Unix timestamps (no negative signs)
      if (!/^\d+$/.test(cleanValue)) {
        throw new Error('Not a Unix timestamp');
      }
      const timestamp = parseInt(cleanValue);
      // Unix timestamps should be either 0 (epoch) or reasonably long (at least 8 digits for dates after 1973)
      // and within reasonable range (1970-2100). Exclude short numbers like "2025" which
      // are more likely to be years than timestamps unless they're the special case of 0
      if ((timestamp !== 0 && cleanValue.length < 8) || timestamp < 0 || timestamp > 4102444800) {
        throw new Error('Unix timestamp out of range');
      }
      return new Date(timestamp * 1000);
    },
    // Fallback to generic Date constructor for other formats
    // But be more strict - don't accept simple year numbers, single words, or partial dates
    () => {
      // Reject simple 4-digit years, single words, very short strings, or negative numbers
      if (/^\d{1,4}$/.test(cleanValue) || /^-\d+$/.test(cleanValue) || cleanValue.length < 4) {
        throw new Error('Not a valid date format');
      }
      // Must contain date separators but not start with them
      if (!/[\s\/\.\,\:]/.test(cleanValue) && !/\d+\-\d+/.test(cleanValue)) {
        throw new Error('Not a valid date format');
      }
      // Reject incomplete date formats like "1/2" (missing year)
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
  
  for (const formatFn of formats) {
    try {
      const date = formatFn();
      if (!isNaN(date.getTime()) && date.getFullYear() > 1000 && date.getFullYear() < 10000) {
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
    case 'TAIWAN_FORMAT':
    case 'TAIWAN_STANDARD': // TAIWAN_STANDARD produces YYYY年MM月DD日 format, same as TAIWAN_FORMAT
      return parseTaiwanFormat(dateValue);
    case 'KOREA_FORMAT':
    case 'KOREA_STANDARD': // KOREA_STANDARD produces YYYY년 MM월 DD일 format, same as KOREA_FORMAT
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
  
  // Process tokens in order from longest to shortest to avoid conflicts
  // This prevents 'D' from matching inside 'DD' or 'Date'
  return pattern
    .replace(/YYYY/g, year.toString())
    .replace(/MMMM/g, monthNames[month - 1])
    .replace(/MMM/g, shortMonthNames[month - 1])
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