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
    const orders = await prisma.order.findMany({
      where: {
        companyId,
        ...(config.filters.dateFrom && { createdAt: { gte: new Date(config.filters.dateFrom) } }),
        ...(config.filters.dateTo && { createdAt: { lte: new Date(config.filters.dateTo) } }),
        ...(config.filters.status && { status: config.filters.status }),
      },
      include: { items: true, client: true },
    });

    const rows = orders.map(order => ({
      orderNumber: order.orderNumber,
      clientName: order.client?.name,
      totalAmount: order.totalAmount,
      itemCount: order.items.length,
      status: order.status,
      createdAt: order.createdAt,
    }));

    const summary = {
      totalOrders: rows.length,
      totalRevenue: rows.reduce((sum, r) => sum + (r.totalAmount || 0), 0),
      averageOrderValue: rows.length > 0 ? rows.reduce((sum, r) => sum + (r.totalAmount || 0), 0) / rows.length : 0,
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
      include: { product: true, category: true },
    });

    const rows = stocks.map(stock => ({
      productName: stock.product?.name,
      category: stock.category?.name,
      quantity: stock.quantity,
      minimumLevel: stock.minimumLevel,
      value: stock.quantity * (stock.product?.price || 0),
      status: stock.quantity < (stock.minimumLevel || 10) ? 'Low Stock' : 'OK',
    }));

    const summary = {
      totalItems: rows.length,
      totalValue: rows.reduce((sum, r) => sum + (r.value || 0), 0),
      lowStockItems: rows.filter(r => r.status === 'Low Stock').length,
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

    const rows = invoices.map(invoice => ({
      invoiceNumber: invoice.invoiceNumber,
      amount: invoice.amount,
      status: invoice.status,
      dueDate: invoice.dueDate,
      createdAt: invoice.createdAt,
    }));

    const summary = {
      totalInvoices: rows.length,
      totalAmount: rows.reduce((sum, r) => sum + (r.amount || 0), 0),
      paidAmount: rows.filter(r => r.status === 'paid').reduce((sum, r) => sum + (r.amount || 0), 0),
      pendingAmount: rows.filter(r => r.status !== 'paid').reduce((sum, r) => sum + (r.amount || 0), 0),
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

