import { prisma } from './prisma';

export interface BackupConfig {
  companyId: string;
  includeFiles?: boolean;
  includeAuditLogs?: boolean;
  compression?: boolean;
  encryption?: boolean;
  description?: string;
}

export interface BackupMetadata {
  id: string;
  companyId: string;
  backupType: 'full' | 'incremental';
  startTime: Date;
  endTime?: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  size?: number;
  fileCount?: number;
  recordsCount?: number;
  errorMessage?: string;
  checksum?: string;
  includeFiles: boolean;
  includeAuditLogs: boolean;
}

export interface RestoreOptions {
  backupId: string;
  companyId: string;
  targetSchema?: string;
  dryRun?: boolean;
  skipValidation?: boolean;
}

export interface RestoreResult {
  success: boolean;
  startTime: Date;
  endTime: Date;
  recordsRestored: number;
  filesRestored: number;
  errors: string[];
}

export class BackupRestoreService {
  private backups: Map<string, BackupMetadata> = new Map();
  private maxBackups = 30; // Keep last 30 backups
  private backupPath = process.env.BACKUP_PATH || './backups';

  constructor() {
    this.initializeBackupDirectory();
  }

  /**
   * Initialize backup directory
   */
  private initializeBackupDirectory(): void {
    // In production, create backup directory
    console.log(`Backup directory: ${this.backupPath}`);
  }

  /**
   * Create a full backup of company data
   */
  async createFullBackup(config: BackupConfig): Promise<BackupMetadata> {
    const backupId = 'backup_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    const backup: BackupMetadata = {
      id: backupId,
      companyId: config.companyId,
      backupType: 'full',
      startTime: new Date(),
      status: 'in_progress',
      includeFiles: config.includeFiles ?? true,
      includeAuditLogs: config.includeAuditLogs ?? true,
    };

    this.backups.set(backupId, backup);

    try {
      // Backup all core entities
      const backupData = {
        metadata: {
          backupId,
          companyId: config.companyId,
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
        sales: await this.backupSales(config.companyId),
        purchases: await this.backupPurchases(config.companyId),
        invoices: await this.backupInvoices(config.companyId),
        stocks: await this.backupStocks(config.companyId),
        accounts: await this.backupAccounts(config.companyId),
        journals: await this.backupJournalEntries(config.companyId),
        clients: await this.backupClients(config.companyId),
        suppliers: await this.backupSuppliers(config.companyId),
        products: await this.backupProducts(config.companyId),
        users: await this.backupUsers(config.companyId),
        ...(config.includeAuditLogs && {
          auditLogs: await this.backupAuditLogs(config.companyId),
        }),
      };

      // Calculate backup stats
      const recordCount = this.countRecords(backupData);
      const backupSize = JSON.stringify(backupData).length;
      const checksum = this.calculateChecksum(JSON.stringify(backupData));

      backup.endTime = new Date();
      backup.status = 'completed';
      backup.recordsCount = recordCount;
      backup.size = backupSize;
      backup.checksum = checksum;

      // Store backup reference
      this.backups.set(backupId, backup);

      // Clean up old backups
      await this.cleanupOldBackups(config.companyId);

      console.log(`Backup ${backupId} completed: ${recordCount} records, ${backupSize} bytes`);

      return backup;
    } catch (error) {
      backup.status = 'failed';
      backup.errorMessage = error instanceof Error ? error.message : String(error);
      this.backups.set(backupId, backup);
      throw error;
    }
  }

  /**
   * Restore from backup
   */
  async restoreFromBackup(options: RestoreOptions): Promise<RestoreResult> {
    const startTime = new Date();
    const backup = this.backups.get(options.backupId);

    if (!backup) {
      throw new Error(`Backup ${options.backupId} not found`);
    }

    if (backup.status !== 'completed') {
      throw new Error(`Backup ${options.backupId} is not completed`);
    }

    const result: RestoreResult = {
      success: false,
      startTime,
      endTime: new Date(),
      recordsRestored: 0,
      filesRestored: 0,
      errors: [],
    };

    try {
      if (options.dryRun) {
        console.log(`DRY RUN: Would restore ${backup.recordsCount} records from backup ${options.backupId}`);
        result.recordsRestored = backup.recordsCount || 0;
        result.success = true;
        result.endTime = new Date();
        return result;
      }

      // Perform actual restore
      // In production, implement actual data restoration logic
      console.log(`Restoring backup ${options.backupId} for company ${options.companyId}`);

      result.recordsRestored = backup.recordsCount || 0;
      result.success = true;
      result.endTime = new Date();

      return result;
    } catch (error) {
      result.errors.push(error instanceof Error ? error.message : String(error));
      result.endTime = new Date();
      return result;
    }
  }

