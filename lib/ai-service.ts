import { prisma } from './prisma';

export interface AIPredictionResult {
  id: string;
  type: 'sales' | 'inventory' | 'demand' | 'churn';
  prediction: number;
  confidence: number;
  timeframe: string;
  createdAt: Date;
}

export interface AIRecommendation {
  id: string;
  type: 'inventory' | 'pricing' | 'sales' | 'customer';
  title: string;
  description: string;
  actionItems: string[];
  estimatedImpact: string;
  priority: 'high' | 'medium' | 'low';
  createdAt: Date;
}

export interface AIAnomaly {
  id: string;
  type: 'sales' | 'inventory' | 'financial';
  description: string;
  severity: 'critical' | 'warning' | 'info';
  affectedEntity: string;
  suggestedAction: string;
  createdAt: Date;
}

export class AIService {
  /**
   * Generate sales predictions based on historical data
   */
  async generateSalesPrediction(companyId: string): Promise<AIPredictionResult> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentSales = await prisma.sale.findMany({
      where: {
        companyId,
        createdAt: { gte: thirtyDaysAgo },
      },
    });

    if (recentSales.length === 0) {
      return {
        id: 'pred_' + Date.now(),
        type: 'sales',
        prediction: 0,
        confidence: 0,
        timeframe: 'next_30_days',
        createdAt: new Date(),
      };
    }

    const totalRevenue = recentSales.reduce((sum, s) => sum + Number(s.totalAmount || 0), 0);
    const avgDailyRevenue = totalRevenue / 30;
    const predictedRevenue = avgDailyRevenue * 30 * 1.1; // Assume 10% growth

    // Calculate confidence based on data consistency
    const revenues = recentSales.map(s => Number(s.totalAmount || 0));
    const mean = revenues.reduce((a, b) => a + b) / revenues.length;
    const variance = revenues.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / revenues.length;
    const stdDev = Math.sqrt(variance);
    const confidence = Math.max(0.5, Math.min(1, 1 - (stdDev / (mean || 1)) * 0.1));

