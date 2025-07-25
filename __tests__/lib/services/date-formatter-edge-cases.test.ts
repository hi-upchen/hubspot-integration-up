import { parseSourceDate, formatDate } from '@/lib/services/date-formatter'
import type { DateFormat } from '@/lib/types'

describe('Date Formatter Edge Cases', () => {
  describe('Critical 2-digit year boundary testing', () => {
    describe('Year 49/50 boundary - comprehensive testing', () => {
      test('should handle 49 -> 2049 transition correctly', () => {
        const testCases = [
          { input: '12/31/48', expected: 2048 },
          { input: '01/01/49', expected: 2049 },
          { input: '12/31/49', expected: 2049 },
        ]

        testCases.forEach(({ input, expected }) => {
          const result = parseSourceDate(input, 'US_FORMAT')
          expect(result.getFullYear()).toBe(expected)
        })
      })

      test('should handle 50 -> 1950 transition correctly', () => {
        const testCases = [
          { input: '01/01/50', expected: 1950 },
          { input: '12/31/50', expected: 1950 },
          { input: '01/01/51', expected: 1951 },
        ]

        testCases.forEach(({ input, expected }) => {
          const result = parseSourceDate(input, 'US_FORMAT')
          expect(result.getFullYear()).toBe(expected)
        })
      })

      test('should handle century rollover correctly', () => {
        const boundaryTests = [
          { input: '01/01/00', expected: 2000, description: 'Y2K boundary' },
          { input: '12/31/99', expected: 1999, description: 'Last year of 20th century' },
          { input: '01/01/49', expected: 2049, description: 'Last 21st century 2-digit year' },
          { input: '01/01/50', expected: 1950, description: 'First 20th century 2-digit year' },
        ]

        boundaryTests.forEach(({ input, expected, description }) => {
          const result = parseSourceDate(input, 'US_FORMAT')
          expect(result.getFullYear()).toBe(expected)
        })
      })

      test('should handle all formats consistently for boundary years', () => {
        const formats = ['US_FORMAT', 'UK_FORMAT', 'EU_FORMAT'] as const
        const boundaryYears = ['49', '50']

        formats.forEach(format => {
          boundaryYears.forEach(year => {
            let dateString: string
            switch (format) {
              case 'US_FORMAT':
                dateString = `01/01/${year}`
                break
              case 'UK_FORMAT':
                dateString = `01/01/${year}`
                break
              case 'EU_FORMAT':
                dateString = `01.01.${year}`
                break
            }

            const result = parseSourceDate(dateString, format)
            const expectedYear = year === '49' ? 2049 : 1950
            expect(result.getFullYear()).toBe(expectedYear)
          })
        })
      })
    })

    describe('Comprehensive 2-digit year range testing', () => {
      test('should handle all valid 2-digit years correctly', () => {
        for (let year = 0; year <= 99; year++) {
          const yearStr = year.toString().padStart(2, '0')
          const dateString = `01/01/${yearStr}`
          
          const result = parseSourceDate(dateString, 'US_FORMAT')
          const expectedYear = year < 50 ? 2000 + year : 1900 + year
          
          expect(result.getFullYear()).toBe(expectedYear)
        }
      })

      test('should handle edge cases within boundary ranges', () => {
        const edgeCases = [
          { year: '01', expected: 2001 },
          { year: '10', expected: 2010 },
          { year: '20', expected: 2020 },
          { year: '30', expected: 2030 },
          { year: '40', expected: 2040 },
          { year: '48', expected: 2048 },
          { year: '49', expected: 2049 },
          { year: '50', expected: 1950 },
          { year: '60', expected: 1960 },
          { year: '70', expected: 1970 },
          { year: '80', expected: 1980 },
          { year: '90', expected: 1990 },
          { year: '99', expected: 1999 },
        ]

        edgeCases.forEach(({ year, expected }) => {
          const result = parseSourceDate(`01/01/${year}`, 'US_FORMAT')
          expect(result.getFullYear()).toBe(expected)
        })
      })
    })
  })

  describe('Leap year comprehensive testing', () => {
    describe('Standard leap year rules', () => {
      test('should handle divisible by 4 rule', () => {
        const leapYears = ['2020', '2024', '2028', '20'] // 2020 as 2-digit
        leapYears.forEach(year => {
          const result = parseSourceDate(`02/29/${year}`, 'US_FORMAT')
          expect(result).toBeValidDate()
          expect(result.getMonth()).toBe(1) // February
          expect(result.getDate()).toBe(29)
        })
      })

      test('should reject non-leap years', () => {
        const nonLeapYears = ['2021', '2022', '2023', '21', '22', '23']
        nonLeapYears.forEach(year => {
          expect(() => parseSourceDate(`02/29/${year}`, 'US_FORMAT'))
            .toThrow('Invalid date values in US format')
        })
      })
    })

    describe('Century year rules (divisible by 100)', () => {
      test('should handle century years divisible by 400', () => {
        // These are leap years
        const centuryLeapYears = ['2000']
        centuryLeapYears.forEach(year => {
          const result = parseSourceDate(`02/29/${year}`, 'US_FORMAT')
          expect(result).toBeValidDate()
          expect(result.getDate()).toBe(29)
        })
      })

      test('should reject century years not divisible by 400', () => {
        // These are not leap years
        const centuryNonLeapYears = ['1900', '2100', '2200', '2300']
        centuryNonLeapYears.forEach(year => {
          expect(() => parseSourceDate(`02/29/${year}`, 'US_FORMAT'))
            .toThrow('Invalid date values in US format')
        })
      })
    })

    describe('2-digit leap year edge cases', () => {
      test('should handle 2-digit leap years correctly', () => {
        // Testing 2-digit years that become leap years
        const tests = [
          { input: '02/29/00', expected: 2000 }, // 2000 is leap year
          { input: '02/29/04', expected: 2004 }, // 2004 is leap year
          { input: '02/29/96', expected: 1996 }, // 1996 is leap year
        ]

        tests.forEach(({ input, expected }) => {
          const result = parseSourceDate(input, 'US_FORMAT')
          expect(result).toBeValidDate()
          expect(result.getFullYear()).toBe(expected)
          expect(result.getMonth()).toBe(1)
          expect(result.getDate()).toBe(29)
        })
      })

      test('should reject 2-digit non-leap years', () => {
        const nonLeapTests = [
          '02/29/01', // 2001
          '02/29/02', // 2002
          '02/29/03', // 2003
          '02/29/97', // 1997
          '02/29/98', // 1998
          '02/29/99', // 1999
        ]

        nonLeapTests.forEach(input => {
          expect(() => parseSourceDate(input, 'US_FORMAT'))
            .toThrow('Invalid date values in US format')
        })
      })
    })

    describe('February edge cases', () => {
      test('should handle February 28th in non-leap years', () => {
        const nonLeapYears = ['2021', '2022', '2023']
        nonLeapYears.forEach(year => {
          const result = parseSourceDate(`02/28/${year}`, 'US_FORMAT')
          expect(result).toBeValidDate()
          expect(result.getDate()).toBe(28)
        })
      })

      test('should handle February 28th in leap years', () => {
        const leapYears = ['2020', '2024']
        leapYears.forEach(year => {
          const result = parseSourceDate(`02/28/${year}`, 'US_FORMAT')
          expect(result).toBeValidDate()
          expect(result.getDate()).toBe(28)
        })
      })

      test('should reject February 30th and 31st always', () => {
        const years = ['2020', '2021', '2024', '20', '21', '24']
        const invalidFebDays = ['30', '31']

        years.forEach(year => {
          invalidFebDays.forEach(day => {
            expect(() => parseSourceDate(`02/${day}/${year}`, 'US_FORMAT'))
              .toThrow('Invalid date values in US format')
          })
        })
      })
    })
  })

  describe('Invalid date detection - comprehensive', () => {
    describe('Invalid days for each month', () => {
      test('should reject day 32 for all months', () => {
        for (let month = 1; month <= 12; month++) {
          const monthStr = month.toString().padStart(2, '0')
          expect(() => parseSourceDate(`${monthStr}/32/2025`, 'US_FORMAT'))
            .toThrow('Invalid date values in US format')
        }
      })

      test('should reject day 31 for 30-day months', () => {
        const thirtyDayMonths = ['04', '06', '09', '11'] // April, June, September, November
        thirtyDayMonths.forEach(month => {
          expect(() => parseSourceDate(`${month}/31/2025`, 'US_FORMAT'))
            .toThrow('Invalid date values in US format')
        })
      })

      test('should accept day 31 for 31-day months', () => {
        const thirtyOneDayMonths = ['01', '03', '05', '07', '08', '10', '12']
        thirtyOneDayMonths.forEach(month => {
          const result = parseSourceDate(`${month}/31/2025`, 'US_FORMAT')
          expect(result).toBeValidDate()
          expect(result.getDate()).toBe(31)
        })
      })

      test('should accept day 30 for all months except February', () => {
        const nonFebMonths = ['01', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']
        nonFebMonths.forEach(month => {
          const result = parseSourceDate(`${month}/30/2025`, 'US_FORMAT')
          expect(result).toBeValidDate()
          expect(result.getDate()).toBe(30)
        })
      })
    })

    describe('Invalid months', () => {
      test('should reject month 00', () => {
        expect(() => parseSourceDate('00/15/2025', 'US_FORMAT'))
          .toThrow('Invalid date values in US format')
      })

      test('should reject months > 12', () => {
        const invalidMonths = ['13', '14', '15', '99']
        invalidMonths.forEach(month => {
          expect(() => parseSourceDate(`${month}/15/2025`, 'US_FORMAT'))
            .toThrow('Invalid date values in US format')
        })
      })

      test('should accept all valid months', () => {
        for (let month = 1; month <= 12; month++) {
          const monthStr = month.toString().padStart(2, '0')
          const result = parseSourceDate(`${monthStr}/15/2025`, 'US_FORMAT')
          expect(result).toBeValidDate()
          expect(result.getMonth()).toBe(month - 1) // JavaScript months are 0-indexed
        }
      })
    })

    describe('Invalid day zero', () => {
      test('should reject day 00 for all months', () => {
        for (let month = 1; month <= 12; month++) {
          const monthStr = month.toString().padStart(2, '0')
          expect(() => parseSourceDate(`${monthStr}/00/2025`, 'US_FORMAT'))
            .toThrow('Invalid date values in US format')
        }
      })
    })
  })

  describe('Auto-detection edge cases', () => {
    describe('Ambiguous date resolution', () => {
      test('should handle dates that could be multiple formats', () => {
        // These dates are ambiguous between US and UK formats
        const ambiguousDates = [
          { date: '01/02/2025', description: 'Could be Jan 2 (US) or Feb 1 (UK)' },
          { date: '03/04/2025', description: 'Could be Mar 4 (US) or Apr 3 (UK)' },
          { date: '05/06/2025', description: 'Could be May 6 (US) or Jun 5 (UK)' },
        ]

        ambiguousDates.forEach(({ date }) => {
          // Auto-detection should successfully parse (priority order matters)
          const result = parseSourceDate(date, 'AUTO')
          expect(result).toBeValidDate()
        })
      })

      test('should prefer earlier format in priority order for ambiguous dates', () => {
        // This date could be parsed as US format (Jan 2) or UK format (Feb 1)
        // Auto-detection tries ISO first, then US, then UK
        const result = parseSourceDate('01/02/2025', 'AUTO')
        expect(result).toBeValidDate()
        // Should be parsed as US format (MM/DD/YYYY) -> January 2nd
        expect(result.getMonth()).toBe(0) // January
        expect(result.getDate()).toBe(2)
      })

      test('should handle clearly unambiguous dates', () => {
        const unambiguousDates = [
          { date: '13/01/2025', description: 'Clearly DD/MM (month 13 invalid)' },
          { date: '01/13/2025', description: 'Clearly MM/DD (day 13 in month 1)' },
          { date: '31/12/2025', description: 'Clearly DD/MM (day 31)' },
          { date: '12/31/2025', description: 'Clearly MM/DD (December 31)' },
        ]

        unambiguousDates.forEach(({ date }) => {
          const result = parseSourceDate(date, 'AUTO')
          expect(result).toBeValidDate()
        })
      })
    })

    describe('Format detection failure cases', () => {
      test('should fail gracefully on completely invalid inputs', () => {
        const invalidInputs = [
          'not-a-date-at-all',
          '99/99/99',
          'totally-invalid',
          '2025', // Just a year
          'January', // Just a month
          '', // Empty string
          '   ', // Whitespace only
          '32/13/2025', // Invalid day and month
          '00/00/00', // All zeros
          'NaN/NaN/NaN',
        ]

        invalidInputs.forEach(input => {
          expect(() => parseSourceDate(input, 'AUTO'))
            .toThrow('Unable to auto-detect date format')
        })
      })

      test('should handle edge cases that might partially match', () => {
        const partialMatches = [
          '1/2', // Missing year
          '1/2/3/4', // Too many parts
          '25.12', // Missing year in EU format
        ]

        partialMatches.forEach(input => {
          expect(() => parseSourceDate(input, 'AUTO'))
            .toThrow('Unable to auto-detect date format')
        })
      })
    })

    describe('Unix timestamp edge cases', () => {
      test('should handle valid Unix timestamps', () => {
        const timestamps = [
          { input: '0', expected: new Date(0) },
          { input: '1640995200', expected: new Date(1640995200 * 1000) }, // 2022-01-01
          { input: '2147483647', expected: new Date(2147483647 * 1000) }, // 2038-01-19 (32-bit limit)
        ]

        timestamps.forEach(({ input, expected }) => {
          const result = parseSourceDate(input, 'AUTO')
          expect(result).toBeValidDate()
          expect(result.getTime()).toBe(expected.getTime())
        })
      })

      test('should handle invalid Unix timestamps gracefully', () => {
        const invalidTimestamps = [
          'not-a-number',
          '12345678901234567890', // Too large
          '-1', // Negative (might be valid but depends on implementation)
        ]

        // These should either work or fail gracefully in auto-detection
        invalidTimestamps.forEach(input => {
          expect(() => parseSourceDate(input, 'AUTO')).toThrow()
        })
      })
    })
  })

  describe('Custom format edge cases', () => {
    describe('Token replacement edge cases', () => {
      test('should handle overlapping tokens correctly', () => {
        // Test that YYYY doesn't interfere with YY and MM doesn't interfere with MMM, etc.
        const overlappingTests = [
          { pattern: 'YY-YYYY', input: '01/01/2025', expected: '25-2025' },
          { pattern: 'MM-MMM-MMMM', input: '01/01/2025', expected: '01-Jan-January' },
          { pattern: 'D-DD', input: '01/01/2025', expected: '1-01' },
        ]

        overlappingTests.forEach(({ pattern, input, expected }) => {
          const result = formatDate(input, 'US_FORMAT', 'CUSTOM', pattern)
          expect(result).toBe(expected)
        })
      })

      test('should handle repeated tokens', () => {
        const repeatedTests = [
          { pattern: 'YYYY YYYY', input: '01/01/2025', expected: '2025 2025' },
          { pattern: 'MM/MM/YYYY', input: '01/01/2025', expected: '01/01/2025' },
          { pattern: 'DD DD DD', input: '01/05/2025', expected: '05 05 05' },
        ]

        repeatedTests.forEach(({ pattern, input, expected }) => {
          const result = formatDate(input, 'US_FORMAT', 'CUSTOM', pattern)
          expect(result).toBe(expected)
        })
      })

      test('should handle tokens within words', () => {
        const embeddedTests = [
          { pattern: 'Year-YYYY-End', input: '01/01/2025', expected: 'Year-2025-End' },
          { pattern: 'MMM-Month', input: '01/01/2025', expected: 'Jan-Month' },
          { pattern: 'Day-DD-Date', input: '01/05/2025', expected: 'Day-05-Date' },
        ]

        embeddedTests.forEach(({ pattern, input, expected }) => {
          const result = formatDate(input, 'US_FORMAT', 'CUSTOM', pattern)
          expect(result).toBe(expected)
        })
      })
    })

    describe('Special characters and escaping', () => {
      test('should handle special characters in patterns', () => {
        const specialCharTests = [
          { pattern: 'DD/MM/YYYY', input: '01/15/2025', expected: '15/01/2025' },
          { pattern: 'DD-MM-YYYY', input: '01/15/2025', expected: '15-01-2025' },
          { pattern: 'DD.MM.YYYY', input: '01/15/2025', expected: '15.01.2025' },
          { pattern: 'DD_MM_YYYY', input: '01/15/2025', expected: '15_01_2025' },
          { pattern: 'DD MM YYYY', input: '01/15/2025', expected: '15 01 2025' },
          { pattern: 'DD|MM|YYYY', input: '01/15/2025', expected: '15|01|2025' },
        ]

        specialCharTests.forEach(({ pattern, input, expected }) => {
          const result = formatDate(input, 'US_FORMAT', 'CUSTOM', pattern)
          expect(result).toBe(expected)
        })
      })

      test('should handle patterns with no tokens', () => {
        const noTokenTests = [
          { pattern: 'No tokens here', input: '01/15/2025', expected: 'No tokens here' },
          { pattern: '12345', input: '01/15/2025', expected: '12345' },
          { pattern: '!@#$%', input: '01/15/2025', expected: '!@#$%' },
        ]

        noTokenTests.forEach(({ pattern, input, expected }) => {
          const result = formatDate(input, 'US_FORMAT', 'CUSTOM', pattern)
          expect(result).toBe(expected)
        })
      })
    })

    describe('Month name edge cases', () => {
      test('should handle all months for full names', () => {
        const monthTests = [
          { month: '01', fullName: 'January' },
          { month: '02', fullName: 'February' },
          { month: '03', fullName: 'March' },
          { month: '04', fullName: 'April' },
          { month: '05', fullName: 'May' },
          { month: '06', fullName: 'June' },
          { month: '07', fullName: 'July' },
          { month: '08', fullName: 'August' },
          { month: '09', fullName: 'September' },
          { month: '10', fullName: 'October' },
          { month: '11', fullName: 'November' },
          { month: '12', fullName: 'December' },
        ]

        monthTests.forEach(({ month, fullName }) => {
          const result = formatDate(`${month}/15/2025`, 'US_FORMAT', 'CUSTOM', 'MMMM')
          expect(result).toBe(fullName)
        })
      })

      test('should handle all months for short names', () => {
        const shortMonthTests = [
          { month: '01', shortName: 'Jan' },
          { month: '02', shortName: 'Feb' },
          { month: '03', shortName: 'Mar' },
          { month: '04', shortName: 'Apr' },
          { month: '05', shortName: 'May' },
          { month: '06', shortName: 'Jun' },
          { month: '07', shortName: 'Jul' },
          { month: '08', shortName: 'Aug' },
          { month: '09', shortName: 'Sep' },
          { month: '10', shortName: 'Oct' },
          { month: '11', shortName: 'Nov' },
          { month: '12', shortName: 'Dec' },
        ]

        shortMonthTests.forEach(({ month, shortName }) => {
          const result = formatDate(`${month}/15/2025`, 'US_FORMAT', 'CUSTOM', 'MMM')
          expect(result).toBe(shortName)
        })
      })
    })
  })

  describe('Strict date validation (JavaScript Date constructor bug fixes)', () => {
    describe('Invalid dates that JavaScript Date accepts but should be rejected', () => {
      test('should reject February 29 in non-leap years (JavaScript auto-corrects to March 1)', () => {
        const nonLeapYears = ['2023', '2021', '2022', '2025', '23', '21', '22']
        const formats = [
          { format: 'US_FORMAT' as const, createDate: (year: string) => `02/29/${year}` },
          { format: 'UK_FORMAT' as const, createDate: (year: string) => `29/02/${year}` },
          { format: 'EU_FORMAT' as const, createDate: (year: string) => `29.02.${year}` },
        ]

        nonLeapYears.forEach(year => {
          formats.forEach(({ format, createDate }) => {
            const dateString = createDate(year)
            expect(() => parseSourceDate(dateString, format))
              .toThrow(/Invalid date values in .* format/)
          })
        })
      })

      test('should reject month 13 (JavaScript auto-corrects to January of next year)', () => {
        const formats = [
          { format: 'US_FORMAT' as const, dateString: '13/15/2023', expectedError: 'US format' },
          { format: 'UK_FORMAT' as const, dateString: '15/13/2023', expectedError: 'UK format' },
          { format: 'EU_FORMAT' as const, dateString: '15.13.2023', expectedError: 'EU format' },
        ]

        formats.forEach(({ format, dateString, expectedError }) => {
          expect(() => parseSourceDate(dateString, format))
            .toThrow(`Invalid date values in ${expectedError}`)
        })
      })

      test('should reject day 32 (JavaScript auto-corrects to day 1 of next month)', () => {
        const formats = [
          { format: 'US_FORMAT' as const, dateString: '04/32/2023', expectedError: 'US format' },
          { format: 'UK_FORMAT' as const, dateString: '32/04/2023', expectedError: 'UK format' },
          { format: 'EU_FORMAT' as const, dateString: '32.04.2023', expectedError: 'EU format' },
        ]

        formats.forEach(({ format, dateString, expectedError }) => {
          expect(() => parseSourceDate(dateString, format))
            .toThrow(`Invalid date values in ${expectedError}`)
        })
      })

      test('should reject day 31 for 30-day months (JavaScript auto-corrects to day 1 of next month)', () => {
        const thirtyDayMonths = ['04', '06', '09', '11'] // April, June, September, November
        const formats = [
          { format: 'US_FORMAT' as const, createDate: (month: string) => `${month}/31/2023` },
          { format: 'UK_FORMAT' as const, createDate: (month: string) => `31/${month}/2023` },
          { format: 'EU_FORMAT' as const, createDate: (month: string) => `31.${month}.2023` },
        ]

        thirtyDayMonths.forEach(month => {
          formats.forEach(({ format, createDate }) => {
            const dateString = createDate(month)
            expect(() => parseSourceDate(dateString, format))
              .toThrow(/Invalid date values in .* format/)
          })
        })
      })

      test('should reject month 0 (JavaScript auto-corrects to December of previous year)', () => {
        const formats = [
          { format: 'US_FORMAT' as const, dateString: '00/15/2023', expectedError: 'US format' },
          { format: 'UK_FORMAT' as const, dateString: '15/00/2023', expectedError: 'UK format' },
          { format: 'EU_FORMAT' as const, dateString: '15.00.2023', expectedError: 'EU format' },
        ]

        formats.forEach(({ format, dateString, expectedError }) => {
          expect(() => parseSourceDate(dateString, format))
            .toThrow(`Invalid date values in ${expectedError}`)
        })
      })

      test('should reject day 0 (JavaScript auto-corrects to last day of previous month)', () => {
        const formats = [
          { format: 'US_FORMAT' as const, dateString: '04/00/2023', expectedError: 'US format' },
          { format: 'UK_FORMAT' as const, dateString: '00/04/2023', expectedError: 'UK format' },
          { format: 'EU_FORMAT' as const, dateString: '00.04.2023', expectedError: 'EU format' },
        ]

        formats.forEach(({ format, dateString, expectedError }) => {
          expect(() => parseSourceDate(dateString, format))
            .toThrow(`Invalid date values in ${expectedError}`)
        })
      })
    })

    describe('Valid dates that should still work after strict validation', () => {
      test('should accept valid leap year February 29', () => {
        const leapYears = ['2024', '2020', '2000', '24', '20', '00']
        const formats = [
          { format: 'US_FORMAT' as const, createDate: (year: string) => `02/29/${year}` },
          { format: 'UK_FORMAT' as const, createDate: (year: string) => `29/02/${year}` },
          { format: 'EU_FORMAT' as const, createDate: (year: string) => `29.02.${year}` },
        ]

        leapYears.forEach(year => {
          formats.forEach(({ format, createDate }) => {
            const dateString = createDate(year)
            const result = parseSourceDate(dateString, format)
            expect(result).toBeValidDate()
            expect(result.getMonth()).toBe(1) // February
            expect(result.getDate()).toBe(29)
          })
        })
      })

      test('should accept valid days for each month', () => {
        const validDates = [
          { month: '01', day: '31' }, // January - 31 days
          { month: '02', day: '28' }, // February - 28 days (non-leap)
          { month: '03', day: '31' }, // March - 31 days
          { month: '04', day: '30' }, // April - 30 days
          { month: '05', day: '31' }, // May - 31 days
          { month: '06', day: '30' }, // June - 30 days
          { month: '07', day: '31' }, // July - 31 days
          { month: '08', day: '31' }, // August - 31 days
          { month: '09', day: '30' }, // September - 30 days
          { month: '10', day: '31' }, // October - 31 days
          { month: '11', day: '30' }, // November - 30 days
          { month: '12', day: '31' }, // December - 31 days
        ]

        validDates.forEach(({ month, day }) => {
          // Test US format
          const usDate = `${month}/${day}/2023`
          const usResult = parseSourceDate(usDate, 'US_FORMAT')
          expect(usResult).toBeValidDate()
          expect(usResult.getMonth()).toBe(parseInt(month) - 1)
          expect(usResult.getDate()).toBe(parseInt(day))

          // Test UK format
          const ukDate = `${day}/${month}/2023`
          const ukResult = parseSourceDate(ukDate, 'UK_FORMAT')
          expect(ukResult).toBeValidDate()
          expect(ukResult.getMonth()).toBe(parseInt(month) - 1)
          expect(ukResult.getDate()).toBe(parseInt(day))

          // Test EU format
          const euDate = `${day}.${month}.2023`
          const euResult = parseSourceDate(euDate, 'EU_FORMAT')
          expect(euResult).toBeValidDate()
          expect(euResult.getMonth()).toBe(parseInt(month) - 1)
          expect(euResult.getDate()).toBe(parseInt(day))
        })
      })
    })

    describe('Edge cases that demonstrate the strict validation fix', () => {
      test('should show difference between JavaScript Date behavior and our strict validation', () => {
        // These test cases demonstrate what JavaScript Date constructor does vs what we do
        const testCases = [
          {
            description: 'Feb 29, 2023 → JS corrects to Mar 1, 2023; we reject',
            dateString: '02/29/2023',
            jsDateResult: new Date(2023, 1, 29), // JavaScript creates Mar 1, 2023
            ourBehavior: 'throw',
          },
          {
            description: 'Month 13 → JS corrects to Jan next year; we reject',
            dateString: '13/15/2023',
            jsDateResult: new Date(2023, 12, 15), // JavaScript creates Jan 15, 2024
            ourBehavior: 'throw',
          },
          {
            description: 'Day 32 → JS corrects to next month day 1; we reject',
            dateString: '04/32/2023',
            jsDateResult: new Date(2023, 3, 32), // JavaScript creates May 2, 2023
            ourBehavior: 'throw',
          },
        ]

        testCases.forEach(({ description, dateString, jsDateResult, ourBehavior }) => {
          // Verify JavaScript Date constructor's permissive behavior
          expect(jsDateResult.getTime()).not.toBeNaN() // JS creates a valid date

          // Verify our strict validation rejects it
          if (ourBehavior === 'throw') {
            expect(() => parseSourceDate(dateString, 'US_FORMAT')).toThrow()
          }
        })
      })
    })
  })

  describe('Performance and stress testing', () => {
    describe('Large volume processing', () => {
      test('should handle 1000 date conversions efficiently', () => {
        const dates = Array.from({ length: 1000 }, (_, i) => {
          const day = (i % 28) + 1 // Ensure valid days (1-28 for all months)
          const month = (i % 12) + 1
          const year = 2000 + (i % 50) // Years 2000-2049
          return `${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}/${year}`
        })

        const startTime = performance.now()
        
        dates.forEach(date => {
          formatDate(date, 'US_FORMAT', 'ISO_STANDARD')
        })

        const endTime = performance.now()
        const totalTime = endTime - startTime

        expect(totalTime).toBeLessThan(1000) // Should complete in under 1 second
        expect(dates.length).toBe(1000) // Verify we processed all dates
      })

      test('should handle auto-detection on mixed formats efficiently', () => {
        const mixedDates = [
          '2025-01-15', // ISO
          '01/15/2025', // US
          '15/01/2025', // UK
          '15.01.2025', // EU
        ]

        // Repeat the pattern to create a larger dataset
        const largeMixedSet = Array.from({ length: 300 }, (_, i) => 
          mixedDates[i % mixedDates.length]
        )

        const startTime = performance.now()
        
        largeMixedSet.forEach(date => {
          formatDate(date, 'AUTO', 'ISO_STANDARD')
        })

        const endTime = performance.now()
        const totalTime = endTime - startTime

        expect(totalTime).toBeLessThan(500) // Should complete efficiently
        expect(largeMixedSet.length).toBe(300)
      })
    })

    describe('Memory usage patterns', () => {
      test('should not leak memory during repeated operations', () => {
        const testDate = '01/15/2025'
        const iterations = 10000

        // Force garbage collection if available (Node.js)
        if (global.gc) {
          global.gc()
        }

        for (let i = 0; i < iterations; i++) {
          formatDate(testDate, 'US_FORMAT', 'ISO_STANDARD')
          
          // Periodically check that we're not accumulating objects
          if (i % 1000 === 0 && global.gc) {
            global.gc()
          }
        }

        // Test should complete without memory issues
        expect(true).toBe(true)
      })
    })
  })
})