/**
 * Custom Jest matchers for date testing
 * 
 * This file contains only Jest matcher extensions following best practices:
 * - Simple, focused matchers
 * - Clear error messages
 * - Type-safe implementations
 */

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidDate(): R
      toHaveYear(expectedYear: number): R
    }
  }
}

// Export empty object to make this a module
export {}

expect.extend({
  /**
   * Checks if the received value is a valid Date object
   */
  toBeValidDate(received: unknown) {
    const pass = received instanceof Date && !isNaN(received.getTime())
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid Date`,
        pass: true,
      }
    } else {
      return {
        message: () => `expected ${received} to be a valid Date`,
        pass: false,
      }
    }
  },
  
  /**
   * Checks if a Date object has the specified year
   */
  toHaveYear(received: unknown, expectedYear: number) {
    if (!(received instanceof Date)) {
      return {
        message: () => `expected ${received} to be a Date object`,
        pass: false,
      }
    }
    
    const actualYear = received.getFullYear()
    const pass = actualYear === expectedYear
    
    if (pass) {
      return {
        message: () => `expected ${received} not to have year ${expectedYear}`,
        pass: true,
      }
    } else {
      return {
        message: () => `expected ${received} to have year ${expectedYear}, but got ${actualYear}`,
        pass: false,
      }
    }
  },
})