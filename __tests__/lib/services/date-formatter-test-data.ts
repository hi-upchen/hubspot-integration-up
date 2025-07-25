/**
 * Test data generators and utilities for date formatter testing
 */

export interface DateTestCase {
  input: string
  sourceFormat: string
  targetFormat: string
  expected: string
  description?: string
}

export interface ValidationTestCase {
  input: string
  format: string
  shouldPass: boolean
  expectedError?: string
  description?: string
}

export interface YearBoundaryTestCase {
  input: string
  expectedYear: number
  description: string
}

/**
 * Generates comprehensive test data for 2-digit year boundary testing
 */
export function generateYearBoundaryTestData(): YearBoundaryTestCase[] {
  const testCases: YearBoundaryTestCase[] = []

  // Critical boundary cases
  testCases.push(
    { input: '49', expectedYear: 2049, description: 'Critical boundary: 49 → 2049' },
    { input: '50', expectedYear: 1950, description: 'Critical boundary: 50 → 1950' }
  )

  // Boundary neighbors
  testCases.push(
    { input: '48', expectedYear: 2048, description: 'Before boundary: 48 → 2048' },
    { input: '51', expectedYear: 1951, description: 'After boundary: 51 → 1951' }
  )

  // Extreme cases
  testCases.push(
    { input: '00', expectedYear: 2000, description: 'Minimum: 00 → 2000' },
    { input: '99', expectedYear: 1999, description: 'Maximum: 99 → 1999' }
  )

  // Decade boundaries
  for (let decade = 0; decade < 10; decade++) {
    const year = decade * 10
    const yearStr = year.toString().padStart(2, '0')
    const expectedYear = year < 50 ? 2000 + year : 1900 + year
    testCases.push({
      input: yearStr,
      expectedYear,
      description: `Decade boundary: ${yearStr} → ${expectedYear}`
    })
  }

  // Random sampling across the range
  const sampleYears = [5, 15, 25, 35, 45, 55, 65, 75, 85, 95]
  sampleYears.forEach(year => {
    const yearStr = year.toString().padStart(2, '0')
    const expectedYear = year < 50 ? 2000 + year : 1900 + year
    testCases.push({
      input: yearStr,
      expectedYear,
      description: `Sample year: ${yearStr} → ${expectedYear}`
    })
  })

  return testCases
}

/**
 * Generates leap year test cases
 */
export function generateLeapYearTestData(): ValidationTestCase[] {
  const testCases: ValidationTestCase[] = []

  // Valid leap years
  const validLeapYears = [
    { year: '2000', description: 'Century year divisible by 400' },
    { year: '2004', description: 'Standard leap year' },
    { year: '2020', description: 'Recent leap year' },
    { year: '2024', description: 'Current leap year' },
    { year: '00', description: '2-digit century leap year' },
    { year: '04', description: '2-digit leap year' },
    { year: '20', description: '2-digit recent leap year' },
    { year: '24', description: '2-digit current leap year' },
  ]

  validLeapYears.forEach(({ year, description }) => {
    testCases.push({
      input: `02/29/${year}`,
      format: 'US_FORMAT',
      shouldPass: true,
      description: `Valid leap year Feb 29: ${description}`
    })
  })

  // Invalid leap years
  const invalidLeapYears = [
    { year: '1900', description: 'Century year not divisible by 400' },
    { year: '2100', description: 'Future century non-leap year' },
    { year: '2021', description: 'Recent non-leap year' },
    { year: '2022', description: 'Recent non-leap year' },
    { year: '2023', description: 'Recent non-leap year' },
    { year: '01', description: '2-digit non-leap year' },
    { year: '02', description: '2-digit non-leap year' },
    { year: '03', description: '2-digit non-leap year' },
  ]

  invalidLeapYears.forEach(({ year, description }) => {
    testCases.push({
      input: `02/29/${year}`,
      format: 'US_FORMAT',
      shouldPass: false,
      expectedError: 'Invalid date values in US format',
      description: `Invalid leap year Feb 29: ${description}`
    })
  })

  return testCases
}

/**
 * Generates invalid date test cases
 */
