/**
 * Test utilities barrel export
 * 
 * This file provides a convenient single import point for all test utilities.
 * Usage: import { createTestDate, generateInvalidDates } from '__tests__/utils'
 */

// Date test helpers
export {
  createTestDate,
  formatDateForTest,
  createDateFromComponents,
  isSameDay,
  createInvalidDate,
  getCurrentYear,
  createLeapYearTestDates,
} from './date-test-helpers'

// Test data builders
export {
  generateInvalidDates,
  generateYearBoundaryTests,
  generateExtendedYearBoundaryTests,
  generateMonthDayLimitTests,
  generateLeapYearTestCases,
  generateRandomTestDates,
  generateHubSpotScenarios,
} from './test-data-builders'

// Re-export types for convenience
export type { YearBoundaryTestCase } from './test-data-builders'