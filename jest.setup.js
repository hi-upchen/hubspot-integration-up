// Jest setup file - Global configuration only
// If you delete this file, remove `setupFilesAfterEnv` from `jest.config.js`

// Testing Library DOM matchers
import '@testing-library/jest-dom'

// Custom Jest matchers
import './__tests__/setup/jest-matchers'

// Test environment setup and mocks
import './__tests__/setup/test-environment'