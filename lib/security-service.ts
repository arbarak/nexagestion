import crypto from 'crypto';

export interface SecurityPolicy {
  id: string;
  companyId: string;
  name: string;
  description: string;
  passwordMinLength: number;
  passwordRequireUppercase: boolean;
  passwordRequireNumbers: boolean;
  passwordRequireSpecialChars: boolean;
  sessionTimeout: number;
  mfaRequired: boolean;
  ipWhitelistEnabled: boolean;
  ipWhitelist: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SecurityAudit {
  id: string;
  companyId: string;
  userId: string;
  action: string;
  resource: string;
  status: 'success' | 'failure';
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
}

export interface EncryptionKey {
  id: string;
  companyId: string;
  keyName: string;
  algorithm: string;
  keySize: number;
  createdAt: Date;
  rotatedAt?: Date;
  expiresAt?: Date;
}

export class SecurityService {
  private policies: Map<string, SecurityPolicy> = new Map();
  private audits: SecurityAudit[] = [];
  private encryptionKeys: Map<string, EncryptionKey> = new Map();

  async createSecurityPolicy(
    companyId: string,
    name: string,
    description: string,
    options: Partial<SecurityPolicy> = {}
  ): Promise<SecurityPolicy> {
    const policy: SecurityPolicy = {
      id: Math.random().toString(36).substr(2, 9),
      companyId,
      name,
      description,
      passwordMinLength: options.passwordMinLength || 12,
      passwordRequireUppercase: options.passwordRequireUppercase !== false,
      passwordRequireNumbers: options.passwordRequireNumbers !== false,
      passwordRequireSpecialChars: options.passwordRequireSpecialChars !== false,
      sessionTimeout: options.sessionTimeout || 3600,
      mfaRequired: options.mfaRequired || false,
      ipWhitelistEnabled: options.ipWhitelistEnabled || false,
      ipWhitelist: options.ipWhitelist || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.policies.set(policy.id, policy);
    console.log(`Security policy created: ${name}`);
    return policy;
  }

  async getSecurityPolicy(companyId: string): Promise<SecurityPolicy | null> {
    for (const policy of this.policies.values()) {
      if (policy.companyId === companyId) {
        return policy;
      }
    }
    return null;
  }

  async validatePassword(password: string, policy: SecurityPolicy): Promise<{
    valid: boolean;
    errors: string[];
  }> {
    const errors: string[] = [];

    if (password.length < policy.passwordMinLength) {
      errors.push(`Password must be at least ${policy.passwordMinLength} characters`);
    }

    if (policy.passwordRequireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain uppercase letters');
    }

    if (policy.passwordRequireNumbers && !/[0-9]/.test(password)) {
      errors.push('Password must contain numbers');
    }

    if (policy.passwordRequireSpecialChars && !/[!@#$%^&*]/.test(password)) {
      errors.push('Password must contain special characters');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  async recordAudit(
    companyId: string,
    userId: string,
    action: string,
    resource: string,
    status: 'success' | 'failure',
    ipAddress: string,
    userAgent: string
  ): Promise<SecurityAudit> {
    const audit: SecurityAudit = {
      id: Math.random().toString(36).substr(2, 9),
      companyId,
      userId,
      action,
      resource,
      status,
      ipAddress,
      userAgent,
      timestamp: new Date(),
    };

    this.audits.push(audit);
    console.log(`Audit recorded: ${action} on ${resource}`);
    return audit;
  }

  async getAudits(
    companyId: string,
    limit: number = 100
  ): Promise<SecurityAudit[]> {
    return this.audits
      .filter((a) => a.companyId === companyId)
      .slice(-limit);
  }

  async generateEncryptionKey(
    companyId: string,
    keyName: string,
    algorithm: string = 'aes-256-gcm',
    keySize: number = 256
  ): Promise<EncryptionKey> {
    const key: EncryptionKey = {
      id: Math.random().toString(36).substr(2, 9),
      companyId,
      keyName,
      algorithm,
      keySize,
      createdAt: new Date(),
    };

    this.encryptionKeys.set(key.id, key);
    console.log(`Encryption key generated: ${keyName}`);
    return key;
  }

  async rotateEncryptionKey(keyId: string): Promise<EncryptionKey | null> {
    const key = this.encryptionKeys.get(keyId);
    if (key) {
      key.rotatedAt = new Date();
      this.encryptionKeys.set(keyId, key);
      console.log(`Encryption key rotated: ${key.keyName}`);
      return key;
    }
    return null;
  }

  async getEncryptionKeys(companyId: string): Promise<EncryptionKey[]> {
    return Array.from(this.encryptionKeys.values()).filter(
      (k) => k.companyId === companyId
    );
  }

  async encryptData(data: string, key: string): Promise<string> {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(key), iv);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }

  async decryptData(encryptedData: string, key: string): Promise<string> {
    const [iv, authTag, encrypted] = encryptedData.split(':');
    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      Buffer.from(key),
      Buffer.from(iv, 'hex')
    );
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  async getSecurityMetrics(companyId: string): Promise<{
    totalAudits: number;
    failedAttempts: number;
    successfulActions: number;
    uniqueUsers: number;
  }> {
    const companyAudits = this.audits.filter((a) => a.companyId === companyId);
    const failedAttempts = companyAudits.filter((a) => a.status === 'failure').length;
    const successfulActions = companyAudits.filter((a) => a.status === 'success').length;
    const uniqueUsers = new Set(companyAudits.map((a) => a.userId)).size;

    return {
      totalAudits: companyAudits.length,
      failedAttempts,
      successfulActions,
      uniqueUsers,
    };
  }
}

export const securityService = new SecurityService();

