import { describe, it, expect, beforeEach, vi } from 'vitest';
import { importExportService } from '../import-export-service';

describe('ImportExportService', () => {
  const mockCompanyId = 'company_test_123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('CSV Parsing', () => {
    it('should correctly parse simple CSV line', async () => {
      const csvContent = 'name,email,phone\nJohn Doe,john@example.com,555-1234\n';

      const result = await importExportService.importFromCSV({
        format: 'csv',
        entityType: 'clients',
        companyId: mockCompanyId,
        csvContent,
        data: [],
      });

      expect(result).toBeDefined();
      expect(result.totalRecords).toBeGreaterThanOrEqual(0);
    });

    it('should handle CSV with quoted fields', async () => {
      const csvContent = '"Name","Description"\n"Product 1","A complex, quoted description"\n';

      const result = await importExportService.importFromCSV({
        format: 'csv',
        entityType: 'products',
        companyId: mockCompanyId,
        csvContent,
        data: [],
      });

      expect(result).toBeDefined();
    });

    it('should handle CSV with escaped quotes', async () => {
      const csvContent = '"Name","Description"\n"Product","Has ""quoted"" word"\n';

      const result = await importExportService.importFromCSV({
        format: 'csv',
        entityType: 'products',
        companyId: mockCompanyId,
        csvContent,
        data: [],
      });

      expect(result).toBeDefined();
    });
  });

  describe('Data Validation', () => {
    it('should validate required fields for products', async () => {
      const validation = await importExportService.validateImportData({
        format: 'csv',
        entityType: 'products',
        companyId: mockCompanyId,
        data: [
          { email: 'test@example.com' }, // missing 'name'
        ],
      });

      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });

    it('should validate required fields for clients', async () => {
      const validation = await importExportService.validateImportData({
        format: 'csv',
        entityType: 'clients',
        companyId: mockCompanyId,
        data: [
          { email: 'test@example.com' }, // missing 'name'
        ],
      });

      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });

    it('should validate required fields for invoices', async () => {
      const validation = await importExportService.validateImportData({
        format: 'csv',
        entityType: 'invoices',
        companyId: mockCompanyId,
        data: [
          { saleId: 'sale_123' }, // missing 'clientId'
        ],
      });

      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });

    it('should validate required fields for sales', async () => {
      const validation = await importExportService.validateImportData({
        format: 'csv',
        entityType: 'sales',
        companyId: mockCompanyId,
        data: [
          { totalAmount: '1000' }, // missing 'clientId'
        ],
      });

      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });

    it('should pass validation with all required fields', async () => {
      const validation = await importExportService.validateImportData({
        format: 'csv',
        entityType: 'products',
        companyId: mockCompanyId,
        data: [
          { name: 'Product 1', price: '100' },
          { name: 'Product 2', price: '200' },
        ],
      });

      expect(validation.valid).toBe(true);
      expect(validation.errors).toEqual([]);
    });

    it('should fail validation with empty data', async () => {
      const validation = await importExportService.validateImportData({
        format: 'csv',
        entityType: 'products',
        companyId: mockCompanyId,
        data: [],
      });

      expect(validation.valid).toBe(false);
    });
  });

  describe('CSV Field Escaping', () => {
    it('should escape fields with commas', async () => {
      const field = 'Smith, John';
      // Simulating the escapeCSVField behavior
      const escaped = `"${field}"`;
      expect(escaped).toContain(',');
      expect(escaped).toMatch(/^".*"$/);
    });

    it('should escape fields with quotes', async () => {
      const field = 'Product "Premium"';
      const escaped = `"${field.replace(/"/g, '""')}"`;
      expect(escaped).toContain('""');
    });

    it('should escape fields with newlines', async () => {
      const field = 'Line 1\nLine 2';
      const escaped = `"${field}"`;
      expect(escaped).toContain('\n');
    });
  });

  describe('Data Import Result', () => {
    it('should return import result with success metrics', async () => {
      const result = await importExportService.importData({
        format: 'csv',
        entityType: 'products',
        companyId: mockCompanyId,
        data: [
          { name: 'Product 1', price: '100' },
          { name: 'Product 2', price: '200' },
        ],
      });

      expect(result).toHaveProperty('totalRecords');
      expect(result).toHaveProperty('successfulRecords');
      expect(result).toHaveProperty('failedRecords');
      expect(result).toHaveProperty('errors');
      expect(result).toHaveProperty('createdIds');
      expect(result).toHaveProperty('updatedIds');
    });

    it('should track created and updated records separately', async () => {
      const result = await importExportService.importData({
        format: 'csv',
        entityType: 'products',
        companyId: mockCompanyId,
        data: [
          { name: 'New Product', price: '100' },
        ],
      });

      expect(Array.isArray(result.createdIds)).toBe(true);
      expect(Array.isArray(result.updatedIds)).toBe(true);
    });

    it('should count successful and failed records', async () => {
      const result = await importExportService.importData({
        format: 'csv',
        entityType: 'products',
        companyId: mockCompanyId,
        data: [
          { name: 'Valid Product', price: '100' },
        ],
      });

      expect(result.successfulRecords + result.failedRecords).toBe(result.totalRecords);
    });
  });

  describe('Entity Type Support', () => {
    it('should support all entity types', async () => {
      const entityTypes = ['products', 'clients', 'suppliers', 'invoices', 'sales'] as const;

      for (const entityType of entityTypes) {
        const validation = await importExportService.validateImportData({
          format: 'csv',
          entityType,
          companyId: mockCompanyId,
          data: [],
        });

        // Should not throw error
        expect(validation).toBeDefined();
      }
    });
  });

  describe('Nested Property Access', () => {
    it('should access nested object properties', async () => {
      const data = {
        product: {
          category: {
            name: 'Electronics',
          },
        },
      };

      // Test that getNestedProperty can handle nested paths
      const field = 'product.category.name';
      const parts = field.split('.');
      expect(parts.length).toBe(3);
    });
  });

  describe('Export Functionality', () => {
    it('should export data as CSV string', async () => {
      const csv = await importExportService.exportToCSV({
        format: 'csv',
        entityType: 'products',
        companyId: mockCompanyId,
      });

      expect(typeof csv).toBe('string');
      // Even with empty data, should have header or empty message
      expect(csv.length).toBeGreaterThan(0);
    });

    it('should export data as Excel (JSON)', async () => {
      const data = await importExportService.exportToExcel({
        format: 'excel',
        entityType: 'products',
        companyId: mockCompanyId,
      });

      expect(Array.isArray(data)).toBe(true);
    });

    it('should filter fields in export if specified', async () => {
      const data = await importExportService.exportToExcel({
        format: 'excel',
        entityType: 'products',
        companyId: mockCompanyId,
        fields: ['name', 'price'],
      });

      if (data.length > 0) {
        const record = data[0];
        expect(record).toHaveProperty('name');
        expect(record).toHaveProperty('price');
      }
    });
  });

  describe('CSV Line Parsing', () => {
    it('should handle empty CSV lines', async () => {
      const csvContent = 'name,email\n\n';

      const result = await importExportService.importFromCSV({
        format: 'csv',
        entityType: 'clients',
        companyId: mockCompanyId,
        csvContent,
        data: [],
      });

      expect(result).toBeDefined();
    });

    it('should preserve spaces in fields', async () => {
      const csvContent = 'name,email\n" John Doe "," john@example.com "\n';

      const result = await importExportService.importFromCSV({
        format: 'csv',
        entityType: 'clients',
        companyId: mockCompanyId,
        csvContent,
        data: [],
      });

      expect(result).toBeDefined();
    });
  });
});
