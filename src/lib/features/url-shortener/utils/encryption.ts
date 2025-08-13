import crypto from 'crypto';

/**
 * Encryption utility for API keys and sensitive data
 * Uses AES-256-GCM for encryption
 */
export class EncryptionService {
  private algorithm = 'aes-256-gcm';
  private keyLength = 32; // 256 bits
  private ivLength = 16; // 128 bits
  private tagLength = 16; // 128 bits
  private saltLength = 32; // 256 bits
  private iterations = 100000;
  
  private deriveKey(password: string, salt: Buffer): Buffer {
    return crypto.pbkdf2Sync(password, salt, this.iterations, this.keyLength, 'sha256');
  }
  
  /**
   * Encrypts a string value
   * @param text - The plaintext to encrypt
   * @param password - The password/key to use for encryption
   * @returns Encrypted string in format: salt:iv:tag:encrypted
   */
  encrypt(text: string, password: string): string {
    // Generate random salt for key derivation
    const salt = crypto.randomBytes(this.saltLength);
    
    // Derive key from password
    const key = this.deriveKey(password, salt);
    
    // Generate random IV
    const iv = crypto.randomBytes(this.ivLength);
    
    // Create cipher
    const cipher = crypto.createCipheriv(this.algorithm, key, iv);
    
    // Encrypt the text
    const encrypted = Buffer.concat([
      cipher.update(text, 'utf8'),
      cipher.final()
    ]);
    
    // Get the authentication tag
    const tag = cipher.getAuthTag();
    
    // Combine salt, iv, tag, and encrypted data
    const combined = Buffer.concat([salt, iv, tag, encrypted]);
    
    // Return as base64 string
    return combined.toString('base64');
  }
  
  /**
   * Decrypts an encrypted string
   * @param encryptedText - The encrypted string from encrypt()
   * @param password - The password/key used for encryption
   * @returns The decrypted plaintext
   */
  decrypt(encryptedText: string, password: string): string {
    // Decode from base64
    const combined = Buffer.from(encryptedText, 'base64');
    
    // Extract components
    const salt = combined.subarray(0, this.saltLength);
    const iv = combined.subarray(this.saltLength, this.saltLength + this.ivLength);
    const tag = combined.subarray(
      this.saltLength + this.ivLength,
      this.saltLength + this.ivLength + this.tagLength
    );
    const encrypted = combined.subarray(this.saltLength + this.ivLength + this.tagLength);
    
    // Derive key from password
    const key = this.deriveKey(password, salt);
    
    // Create decipher
    const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
    decipher.setAuthTag(tag);
    
    // Decrypt
    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final()
    ]);
    
    return decrypted.toString('utf8');
  }
  
  /**
   * Generates a secure random key
   * @returns A random key suitable for encryption
   */
  generateKey(): string {
    return crypto.randomBytes(32).toString('hex');
  }
}

// Singleton instance
let encryptionService: EncryptionService | null = null;

/**
 * Gets the singleton encryption service instance
 * @returns The encryption service
 */
export function getEncryptionService(): EncryptionService {
  if (!encryptionService) {
    encryptionService = new EncryptionService();
  }
  return encryptionService;
}

/**
 * Encrypts an API key using the application's encryption key
 * @param apiKey - The API key to encrypt
 * @returns The encrypted API key
 */
export function encryptApiKey(apiKey: string): string {
  const encryptionKey = process.env.ENCRYPTION_KEY;
  if (!encryptionKey) {
    throw new Error('ENCRYPTION_KEY environment variable is not set');
  }
  
  const service = getEncryptionService();
  return service.encrypt(apiKey, encryptionKey);
}

/**
 * Decrypts an API key using the application's encryption key
 * @param encryptedApiKey - The encrypted API key
 * @returns The decrypted API key
 */
export function decryptApiKey(encryptedApiKey: string): string {
  const encryptionKey = process.env.ENCRYPTION_KEY;
  if (!encryptionKey) {
    throw new Error('ENCRYPTION_KEY environment variable is not set');
  }
  
  const service = getEncryptionService();
  return service.decrypt(encryptedApiKey, encryptionKey);
}