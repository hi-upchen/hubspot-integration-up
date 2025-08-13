/**
 * Tests for Encryption Service
 */

import { EncryptionService, getEncryptionService, encryptApiKey, decryptApiKey } from '@/lib/features/url-shortener/utils/encryption';

describe('EncryptionService', () => {
  let encryptionService: EncryptionService;
  const testPassword = 'test-password-12345';
  const testText = 'sensitive-api-key-data';

  beforeEach(() => {
    encryptionService = new EncryptionService();
  });

  describe('encrypt and decrypt', () => {
    it('should encrypt and decrypt text correctly', () => {
      const encrypted = encryptionService.encrypt(testText, testPassword);
      expect(encrypted).toBeDefined();
      expect(encrypted).not.toBe(testText);
      expect(typeof encrypted).toBe('string');

      const decrypted = encryptionService.decrypt(encrypted, testPassword);
      expect(decrypted).toBe(testText);
    });

    it('should produce different encrypted values for same input', () => {
      const encrypted1 = encryptionService.encrypt(testText, testPassword);
      const encrypted2 = encryptionService.encrypt(testText, testPassword);
      
      expect(encrypted1).not.toBe(encrypted2);
      
      // But both should decrypt to the same value
      expect(encryptionService.decrypt(encrypted1, testPassword)).toBe(testText);
      expect(encryptionService.decrypt(encrypted2, testPassword)).toBe(testText);
    });

    it('should fail to decrypt with wrong password', () => {
      const encrypted = encryptionService.encrypt(testText, testPassword);
      
      expect(() => {
        encryptionService.decrypt(encrypted, 'wrong-password');
      }).toThrow();
    });

    it('should handle empty string', () => {
      const encrypted = encryptionService.encrypt('', testPassword);
      const decrypted = encryptionService.decrypt(encrypted, testPassword);
      expect(decrypted).toBe('');
    });

    it('should handle unicode characters', () => {
      const unicodeText = '🔐 API Key with émojis and spëcial chars 中文';
      const encrypted = encryptionService.encrypt(unicodeText, testPassword);
      const decrypted = encryptionService.decrypt(encrypted, testPassword);
      expect(decrypted).toBe(unicodeText);
    });

    it('should handle long text', () => {
      const longText = 'A'.repeat(10000);
      const encrypted = encryptionService.encrypt(longText, testPassword);
      const decrypted = encryptionService.decrypt(encrypted, testPassword);
      expect(decrypted).toBe(longText);
    });

    it('should fail with invalid encrypted data', () => {
      expect(() => {
        encryptionService.decrypt('invalid-encrypted-data', testPassword);
      }).toThrow();
    });

    it('should fail with truncated encrypted data', () => {
      const encrypted = encryptionService.encrypt(testText, testPassword);
      const truncated = encrypted.substring(0, 10);
      
      expect(() => {
        encryptionService.decrypt(truncated, testPassword);
      }).toThrow();
    });
  });

  describe('generateKey', () => {
    it('should generate a secure random key', () => {
      const key1 = encryptionService.generateKey();
      const key2 = encryptionService.generateKey();
      
      expect(key1).toBeDefined();
      expect(key2).toBeDefined();
      expect(typeof key1).toBe('string');
      expect(typeof key2).toBe('string');
      expect(key1.length).toBe(64); // 32 bytes * 2 (hex)
      expect(key2.length).toBe(64);
      expect(key1).not.toBe(key2);
    });

    it('should generate keys with valid hex characters', () => {
      const key = encryptionService.generateKey();
      expect(key).toMatch(/^[0-9a-f]{64}$/);
    });
  });
});

describe('getEncryptionService', () => {
  it('should return singleton instance', () => {
    const service1 = getEncryptionService();
    const service2 = getEncryptionService();
    
    expect(service1).toBe(service2);
    expect(service1).toBeInstanceOf(EncryptionService);
  });
});

describe('API key encryption helpers', () => {
  const originalEnv = process.env.ENCRYPTION_KEY;
  const testEncryptionKey = 'test-encryption-key-12345';
  const testApiKey = 'bitly-api-key-example';

  beforeAll(() => {
    process.env.ENCRYPTION_KEY = testEncryptionKey;
  });

  afterAll(() => {
    if (originalEnv !== undefined) {
      process.env.ENCRYPTION_KEY = originalEnv;
    } else {
      delete process.env.ENCRYPTION_KEY;
    }
  });

  describe('encryptApiKey', () => {
    it('should encrypt API key using environment key', () => {
      const encrypted = encryptApiKey(testApiKey);
      
      expect(encrypted).toBeDefined();
      expect(typeof encrypted).toBe('string');
      expect(encrypted).not.toBe(testApiKey);
    });

    it('should throw error without ENCRYPTION_KEY', () => {
      delete process.env.ENCRYPTION_KEY;
      
      expect(() => {
        encryptApiKey(testApiKey);
      }).toThrow('ENCRYPTION_KEY environment variable is not set');
      
      // Restore for other tests
      process.env.ENCRYPTION_KEY = testEncryptionKey;
    });
  });

  describe('decryptApiKey', () => {
    it('should decrypt API key using environment key', () => {
      const encrypted = encryptApiKey(testApiKey);
      const decrypted = decryptApiKey(encrypted);
      
      expect(decrypted).toBe(testApiKey);
    });

    it('should throw error without ENCRYPTION_KEY', () => {
      const encrypted = encryptApiKey(testApiKey);
      delete process.env.ENCRYPTION_KEY;
      
      expect(() => {
        decryptApiKey(encrypted);
      }).toThrow('ENCRYPTION_KEY environment variable is not set');
      
      // Restore for other tests
      process.env.ENCRYPTION_KEY = testEncryptionKey;
    });
  });

  describe('round-trip encryption', () => {
    it('should handle round-trip encryption correctly', () => {
      const originalKey = 'super-secret-bitly-api-key-12345';
      
      const encrypted = encryptApiKey(originalKey);
      const decrypted = decryptApiKey(encrypted);
      
      expect(decrypted).toBe(originalKey);
    });

    it('should handle multiple round-trips', () => {
      const originalKey = 'api-key-test';
      
      // Encrypt and decrypt multiple times
      for (let i = 0; i < 5; i++) {
        const encrypted = encryptApiKey(originalKey);
        const decrypted = decryptApiKey(encrypted);
        expect(decrypted).toBe(originalKey);
      }
    });
  });
});