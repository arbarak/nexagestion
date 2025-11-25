import { prisma } from './prisma';

export interface AnalyticsMetric {
  label: string;
  value: number;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
}

export interface SalesAnalytics {
  totalRevenue: AnalyticsMetric;
  totalOrders: AnalyticsMetric;
  averageOrderValue: AnalyticsMetric;
  conversionRate: AnalyticsMetric;
  topProducts: Array<{ name: string; revenue: number; orders: number }>;
  topClients: Array<{ name: string; revenue: number; orders: number }>;
  revenueByMonth: Array<{ month: string; revenue: number }>;
  ordersByStatus: Record<string, number>;
}

export interface InventoryAnalytics {
  totalItems: AnalyticsMetric;
  lowStockItems: AnalyticsMetric;
  stockValue: AnalyticsMetric;
  turnoverRate: AnalyticsMetric;
  topMovingProducts: Array<{ name: string; quantity: number; value: number }>;
  slowMovingProducts: Array<{ name: string; quantity: number; value: number }>;
  stockByCategory: Record<string, number>;
}

export interface FinancialAnalytics {
  totalRevenue: AnalyticsMetric;
  totalExpenses: AnalyticsMetric;
  netProfit: AnalyticsMetric;
  profitMargin: AnalyticsMetric;
  accountsReceivable: AnalyticsMetric;
  accountsPayable: AnalyticsMetric;
  cashFlow: Array<{ month: string; inflow: number; outflow: number }>;
  expensesByCategory: Record<string, number>;
}

export class AnalyticsService {
  async getSalesAnalytics(companyId: string, days: number = 30): Promise<SalesAnalytics> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const orders = await prisma.order.findMany({
      where: {
        companyId,
        createdAt: { gte: startDate },
      },
      include: {
        items: true,
        client: true,
      },
    });

    const totalRevenue = orders.reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Get top products
    const topProducts = await prisma.orderItem.groupBy({
      by: ['productId'],
      where: {
        order: { companyId, createdAt: { gte: startDate } },
      },
      _sum: { quantity: true, totalPrice: true },
      orderBy: { _sum: { totalPrice: 'desc' } },
      take: 5,
    });

    // Get top clients
    const topClients = await prisma.order.groupBy({
      by: ['clientId'],
      where: { companyId, createdAt: { gte: startDate } },
      _sum: { totalAmount: true },
      _count: true,
      orderBy: { _sum: { totalAmount: 'desc' } },
      take: 5,
    });

    // Get orders by status
    const ordersByStatus = await prisma.order.groupBy({
      by: ['status'],
      where: { companyId },
      _count: true,
    });

    return {
      totalRevenue: {
        label: 'Total Revenue',
        value: totalRevenue,
        change: 0,
        changePercent: 0,
        trend: 'up',
      },
      totalOrders: {
        label: 'Total Orders',
        value: totalOrders,
        change: 0,
        changePercent: 0,
        trend: 'up',
      },
      averageOrderValue: {
        label: 'Average Order Value',
        value: averageOrderValue,
        change: 0,
        changePercent: 0,
        trend: 'stable',
      },
      conversionRate: {
        label: 'Conversion Rate',
        value: 0,
        change: 0,
        changePercent: 0,
        trend: 'stable',
      },
      topProducts: [],
      topClients: [],
      revenueByMonth: [],
      ordersByStatus: Object.fromEntries(
        ordersByStatus.map((item: any) => [item.status, item._count])
      ),
    };
  }

  async getInventoryAnalytics(companyId: string): Promise<InventoryAnalytics> {
    const stocks = await prisma.stock.findMany({
      where: { companyId },
      include: { product: true },
    });

    const totalItems = stocks.reduce((sum: number, stock: any) => sum + stock.quantity, 0);
    const lowStockItems = stocks.filter((s: any) => s.quantity < (s.minimumLevel || 10)).length;
    const stockValue = stocks.reduce((sum: number, stock: any) => sum + (stock.quantity * (stock.product?.price || 0)), 0);

    // Get stock by category
    const stockByCategory = await prisma.stock.groupBy({
      by: ['productId'],
      where: { companyId },
      _sum: { quantity: true },
    });

    return {
      totalItems: {
        label: 'Total Items',
        value: totalItems,
        change: 0,
        changePercent: 0,
        trend: 'stable',
      },
      lowStockItems: {
        label: 'Low Stock Items',
        value: lowStockItems,
        change: 0,
        changePercent: 0,
        trend: 'down',
      },
      stockValue: {
        label: 'Stock Value',
        value: stockValue,
        change: 0,
        changePercent: 0,
        trend: 'up',
      },
      turnoverRate: {
        label: 'Turnover Rate',
        value: 0,
        change: 0,
        changePercent: 0,
        trend: 'stable',
      },
      topMovingProducts: [],
      slowMovingProducts: [],
      stockByCategory: {},
    };
  }

  async getFinancialAnalytics(companyId: string): Promise<FinancialAnalytics> {
    const invoices = await prisma.invoice.findMany({
      where: { companyId },
    });

    const totalRevenue = invoices
      .filter((i: any) => i.status === 'paid')
      .reduce((sum: number, i: any) => sum + (i.amount || 0), 0);

    const accountsReceivable = invoices
      .filter((i: any) => i.status !== 'paid')
      .reduce((sum: number, i: any) => sum + (i.amount || 0), 0);

    return {
      totalRevenue: {
        label: 'Total Revenue',
        value: totalRevenue,
        change: 0,
        changePercent: 0,
        trend: 'up',
      },
      totalExpenses: {
        label: 'Total Expenses',
        value: 0,
        change: 0,
        changePercent: 0,
        trend: 'stable',
      },
      netProfit: {
        label: 'Net Profit',
        value: totalRevenue,
        change: 0,
        changePercent: 0,
        trend: 'up',
      },
      profitMargin: {
        label: 'Profit Margin',
        value: 0,
        change: 0,
        changePercent: 0,
        trend: 'stable',
      },
      accountsReceivable: {
        label: 'Accounts Receivable',
        value: accountsReceivable,
        change: 0,
        changePercent: 0,
        trend: 'down',
      },
      accountsPayable: {
        label: 'Accounts Payable',
        value: 0,
        change: 0,
        changePercent: 0,
        trend: 'stable',
      },
      cashFlow: [],
      expensesByCategory: {},
    };
  }
}

export const analyticsService = new AnalyticsService();

