import { prisma } from './prisma';

export interface ImportOptions {
  format: 'csv' | 'excel';
  entityType: 'products' | 'clients' | 'suppliers' | 'invoices' | 'sales';
  companyId: string;
  data: Record<string, any>[];
  skipErrors?: boolean;
  updateExisting?: boolean;
}

export interface ExportOptions {
  format: 'csv' | 'excel';
  entityType: 'products' | 'clients' | 'suppliers' | 'invoices' | 'sales';
  companyId: string;
  filters?: Record<string, any>;
  fields?: string[];
}

export interface ImportResult {
  totalRecords: number;
  successfulRecords: number;
  failedRecords: number;
  errors: Array<{ row: number; error: string }>;
  createdIds: string[];
  updatedIds: string[];
}

export class ImportExportService {
  /**
   * Export data to CSV format
   */
  async exportToCSV(options: ExportOptions): Promise<string> {
    const data = await this.fetchEntityData(options.entityType, options.companyId, options.filters);

    if (data.length === 0) {
      return 'No data to export';
    }

    const fields = options.fields || Object.keys(data[0]);
    const rows: string[] = [];

    // Add header row
    rows.push(fields.map((field) => this.escapeCSVField(field)).join(','));

    // Add data rows
    for (const record of data) {
      const row = fields.map((field) => {
        const value = this.getNestedProperty(record, field);
        return this.escapeCSVField(String(value || ''));
      });
      rows.push(row.join(','));
    }

    return rows.join('\n');
  }

  /**
   * Export data to Excel format (as JSON-compatible data)
   */
  async exportToExcel(options: ExportOptions): Promise<Record<string, any>[]> {
    const data = await this.fetchEntityData(options.entityType, options.companyId, options.filters);

    if (options.fields) {
      return data.map((record) => {
        const filtered: Record<string, any> = {};
        for (const field of options.fields!) {
          filtered[field] = this.getNestedProperty(record, field);
        }
        return filtered;
      });
    }

    return data;
  }