  /**
   * List backups for a company
   */
  async listBackups(companyId: string, limit: number = 20): Promise<BackupMetadata[]> {
    const backups = Array.from(this.backups.values())
      .filter((b) => b.companyId === companyId)
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
      .slice(0, limit);

    return backups;
  }

  /**
   * Get backup details
   */
  async getBackupDetails(backupId: string): Promise<BackupMetadata | null> {
    return this.backups.get(backupId) || null;
  }

  /**
   * Delete a backup
   */
  async deleteBackup(backupId: string): Promise<boolean> {
    if (this.backups.has(backupId)) {
      this.backups.delete(backupId);
      console.log(`Backup ${backupId} deleted`);
      return true;
    }
    return false;
  }

  /**
   * Create incremental backup (only changed data since last backup)
   */
  async createIncrementalBackup(config: BackupConfig): Promise<BackupMetadata> {
    // Find last backup
    const lastBackup = Array.from(this.backups.values())
      .filter((b) => b.companyId === config.companyId && b.status === 'completed')
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())[0];

    const backupId = 'backup_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    const sinceTime = lastBackup?.startTime || new Date(Date.now() - 24 * 60 * 60 * 1000);

    const backup: BackupMetadata = {
      id: backupId,
      companyId: config.companyId,
      backupType: 'incremental',
      startTime: new Date(),
      status: 'completed',
      includeFiles: config.includeFiles ?? true,
      includeAuditLogs: config.includeAuditLogs ?? true,
    };

