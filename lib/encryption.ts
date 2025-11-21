import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key-change-in-production';
const ALGORITHM = 'aes-256-gcm';

export class EncryptionService {
  private key: Buffer;

  constructor(key: string = ENCRYPTION_KEY) {
    // Ensure key is 32 bytes for AES-256
    this.key = crypto.scryptSync(key, 'salt', 32);
  }

  encrypt(plaintext: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, this.key, iv);

    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    // Combine IV, auth tag, and encrypted data
    const combined = iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
    return combined;
  }

  decrypt(encrypted: string): string {
    const parts = encrypted.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format');
    }

    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encryptedData = parts[2];

    const decipher = crypto.createDecipheriv(ALGORITHM, this.key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  verifyPassword(password: string, hash: string): boolean {
    return this.hashPassword(password) === hash;
  }

  generateToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  generateOTP(length: number = 6): string {
    const digits = '0123456789';
    let otp = '';
    for (let i = 0; i < length; i++) {
      otp += digits[Math.floor(Math.random() * 10)];
    }
    return otp;
  }
}

export const encryptionService = new EncryptionService();

// Utility functions
export function encryptSensitiveData(data: string): string {
  return encryptionService.encrypt(data);
}

export function decryptSensitiveData(encrypted: string): string {
  return encryptionService.decrypt(encrypted);
}

export function hashPassword(password: string): string {
  return encryptionService.hashPassword(password);
}

export function verifyPassword(password: string, hash: string): boolean {
  return encryptionService.verifyPassword(password, hash);
}

export function generateSecureToken(): string {
  return encryptionService.generateToken();
}

export function generateOTP(): string {
  return encryptionService.generateOTP();
}

