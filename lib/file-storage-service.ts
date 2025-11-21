export interface StorageQuota {
  companyId: string;
  totalQuota: number;
  usedSpace: number;
  fileCount: number;
  lastUpdated: Date;
}

export interface FileVersion {
  id: string;
  documentId: string;
  versionNumber: number;
  uploadedAt: Date;
  uploadedBy: string;
  fileSize: number;
  changeLog?: string;
}

export class FileStorageService {
  private quotas: Map<string, StorageQuota> = new Map();
  private versions: Map<string, FileVersion[]> = new Map();
  private defaultQuota = 10 * 1024 * 1024 * 1024; // 10GB

  async initializeQuota(companyId: string, quotaSize?: number): Promise<StorageQuota> {
    const quota: StorageQuota = {
      companyId,
      totalQuota: quotaSize || this.defaultQuota,
      usedSpace: 0,
      fileCount: 0,
      lastUpdated: new Date(),
    };

    this.quotas.set(companyId, quota);
    console.log(`Initialized quota for company: ${companyId}`);
    return quota;
  }

  async getQuota(companyId: string): Promise<StorageQuota | null> {
    return this.quotas.get(companyId) || null;
  }

  async updateQuotaUsage(
    companyId: string,
    fileSize: number,
    increment: boolean = true
  ): Promise<StorageQuota | null> {
    const quota = this.quotas.get(companyId);
    if (!quota) return null;

    if (increment) {
      quota.usedSpace += fileSize;
      quota.fileCount++;
    } else {
      quota.usedSpace = Math.max(0, quota.usedSpace - fileSize);
      quota.fileCount = Math.max(0, quota.fileCount - 1);
    }

    quota.lastUpdated = new Date();
    this.quotas.set(companyId, quota);
    return quota;
  }

  async checkQuotaAvailable(companyId: string, fileSize: number): Promise<boolean> {
    const quota = this.quotas.get(companyId);
    if (!quota) return false;
    return quota.usedSpace + fileSize <= quota.totalQuota;
  }

  async getQuotaPercentage(companyId: string): Promise<number> {
    const quota = this.quotas.get(companyId);
    if (!quota) return 0;
    return (quota.usedSpace / quota.totalQuota) * 100;
  }

  async addFileVersion(
    documentId: string,
    fileSize: number,
    uploadedBy: string,
    changeLog?: string
  ): Promise<FileVersion> {
    const versions = this.versions.get(documentId) || [];
    const versionNumber = versions.length + 1;

    const version: FileVersion = {
      id: Math.random().toString(36).substr(2, 9),
      documentId,
      versionNumber,
      uploadedAt: new Date(),
      uploadedBy,
      fileSize,
      changeLog,
    };

    versions.push(version);
    this.versions.set(documentId, versions);
    console.log(`Added version ${versionNumber} for document: ${documentId}`);
    return version;
  }

  async getFileVersions(documentId: string): Promise<FileVersion[]> {
    return this.versions.get(documentId) || [];
  }

  async getFileVersion(documentId: string, versionNumber: number): Promise<FileVersion | null> {
    const versions = this.versions.get(documentId) || [];
    return versions.find(v => v.versionNumber === versionNumber) || null;
  }

  async deleteFileVersion(documentId: string, versionNumber: number): Promise<void> {
    const versions = this.versions.get(documentId) || [];
    const filtered = versions.filter(v => v.versionNumber !== versionNumber);
    if (filtered.length > 0) {
      this.versions.set(documentId, filtered);
    } else {
      this.versions.delete(documentId);
    }
    console.log(`Deleted version ${versionNumber} for document: ${documentId}`);
  }

  async getStorageStats(companyId: string): Promise<{
    quota: StorageQuota | null;
    usagePercentage: number;
    remainingSpace: number;
    averageFileSize: number;
  }> {
    const quota = this.quotas.get(companyId);
    if (!quota) {
      return {
        quota: null,
        usagePercentage: 0,
        remainingSpace: 0,
        averageFileSize: 0,
      };
    }

    const usagePercentage = (quota.usedSpace / quota.totalQuota) * 100;
    const remainingSpace = quota.totalQuota - quota.usedSpace;
    const averageFileSize = quota.fileCount > 0 ? quota.usedSpace / quota.fileCount : 0;

    return {
      quota,
      usagePercentage,
      remainingSpace,
      averageFileSize,
    };
  }

  async upgradeQuota(companyId: string, newQuotaSize: number): Promise<StorageQuota | null> {
    const quota = this.quotas.get(companyId);
    if (!quota) return null;

    quota.totalQuota = newQuotaSize;
    quota.lastUpdated = new Date();
    this.quotas.set(companyId, quota);
    console.log(`Upgraded quota for company ${companyId} to ${newQuotaSize} bytes`);
    return quota;
  }

  async cleanupExpiredFiles(companyId: string, expirationDays: number): Promise<number> {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() - expirationDays);

    let cleanedCount = 0;
    // This would be implemented with actual file cleanup logic
    console.log(`Cleanup completed for company ${companyId}`);
    return cleanedCount;
  }
}

export const fileStorageService = new FileStorageService();

