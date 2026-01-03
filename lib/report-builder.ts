import { prisma } from './prisma';

export interface ReportConfig {
  id: string;
  name: string;
  description: string;
  type: 'sales' | 'inventory' | 'financial' | 'custom';
  filters: Record<string, any>;
  columns: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  groupBy?: string;
  aggregations?: string[];
}

export interface ReportData {
  title: string;
  generatedAt: Date;
  rows: Record<string, any>[];
  summary?: Record<string, any>;
  totalRows: number;
}

export class ReportBuilder {
  async buildSalesReport(companyId: string, config: ReportConfig): Promise<ReportData> {
    const sales = await prisma.sale.findMany({
      where: {
        companyId,
        ...(config.filters.dateFrom && { createdAt: { gte: new Date(config.filters.dateFrom) } }),
        ...(config.filters.dateTo && { createdAt: { lte: new Date(config.filters.dateTo) } }),
        ...(config.filters.status && { status: config.filters.status }),
      },
      include: { items: true, client: true },
    });

    const rows = sales.map((sale: any) => ({
      saleNumber: sale.number,
      clientName: sale.client?.name,
      totalAmount: sale.totalAmount,
      itemCount: sale.items.length,
      status: sale.status,
      createdAt: sale.createdAt,
    }));

    const summary = {
      totalSales: rows.length,
      totalRevenue: rows.reduce((sum: number, r: any) => sum + (r.totalAmount || 0), 0),
      averageSaleValue: rows.length > 0 ? rows.reduce((sum: number, r: any) => sum + (r.totalAmount || 0), 0) / rows.length : 0,
    };

    return {
      title: config.name,
      generatedAt: new Date(),
      rows,
      summary,
      totalRows: rows.length,
    };
  }

  async buildInventoryReport(companyId: string, config: ReportConfig): Promise<ReportData> {
    const stocks = await prisma.stock.findMany({
      where: { companyId },
      include: { product: { include: { category: true } } },
    });

    interface InventoryRow {
      productName?: string;
      category?: string;
      quantity: number;
      minimumLevel?: number;
      value: number;
      status: string;
    }

    const rows: InventoryRow[] = stocks.map((stock: any) => ({
      productName: stock.product?.name,
      category: stock.product?.category?.name,
      quantity: stock.quantity,
      minimumLevel: stock.minimumLevel,
      value: stock.quantity * (stock.product?.price || 0),
      status: stock.quantity < (stock.minimumLevel || 10) ? 'Low Stock' : 'OK',
    }));

    const summary = {
      totalItems: rows.length,
      totalValue: rows.reduce((sum: number, r: InventoryRow) => sum + (r.value || 0), 0),
      lowStockItems: rows.filter((r: InventoryRow) => r.status === 'Low Stock').length,
    };

    return {
      title: config.name,
      generatedAt: new Date(),
      rows,
      summary,
      totalRows: rows.length,
    };
  }

  async buildFinancialReport(companyId: string, config: ReportConfig): Promise<ReportData> {
    const invoices = await prisma.invoice.findMany({
      where: { companyId },
    });

    interface FinancialRow {
      invoiceNumber: string;
      amount: number;
      status: string;
      dueDate: Date | null;
      createdAt: Date;
    }

    const rows: FinancialRow[] = invoices.map((invoice: any) => ({
      invoiceNumber: invoice.invoiceNumber,
      amount: invoice.amount,
      status: invoice.status,
      dueDate: invoice.dueDate,
      createdAt: invoice.createdAt,
    }));

    const summary = {
      totalInvoices: rows.length,
      totalAmount: rows.reduce((sum: number, r: FinancialRow) => sum + (r.amount || 0), 0),
      paidAmount: rows.filter((r: FinancialRow) => r.status === 'paid').reduce((sum: number, r: FinancialRow) => sum + (r.amount || 0), 0),
      pendingAmount: rows.filter((r: FinancialRow) => r.status !== 'paid').reduce((sum: number, r: FinancialRow) => sum + (r.amount || 0), 0),
    };

    return {
      title: config.name,
      generatedAt: new Date(),
      rows,
      summary,
      totalRows: rows.length,
    };
  }

  async saveReportConfig(companyId: string, config: ReportConfig): Promise<void> {
    // Save report configuration for future use
    return;
  }

  async getReportConfigs(companyId: string): Promise<ReportConfig[]> {
    // Retrieve saved report configurations
    return [];
  }
}

export const reportBuilder = new ReportBuilder();