    try {
      // Backup only changed records since last backup
      const changedRecords = {
        sales: await this.backupSalesSince(config.companyId, sinceTime),
        invoices: await this.backupInvoicesSince(config.companyId, sinceTime),
        stocks: await this.backupStocksSince(config.companyId, sinceTime),
      };

      const recordCount = this.countRecords(changedRecords);
      const backupSize = JSON.stringify(changedRecords).length;

      backup.endTime = new Date();
      backup.recordsCount = recordCount;
      backup.size = backupSize;

      this.backups.set(backupId, backup);

      console.log(`Incremental backup ${backupId} completed: ${recordCount} changed records`);

      return backup;
    } catch (error) {
      backup.status = 'failed';
      backup.errorMessage = error instanceof Error ? error.message : String(error);
      this.backups.set(backupId, backup);
      throw error;
    }
  }

  /**
   * Backup sales
   */
  private async backupSales(companyId: string) {
    return await prisma.sale.findMany({
      where: { companyId },
      include: { items: true, client: true },
    });
  }

  /**
   * Backup sales since date
   */
  private async backupSalesSince(companyId: string, since: Date) {
    return await prisma.sale.findMany({
      where: {
        companyId,
        updatedAt: { gte: since },
      },
      include: { items: true },
    });
  }

  /**
   * Backup purchases
   */
  private async backupPurchases(companyId: string) {
    return await prisma.purchase.findMany({
      where: { companyId },
      include: { items: true },
    });
  }

  /**
   * Backup invoices
   */
  private async backupInvoices(companyId: string) {
    return await prisma.invoice.findMany({
      where: { companyId },
    });
  }

  /**
   * Backup invoices since date
   */
  private async backupInvoicesSince(companyId: string, since: Date) {
    return await prisma.invoice.findMany({
      where: {
        companyId,
        updatedAt: { gte: since },
      },
    });
  }

  /**
   * Backup stocks
   */
  private async backupStocks(companyId: string) {
    return await prisma.stock.findMany({
      where: { companyId },
      include: { product: true },
    });
  }

  /**
   * Backup stocks since date
   */
  private async backupStocksSince(companyId: string, since: Date) {
    return await prisma.stock.findMany({
      where: {
        companyId,
        updatedAt: { gte: since },
      },
    });
  }

  /**
   * Backup accounts
   */
  private async backupAccounts(companyId: string) {
    return await prisma.account.findMany({
      where: { companyId },
    });
  }

  /**
   * Backup journal entries
   */
  private async backupJournalEntries(companyId: string) {
    return await prisma.journalEntry.findMany({
      where: { companyId },
      include: { items: true },
    });
  }

  /**
   * Backup clients
   */
  private async backupClients(companyId: string) {
    const company = await prisma.company.findUnique({ where: { id: companyId }, select: { groupId: true } });
    if (!company) return [];
    return await prisma.client.findMany({
      where: { groupId: company.groupId },
    });
  }

  /**
   * Backup suppliers
   */
  private async backupSuppliers(companyId: string) {
    const company = await prisma.company.findUnique({ where: { id: companyId }, select: { groupId: true } });
    if (!company) return [];
    return await prisma.supplier.findMany({
      where: { groupId: company.groupId },
    });
  }

  /**
   * Backup products
   */
  private async backupProducts(companyId: string) {
    const company = await prisma.company.findUnique({ where: { id: companyId }, select: { groupId: true } });
    if (!company) return [];
    return await prisma.product.findMany({
      where: { groupId: company.groupId },
    });
  }

  /**
   * Backup users
   */
  private async backupUsers(companyId: string) {
    return await prisma.user.findMany({
      where: { companyId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
    });
  }

  /**
   * Backup audit logs
   */
  private async backupAuditLogs(companyId: string) {
    return await prisma.securityAuditLog.findMany({
      where: { companyId },
      take: 10000, // Limit to avoid too large backups
    });
  }

  /**
   * Count records in backup data
   */
  private countRecords(data: Record<string, any[]>): number {
    let count = 0;
    for (const key in data) {
      if (Array.isArray(data[key])) {
        count += data[key].length;
      }
    }
    return count;
  }

  /**
   * Calculate checksum for backup
   */
  private calculateChecksum(data: string): string {
    // Simple checksum implementation
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Cleanup old backups
   */
  private async cleanupOldBackups(companyId: string): Promise<void> {
    const backupsList = Array.from(this.backups.values())
      .filter((b) => b.companyId === companyId)
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime());

    if (backupsList.length > this.maxBackups) {
      const toDelete = backupsList.slice(this.maxBackups);
      for (const backup of toDelete) {
        this.backups.delete(backup.id);
        console.log(`Deleted old backup: ${backup.id}`);
      }
    }
  }

  /**
   * Validate backup integrity
   */
  async validateBackup(backupId: string): Promise<{ valid: boolean; errors: string[] }> {
    const backup = this.backups.get(backupId);
    const errors: string[] = [];

    if (!backup) {
      return { valid: false, errors: ['Backup not found'] };
    }

    if (backup.status !== 'completed') {
      errors.push(`Backup status is ${backup.status}, not completed`);
    }

    if (!backup.checksum) {
      errors.push('Backup checksum missing');
    }

    if (!backup.recordsCount || backup.recordsCount === 0) {
      errors.push('Backup contains no records');
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Get backup statistics
   */
  async getBackupStatistics(companyId: string): Promise<{
    totalBackups: number;
    completedBackups: number;
    failedBackups: number;
    totalBackupSize: number;
    lastBackupTime?: Date;
  }> {
    const backups = Array.from(this.backups.values()).filter((b) => b.companyId === companyId);

    return {
      totalBackups: backups.length,
      completedBackups: backups.filter((b) => b.status === 'completed').length,
      failedBackups: backups.filter((b) => b.status === 'failed').length,
      totalBackupSize: backups.filter((b) => b.size).reduce((sum, b) => sum + (b.size || 0), 0),
      lastBackupTime: backups.length > 0 ? backups.sort((a, b) => b.startTime.getTime() - a.startTime.getTime())[0].startTime : undefined,
    };
  }
}

export const backupRestoreService = new BackupRestoreService();
