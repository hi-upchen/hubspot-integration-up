/**
 * Date-specific test helper functions
 * 
 * This module provides utilities for creating and manipulating dates in tests.
 * These are simple, focused helper functions that support date testing scenarios.
 */

/**
 * Creates a consistent test date object
 * @param year - Full year (e.g., 2025)
 * @param month - Month (1-12, not 0-11)
 * @param day - Day of month (1-31)
 * @returns Date object for testing
 */
export function createTestDate(year: number, month: number, day: number): Date {
  return new Date(year, month - 1, day)
}

/**
 * Formats a date for consistent string comparison in tests
 * @param date - Date object to format
 * @returns ISO date string (YYYY-MM-DD format)
 */
export function formatDateForTest(date: Date): string {
  return date.toISOString().split('T')[0]
}

/**
 * Creates a Date object from date components for testing
 * @param year - Year (2 or 4 digits)
 * @param month - Month (1-12)
 * @param day - Day (1-31)
 * @returns Date object
 */
export function createDateFromComponents(year: number, month: number, day: number): Date {
  // Handle 2-digit years using the same logic as the date formatter
  const fullYear = year < 100 ? (year < 50 ? 2000 + year : 1900 + year) : year
  return new Date(fullYear, month - 1, day)
}

/**
 * Checks if two dates represent the same day (ignoring time)
 * @param date1 - First date
 * @param date2 - Second date
 * @returns True if dates are the same day
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

/**
 * Creates a date that is guaranteed to be invalid for testing error conditions
 * @returns Invalid Date object
 */
export function createInvalidDate(): Date {
  return new Date('invalid')
}

/**
 * Gets the current year for boundary testing
 * @returns Current year as number
 */
export function getCurrentYear(): number {
  return new Date().getFullYear()
}

/**
 * Creates test dates for leap year scenarios
 * @param year - Year to test (can be 2 or 4 digits)
 * @returns Object with leap year test dates
 */
export function createLeapYearTestDates(year: number) {
  const fullYear = year < 100 ? (year < 50 ? 2000 + year : 1900 + year) : year
  
  return {
    leapDay: new Date(fullYear, 1, 29), // Feb 29
    dayBefore: new Date(fullYear, 1, 28), // Feb 28
    dayAfter: new Date(fullYear, 2, 1), // Mar 1
    isLeapYear: ((fullYear % 4 === 0 && fullYear % 100 !== 0) || fullYear % 400 === 0)
  }
}