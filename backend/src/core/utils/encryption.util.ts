import * as crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
// Ensure the key is exactly 32 bytes (64 hex characters)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY 
  ? Buffer.from(process.env.ENCRYPTION_KEY, 'hex') 
  : crypto.randomBytes(32); 

const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;

/**
 * Encrypts a string using AES-256-GCM.
 * Returns a hex string in the format: iv:tag:encryptedData
 */
export function encrypt(text: string | null | undefined): string | null {
  if (!text) return null;
  
  // If it's already encrypted (has iv:tag:content format), don't encrypt again
  if (isEncrypted(text)) return text;

  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`;
  } catch (error) {
    console.error('Encryption failed:', error);
    return text; // Fallback to raw text if encryption fails
  }
}

/**
 * Decrypts an AES-256-GCM encrypted string.
 * Expects the format: iv:tag:encryptedData
 */
export function decrypt(text: string | null | undefined): string | null {
  if (!text) return null;

  if (!isEncrypted(text)) return text;

  try {
    const parts = text.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const tag = Buffer.from(parts[1], 'hex');
    const encryptedText = parts[2];

    const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('Decryption failed for text:', text, error);
    return text; // Return the original text if decryption fails (might be raw data that looked like encrypted)
  }
}

/**
 * Checks if a string looks like our encrypted format (iv:tag:data).
 */
export function isEncrypted(text: string): boolean {
  if (!text || typeof text !== 'string') return false;
  const parts = text.split(':');
  // iv is 16 bytes (32 hex chars), tag is 16 bytes (32 hex chars)
  return parts.length === 3 && parts[0].length === 32 && parts[1].length === 32;
}
