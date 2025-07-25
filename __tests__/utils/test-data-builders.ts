/**
 * Test data builders and generators
 * 
 * This module provides functions to generate test data for various testing scenarios.
 * Separated from Jest setup to follow clean architecture principles.
 */

export interface YearBoundaryTestCase {
  input: string
  expected: number
  description: string
}

/**
 * Generates invalid date strings for validation testing
 * @returns Array of invalid date strings
 */
export function generateInvalidDates(): string[] {
  return [
    '32/01/2025',  // Invalid day
    '01/32/2025',  // Invalid month  
    '29/02/2023',  // Invalid leap year
    '31/04/2025',  // April has only 30 days
    '31/06/2025',  // June has only 30 days
    '31/09/2025',  // September has only 30 days
    '31/11/2025',  // November has only 30 days
    '00/01/2025',  // Zero day
    '01/00/2025',  // Zero month
    '01/13/2025',  // Month > 12
  ]
}

/**
 * Generates test cases for 2-digit year boundary testing
 * Tests the critical 49/50 boundary where years switch centuries
 * @returns Array of year boundary test cases
 */
export function generateYearBoundaryTests(): YearBoundaryTestCase[] {
  return [
    { input: '49', expected: 2049, description: '49 -> 2049 (boundary)' },
    { input: '50', expected: 1950, description: '50 -> 1950 (boundary)' },
    { input: '00', expected: 2000, description: '00 -> 2000' },
    { input: '99', expected: 1999, description: '99 -> 1999' },
    { input: '25', expected: 2025, description: '25 -> 2025' },
    { input: '75', expected: 1975, description: '75 -> 1975' },
  ]
}

/**
 * Generates comprehensive year boundary test cases including edge cases
 * @returns Extended array of year boundary test cases
 */
export function generateExtendedYearBoundaryTests(): YearBoundaryTestCase[] {
  const testCases: YearBoundaryTestCase[] = []

  // Critical boundary cases
  testCases.push(
    { input: '49', expected: 2049, description: 'Critical boundary: 49 → 2049' },
    { input: '50', expected: 1950, description: 'Critical boundary: 50 → 1950' }
  )

  // Boundary neighbors
  testCases.push(
    { input: '48', expected: 2048, description: 'Before boundary: 48 → 2048' },
    { input: '51', expected: 1951, description: 'After boundary: 51 → 1951' }
  )

  // Extreme cases
  testCases.push(
    { input: '00', expected: 2000, description: 'Minimum: 00 → 2000' },
    { input: '99', expected: 1999, description: 'Maximum: 99 → 1999' }
  )

  // Decade boundaries
  for (let decade = 0; decade < 10; decade++) {
    const year = decade * 10
    const yearStr = year.toString().padStart(2, '0')
    const expectedYear = year < 50 ? 2000 + year : 1900 + year
    testCases.push({
      input: yearStr,
      expected: expectedYear,
      description: `Decade boundary: ${yearStr} → ${expectedYear}`
    })
  }

  return testCases
}

/**
 * Generates test cases for months with different day limits
 * @returns Array of objects containing month info and edge cases
 */
export function generateMonthDayLimitTests() {
  return [
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
}

/**
 * Generates leap year test cases for validation
 * @returns Object with valid and invalid leap year test data
 */
export function generateLeapYearTestCases() {
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

  return { validLeapYears, invalidLeapYears }
}

/**
 * Generates random test dates for performance testing
 * @param count - Number of dates to generate
 * @returns Array of date strings in MM/DD/YYYY format
 */
export function generateRandomTestDates(count: number): string[] {
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
 * Generates realistic HubSpot workflow test scenarios
 * @returns Array of test cases mimicking real HubSpot data
 */
export function generateHubSpotScenarios() {
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
  ]
}