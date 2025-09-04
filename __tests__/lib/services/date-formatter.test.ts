import { parseSourceDate, formatDate } from '@/lib/features/date-formatter/services/date-formatter'
import type { DateFormat } from '@/lib/types'

describe('Date Formatter Service', () => {
  describe('parseYear utility (internal function testing through public APIs)', () => {
    describe('2-digit year boundaries', () => {
      test.each([
        { input: '01/01/49', expected: 2049, format: 'US_FORMAT' },
        { input: '01/01/50', expected: 1950, format: 'US_FORMAT' },
        { input: '01/01/00', expected: 2000, format: 'US_FORMAT' },
        { input: '01/01/99', expected: 1999, format: 'US_FORMAT' },
        { input: '01/01/25', expected: 2025, format: 'US_FORMAT' },
        { input: '01/01/75', expected: 1975, format: 'US_FORMAT' },
      ])('should convert $input to year $expected', ({ input, expected, format }) => {
        const result = parseSourceDate(input, format)
        expect(result).toHaveYear(expected)
      })

      test('critical boundary: 49 should become 2049, 50 should become 1950', () => {
        const date49 = parseSourceDate('01/01/49', 'US_FORMAT')
        const date50 = parseSourceDate('01/01/50', 'US_FORMAT')
        
        expect(date49.getFullYear()).toBe(2049)
        expect(date50.getFullYear()).toBe(1950)
        expect(date49.getFullYear() - date50.getFullYear()).toBe(99)
      })
    })

    describe('4-digit years', () => {
      test('should handle 4-digit years unchanged', () => {
        const testCases = ['2025', '1999', '2049', '1950']
        testCases.forEach(year => {
          const result = parseSourceDate(`01/01/${year}`, 'US_FORMAT')
          expect(result.getFullYear()).toBe(parseInt(year))
        })
      })
    })
  })

  describe('parseUSFormat', () => {
    describe('valid formats', () => {
      test('should parse MM/DD/YYYY format', () => {
        const result = parseSourceDate('12/25/2025', 'US_FORMAT')
        expect(result).toBeValidDate()
        expect(result.getFullYear()).toBe(2025)
        expect(result.getMonth()).toBe(11) // December (0-indexed)
        expect(result.getDate()).toBe(25)
      })

      test('should parse MM/DD/YY format with 2-digit years', () => {
        const result = parseSourceDate('07/04/76', 'US_FORMAT')
        expect(result).toBeValidDate()
        expect(result.getFullYear()).toBe(1976)
        expect(result.getMonth()).toBe(6) // July
        expect(result.getDate()).toBe(4)
      })

      test('should handle single-digit months and days', () => {
        const result = parseSourceDate('1/5/2025', 'US_FORMAT')
        expect(result).toBeValidDate()
        expect(result.getMonth()).toBe(0) // January
        expect(result.getDate()).toBe(5)
      })
    })

    describe('invalid formats', () => {
      test('should throw error for wrong number of parts', () => {
        expect(() => parseSourceDate('12/25', 'US_FORMAT')).toThrow('Invalid US format')
        expect(() => parseSourceDate('12/25/2025/extra', 'US_FORMAT')).toThrow('Invalid US format')
        expect(() => parseSourceDate('12-25-2025', 'US_FORMAT')).toThrow('Invalid US format')
      })

      test('should throw error for invalid date values', () => {
        const invalidDates = [
          '13/01/2025', // Invalid month
          '12/32/2025', // Invalid day
          '02/29/2023', // Invalid leap year
          '04/31/2025', // April has only 30 days
          '00/01/2025', // Zero month
          '01/00/2025', // Zero day
        ]

        invalidDates.forEach(invalidDate => {
          expect(() => parseSourceDate(invalidDate, 'US_FORMAT'))
            .toThrow('Invalid date values in US format')
        })
      })

      test('should throw error for non-numeric values', () => {
        expect(() => parseSourceDate('aa/bb/cccc', 'US_FORMAT'))
          .toThrow('Invalid date values in US format')
      })
    })

    describe('leap year handling', () => {
      test('should handle valid leap years', () => {
        const validLeapYears = ['02/29/2020', '02/29/2024', '02/29/2000']
        validLeapYears.forEach(date => {
          const result = parseSourceDate(date, 'US_FORMAT')
          expect(result).toBeValidDate()
          expect(result.getMonth()).toBe(1) // February
          expect(result.getDate()).toBe(29)
        })
      })

      test('should reject invalid leap years', () => {
        const invalidLeapYears = ['02/29/2021', '02/29/2022', '02/29/2023', '02/29/1900']
        invalidLeapYears.forEach(date => {
          expect(() => parseSourceDate(date, 'US_FORMAT'))
            .toThrow('Invalid date values in US format')
        })
      })

      test('should handle February 29th in 2-digit leap years', () => {
        const result = parseSourceDate('02/29/20', 'US_FORMAT') // 2020
        expect(result).toBeValidDate()
        expect(result.getFullYear()).toBe(2020)
      })
    })
  })

  describe('parseUKFormat', () => {
    describe('valid formats', () => {
      test('should parse DD/MM/YYYY format', () => {
        const result = parseSourceDate('25/12/2025', 'UK_FORMAT')
        expect(result).toBeValidDate()
        expect(result.getFullYear()).toBe(2025)
        expect(result.getMonth()).toBe(11) // December
        expect(result.getDate()).toBe(25)
      })

      test('should parse DD/MM/YY format', () => {
        const result = parseSourceDate('04/07/76', 'UK_FORMAT')
        expect(result).toBeValidDate()
        expect(result.getFullYear()).toBe(1976)
        expect(result.getMonth()).toBe(6) // July
        expect(result.getDate()).toBe(4)
      })
    })

    describe('invalid formats', () => {
      test('should throw error for wrong separator', () => {
        expect(() => parseSourceDate('25-12-2025', 'UK_FORMAT')).toThrow('Invalid UK format')
      })

      test('should throw error for invalid date values', () => {
        expect(() => parseSourceDate('32/12/2025', 'UK_FORMAT'))
          .toThrow('Invalid date values in UK format')
        expect(() => parseSourceDate('29/02/2023', 'UK_FORMAT'))
          .toThrow('Invalid date values in UK format')
      })
    })

    describe('ambiguous date handling', () => {
      test('should differentiate from US format for ambiguous dates', () => {
        // 05/03/2025 could be May 3rd (US) or March 5th (UK)
        const usResult = parseSourceDate('05/03/2025', 'US_FORMAT')
        const ukResult = parseSourceDate('05/03/2025', 'UK_FORMAT')
        
        expect(usResult.getMonth()).toBe(4) // May (US format: MM/DD/YYYY)
        expect(usResult.getDate()).toBe(3)
        
        expect(ukResult.getMonth()).toBe(2) // March (UK format: DD/MM/YYYY)
        expect(ukResult.getDate()).toBe(5)
        
        // Test a clearer case
        const usResult2 = parseSourceDate('12/05/2025', 'US_FORMAT')
        const ukResult2 = parseSourceDate('12/05/2025', 'UK_FORMAT')
        
        expect(usResult2.getMonth()).toBe(11) // December (US: MM/DD/YYYY)
        expect(usResult2.getDate()).toBe(5)
        
        expect(ukResult2.getMonth()).toBe(4) // May (UK: DD/MM/YYYY)
        expect(ukResult2.getDate()).toBe(12)
      })
    })
  })

  describe('parseEUFormat', () => {
    describe('valid formats', () => {
      test('should parse DD.MM.YYYY format', () => {
        const result = parseSourceDate('25.12.2025', 'EU_FORMAT')
        expect(result).toBeValidDate()
        expect(result.getFullYear()).toBe(2025)
        expect(result.getMonth()).toBe(11)
        expect(result.getDate()).toBe(25)
      })

      test('should parse DD.MM.YY format', () => {
        const result = parseSourceDate('04.07.76', 'EU_FORMAT')
        expect(result).toBeValidDate()
        expect(result.getFullYear()).toBe(1976)
      })
    })

    describe('invalid formats', () => {
      test('should throw error for wrong separator', () => {
        expect(() => parseSourceDate('25/12/2025', 'EU_FORMAT')).toThrow('Invalid EU format')
        expect(() => parseSourceDate('25-12-2025', 'EU_FORMAT')).toThrow('Invalid EU format')
      })
    })
  })


  describe('autoDetectAndParse', () => {
    describe('successful detection', () => {
      test('should detect ISO DateTime format', () => {
        const isoDateTime = '2025-07-25T10:30:00Z'
        const result = parseSourceDate(isoDateTime, 'AUTO')
        expect(result).toBeValidDate()
        expect(result.getFullYear()).toBe(2025)
      })

      test('should detect US format', () => {
        const result = parseSourceDate('12/25/2025', 'AUTO')
        expect(result).toBeValidDate()
        expect(result.getMonth()).toBe(11)
        expect(result.getDate()).toBe(25)
      })

      test('should detect UK format when unambiguous', () => {
        const result = parseSourceDate('31/12/2025', 'AUTO') // Clearly DD/MM
        expect(result).toBeValidDate()
        expect(result.getMonth()).toBe(11)
        expect(result.getDate()).toBe(31)
      })

      test('should detect EU format', () => {
        const result = parseSourceDate('25.12.2025', 'AUTO')
        expect(result).toBeValidDate()
        expect(result.getMonth()).toBe(11)
        expect(result.getDate()).toBe(25)
      })


      test('should detect Unix timestamp', () => {
        const timestamp = '1640995200' // 2022-01-01 00:00:00 UTC
        const result = parseSourceDate(timestamp, 'AUTO')
        expect(result).toBeValidDate()
        expect(result.getFullYear()).toBe(2022)
      })
    })

    describe('ambiguous date handling', () => {
      test('should handle ambiguous dates consistently', () => {
        // For ambiguous dates like 01/02/2025, it should try US format first
        const result = parseSourceDate('01/02/2025', 'AUTO')
        expect(result).toBeValidDate()
        expect(result.getMonth()).toBe(0) // January (US format: MM/DD)
        expect(result.getDate()).toBe(2)
      })

      test('should prioritize format order in case of multiple matches', () => {
        // Test format priority order
        const ambiguousDate = '2025-01-02'
        const result = parseSourceDate(ambiguousDate, 'AUTO')
        expect(result).toBeValidDate()
        // Should be detected as ISO format (first in priority)
      })
    })

    describe('failed detection', () => {
      test('should throw error when no format matches', () => {
        const invalidFormats = [
          'not-a-date',
          '99/99/99',
          'invalid',
          'abc123',
          'random-text',
          '32/13/2025',
        ]

        invalidFormats.forEach(invalidFormat => {
          expect(() => parseSourceDate(invalidFormat, 'AUTO'))
            .toThrow('Unable to auto-detect date format')
        })
      })
    })
  })

  describe('parseSourceDate - format routing', () => {
    describe('supported formats', () => {
      const testDate = '2025-07-25T10:30:00Z'
      
      test('should handle HUBSPOT_DATETIME format', () => {
        const result = parseSourceDate(testDate, 'HUBSPOT_DATETIME')
        expect(result).toBeValidDate()
      })

      test('should handle ISO_DATE format', () => {
        const result = parseSourceDate('2025-07-25', 'ISO_DATE')
        expect(result).toBeValidDate()
        expect(result.getFullYear()).toBe(2025)
      })

      test('should handle UNIX_TIMESTAMP format', () => {
        const result = parseSourceDate('1640995200', 'UNIX_TIMESTAMP')
        expect(result).toBeValidDate()
      })

      test('should handle WRITTEN_DATE format', () => {
        const result = parseSourceDate('July 25, 2025', 'WRITTEN_DATE')
        expect(result).toBeValidDate()
      })
    })

    describe('unsupported formats', () => {
      test('should throw error for unsupported format', () => {
        expect(() => parseSourceDate('2025-07-25', 'UNSUPPORTED_FORMAT'))
          .toThrow('Unsupported source format: UNSUPPORTED_FORMAT')
      })
    })
  })

  describe('applyCustomFormat', () => {
    const testDate = new Date(2025, 6, 25) // July 25, 2025

    describe('year tokens', () => {
      test('should handle YYYY token', () => {
        const result = formatDate('07/25/2025', 'US_FORMAT', 'CUSTOM', 'YYYY')
        expect(result).toBe('2025')
      })

      test('should handle YY token', () => {
        const result = formatDate('07/25/2025', 'US_FORMAT', 'CUSTOM', 'YY')
        expect(result).toBe('25')
      })
    })

    describe('month tokens', () => {
      test('should handle MMMM token (full month name)', () => {
        const result = formatDate('07/25/2025', 'US_FORMAT', 'CUSTOM', 'MMMM')
        expect(result).toBe('July')
      })

      test('should handle MMM token (short month name)', () => {
        const result = formatDate('07/25/2025', 'US_FORMAT', 'CUSTOM', 'MMM')
        expect(result).toBe('Jul')
      })

      test('should handle MM token (zero-padded month)', () => {
        const result = formatDate('07/25/2025', 'US_FORMAT', 'CUSTOM', 'MM')
        expect(result).toBe('07')
      })

      test('should handle MM token for single-digit months', () => {
        const result = formatDate('01/25/2025', 'US_FORMAT', 'CUSTOM', 'MM')
        expect(result).toBe('01')
      })
    })

    describe('day tokens', () => {
      test('should handle DD token (zero-padded day)', () => {
        const result = formatDate('07/25/2025', 'US_FORMAT', 'CUSTOM', 'DD')
        expect(result).toBe('25')
      })

      test('should handle DD token for single-digit days', () => {
        const result = formatDate('07/05/2025', 'US_FORMAT', 'CUSTOM', 'DD')
        expect(result).toBe('05')
      })

      test('should handle D token (non-padded day)', () => {
        const result = formatDate('07/05/2025', 'US_FORMAT', 'CUSTOM', 'D')
        expect(result).toBe('5')
      })
    })

    describe('complex patterns', () => {
      test('should handle complex date patterns', () => {
        const patterns = [
          { pattern: 'DD-MM-YYYY', expected: '25-07-2025' },
          { pattern: 'YYYY/MM/DD', expected: '2025/07/25' },
          { pattern: 'MMM D, YYYY', expected: 'Jul 25, 2025' },
          { pattern: 'MMMM DD, YYYY', expected: 'July 25, 2025' },
          { pattern: 'DD MMMM YYYY', expected: '25 July 2025' },
          { pattern: 'YY-MM-DD', expected: '25-07-25' },
        ]

        patterns.forEach(({ pattern, expected }) => {
          const result = formatDate('07/25/2025', 'US_FORMAT', 'CUSTOM', pattern)
          expect(result).toBe(expected)
        })
      })

      test('should handle patterns with literal text', () => {
        const result = formatDate('07/25/2025', 'US_FORMAT', 'CUSTOM', '[Date]: DD/MM/YYYY')
        expect(result).toBe('Date: 25/07/2025')
      })

      test('should handle patterns with multiple separators', () => {
        const result = formatDate('07/25/2025', 'US_FORMAT', 'CUSTOM', 'DD.MM.YYYY - MMMM')
        expect(result).toBe('25.07.2025 - July')
      })

      test('should handle ordinal dates with Do token', () => {
        const result = formatDate('09/02/2025', 'US_FORMAT', 'CUSTOM', 'dddd Do [of] MMMM')
        expect(result).toBe('Tuesday 2nd of September')
      })

      test('should handle various ordinal formats', () => {
        const ordinalTests = [
          { input: '09/01/2025', pattern: 'Do MMMM YYYY', expected: '1st September 2025' },
          { input: '09/02/2025', pattern: 'dddd [the] Do', expected: 'Tuesday the 2nd' },
          { input: '09/03/2025', pattern: 'MMMM Do, YYYY', expected: 'September 3rd, 2025' },
          { input: '09/21/2025', pattern: '[The] Do [of] MMMM', expected: 'The 21st of September' },
          { input: '12/25/2025', pattern: 'dddd, MMMM Do', expected: 'Thursday, December 25th' },
        ]

        ordinalTests.forEach(({ input, pattern, expected }) => {
          const result = formatDate(input, 'US_FORMAT', 'CUSTOM', pattern)
          expect(result).toBe(expected)
        })
      })

      test('should handle day name formats', () => {
        const dayNameTests = [
          { input: '01/01/2025', pattern: 'dddd', expected: 'Wednesday' },
          { input: '01/01/2025', pattern: 'ddd', expected: 'Wed' },
          { input: '07/04/2025', pattern: 'dddd, MMMM DD', expected: 'Friday, July 04' },
          { input: '12/31/2025', pattern: 'ddd DD/MM', expected: 'Wed 31/12' },
        ]

        dayNameTests.forEach(({ input, pattern, expected }) => {
          const result = formatDate(input, 'US_FORMAT', 'CUSTOM', pattern)
          expect(result).toBe(expected)
        })
      })

      test('should handle all dayjs token types comprehensively', () => {
        // Using July 4, 2025 (Friday) for comprehensive testing
        const tokenTests = [
          // Year tokens
          { input: '07/04/2025', pattern: 'YY', expected: '25' },
          { input: '07/04/2025', pattern: 'YYYY', expected: '2025' },
          
          // Month tokens
          { input: '07/04/2025', pattern: 'M', expected: '7' },
          { input: '07/04/2025', pattern: 'MM', expected: '07' },
          { input: '07/04/2025', pattern: 'MMM', expected: 'Jul' },
          { input: '07/04/2025', pattern: 'MMMM', expected: 'July' },
          
          // Day of month tokens
          { input: '07/04/2025', pattern: 'D', expected: '4' },
          { input: '07/04/2025', pattern: 'DD', expected: '04' },
          { input: '07/04/2025', pattern: 'Do', expected: '4th' },
          
          // Day of week tokens (Friday = 5, Sun=0)
          { input: '07/04/2025', pattern: 'd', expected: '5' },
          { input: '07/04/2025', pattern: 'dd', expected: 'Fr' },
          { input: '07/04/2025', pattern: 'ddd', expected: 'Fri' },
          { input: '07/04/2025', pattern: 'dddd', expected: 'Friday' },
          
          // Quarter token (July = Q3)
          { input: '07/04/2025', pattern: 'Q', expected: '3' },
        ]

        tokenTests.forEach(({ input, pattern, expected }) => {
          const result = formatDate(input, 'US_FORMAT', 'CUSTOM', pattern)
          expect(result).toBe(expected)
        })
      })

      test('should handle edge cases for ordinal dates', () => {
        const ordinalEdgeCases = [
          // Test all ordinal suffixes
          { input: '09/01/2025', pattern: 'Do', expected: '1st' },
          { input: '09/02/2025', pattern: 'Do', expected: '2nd' },
          { input: '09/03/2025', pattern: 'Do', expected: '3rd' },
          { input: '09/04/2025', pattern: 'Do', expected: '4th' },
          { input: '09/11/2025', pattern: 'Do', expected: '11th' }, // Special case: 11th not 11st
          { input: '09/12/2025', pattern: 'Do', expected: '12th' }, // Special case: 12th not 12nd
          { input: '09/13/2025', pattern: 'Do', expected: '13th' }, // Special case: 13th not 13rd
          { input: '09/21/2025', pattern: 'Do', expected: '21st' },
          { input: '09/22/2025', pattern: 'Do', expected: '22nd' },
          { input: '09/23/2025', pattern: 'Do', expected: '23rd' },
          { input: '08/31/2025', pattern: 'Do', expected: '31st' },
        ]

        ordinalEdgeCases.forEach(({ input, pattern, expected }) => {
          const result = formatDate(input, 'US_FORMAT', 'CUSTOM', pattern)
          expect(result).toBe(expected)
        })
      })

      test('should handle day of week numbers correctly', () => {
        // Test each day of the week (Sunday = 0)
        const dayOfWeekTests = [
          { input: '01/05/2025', pattern: 'd', expected: '0' }, // Sunday
          { input: '01/06/2025', pattern: 'd', expected: '1' }, // Monday
          { input: '01/07/2025', pattern: 'd', expected: '2' }, // Tuesday
          { input: '01/08/2025', pattern: 'd', expected: '3' }, // Wednesday
          { input: '01/09/2025', pattern: 'd', expected: '4' }, // Thursday
          { input: '01/10/2025', pattern: 'd', expected: '5' }, // Friday
          { input: '01/11/2025', pattern: 'd', expected: '6' }, // Saturday
        ]

        dayOfWeekTests.forEach(({ input, pattern, expected }) => {
          const result = formatDate(input, 'US_FORMAT', 'CUSTOM', pattern)
          expect(result).toBe(expected)
        })
      })

      test('should handle quarter calculations correctly', () => {
        const quarterTests = [
          { input: '01/15/2025', pattern: 'Q', expected: '1' }, // Q1: Jan-Mar
          { input: '02/15/2025', pattern: 'Q', expected: '1' },
          { input: '03/15/2025', pattern: 'Q', expected: '1' },
          { input: '04/15/2025', pattern: 'Q', expected: '2' }, // Q2: Apr-Jun
          { input: '05/15/2025', pattern: 'Q', expected: '2' },
          { input: '06/15/2025', pattern: 'Q', expected: '2' },
          { input: '07/15/2025', pattern: 'Q', expected: '3' }, // Q3: Jul-Sep
          { input: '08/15/2025', pattern: 'Q', expected: '3' },
          { input: '09/15/2025', pattern: 'Q', expected: '3' },
          { input: '10/15/2025', pattern: 'Q', expected: '4' }, // Q4: Oct-Dec
          { input: '11/15/2025', pattern: 'Q', expected: '4' },
          { input: '12/15/2025', pattern: 'Q', expected: '4' },
        ]

        quarterTests.forEach(({ input, pattern, expected }) => {
          const result = formatDate(input, 'US_FORMAT', 'CUSTOM', pattern)
          expect(result).toBe(expected)
        })
      })

      test('should handle complex mixed token patterns', () => {
        const complexTests = [
          { 
            input: '07/04/2025', 
            pattern: 'dddd [the] Do [of] MMMM YYYY ([Q]Q)', 
            expected: 'Friday the 4th of July 2025 (Q3)' 
          },
          { 
            input: '12/25/2025', 
            pattern: 'ddd, MMM Do YY', 
            expected: 'Thu, Dec 25th 25' 
          },
          { 
            input: '01/01/2025', 
            pattern: 'dddd [is day] d [of the week]', 
            expected: 'Wednesday is day 3 of the week' 
          },
          { 
            input: '03/15/2025', 
            pattern: 'YYYY-MM-DD (dd)', 
            expected: '2025-03-15 (Sa)' 
          },
        ]

        complexTests.forEach(({ input, pattern, expected }) => {
          const result = formatDate(input, 'US_FORMAT', 'CUSTOM', pattern)
          expect(result).toBe(expected)
        })
      })
    })

    describe('edge cases', () => {
      test('should handle all months correctly', () => {
        const months = [
          { month: '01', fullName: 'January', shortName: 'Jan' },
          { month: '02', fullName: 'February', shortName: 'Feb' },
          { month: '03', fullName: 'March', shortName: 'Mar' },
          { month: '04', fullName: 'April', shortName: 'Apr' },
          { month: '05', fullName: 'May', shortName: 'May' },
          { month: '06', fullName: 'June', shortName: 'Jun' },
          { month: '07', fullName: 'July', shortName: 'Jul' },
          { month: '08', fullName: 'August', shortName: 'Aug' },
          { month: '09', fullName: 'September', shortName: 'Sep' },
          { month: '10', fullName: 'October', shortName: 'Oct' },
          { month: '11', fullName: 'November', shortName: 'Nov' },
          { month: '12', fullName: 'December', shortName: 'Dec' },
        ]

        months.forEach(({ month, fullName, shortName }) => {
          const fullResult = formatDate(`${month}/15/2025`, 'US_FORMAT', 'CUSTOM', 'MMMM')
          const shortResult = formatDate(`${month}/15/2025`, 'US_FORMAT', 'CUSTOM', 'MMM')
          expect(fullResult).toBe(fullName)
          expect(shortResult).toBe(shortName)
        })
      })
    })
  })

  describe('applyPredefinedFormat', () => {
    const testCases = [
      {
        format: 'US_STANDARD' as DateFormat,
        input: '25/07/2025',
        inputFormat: 'UK_FORMAT',
        expected: '07/25/2025'
      },
      {
        format: 'UK_STANDARD' as DateFormat,
        input: '07/25/2025',
        inputFormat: 'US_FORMAT',
        expected: '25/07/2025'
      },
      {
        format: 'ISO_STANDARD' as DateFormat,
        input: '07/25/2025',
        inputFormat: 'US_FORMAT',
        expected: '2025-07-25'
      },
      {
        format: 'US_WRITTEN' as DateFormat,
        input: '07/25/2025',
        inputFormat: 'US_FORMAT',
        expected: 'July 25, 2025'
      },
      {
        format: 'EU_WRITTEN' as DateFormat,
        input: '07/25/2025',
        inputFormat: 'US_FORMAT',
        expected: '25 July 2025'
      },
      {
        format: 'TAIWAN_STANDARD' as DateFormat,
        input: '07/25/2025',
        inputFormat: 'US_FORMAT',
        expected: '2025年07月25日'
      },
      {
        format: 'HONG_KONG_STANDARD' as DateFormat,
        input: '07/25/2025',
        inputFormat: 'US_FORMAT',
        expected: '25/07/2025'
      },
      {
        format: 'KOREA_STANDARD' as DateFormat,
        input: '07/25/2025',
        inputFormat: 'US_FORMAT',
        expected: '2025년 07월 25일'
      },
    ]

    test.each(testCases)(
      'should format $input to $format as $expected',
      ({ format, input, inputFormat, expected }) => {
        const result = formatDate(input, inputFormat, format)
        expect(result).toBe(expected)
      }
    )

    describe('single-digit padding', () => {
      test('should pad single-digit months and days correctly', () => {
        const result = formatDate('01/05/2025', 'US_FORMAT', 'ISO_STANDARD')
        expect(result).toBe('2025-01-05')
      })

      test('should handle different formats with padding', () => {
        const testDate = '01/05/2025' // January 5, 2025
        expect(formatDate(testDate, 'US_FORMAT', 'US_STANDARD')).toBe('01/05/2025')
        expect(formatDate(testDate, 'US_FORMAT', 'UK_STANDARD')).toBe('05/01/2025')
        expect(formatDate(testDate, 'US_FORMAT', 'TAIWAN_STANDARD')).toBe('2025年01月05日')
        expect(formatDate(testDate, 'US_FORMAT', 'KOREA_STANDARD')).toBe('2025년 01월 05일')
      })
    })
  })

  describe('formatDate - main integration function', () => {
    describe('successful formatting', () => {
      test('should format from US to UK format', () => {
        const result = formatDate('12/25/2025', 'US_FORMAT', 'UK_STANDARD')
        expect(result).toBe('25/12/2025')
      })

      test('should format with custom pattern', () => {
        const result = formatDate('12/25/2025', 'US_FORMAT', 'CUSTOM', 'DD-MM-YYYY')
        expect(result).toBe('25-12-2025')
      })

      test('should format with auto-detection', () => {
        const result = formatDate('2025-12-25', 'AUTO', 'US_STANDARD')
        expect(result).toBe('12/25/2025')
      })
    })

    describe('error handling', () => {
      test('should throw error for invalid source date', () => {
        expect(() => formatDate('invalid-date', 'US_FORMAT', 'UK_STANDARD'))
          .toThrow()
      })

      test('should throw error for custom format without pattern', () => {
        expect(() => formatDate('12/25/2025', 'US_FORMAT', 'CUSTOM'))
          .toThrow()
      })

      test('should throw error for unsupported target format', () => {
        expect(() => formatDate('12/25/2025', 'US_FORMAT', 'UNSUPPORTED' as DateFormat))
          .toThrow('Unsupported target format: UNSUPPORTED')
      })
    })

    describe('comprehensive format conversion matrix', () => {
      const sourceDate = '2025-07-25'
      const allFormats: DateFormat[] = [
        'US_STANDARD',
        'UK_STANDARD', 
        'ISO_STANDARD',
        'US_WRITTEN',
        'EU_WRITTEN',
        'TAIWAN_STANDARD',
        'HONG_KONG_STANDARD',
        'KOREA_STANDARD'
      ]

      test.each(allFormats)('should convert ISO date to %s format', (targetFormat) => {
        const result = formatDate(sourceDate, 'ISO_DATE', targetFormat)
        expect(result).toBeTruthy()
        expect(typeof result).toBe('string')
      })
    })

    describe('real-world scenarios', () => {
      test('should handle HubSpot workflow scenario', () => {
        // Simulating actual HubSpot workflow data
        const hubspotDate = '7/25/25' // Typical HubSpot format
        const result = formatDate(hubspotDate, 'US_FORMAT', 'TAIWAN_STANDARD')
        expect(result).toBe('2025年07月25日')
      })

      test('should handle international date conversion', () => {
        const ukDate = '25/07/2025'
        const result = formatDate(ukDate, 'UK_FORMAT', 'US_WRITTEN')
        expect(result).toBe('July 25, 2025')
      })

    })
  })

  describe('edge cases and boundary conditions', () => {
    describe('extreme dates', () => {
      test('should handle year boundaries', () => {
        expect(() => formatDate('01/01/0001', 'US_FORMAT', 'ISO_STANDARD')).not.toThrow()
        expect(() => formatDate('12/31/9999', 'US_FORMAT', 'ISO_STANDARD')).not.toThrow()
      })

      test('should handle leap year edge cases', () => {
        // Century years divisible by 400 are leap years
        expect(() => formatDate('02/29/2000', 'US_FORMAT', 'ISO_STANDARD')).not.toThrow()
        // Century years not divisible by 400 are not leap years  
        expect(() => formatDate('02/29/1900', 'US_FORMAT', 'ISO_STANDARD')).toThrow()
      })
    })

    describe('month boundary conditions', () => {
      test('should handle end-of-month dates correctly', () => {
        const endOfMonthDates = [
          '01/31/2025', // January
          '03/31/2025', // March
          '04/30/2025', // April
          '05/31/2025', // May
          '06/30/2025', // June
          '07/31/2025', // July
          '08/31/2025', // August
          '09/30/2025', // September
          '10/31/2025', // October
          '11/30/2025', // November
          '12/31/2025', // December
        ]

        endOfMonthDates.forEach(date => {
          expect(() => formatDate(date, 'US_FORMAT', 'ISO_STANDARD')).not.toThrow()
        })
      })

      test('should reject invalid end-of-month dates', () => {
        const invalidEndOfMonthDates = [
          '02/30/2025', // February never has 30 days
          '02/31/2025', // February never has 31 days
          '04/31/2025', // April has only 30 days
          '06/31/2025', // June has only 30 days
          '09/31/2025', // September has only 30 days
          '11/31/2025', // November has only 30 days
        ]

        invalidEndOfMonthDates.forEach(date => {
          expect(() => formatDate(date, 'US_FORMAT', 'ISO_STANDARD')).toThrow()
        })
      })
    })

    describe('input validation', () => {
      test('should handle empty and null inputs', () => {
        expect(() => formatDate('', 'US_FORMAT', 'ISO_STANDARD')).toThrow()
        expect(() => formatDate('   ', 'US_FORMAT', 'ISO_STANDARD')).toThrow()
      })

      test('should handle whitespace in inputs', () => {
        expect(() => formatDate(' 12/25/2025 ', 'US_FORMAT', 'ISO_STANDARD')).not.toThrow()
        expect(() => formatDate('12 / 25 / 2025', 'US_FORMAT', 'ISO_STANDARD')).toThrow()
      })
    })
  })

  describe('performance considerations', () => {
    test('should handle batch processing efficiently', () => {
      const dates = Array.from({ length: 100 }, (_, i) => `01/${String(i + 1).padStart(2, '0')}/2025`)
      const validDates = dates.slice(0, 31) // Only first 31 are valid for January

      const startTime = performance.now()
      validDates.forEach(date => {
        formatDate(date, 'US_FORMAT', 'ISO_STANDARD')
      })
      const endTime = performance.now()

      expect(endTime - startTime).toBeLessThan(100) // Should complete in under 100ms
    })

    test('should handle auto-detection efficiently', () => {
      const mixedFormats = [
        '2025-07-25',
        '07/25/2025',
        '25/07/2025',
        '25.07.2025',
      ]

      const startTime = performance.now()
      mixedFormats.forEach(date => {
        formatDate(date, 'AUTO', 'ISO_STANDARD')
      })
      const endTime = performance.now()

      expect(endTime - startTime).toBeLessThan(50) // Should be very fast
    })
  })
})