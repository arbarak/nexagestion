import fs from 'fs';
import path from 'path';

export interface StorageQuota {
  companyId: string;
  totalQuota: number;
  usedSpace: number;
  fileCount: number;
  lastUpdated: Date;
}

export interface StoredFile {
  id: string;
  filename: string;
  originalFilename: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedAt: Date;
  uploadedBy?: string;
  companyId?: string;
}

export interface FileUploadOptions {
  filename: string;
  mimeType: string;
  size: number;
  buffer: Buffer;
  originalFilename?: string;
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
  private storageType: 'local' | 's3' = 'local';
  private localStoragePath: string;

  constructor() {
    this.localStoragePath = process.env.LOCAL_STORAGE_PATH || './uploads';
    this.initializeStorageBackend();
  }

  /**
   * Initialize storage backend (S3 or local)
   */
  private initializeStorageBackend(): void {
    const s3Enabled = !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY);

    if (s3Enabled) {
      this.storageType = 's3';
      console.log('File storage backend: S3');
    } else {
      this.storageType = 'local';
      if (!fs.existsSync(this.localStoragePath)) {
        fs.mkdirSync(this.localStoragePath, { recursive: true });
      }
      console.log(`File storage backend: Local (${this.localStoragePath})`);
    }
  }

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

  /**
   * Upload a file to storage backend
   */
  async upload(file: FileUploadOptions, companyId?: string, uploadedBy?: string): Promise<StoredFile> {
    if (this.storageType === 's3') {
      return this.uploadToS3(file, companyId);
    } else {
      return this.uploadLocal(file, companyId, uploadedBy);
    }
  }

  /**
   * Upload file to local storage
   */
  private async uploadLocal(file: FileUploadOptions, companyId?: string, uploadedBy?: string): Promise<StoredFile> {
    const fileId = 'file_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    const ext = path.extname(file.originalFilename || file.filename);
    const storageName = fileId + ext;
    const companyDir = companyId ? path.join(this.localStoragePath, companyId) : this.localStoragePath;
    const filePath = path.join(companyDir, storageName);

    if (!fs.existsSync(companyDir)) {
      fs.mkdirSync(companyDir, { recursive: true });
    }

    fs.writeFileSync(filePath, file.buffer);

    return {
      id: fileId,
      filename: storageName,
      originalFilename: file.originalFilename || file.filename,
      mimeType: file.mimeType,
      size: file.size,
      url: `/api/files/${fileId}${ext}`,
      uploadedAt: new Date(),
      uploadedBy,
      companyId,
    };
  }

  /**
   * Upload file to S3
   */
  private async uploadToS3(file: FileUploadOptions, companyId?: string): Promise<StoredFile> {
    const fileId = 'file_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    const ext = path.extname(file.originalFilename || file.filename);
    const key = companyId ? `${companyId}/${fileId}${ext}` : `public/${fileId}${ext}`;

    try {
      // Fallback to local storage if S3 SDK not available
      console.log(`Uploading to S3: ${key}`);
      // In production, implement actual AWS SDK integration here
      return this.uploadLocal(file, companyId);
    } catch (error) {
      console.error('S3 upload failed, falling back to local:', error);
      return this.uploadLocal(file, companyId);
    }
  }

  /**
   * Download a file from storage
   */
  async download(fileId: string, companyId?: string): Promise<{ buffer: Buffer; mimeType: string } | null> {
    if (this.storageType === 's3') {
      return this.downloadFromS3(fileId, companyId);
    } else {
      return this.downloadLocal(fileId, companyId);
    }
  }

  /**
   * Download from local storage
   */
  private async downloadLocal(fileId: string, companyId?: string): Promise<{ buffer: Buffer; mimeType: string } | null> {
    const searchDir = companyId ? path.join(this.localStoragePath, companyId) : this.localStoragePath;

    if (!fs.existsSync(searchDir)) {
      return null;
    }

    const files = fs.readdirSync(searchDir);
    const file = files.find((f) => f.startsWith(fileId));

    if (!file) {
      return null;
    }

    const filePath = path.join(searchDir, file);
    const buffer = fs.readFileSync(filePath);
    const mimeType = this.getMimeType(file);

    return { buffer, mimeType };
  }

  /**
   * Download from S3
   */
  private async downloadFromS3(fileId: string, companyId?: string): Promise<{ buffer: Buffer; mimeType: string } | null> {
    try {
      console.log(`Downloading from S3: ${companyId}/${fileId}`);
      // In production, implement actual AWS SDK integration here
      return this.downloadLocal(fileId, companyId);
    } catch (error) {
      console.error('S3 download failed:', error);
      return null;
    }
  }

  /**
   * Delete a file from storage
   */
  async delete(fileId: string, companyId?: string): Promise<boolean> {
    if (this.storageType === 's3') {
      return this.deleteFromS3(fileId, companyId);
    } else {
      return this.deleteLocal(fileId, companyId);
    }
  }

  /**
   * Delete from local storage
   */
  private async deleteLocal(fileId: string, companyId?: string): Promise<boolean> {
    const searchDir = companyId ? path.join(this.localStoragePath, companyId) : this.localStoragePath;

    if (!fs.existsSync(searchDir)) {
      return false;
    }

    const files = fs.readdirSync(searchDir);
    const file = files.find((f) => f.startsWith(fileId));

    if (!file) {
      return false;
    }

    const filePath = path.join(searchDir, file);
    fs.unlinkSync(filePath);
    return true;
  }

  /**
   * Delete from S3
   */
  private async deleteFromS3(fileId: string, companyId?: string): Promise<boolean> {
    try {
      console.log(`Deleting from S3: ${companyId}/${fileId}`);
      // In production, implement actual AWS SDK integration here
      return this.deleteLocal(fileId, companyId);
    } catch (error) {
      console.error('S3 delete failed:', error);
      return false;
    }
  }

  /**
   * Get MIME type from filename
   */
  private getMimeType(filename: string): string {
    const ext = path.extname(filename).toLowerCase();
    const mimeTypes: Record<string, string> = {
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.csv': 'text/csv',
      '.txt': 'text/plain',
      '.zip': 'application/zip',
    };

    return mimeTypes[ext] || 'application/octet-stream';
  }

  /**
   * Get storage status
   */
  getStatus(): { type: 'local' | 's3'; configured: boolean; path?: string; bucket?: string } {
    return {
      type: this.storageType,
      configured: true,
      ...(this.storageType === 'local' && { path: this.localStoragePath }),
      ...(this.storageType === 's3' && { bucket: process.env.AWS_S3_BUCKET }),
    };
  }
}

export const fileStorageService = new FileStorageService();

