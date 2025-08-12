import { parseSourceDate, formatDate } from '@/lib/features/date-formatter/services/date-formatter'
import type { DateFormat } from '@/lib/types'
import {
  generateYearBoundaryTestData,
  generateLeapYearTestData,
  generateInvalidDateTestData,
  generateFormatConversionMatrix,
  generateCustomFormatTestData,
  generateAutoDetectionTestData,
  generateHubSpotWorkflowTestData,
  generatePerformanceTestData,
  generateMixedFormatTestData,
} from './date-formatter-test-data'

describe('Date Formatter - Comprehensive Test Suite', () => {
  describe('2-digit year boundary testing (data-driven)', () => {
    const yearBoundaryTestData = generateYearBoundaryTestData()

    test.each(yearBoundaryTestData)(
      'should convert year $input to $expectedYear: $description',
      ({ input, expectedYear }) => {
        const dateString = `01/01/${input}`
        const result = parseSourceDate(dateString, 'US_FORMAT')
        expect(result.getFullYear()).toBe(expectedYear)
      }
    )

    test('critical 49/50 boundary verification', () => {
      const date49 = parseSourceDate('01/01/49', 'US_FORMAT')
      const date50 = parseSourceDate('01/01/50', 'US_FORMAT')
      
      expect(date49.getFullYear()).toBe(2049)
      expect(date50.getFullYear()).toBe(1950)
      
      // Verify the century gap
      expect(date49.getFullYear() - date50.getFullYear()).toBe(99)
    })
  })

  describe('Leap year validation (data-driven)', () => {
    const leapYearTestData = generateLeapYearTestData()

    test.each(leapYearTestData.filter(t => t.shouldPass))(
      'should accept valid leap year date: $description',
      ({ input, format }) => {
        const result = parseSourceDate(input, format)
        expect(result).toBeValidDate()
        expect(result.getMonth()).toBe(1) // February
        expect(result.getDate()).toBe(29)
      }
    )

    test.each(leapYearTestData.filter(t => !t.shouldPass))(
      'should reject invalid leap year date: $description',
      ({ input, format, expectedError }) => {
        expect(() => parseSourceDate(input, format)).toThrow(expectedError)
      }
    )
  })

  describe('Invalid date detection (data-driven)', () => {
    const invalidDateTestData = generateInvalidDateTestData()

    test.each(invalidDateTestData)(
      'should reject invalid date: $description',
      ({ input, format, expectedError }) => {
        expect(() => parseSourceDate(input, format)).toThrow(expectedError)
      }
    )

    test('should validate month boundaries correctly', () => {
      // Test all months have correct day limits
      const monthDayLimits = [
        { month: 1, maxDay: 31 }, { month: 2, maxDay: 28 }, { month: 3, maxDay: 31 },
        { month: 4, maxDay: 30 }, { month: 5, maxDay: 31 }, { month: 6, maxDay: 30 },
        { month: 7, maxDay: 31 }, { month: 8, maxDay: 31 }, { month: 9, maxDay: 30 },
        { month: 10, maxDay: 31 }, { month: 11, maxDay: 30 }, { month: 12, maxDay: 31 },
      ]

      monthDayLimits.forEach(({ month, maxDay }) => {
        const monthStr = month.toString().padStart(2, '0')
        
        // Valid max day should work
        const validDate = `${monthStr}/${maxDay.toString().padStart(2, '0')}/2025`
        expect(() => parseSourceDate(validDate, 'US_FORMAT')).not.toThrow()
        
        // Invalid day (max + 1) should fail
        if (maxDay < 31) {
          const invalidDate = `${monthStr}/${(maxDay + 1).toString().padStart(2, '0')}/2025`
          expect(() => parseSourceDate(invalidDate, 'US_FORMAT')).toThrow()
        }
      })
    })
  })

  describe('Format conversion matrix (data-driven)', () => {
    const conversionMatrix = generateFormatConversionMatrix()

    test.each(conversionMatrix)(
      'should convert $sourceFormat to $targetFormat: $description',
      ({ input, sourceFormat, targetFormat, expected }) => {
        const result = formatDate(input, sourceFormat, targetFormat as DateFormat)
        expect(result).toBe(expected)
      }
    )

    test('conversion matrix consistency check', () => {
      // Verify that converting back and forth maintains consistency
      const testDate = '07/25/2025'
      const formats: DateFormat[] = ['US_STANDARD', 'UK_STANDARD', 'ISO_STANDARD']
      
      formats.forEach(targetFormat => {
        const converted = formatDate(testDate, 'US_FORMAT', targetFormat)
        expect(converted).toBeTruthy()
        expect(typeof converted).toBe('string')
        
        // Convert back to a common format to verify consistency
        const backConverted = formatDate(converted, targetFormat, 'ISO_STANDARD')
        expect(backConverted).toBe('2025-07-25')
      })
    })
  })

  describe('Custom format patterns (data-driven)', () => {
    const customFormatTestData = generateCustomFormatTestData()

    test.each(customFormatTestData)(
      'should apply custom format: $description',
      ({ input, sourceFormat, expected, description }) => {
        // Extract pattern from description for the test
        const pattern = description.includes("'MMMM D'") ? 'MMMM D' :
                      description.includes('ISO-like') ? 'YYYY-MM-DD' :
                      description.includes('UK-like') ? 'DD/MM/YYYY' :
                      description.includes('US with dashes') ? 'MM-DD-YYYY' :
                      description.includes('Japanese-like') ? 'YYYY/MM/DD' :
                      description.includes('German-like') ? 'DD.MM.YYYY' :
                      description.includes('2-digit year') ? 'YY-MM-DD' :
                      description.includes('Short month name') ? 'MMM DD, YYYY' :
                      description.includes('Full month name') ? 'MMMM DD, YYYY' :
                      description.includes('European written style') ? 'DD MMM YYYY' :
                      description.includes('European full written') ? 'DD MMMM YYYY' :
                      description.includes('No padding') ? 'D/M/YYYY' :
                      description.includes('Chinese-style') ? 'YYYY年MM月DD日' :
                      'DD/MM/YYYY'
        
        const result = formatDate(input, sourceFormat, 'CUSTOM', pattern)
        expect(result).toBe(expected)
      }
    )

    test('should handle complex custom patterns', () => {
      const complexPatterns = [
        {
          pattern: 'Today is MMMM DD, YYYY (YY)',
          expected: 'Today is July 25, 2025 (25)',
        },
        {
          pattern: 'DD.MM.YYYY - MMMM',
          expected: '25.07.2025 - July',
        },
        {
          pattern: 'YYYY/MM/DD (D/M/YY)',
          expected: '2025/07/25 (25/7/25)',
        },
      ]

      complexPatterns.forEach(({ pattern, expected }) => {
        const result = formatDate('07/25/2025', 'US_FORMAT', 'CUSTOM', pattern)
        expect(result).toBe(expected)
      })
    })
  })

  describe('Auto-detection capabilities (data-driven)', () => {
    const autoDetectionTestData = generateAutoDetectionTestData()

    test.each(autoDetectionTestData.filter(t => t.shouldPass))(
      'should successfully auto-detect: $description',
      ({ input }) => {
        const result = parseSourceDate(input, 'AUTO')
        expect(result).toBeValidDate()
      }
    )

    test.each(autoDetectionTestData.filter(t => !t.shouldPass))(
      'should fail to auto-detect: $description',
      ({ input, expectedError }) => {
        expect(() => parseSourceDate(input, 'AUTO')).toThrow(expectedError)
      }
    )

    test('should handle ambiguous dates consistently', () => {
      const ambiguousDates = [
        '01/02/2025', // Could be Jan 2 (US) or Feb 1 (UK)
        '03/04/2025', // Could be Mar 4 (US) or Apr 3 (UK)
        '05/06/2025', // Could be May 6 (US) or Jun 5 (UK)
      ]

      ambiguousDates.forEach(date => {
        const result = parseSourceDate(date, 'AUTO')
        expect(result).toBeValidDate()
        
        // Should consistently parse as US format (earlier in priority)
        const usResult = parseSourceDate(date, 'US_FORMAT')
        expect(result.getTime()).toBe(usResult.getTime())
      })
    })

    test('should handle format priority correctly', () => {
      // Test that ISO format is prioritized over other formats
      const isoDate = '2025-07-25'
      const autoResult = parseSourceDate(isoDate, 'AUTO')
      const isoResult = parseSourceDate(isoDate, 'ISO_DATE')
      
      expect(autoResult.getTime()).toBe(isoResult.getTime())
    })
  })

  describe('HubSpot workflow scenarios (data-driven)', () => {
    const hubspotTestData = generateHubSpotWorkflowTestData()

    test.each(hubspotTestData)(
      'HubSpot scenario: $description',
      ({ input, sourceFormat, targetFormat, expected }) => {
        const result = formatDate(input, sourceFormat, targetFormat as DateFormat)
        expect(result).toBe(expected)
      }
    )

    test('should handle typical HubSpot date formats', () => {
      const hubspotScenarios = [
        {
          input: '7/4/76', // Independence Day 1976
          sourceFormat: 'US_FORMAT',
          targetFormat: 'US_WRITTEN',
          expected: 'July 4, 1976',
        },
        {
          input: '12/31/99', // Y2K Eve
          sourceFormat: 'US_FORMAT',
          targetFormat: 'ISO_STANDARD',
          expected: '1999-12-31',
        },
        {
          input: '1/1/00', // Y2K Day
          sourceFormat: 'US_FORMAT',
          targetFormat: 'TAIWAN_STANDARD',
          expected: '2000年01月01日',
        },
      ]

      hubspotScenarios.forEach(({ input, sourceFormat, targetFormat, expected }) => {
        const result = formatDate(input, sourceFormat, targetFormat as DateFormat)
        expect(result).toBe(expected)
      })
    })
  })

  describe('Performance and scalability', () => {
    test('should handle batch processing efficiently', () => {
      const testData = generatePerformanceTestData(1000)
      
      const startTime = performance.now()
      
      const results = testData.map(date => 
        formatDate(date, 'US_FORMAT', 'ISO_STANDARD')
      )
      
      const endTime = performance.now()
      const duration = endTime - startTime
      
      expect(results).toHaveLength(1000)
      expect(results.every(result => typeof result === 'string')).toBe(true)
      expect(duration).toBeLessThan(1000) // Should complete in under 1 second
    })

    test('should handle mixed format auto-detection efficiently', () => {
      const mixedData = generateMixedFormatTestData(300)
      
      const startTime = performance.now()
      
      const results = mixedData.map(date => 
        formatDate(date, 'AUTO', 'ISO_STANDARD')
      )
      
      const endTime = performance.now()
      const duration = endTime - startTime
      
      expect(results).toHaveLength(300)
      expect(results.every(result => typeof result === 'string')).toBe(true)
      expect(duration).toBeLessThan(500) // Should be reasonably fast
    })

    test('should maintain consistent performance across different formats', () => {
      const testDate = '07/25/2025'
      const formats: DateFormat[] = [
        'US_STANDARD', 'UK_STANDARD', 'ISO_STANDARD', 
        'US_WRITTEN', 'EU_WRITTEN', 'TAIWAN_STANDARD',
        'HONG_KONG_STANDARD', 'KOREA_STANDARD'
      ]
      
      const iterations = 100
      const performanceTimes: number[] = []
      
      formats.forEach(format => {
        const startTime = performance.now()
        
        for (let i = 0; i < iterations; i++) {
          formatDate(testDate, 'US_FORMAT', format)
        }
        
        const endTime = performance.now()
        performanceTimes.push(endTime - startTime)
      })
      
      // All formats should perform within reasonable bounds
      performanceTimes.forEach(time => {
        expect(time).toBeLessThan(100) // Each format should complete in under 100ms
      })
      
      // Performance should be relatively consistent across formats
      const avgTime = performanceTimes.reduce((a, b) => a + b, 0) / performanceTimes.length
      const maxTime = Math.max(...performanceTimes)
      const minTime = Math.min(...performanceTimes)
      
      // Max time shouldn't be more than 3x the average
      expect(maxTime).toBeLessThan(avgTime * 3)
      expect(minTime).toBeGreaterThan(0)
    })
  })

  describe('Error handling and edge cases', () => {
    test('should provide meaningful error messages', () => {
      const errorCases = [
        {
          input: '32/01/2025',
          format: 'US_FORMAT',
          expectedMessage: 'Invalid date values in US format',
        },
        {
          input: '01-01-2025',
          format: 'US_FORMAT',
          expectedMessage: 'Invalid US format',
        },
        {
          input: '2025-01-01',
          format: 'UNSUPPORTED_FORMAT',
          expectedMessage: 'Unsupported source format: UNSUPPORTED_FORMAT',
        },
        {
          input: 'random-text',
          format: 'AUTO',
          expectedMessage: 'Unable to auto-detect date format',
        },
      ]

      errorCases.forEach(({ input, format, expectedMessage }) => {
        expect(() => parseSourceDate(input, format))
          .toThrow(expectedMessage)
      })
    })

    test('should handle edge cases gracefully', () => {
      const edgeCases = [
        { input: '', format: 'US_FORMAT', shouldThrow: true },
        { input: '   ', format: 'US_FORMAT', shouldThrow: true },
        { input: '1', format: 'US_FORMAT', shouldThrow: true },
        { input: '1/2', format: 'US_FORMAT', shouldThrow: true },
        { input: '1/2/3/4', format: 'US_FORMAT', shouldThrow: true },
      ]

      edgeCases.forEach(({ input, format, shouldThrow }) => {
        if (shouldThrow) {
          expect(() => parseSourceDate(input, format)).toThrow()
        } else {
          expect(() => parseSourceDate(input, format)).not.toThrow()
        }
      })
    })

    test('should handle custom format without pattern', () => {
      expect(() => formatDate('01/01/2025', 'US_FORMAT', 'CUSTOM'))
        .toThrow()
    })

    test('should handle unsupported target formats', () => {
      expect(() => formatDate('01/01/2025', 'US_FORMAT', 'UNSUPPORTED' as DateFormat))
        .toThrow('Unsupported target format: UNSUPPORTED')
    })
  })

  describe('Regression tests for critical bugs', () => {
    test('should handle February 29th in century years correctly', () => {
      // 1900 is not a leap year despite being divisible by 4
      expect(() => parseSourceDate('02/29/1900', 'US_FORMAT')).toThrow()
      
      // 2000 is a leap year because it's divisible by 400
      expect(() => parseSourceDate('02/29/2000', 'US_FORMAT')).not.toThrow()
    })

    test('should maintain precision in year boundary calculations', () => {
      // Ensure floating point errors don't affect year calculations
      for (let year = 0; year <= 99; year++) {
        const yearStr = year.toString().padStart(2, '0')
        const result = parseSourceDate(`01/01/${yearStr}`, 'US_FORMAT')
        const expectedYear = year < 50 ? 2000 + year : 1900 + year
        
        expect(result.getFullYear()).toBe(expectedYear)
        expect(Number.isInteger(result.getFullYear())).toBe(true)
      }
    })

    test('should handle month name replacements without conflicts', () => {
      // Ensure MMM doesn't interfere with MMMM and MM
      const result = formatDate('01/01/2025', 'US_FORMAT', 'CUSTOM', 'MM-MMM-MMMM')
      expect(result).toBe('01-Jan-January')
      
      // Ensure replacement order doesn't cause issues
      const result2 = formatDate('01/01/2025', 'US_FORMAT', 'CUSTOM', 'MMMM-MMM-MM')
      expect(result2).toBe('January-Jan-01')
    })

    test('should handle time zone independence', () => {
      // Date operations should be time zone independent for date-only operations
      const date1 = parseSourceDate('01/01/2025', 'US_FORMAT')
      const date2 = parseSourceDate('01/01/2025', 'US_FORMAT')
      
      expect(date1.getFullYear()).toBe(date2.getFullYear())
      expect(date1.getMonth()).toBe(date2.getMonth())
      expect(date1.getDate()).toBe(date2.getDate())
    })
  })
})