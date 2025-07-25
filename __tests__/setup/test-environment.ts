/**
 * Test environment setup and global mocks
 * 
 * This file contains:
 * - Console method mocking to reduce test noise
 * - Global environment setup
 * - Mock configurations
 */

// Store original console methods
const originalError = console.error
const originalWarn = console.warn

beforeAll(() => {
  // Mock console.error to filter out known non-critical warnings
  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is deprecated')
    ) {
      return
    }
    originalError.call(console, ...args)
  }

  // Mock console.warn to filter out known non-critical warnings
  console.warn = (...args: unknown[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('componentWillReceiveProps has been renamed')
    ) {
      return
    }
    originalWarn.call(console, ...args)
  }
})

afterAll(() => {
  // Restore original console methods
  console.error = originalError
  console.warn = originalWarn
})

// Additional environment setup can be added here:
// - Global test environment variables
// - Mock service configurations
// - Test database setup
// - etc.