  /**
   * Import data from CSV
   */
  async importFromCSV(options: ImportOptions & { csvContent: string }): Promise<ImportResult> {
    const lines = options.csvContent.trim().split('\n');
    const headers = this.parseCSVLine(lines[0]);
    const data: Record<string, any>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i]);
      const record: Record<string, any> = {};

      for (let j = 0; j < headers.length; j++) {
        record[headers[j]] = values[j] || '';
      }

      data.push(record);
    }

    return this.importData({ ...options, data });
  }

  /**
   * Import data from array
   */
  async importData(options: ImportOptions): Promise<ImportResult> {
    const result: ImportResult = {
      totalRecords: options.data.length,
      successfulRecords: 0,
      failedRecords: 0,
      errors: [],
      createdIds: [],
      updatedIds: [],
    };

    for (let i = 0; i < options.data.length; i++) {
      try {
        const record = options.data[i];
        const importedRecord = await this.importSingleRecord(
          options.entityType,
          options.companyId,
          record,
          options.updateExisting
        );

        if (importedRecord.created) {
          result.createdIds.push(importedRecord.id);
        } else {
          result.updatedIds.push(importedRecord.id);
        }

        result.successfulRecords++;
      } catch (error) {
        result.failedRecords++;
        result.errors.push({
          row: i + 2,
          error: error instanceof Error ? error.message : String(error),
        });

        if (!options.skipErrors) {
          break;
        }
      }
    }

    return result;
  }

  /**
   * Import a single record
   */
  private async importSingleRecord(
    entityType: string,
    companyId: string,
    data: Record<string, any>,
    updateExisting?: boolean
  ): Promise<{ id: string; created: boolean }> {
    switch (entityType) {
      case 'products':
        return this.importProduct(companyId, data, updateExisting);
      case 'clients':
        return this.importClient(companyId, data, updateExisting);
      case 'suppliers':
        return this.importSupplier(companyId, data, updateExisting);
      case 'invoices':
        return this.importInvoice(companyId, data, updateExisting);
      case 'sales':
        return this.importSale(companyId, data, updateExisting);
      default:
        throw new Error(`Unknown entity type: ${entityType}`);
    }
  }

  /**
   * Import product
   */
  private async importProduct(
    companyId: string,
    data: Record<string, any>,
    updateExisting?: boolean
  ): Promise<{ id: string; created: boolean }> {
    const company = await prisma.company.findUnique({ where: { id: companyId }, select: { groupId: true } });
    if (!company) throw new Error('Company not found');

    const existingProduct = data.id ? await prisma.product.findUnique({ where: { id: data.id } }) : null;

    if (existingProduct && updateExisting) {
      const updated = await prisma.product.update({
        where: { id: data.id },
        data: {
          name: data.name || existingProduct.name,
          description: data.description || existingProduct.description,
          price: data.price ? parseFloat(data.price) : existingProduct.price,
          ...(data.categoryId && { categoryId: data.categoryId }),
          ...(data.brandId && { brandId: data.brandId }),
        },
      });
      return { id: updated.id, created: false };
    }

    const product = await prisma.product.create({
      data: {
        groupId: company.groupId,
        name: data.name || 'Imported Product',
        description: data.description || '',
        price: parseFloat(data.price || '0'),
        ...(data.categoryId && { categoryId: data.categoryId }),
        ...(data.brandId && { brandId: data.brandId }),
      },
    });

    return { id: product.id, created: true };
  }

  /**
   * Import client
   */
  private async importClient(
    companyId: string,
    data: Record<string, any>,
    updateExisting?: boolean
  ): Promise<{ id: string; created: boolean }> {
    const company = await prisma.company.findUnique({ where: { id: companyId }, select: { groupId: true } });
    if (!company) throw new Error('Company not found');

    const existingClient = data.id ? await prisma.client.findUnique({ where: { id: data.id } }) : null;

    if (existingClient && updateExisting) {
      const updated = await prisma.client.update({
        where: { id: data.id },
        data: {
          name: data.name || existingClient.name,
          email: data.email || existingClient.email,
          phone: data.phone || existingClient.phone,
          address: data.address || existingClient.address,
        },
      });
      return { id: updated.id, created: false };
    }

    const client = await prisma.client.create({
      data: {
        groupId: company.groupId,
        name: data.name || 'Imported Client',
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || '',
      },
    });

    return { id: client.id, created: true };
  }

  /**
   * Import supplier
   */
  private async importSupplier(
    companyId: string,
    data: Record<string, any>,
    updateExisting?: boolean
  ): Promise<{ id: string; created: boolean }> {
    const company = await prisma.company.findUnique({ where: { id: companyId }, select: { groupId: true } });
    if (!company) throw new Error('Company not found');

    const existingSupplier = data.id ? await prisma.supplier.findUnique({ where: { id: data.id } }) : null;

    if (existingSupplier && updateExisting) {
      const updated = await prisma.supplier.update({
        where: { id: data.id },
        data: {
          name: data.name || existingSupplier.name,
          email: data.email || existingSupplier.email,
          phone: data.phone || existingSupplier.phone,
          address: data.address || existingSupplier.address,
        },
      });
      return { id: updated.id, created: false };
    }

    const supplier = await prisma.supplier.create({
      data: {
        groupId: company.groupId,
        name: data.name || 'Imported Supplier',
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || '',
      },
    });

    return { id: supplier.id, created: true };
  }

  /**
   * Import invoice
   */
  private async importInvoice(
    companyId: string,
    data: Record<string, any>,
    updateExisting?: boolean
  ): Promise<{ id: string; created: boolean }> {
    const existingInvoice = data.id ? await prisma.invoice.findUnique({ where: { id: data.id } }) : null;

    if (existingInvoice && updateExisting) {
      const updated = await prisma.invoice.update({
        where: { id: data.id },
        data: {
          status: data.status || existingInvoice.status,
          totalAmount: data.totalAmount ? parseFloat(data.totalAmount) : existingInvoice.totalAmount,
        },
      });
      return { id: updated.id, created: false };
    }

    if (!data.clientId || !data.saleId) {
      throw new Error('Invoice import requires clientId and saleId');
    }

    const invoice = await prisma.invoice.create({
      data: {
        companyId,
        clientId: data.clientId,
        saleId: data.saleId,
        number: data.number || `INV-${Date.now()}`,
        status: data.status || 'DRAFT',
        totalAmount: parseFloat(data.totalAmount || '0'),
        taxAmount: parseFloat(data.taxAmount || '0'),
      },
    });

    return { id: invoice.id, created: true };
  }

  /**
   * Import sale
   */
  private async importSale(
    companyId: string,
    data: Record<string, any>,
    updateExisting?: boolean
  ): Promise<{ id: string; created: boolean }> {
    const existingSale = data.id ? await prisma.sale.findUnique({ where: { id: data.id } }) : null;

    if (existingSale && updateExisting) {
      const updated = await prisma.sale.update({
        where: { id: data.id },
        data: {
          status: data.status || existingSale.status,
          totalAmount: data.totalAmount ? parseFloat(data.totalAmount) : existingSale.totalAmount,
        },
      });
      return { id: updated.id, created: false };
    }

    if (!data.clientId) {
      throw new Error('Sale import requires clientId');
    }

    const sale = await prisma.sale.create({
      data: {
        companyId,
        clientId: data.clientId,
        number: data.number || `SALE-${Date.now()}`,
        status: data.status || 'DRAFT',
        totalAmount: parseFloat(data.totalAmount || '0'),
      },
    });

    return { id: sale.id, created: true };
  }

  /**
   * Fetch entity data
   */
  private async fetchEntityData(
    entityType: string,
    companyId: string,
    filters?: Record<string, any>
  ): Promise<Record<string, any>[]> {
    const company = await prisma.company.findUnique({ where: { id: companyId }, select: { groupId: true } });
    if (!company) return [];

    switch (entityType) {
      case 'products':
        return prisma.product.findMany({
          where: { groupId: company.groupId },
          include: { category: { select: { name: true } }, brand: { select: { name: true } } },
        });

      case 'clients':
        return prisma.client.findMany({ where: { groupId: company.groupId } });

      case 'suppliers':
        return prisma.supplier.findMany({ where: { groupId: company.groupId } });

      case 'invoices':
        return prisma.invoice.findMany({ where: { companyId } });

      case 'sales':
        return prisma.sale.findMany({
          where: { companyId },
          include: { client: { select: { name: true } } },
        });

      default:
        return [];
    }
  }

  /**
   * CSV helpers
   */
  private escapeCSVField(field: string): string {
    if (field.includes(',') || field.includes('"') || field.includes('\n')) {
      return `"${field.replace(/"/g, '""')}"`;
    }
    return field;
  }

  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let insideQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        if (insideQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (char === ',' && !insideQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    result.push(current.trim());
    return result;
  }

  /**
   * Get nested property from object
   */
  private getNestedProperty(obj: Record<string, any>, path: string): any {
    const parts = path.split('.');
    let value = obj;

    for (const part of parts) {
      if (value && typeof value === 'object' && part in value) {
        value = value[part];
      } else {
        return undefined;
      }
    }

    return value;
  }

  /**
   * Validate import data
   */
  async validateImportData(options: ImportOptions): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    if (options.data.length === 0) {
      errors.push('No data provided');
    }

    // Entity-specific validation
    switch (options.entityType) {
      case 'products':
        for (let i = 0; i < options.data.length; i++) {
          const record = options.data[i];
          if (!record.name) {
            errors.push(`Row ${i + 1}: Product name is required`);
          }
        }
        break;

      case 'clients':
      case 'suppliers':
        for (let i = 0; i < options.data.length; i++) {
          const record = options.data[i];
          if (!record.name) {
            errors.push(`Row ${i + 1}: Name is required`);
          }
        }
        break;

      case 'invoices':
        for (let i = 0; i < options.data.length; i++) {
          const record = options.data[i];
          if (!record.clientId) {
            errors.push(`Row ${i + 1}: Client ID is required`);
          }
        }
        break;

      case 'sales':
        for (let i = 0; i < options.data.length; i++) {
          const record = options.data[i];
          if (!record.clientId) {
            errors.push(`Row ${i + 1}: Client ID is required`);
          }
        }
        break;
    }

    return { valid: errors.length === 0, errors };
  }
}

export const importExportService = new ImportExportService();
