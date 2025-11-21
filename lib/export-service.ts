export interface ExportOptions {
  format: 'csv' | 'json' | 'xlsx' | 'pdf';
  filename: string;
  includeHeaders: boolean;
  includeTimestamp: boolean;
}

export class ExportService {
  async exportToCSV(data: Record<string, any>[], options: ExportOptions): Promise<string> {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const rows = data.map(row =>
      headers.map(header => {
        const value = row[header];
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`;
        }
        return value;
      }).join(',')
    );

    const csv = options.includeHeaders ? [headers.join(','), ...rows].join('\n') : rows.join('\n');
    return csv;
  }

  async exportToJSON(data: Record<string, any>[], options: ExportOptions): Promise<string> {
    const json = {
      exportedAt: options.includeTimestamp ? new Date().toISOString() : undefined,
      recordCount: data.length,
      data,
    };

    return JSON.stringify(json, null, 2);
  }

  async exportToXLSX(data: Record<string, any>[], options: ExportOptions): Promise<Buffer> {
    // XLSX export would require additional library
    // For now, return a placeholder
    const json = JSON.stringify(data);
    return Buffer.from(json);
  }

  async exportToPDF(data: Record<string, any>[], options: ExportOptions): Promise<Buffer> {
    // PDF export would require additional library
    // For now, return a placeholder
    const json = JSON.stringify(data);
    return Buffer.from(json);
  }

  async export(data: Record<string, any>[], options: ExportOptions): Promise<string | Buffer> {
    switch (options.format) {
      case 'csv':
        return this.exportToCSV(data, options);
      case 'json':
        return this.exportToJSON(data, options);
      case 'xlsx':
        return this.exportToXLSX(data, options);
      case 'pdf':
        return this.exportToPDF(data, options);
      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }
  }

  generateFilename(baseFilename: string, format: string, includeTimestamp: boolean): string {
    const timestamp = includeTimestamp ? `_${new Date().toISOString().split('T')[0]}` : '';
    return `${baseFilename}${timestamp}.${format}`;
  }
}

export const exportService = new ExportService();