export function generateInvalidDateTestData(): ValidationTestCase[] {
  const testCases: ValidationTestCase[] = []

  // Invalid days for each month
  const monthDayLimits = [
    { month: '01', maxDay: 31, name: 'January' },
    { month: '02', maxDay: 28, name: 'February (non-leap)' },
    { month: '03', maxDay: 31, name: 'March' },
    { month: '04', maxDay: 30, name: 'April' },
    { month: '05', maxDay: 31, name: 'May' },
    { month: '06', maxDay: 30, name: 'June' },
    { month: '07', maxDay: 31, name: 'July' },
    { month: '08', maxDay: 31, name: 'August' },
    { month: '09', maxDay: 30, name: 'September' },
    { month: '10', maxDay: 31, name: 'October' },
    { month: '11', maxDay: 30, name: 'November' },
    { month: '12', maxDay: 31, name: 'December' },
  ]

  monthDayLimits.forEach(({ month, maxDay, name }) => {
    // Test invalid day (one more than max)
    const invalidDay = maxDay + 1
    testCases.push({
      input: `${month}/${invalidDay.toString().padStart(2, '0')}/2025`,
      format: 'US_FORMAT',
      shouldPass: false,
      expectedError: 'Invalid date values in US format',
      description: `Invalid day for ${name}: day ${invalidDay}`
    })

    // Test day 32 (always invalid)
    testCases.push({
      input: `${month}/32/2025`,
      format: 'US_FORMAT',
      shouldPass: false,
      expectedError: 'Invalid date values in US format',
      description: `Day 32 invalid for ${name}`
    })

    // Test day 0 (always invalid)
    testCases.push({
      input: `${month}/00/2025`,
      format: 'US_FORMAT',
      shouldPass: false,
      expectedError: 'Invalid date values in US format',
      description: `Day 0 invalid for ${name}`
    })
  })

  // Invalid months
  const invalidMonths = ['00', '13', '14', '15', '99']
  invalidMonths.forEach(month => {
    testCases.push({
      input: `${month}/15/2025`,
      format: 'US_FORMAT',
      shouldPass: false,
      expectedError: 'Invalid date values in US format',
      description: `Invalid month: ${month}`
    })
  })

  return testCases
}

/**
 * Generates comprehensive format conversion test matrix
 */
export function generateFormatConversionMatrix(): DateTestCase[] {
  const testCases: DateTestCase[] = []
  
  const baseDate = { month: 7, day: 25, year: 2025 } // July 25, 2025
  
  const sourceFormats = [
    { format: 'US_FORMAT', value: '07/25/2025' },
    { format: 'UK_FORMAT', value: '25/07/2025' },
    { format: 'EU_FORMAT', value: '25.07.2025' },
    { format: 'ISO_DATE', value: '2025-07-25' },
    { format: 'TAIWAN_FORMAT', value: '2025年07月25日' },
    { format: 'KOREA_FORMAT', value: '2025년 07월 25일' },
  ]

  const targetFormatsAndExpected = [
    { format: 'US_STANDARD', expected: '07/25/2025' },
    { format: 'UK_STANDARD', expected: '25/07/2025' },
    { format: 'ISO_STANDARD', expected: '2025-07-25' },
    { format: 'US_WRITTEN', expected: 'July 25, 2025' },
    { format: 'EU_WRITTEN', expected: '25 July 2025' },
    { format: 'TAIWAN_STANDARD', expected: '2025年07月25日' },
    { format: 'HONG_KONG_STANDARD', expected: '25/07/2025' },
    { format: 'KOREA_STANDARD', expected: '2025년 07월 25일' },
  ]

  sourceFormats.forEach(source => {
    targetFormatsAndExpected.forEach(target => {
      testCases.push({
        input: source.value,
        sourceFormat: source.format,
        targetFormat: target.format,
        expected: target.expected,
        description: `Convert ${source.format} to ${target.format}`
      })
    })
  })

  return testCases
}

/**
 * Generates custom format pattern test cases
 */
export function generateCustomFormatTestData(): DateTestCase[] {
  const testCases: DateTestCase[] = []
  const baseInput = '07/25/2025' // July 25, 2025
  const sourceFormat = 'US_FORMAT'

  const customPatterns = [
    { pattern: 'YYYY-MM-DD', expected: '2025-07-25', description: 'ISO-like pattern' },
    { pattern: 'DD/MM/YYYY', expected: '25/07/2025', description: 'UK-like pattern' },
    { pattern: 'MM-DD-YYYY', expected: '07-25-2025', description: 'US with dashes' },
    { pattern: 'YYYY/MM/DD', expected: '2025/07/25', description: 'Japanese-like pattern' },
    { pattern: 'DD.MM.YYYY', expected: '25.07.2025', description: 'German-like pattern' },
    { pattern: 'YY-MM-DD', expected: '25-07-25', description: '2-digit year pattern' },
    { pattern: 'MMM DD, YYYY', expected: 'Jul 25, 2025', description: 'Short month name' },
    { pattern: 'MMMM DD, YYYY', expected: 'July 25, 2025', description: 'Full month name' },
    { pattern: 'DD MMM YYYY', expected: '25 Jul 2025', description: 'European written style' },
    { pattern: 'DD MMMM YYYY', expected: '25 July 2025', description: 'European full written' },
    { pattern: 'D/M/YYYY', expected: '25/7/2025', description: 'No padding pattern' },
    { pattern: 'YYYY年MM月DD日', expected: '2025年07月25日', description: 'Chinese-style pattern' },
  ]

  customPatterns.forEach(({ pattern, expected, description }) => {
    testCases.push({
      input: baseInput,
      sourceFormat,
      targetFormat: 'CUSTOM',
      expected,
      description: `Custom format: ${description}`
    })
  })

  // Test with different input dates to verify padding and edge cases
  const testDates = [
    { input: '01/01/2025', month: 'January', day: 1 },
    { input: '12/31/2025', month: 'December', day: 31 },
    { input: '02/29/2024', month: 'February', day: 29 }, // Leap year
    { input: '06/05/2025', month: 'June', day: 5 },
  ]

  testDates.forEach(({ input, month, day }) => {
    testCases.push({
      input,
      sourceFormat,
      targetFormat: 'CUSTOM',
      expected: `${month} ${day}`,
      description: `Custom pattern with ${month} ${day}: 'MMMM D'`
    })
  })

  return testCases
}

