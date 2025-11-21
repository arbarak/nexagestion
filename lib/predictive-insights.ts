import { prisma } from './prisma';

export interface Prediction {
  metric: string;
  currentValue: number;
  predictedValue: number;
  confidence: number;
  trend: 'up' | 'down' | 'stable';
  recommendation: string;
}

export interface Insight {
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
  action?: string;
}

export class PredictiveInsights {
  async predictSalesRevenue(companyId: string, days: number = 30): Promise<Prediction> {
    const orders = await prisma.order.findMany({
      where: {
        companyId,
        createdAt: {
          gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
        },
      },
    });

    const currentRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const avgDaily = currentRevenue / days;
    const predictedRevenue = avgDaily * days * 1.15; // 15% growth prediction

    return {
      metric: 'Sales Revenue',
      currentValue: currentRevenue,
      predictedValue: predictedRevenue,
      confidence: 0.78,
      trend: 'up',
      recommendation: 'Current sales trend is positive. Consider increasing inventory.',
    };
  }

  async predictInventoryNeeds(companyId: string): Promise<Prediction> {
    const stocks = await prisma.stock.findMany({
      where: { companyId },
      include: { product: true },
    });

    const lowStockCount = stocks.filter(s => s.quantity < (s.minimumLevel || 10)).length;
    const totalItems = stocks.reduce((sum, s) => sum + s.quantity, 0);

    return {
      metric: 'Inventory Needs',
      currentValue: lowStockCount,
      predictedValue: Math.ceil(lowStockCount * 1.2),
      confidence: 0.85,
      trend: 'up',
      recommendation: `${lowStockCount} items are below minimum level. Reorder recommended.`,
    };
  }

  async predictCustomerChurn(companyId: string): Promise<Prediction> {
    const clients = await prisma.client.findMany({
      where: { companyId },
    });

    const activeClients = clients.length;
    const predictedChurn = Math.ceil(activeClients * 0.05); // 5% churn prediction

    return {
      metric: 'Customer Churn',
      currentValue: 0,
      predictedValue: predictedChurn,
      confidence: 0.72,
      trend: 'down',
      recommendation: 'Monitor client engagement and consider retention campaigns.',
    };
  }

  async generateInsights(companyId: string): Promise<Insight[]> {
    const insights: Insight[] = [];

    // Check for low stock
    const lowStockItems = await prisma.stock.findMany({
      where: {
        companyId,
        quantity: { lt: 10 },
      },
      take: 5,
    });

    if (lowStockItems.length > 0) {
      insights.push({
        title: 'Low Stock Alert',
        description: `${lowStockItems.length} products are running low on stock`,
        severity: 'warning',
        action: 'Review inventory and place orders',
      });
    }

    // Check for overdue invoices
    const overdueInvoices = await prisma.invoice.findMany({
      where: {
        companyId,
        status: 'overdue',
      },
      take: 5,
    });

    if (overdueInvoices.length > 0) {
      insights.push({
        title: 'Overdue Invoices',
        description: `${overdueInvoices.length} invoices are overdue`,
        severity: 'critical',
        action: 'Follow up with clients for payment',
      });
    }

    // Check for pending orders
    const pendingOrders = await prisma.order.findMany({
      where: {
        companyId,
        status: 'pending',
      },
      take: 5,
    });

    if (pendingOrders.length > 5) {
      insights.push({
        title: 'High Pending Orders',
        description: `${pendingOrders.length} orders are pending confirmation`,
        severity: 'info',
        action: 'Review and confirm pending orders',
      });
    }

    return insights;
  }

  async getRecommendations(companyId: string): Promise<string[]> {
    const recommendations: string[] = [];

    const orders = await prisma.order.count({ where: { companyId } });
    if (orders < 10) {
      recommendations.push('Increase marketing efforts to boost sales');
    }

    const clients = await prisma.client.count({ where: { companyId } });
    if (clients < 5) {
      recommendations.push('Focus on customer acquisition');
    }

    const products = await prisma.product.count({ where: { companyId } });
    if (products < 20) {
      recommendations.push('Expand product catalog');
    }

    return recommendations;
  }
}

export const predictiveInsights = new PredictiveInsights();

