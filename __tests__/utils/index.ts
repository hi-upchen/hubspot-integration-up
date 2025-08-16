/**
 * Test utilities barrel export
 * 
 * This file provides a convenient single import point for all test utilities.
 * Usage: import { generateInvalidDates } from '__tests__/utils'
 */

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