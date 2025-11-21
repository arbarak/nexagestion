export interface APIKey {
  id: string;
  companyId: string;
  keyCode: string;
  keyName: string;
  keyValue: string;
  permissions: string[];
  rateLimit: number;
  status: 'active' | 'inactive' | 'revoked';
  expiryDate?: Date;
  createdAt: Date;
}

export interface APIUsage {
  id: string;
  keyId: string;
  usageCode: string;
  endpoint: string;
  method: string;
  requestCount: number;
  responseTime: number;
  status: 'success' | 'error';
  createdAt: Date;
}

export interface APIVersion {
  id: string;
  companyId: string;
  versionCode: string;
  versionName: string;
  versionNumber: string;
  releaseDate: Date;
  deprecationDate?: Date;
  status: 'active' | 'deprecated' | 'retired';
  createdAt: Date;
}

export interface APIManagementMetrics {
  totalAPIKeys: number;
  activeAPIKeys: number;
  totalUsage: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  totalVersions: number;
  activeVersions: number;
}

export class APIManagementService {
  private apiKeys: Map<string, APIKey> = new Map();
  private usage: Map<string, APIUsage> = new Map();
  private versions: Map<string, APIVersion> = new Map();

  async createAPIKey(
    companyId: string,
    keyCode: string,
    keyName: string,
    permissions: string[],
    rateLimit: number,
    expiryDate?: Date
  ): Promise<APIKey> {
    const apiKey: APIKey = {
      id: Math.random().toString(36).substr(2, 9),
      companyId,
      keyCode,
      keyName,
      keyValue: Math.random().toString(36).substr(2, 32),
      permissions,
      rateLimit,
      status: 'active',
      expiryDate,
      createdAt: new Date(),
    };

    this.apiKeys.set(apiKey.id, apiKey);
    console.log(`API Key created: ${keyName}`);
    return apiKey;
  }

  async revokeAPIKey(keyId: string): Promise<APIKey | null> {
    const apiKey = this.apiKeys.get(keyId);
    if (!apiKey) return null;

    apiKey.status = 'revoked';
    this.apiKeys.set(keyId, apiKey);
    console.log(`API Key revoked: ${keyId}`);
    return apiKey;
  }

  async recordAPIUsage(
    keyId: string,
    usageCode: string,
    endpoint: string,
    method: string,
    requestCount: number,
    responseTime: number,
    status: 'success' | 'error'
  ): Promise<APIUsage> {
    const apiUsage: APIUsage = {
      id: Math.random().toString(36).substr(2, 9),
      keyId,
      usageCode,
      endpoint,
      method,
      requestCount,
      responseTime,
      status,
      createdAt: new Date(),
    };

    this.usage.set(apiUsage.id, apiUsage);
    console.log(`API usage recorded: ${endpoint}`);
    return apiUsage;
  }

  async createVersion(
    companyId: string,
    versionCode: string,
    versionName: string,
    versionNumber: string,
    releaseDate: Date
  ): Promise<APIVersion> {
    const version: APIVersion = {
      id: Math.random().toString(36).substr(2, 9),
      companyId,
      versionCode,
      versionName,
      versionNumber,
      releaseDate,
      status: 'active',
      createdAt: new Date(),
    };

    this.versions.set(version.id, version);
    console.log(`API Version created: ${versionName}`);
    return version;
  }

  async deprecateVersion(versionId: string, deprecationDate: Date): Promise<APIVersion | null> {
    const version = this.versions.get(versionId);
    if (!version) return null;

    version.status = 'deprecated';
    version.deprecationDate = deprecationDate;
    this.versions.set(versionId, version);
    console.log(`API Version deprecated: ${versionId}`);
    return version;
  }

  async getAPIManagementMetrics(companyId: string): Promise<APIManagementMetrics> {
    const apiKeys = Array.from(this.apiKeys.values()).filter((k) => k.companyId === companyId);
    const activeKeys = apiKeys.filter((k) => k.status === 'active').length;

    const usageRecords = Array.from(this.usage.values());
    const successfulRequests = usageRecords.filter((u) => u.status === 'success').length;
    const failedRequests = usageRecords.filter((u) => u.status === 'error').length;
    const avgResponseTime = usageRecords.length > 0
      ? usageRecords.reduce((sum, u) => sum + u.responseTime, 0) / usageRecords.length
      : 0;

    const versions = Array.from(this.versions.values()).filter((v) => v.companyId === companyId);
    const activeVersions = versions.filter((v) => v.status === 'active').length;

    return {
      totalAPIKeys: apiKeys.length,
      activeAPIKeys: activeKeys,
      totalUsage: usageRecords.length,
      successfulRequests,
      failedRequests,
      averageResponseTime: avgResponseTime,
      totalVersions: versions.length,
      activeVersions,
    };
  }
}

export const apiManagementService = new APIManagementService();

