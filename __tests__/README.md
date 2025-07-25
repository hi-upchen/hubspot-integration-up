# Date Formatter Test Suite

## Overview

This comprehensive test suite provides thorough coverage for the date formatter functionality, focusing on the critical business logic that powers HubSpot workflow actions.

## Test Structure

### Core Test Files

- **`date-formatter.test.ts`** - Main unit tests covering all core functions
- **`date-formatter-edge-cases.test.ts`** - Specialized edge case testing
- **`date-formatter-comprehensive.test.ts`** - Data-driven comprehensive testing
- **`date-formatter-test-data.ts`** - Test data generators and utilities
- **`integration/date-formatter-api.test.ts`** - API integration tests

### Key Testing Areas

#### 1. 2-Digit Year Boundary Testing (Critical)
- **49/50 boundary**: 49 → 2049, 50 → 1950
- Comprehensive testing of all 2-digit years (00-99)
- Edge cases around boundary transitions
- Consistency across all date formats

#### 2. Leap Year Validation
- Standard leap year rules (divisible by 4)
- Century year exceptions (divisible by 400)
- February 29th validation in both leap and non-leap years
- 2-digit year leap year calculations

#### 3. Format Detection and Parsing
- US format (MM/DD/YYYY)
- UK format (DD/MM/YYYY)
- EU format (DD.MM.YYYY)
- Taiwan format (YYYY年MM月DD日)
- Korea format (YYYY년 MM월 DD일)
- Auto-detection with format priority

#### 4. Custom Format Patterns
- All supported tokens (YYYY, YY, MMMM, MMM, MM, DD, D)
- Complex pattern combinations
- Token replacement order and conflicts
- Special characters and escaping

#### 5. Error Handling
- Invalid date detection (Feb 31, month 13, etc.)
- Malformed input validation
- Meaningful error messages
- Graceful failure modes

#### 6. Performance Testing
- Batch processing (1000+ dates)
- Auto-detection performance with mixed formats
- Memory usage patterns
- Consistent performance across formats

## Running Tests

### Basic Commands
```bash
# Run all tests
npm test

# Run with watch mode during development
npm test:watch

# Generate coverage report
npm test:coverage

# Run CI tests (no watch, with coverage)
npm test:ci

# Run only date formatter tests
npm test:date-formatter
```

### Coverage Requirements

The test suite enforces high coverage standards:
- **Overall**: 85% branches, functions, lines, statements
- **Date Formatter Service**: 95% branches, functions, lines, statements

## Test Data Generators

The `date-formatter-test-data.ts` file provides utilities for generating test cases:

- `generateYearBoundaryTestData()` - 2-digit year boundary tests
- `generateLeapYearTestData()` - Leap year validation tests
- `generateInvalidDateTestData()` - Invalid date detection tests
- `generateFormatConversionMatrix()` - Format conversion tests
- `generateCustomFormatTestData()` - Custom pattern tests
- `generateAutoDetectionTestData()` - Auto-detection tests
- `generateHubSpotWorkflowTestData()` - Real-world scenarios
- `generatePerformanceTestData()` - Performance testing data

## Critical Test Cases

### Year Boundary Tests
```typescript
// Critical boundary cases that must pass
{ input: '49', expected: 2049, description: '49 → 2049 (boundary)' }
{ input: '50', expected: 1950, description: '50 → 1950 (boundary)' }
```

### Leap Year Edge Cases
```typescript
// Century year rules
'02/29/2000' // Valid (divisible by 400)
'02/29/1900' // Invalid (divisible by 100 but not 400)
```

### Format Priority Testing
```typescript
// Auto-detection priority order
'01/02/2025' // Should parse as US format (MM/DD) not UK (DD/MM)
```

## Integration Testing

The integration tests verify the actual API endpoint behavior:

- Real HubSpot webhook payload processing
- Error response handling
- Custom format requests
- Auto-detection scenarios

## Custom Jest Matchers

The test suite includes custom matchers for better assertions:

```typescript
expect(date).toBeValidDate()
expect(date).toHaveYear(2025)
```

## Performance Benchmarks

The test suite includes performance validation:

- 1000 date conversions: < 1000ms
- 300 mixed format auto-detections: < 500ms
- Individual format conversions: < 100ms for 100 iterations

## Best Practices

1. **Test Critical Business Logic**: Focus on the 49/50 year boundary
2. **Use Data-Driven Tests**: Leverage test data generators for comprehensive coverage
3. **Test Error Conditions**: Validate both success and failure paths
4. **Performance Validation**: Ensure scalability for batch operations
5. **Real-World Scenarios**: Test with actual HubSpot data patterns

## Debugging Failed Tests

### Common Issues

1. **Year Boundary Failures**: Check 2-digit year calculation logic
2. **Leap Year Issues**: Verify century year rules (divisible by 400)
3. **Format Detection**: Check format priority order in auto-detection
4. **Custom Patterns**: Ensure token replacement doesn't conflict
5. **Performance Issues**: Profile and optimize slow operations

### Debug Commands

```bash
# Run specific test file
npm test date-formatter.test.ts

# Run with verbose output
npm test -- --verbose

# Run single test case
npm test -- --testNamePattern="should convert year"
```

## Continuous Integration

The test suite is designed for CI/CD environments:

- No watch mode in CI (`--watchAll=false`)
- Coverage reporting enabled
- Deterministic test execution
- Clear failure reporting