/**
 * Generates auto-detection test cases with various input formats
 */
export function generateAutoDetectionTestData(): ValidationTestCase[] {
  const testCases: ValidationTestCase[] = []

  // Successful auto-detection cases
  const validAutoDetectionCases = [
    { input: '2025-07-25T10:30:00Z', description: 'ISO DateTime format' },
    { input: '2025-07-25', description: 'ISO Date format' },
    { input: '07/25/2025', description: 'US format' },
    { input: '31/12/2025', description: 'Unambiguous UK format' },
    { input: '25.12.2025', description: 'EU format' },
    { input: '2025年07月25日', description: 'Taiwan format' },
    { input: '2025년 07월 25일', description: 'Korea format with spaces' },
    { input: '2025년07월25일', description: 'Korea format without spaces' },
    { input: '1640995200', description: 'Unix timestamp' },
    { input: 'July 25, 2025', description: 'Written English format' },
  ]

  validAutoDetectionCases.forEach(({ input, description }) => {
    testCases.push({
      input,
      format: 'AUTO',
      shouldPass: true,
      description: `Auto-detect success: ${description}`
    })
  })

  // Failed auto-detection cases
  const invalidAutoDetectionCases = [
    { input: 'not-a-date', description: 'Plain text' },
    { input: '99/99/99', description: 'Invalid date values' },
    { input: '32/13/2025', description: 'Invalid day and month' },
    { input: '2025', description: 'Year only' },
    { input: 'January', description: 'Month only' },
    { input: '', description: 'Empty string' },
    { input: '   ', description: 'Whitespace only' },
    { input: '1/2', description: 'Missing year' },
    { input: '1/2/3/4', description: 'Too many parts' },
    { input: '2025年12月', description: 'Incomplete Taiwan format' },
    { input: '2025년 12월', description: 'Incomplete Korea format' },
    { input: 'NaN/NaN/NaN', description: 'NaN values' },
  ]

  invalidAutoDetectionCases.forEach(({ input, description }) => {
    testCases.push({
      input,
      format: 'AUTO',
      shouldPass: false,
      expectedError: 'Unable to auto-detect date format',
      description: `Auto-detect failure: ${description}`
    })
  })

  return testCases
}

/**
 * Generates realistic HubSpot workflow test scenarios
 */
export function generateHubSpotWorkflowTestData(): DateTestCase[] {
  return [
    {
      input: '7/25/25',
      sourceFormat: 'US_FORMAT',
      targetFormat: 'TAIWAN_STANDARD',
      expected: '2025年07月25日',
      description: 'Typical HubSpot 2-digit year to Taiwan format'
    },
    {
      input: '1/5/24',
      sourceFormat: 'US_FORMAT',
      targetFormat: 'ISO_STANDARD',
      expected: '2024-01-05',
      description: 'Single-digit month/day with 2-digit year'
    },
    {
      input: '12/31/99',
      sourceFormat: 'US_FORMAT',
      targetFormat: 'US_WRITTEN',
      expected: 'December 31, 1999',
      description: 'Y2K boundary date'
    },
    {
      input: '2/29/20',
      sourceFormat: 'US_FORMAT',
      targetFormat: 'EU_WRITTEN',
      expected: '29 February 2020',
      description: 'Leap year February 29th'
    },
    {
      input: '6/15/2025',
      sourceFormat: 'AUTO',
      targetFormat: 'KOREA_STANDARD',
      expected: '2025년 06월 15일',
      description: 'Auto-detection with mixed year format'
    },
  ]
}

/**
 * Performance test data generator
 */
export function generatePerformanceTestData(count: number): string[] {
  const dates: string[] = []
  
  for (let i = 0; i < count; i++) {
    const day = (i % 28) + 1 // Valid days 1-28 for all months
    const month = (i % 12) + 1
    const year = 2000 + (i % 50) // Years 2000-2049
    
    dates.push(`${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}/${year}`)
  }
  
  return dates
}

/**
 * Generates mixed format data for auto-detection performance testing
 */
export function generateMixedFormatTestData(count: number): string[] {
  const baseFormats = [
    '2025-01-15', // ISO
    '01/15/2025', // US
    '15/01/2025', // UK
    '15.01.2025', // EU
    '2025년 01월 15일', // Korea
    '2025年01月15日', // Taiwan
  ]
  
  return Array.from({ length: count }, (_, i) => {
    const baseFormat = baseFormats[i % baseFormats.length]
    
    // Vary the dates while keeping the format structure
    const day = ((i % 28) + 1).toString().padStart(2, '0')
    const month = ((i % 12) + 1).toString().padStart(2, '0')
    const year = 2000 + (i % 50)
    
    // Replace the date components in the base format
    return baseFormat
      .replace(/2025/g, year.toString())
      .replace(/01/g, month)
      .replace(/15/g, day)
  })
}