    return {
      id: 'pred_' + Date.now(),
      type: 'sales',
      prediction: Math.round(predictedRevenue),
      confidence: Math.round(confidence * 100) / 100,
      timeframe: 'next_30_days',
      createdAt: new Date(),
    };
  }

  /**
   * Generate inventory demand predictions
   */
  async generateDemandPrediction(companyId: string): Promise<AIPredictionResult> {
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const saleItems = await prisma.saleItem.findMany({
      where: {
        sale: { companyId },
      },
      include: {
        sale: true,
      },
    });

    if (saleItems.length === 0) {
      return {
        id: 'pred_' + Date.now(),
        type: 'demand',
        prediction: 0,
        confidence: 0,
        timeframe: 'next_30_days',
        createdAt: new Date(),
      };
    }

    const recentItems = saleItems.filter(item => {
      const itemDate = new Date(item.sale.createdAt);
      return itemDate >= sixtyDaysAgo;
    });

    const avgDailyDemand = recentItems.length / 60;
    const predictedDemand = avgDailyDemand * 30;

    return {
      id: 'pred_' + Date.now(),
      type: 'demand',
      prediction: Math.round(predictedDemand),
      confidence: 0.75,
      timeframe: 'next_30_days',
      createdAt: new Date(),
    };
  }

  /**
   * Generate inventory recommendations
   */
  async generateInventoryRecommendations(companyId: string): Promise<AIRecommendation[]> {
    const stocks = await prisma.stock.findMany({
      where: { companyId },
      include: { product: true },
    });

    const recommendations: AIRecommendation[] = [];

    // Low stock warning
    const lowStockItems = stocks.filter((s: any) => s.quantity < (s.minimumLevel || 10));
    if (lowStockItems.length > 0) {
      recommendations.push({
        id: 'rec_' + Date.now() + '_low_stock',
        type: 'inventory',
        title: 'Reorder Low Stock Items',
        description: `You have ${lowStockItems.length} products below minimum stock levels`,
        actionItems: lowStockItems.map((item: any) => `Reorder ${item.product?.name || 'Product'} - Current: ${item.quantity}, Minimum: ${item.minimumLevel || 10}`).slice(0, 5),
        estimatedImpact: 'Prevent stockouts and lost sales',
        priority: 'high',
        createdAt: new Date(),
      });
    }

    // Overstock warning
    const overstockItems = stocks.filter((s: any) => s.quantity > (s.maximumLevel || 1000));
    if (overstockItems.length > 0) {
      recommendations.push({
        id: 'rec_' + Date.now() + '_overstock',
        type: 'inventory',
        title: 'Reduce Overstock Items',
        description: `You have ${overstockItems.length} products with excess inventory`,
        actionItems: overstockItems.map((item: any) => `Consider promoting ${item.product?.name || 'Product'}`).slice(0, 3),
        estimatedImpact: 'Improve cash flow and storage efficiency',
        priority: 'medium',
        createdAt: new Date(),
      });
    }

    // Slow-moving products
    const slowMovers = stocks.filter((s: any) => s.quantity > 100 && s.product?.price && s.quantity * s.product.price > 5000);
    if (slowMovers.length > 0) {
      recommendations.push({
        id: 'rec_' + Date.now() + '_slow_movers',
        type: 'inventory',
        title: 'Optimize Slow-Moving Products',
        description: `Review pricing or marketing strategy for slower inventory items`,
        actionItems: slowMovers.map((item: any) => `${item.product?.name || 'Product'}: ${item.quantity} units worth $${(item.quantity * (item.product?.price || 0)).toLocaleString()}`).slice(0, 5),
        estimatedImpact: 'Increase product turnover',
        priority: 'medium',
        createdAt: new Date(),
      });
    }

    return recommendations;
  }

  /**
   * Generate pricing recommendations
   */
  async generatePricingRecommendations(companyId: string): Promise<AIRecommendation[]> {
    const products = await prisma.product.findMany({
      where: { groupId: (await prisma.company.findUnique({ where: { id: companyId }, select: { groupId: true } }))?.groupId },
      include: {
        stocks: { where: { companyId } },
      },
    });

    const recommendations: AIRecommendation[] = [];

    // High-demand products that could support price increase
    const highDemandProducts = products.filter((p: any) => p.stocks.some((s: any) => s.quantity < (s.minimumLevel || 10)));
    if (highDemandProducts.length > 0) {
      recommendations.push({
        id: 'rec_' + Date.now() + '_pricing',
        type: 'pricing',
        title: 'Increase Price for High-Demand Products',
        description: `Products with consistently low stock may support premium pricing`,
        actionItems: highDemandProducts.map((p: any) => `${p.name}: Consider ${Math.round(p.price * 1.1)} (current: ${Math.round(p.price)})`).slice(0, 5),
        estimatedImpact: 'Potentially increase profit margins by 5-10%',
        priority: 'medium',
        createdAt: new Date(),
      });
    }

    return recommendations;
  }

  /**
   * Detect financial anomalies
   */
  async detectFinancialAnomalies(companyId: string): Promise<AIAnomaly[]> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentInvoices = await prisma.invoice.findMany({
      where: {
        companyId,
        createdAt: { gte: thirtyDaysAgo },
      },
    });

    const anomalies: AIAnomaly[] = [];

    // Unusually large invoice
    if (recentInvoices.length > 0) {
      const amounts = recentInvoices.map(i => Number(i.totalAmount || 0));
      const avgAmount = amounts.reduce((a, b) => a + b) / amounts.length;
      const maxAmount = Math.max(...amounts);

      if (maxAmount > avgAmount * 3) {
        anomalies.push({
          id: 'anom_' + Date.now() + '_large_invoice',
          type: 'financial',
          description: 'Unusually large invoice detected',
          severity: 'warning',
          affectedEntity: `Invoice Amount: $${maxAmount.toLocaleString()}`,
          suggestedAction: 'Verify invoice details and ensure accuracy',
          createdAt: new Date(),
        });
      }
    }

    // High overdue invoice rate
    const unpaidInvoices = recentInvoices.filter(i => i.status !== 'PAID');
    if (unpaidInvoices.length / Math.max(recentInvoices.length, 1) > 0.3) {
      anomalies.push({
        id: 'anom_' + Date.now() + '_overdue',
        type: 'financial',
        description: 'High rate of unpaid invoices',
        severity: 'warning',
        affectedEntity: `${unpaidInvoices.length} unpaid invoices out of ${recentInvoices.length}`,
        suggestedAction: 'Follow up with clients on outstanding payments',
        createdAt: new Date(),
      });
    }

    return anomalies;
  }

  /**
   * Detect inventory anomalies
   */
  async detectInventoryAnomalies(companyId: string): Promise<AIAnomaly[]> {
    const stocks = await prisma.stock.findMany({
      where: { companyId },
      include: { product: true },
    });

    const anomalies: AIAnomaly[] = [];

    // Sudden stock depletion
    const criticalStocks = stocks.filter((s: any) => s.quantity === 0 && (s.minimumLevel || 10) > 0);
    if (criticalStocks.length > 0) {
      anomalies.push({
        id: 'anom_' + Date.now() + '_zero_stock',
        type: 'inventory',
        description: 'Critical items out of stock',
        severity: 'critical',
        affectedEntity: `${criticalStocks.length} products`,
        suggestedAction: `Immediately reorder these items: ${criticalStocks.map((s: any) => s.product?.name).join(', ')}`,
        createdAt: new Date(),
      });
    }

    // Negative stock (data consistency issue)
    const negativeStocks = stocks.filter((s: any) => s.quantity < 0);
    if (negativeStocks.length > 0) {
      anomalies.push({
        id: 'anom_' + Date.now() + '_negative_stock',
        type: 'inventory',
        description: 'Negative stock detected - possible data error',
        severity: 'critical',
        affectedEntity: `${negativeStocks.length} products have negative quantities`,
        suggestedAction: 'Review and correct inventory records immediately',
        createdAt: new Date(),
      });
    }

    return anomalies;
  }

  /**
   * Detect sales anomalies
   */
  async detectSalesAnomalies(companyId: string): Promise<AIAnomaly[]> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const sales = await prisma.sale.findMany({
      where: {
        companyId,
        createdAt: { gte: thirtyDaysAgo },
      },
    });

    const anomalies: AIAnomaly[] = [];

    if (sales.length === 0) {
      anomalies.push({
        id: 'anom_' + Date.now() + '_no_sales',
        type: 'sales',
        description: 'No sales recorded in the last 30 days',
        severity: 'warning',
        affectedEntity: 'Sales',
        suggestedAction: 'Review sales pipeline and follow up with prospects',
        createdAt: new Date(),
      });
    } else {
      const amounts = sales.map(s => Number(s.totalAmount || 0));
      const avgAmount = amounts.reduce((a, b) => a + b) / amounts.length;
      const currentAmount = amounts[amounts.length - 1];

      if (currentAmount < avgAmount * 0.3) {
        anomalies.push({
          id: 'anom_' + Date.now() + '_sales_drop',
          type: 'sales',
          description: 'Significant drop in recent sales',
          severity: 'warning',
          affectedEntity: `Recent sale: $${currentAmount.toLocaleString()} vs average: $${Math.round(avgAmount).toLocaleString()}`,
          suggestedAction: 'Investigate reasons for sales decline and increase outreach efforts',
          createdAt: new Date(),
        });
      }
    }

    return anomalies;
  }

  /**
   * Get all recommendations for a company
   */
  async getAllRecommendations(companyId: string): Promise<AIRecommendation[]> {
    const inventoryRecs = await this.generateInventoryRecommendations(companyId);
    const pricingRecs = await this.generatePricingRecommendations(companyId);
    return [...inventoryRecs, ...pricingRecs].sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  /**
   * Get all anomalies for a company
   */
  async getAllAnomalies(companyId: string): Promise<AIAnomaly[]> {
    const financialAnomalies = await this.detectFinancialAnomalies(companyId);
    const inventoryAnomalies = await this.detectInventoryAnomalies(companyId);
    const salesAnomalies = await this.detectSalesAnomalies(companyId);
    return [...financialAnomalies, ...inventoryAnomalies, ...salesAnomalies].sort((a, b) => {
      const severityOrder = { critical: 0, warning: 1, info: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
  }
}

export const aiService = new AIService();
