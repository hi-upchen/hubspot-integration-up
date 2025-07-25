// Debug script to test invalid formats
import { parseSourceDate } from './src/lib/services/date-formatter.ts';

const invalidFormats = ['not-a-date', '99/99/99', 'invalid', '2025', 'January', '32/13/2025'];

console.log('Testing invalid formats:');
invalidFormats.forEach(format => {
  try {
    const result = parseSourceDate(format, 'AUTO');
    console.log(`❌ '${format}' did not throw error. Result year: ${result.getFullYear()}, full: ${result}`);
  } catch (error) {
    console.log(`✅ '${format}' correctly threw error: ${error.message}`);
  }
});