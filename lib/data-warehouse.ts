import { prisma } from './prisma';

export interface DimensionTable {
  id: string;
  name: string;
  description: string;
  recordCount: number;
  lastUpdated: Date;
}

export interface FactTable {
  id: string;
  name: string;
  description: string;
  recordCount: number;
  lastUpdated: Date;
}

export class DataWarehouse {
  async createSalesFact(companyId: string): Promise<void> {
    // Aggregate sales data into fact table
    const orders = await prisma.order.findMany({
      where: { companyId },
      include: {
        items: true,
        client: true,
      },
    });

    const facts = orders.map(order => ({
      orderId: order.id,
      clientId: order.clientId,
      totalAmount: order.totalAmount,
      itemCount: order.items.length,
      status: order.status,
      date: order.createdAt,
    }));

    return;
  }

  async createInventoryFact(companyId: string): Promise<void> {
    // Aggregate inventory data into fact table
    const stocks = await prisma.stock.findMany({
      where: { companyId },
      include: { product: true },
    });

    const facts = stocks.map(stock => ({
      productId: stock.productId,
      quantity: stock.quantity,
      value: stock.quantity * (stock.product?.price || 0),
      minimumLevel: stock.minimumLevel,
      date: new Date(),
    }));

    return;
  }

  async createFinancialFact(companyId: string): Promise<void> {
    // Aggregate financial data into fact table
    const invoices = await prisma.invoice.findMany({
      where: { companyId },
    });

    const facts = invoices.map(invoice => ({
      invoiceId: invoice.id,
      amount: invoice.amount,
      status: invoice.status,
      date: invoice.createdAt,
    }));

    return;
  }

  async getDimensionTables(companyId: string): Promise<DimensionTable[]> {
    const tables: DimensionTable[] = [];

    // Clients dimension
    const clientCount = await prisma.client.count({ where: { companyId } });
    tables.push({
      id: 'dim_clients',
      name: 'Clients',
      description: 'Client dimension table',
      recordCount: clientCount,
      lastUpdated: new Date(),
    });

    // Products dimension
    const productCount = await prisma.product.count({ where: { companyId } });
    tables.push({
      id: 'dim_products',
      name: 'Products',
      description: 'Product dimension table',
      recordCount: productCount,
      lastUpdated: new Date(),
    });

    // Categories dimension
    const categoryCount = await prisma.category.count({ where: { companyId } });
    tables.push({
      id: 'dim_categories',
      name: 'Categories',
      description: 'Category dimension table',
      recordCount: categoryCount,
      lastUpdated: new Date(),
    });

    return tables;
  }

  async getFactTables(companyId: string): Promise<FactTable[]> {
    const tables: FactTable[] = [];

    // Sales fact
    const orderCount = await prisma.order.count({ where: { companyId } });
    tables.push({
      id: 'fact_sales',
      name: 'Sales',
      description: 'Sales fact table',
      recordCount: orderCount,
      lastUpdated: new Date(),
    });

    // Inventory fact
    const stockCount = await prisma.stock.count({ where: { companyId } });
    tables.push({
      id: 'fact_inventory',
      name: 'Inventory',
      description: 'Inventory fact table',
      recordCount: stockCount,
      lastUpdated: new Date(),
    });

    // Financial fact
    const invoiceCount = await prisma.invoice.count({ where: { companyId } });
    tables.push({
      id: 'fact_financial',
      name: 'Financial',
      description: 'Financial fact table',
      recordCount: invoiceCount,
      lastUpdated: new Date(),
    });

    return tables;
  }

  async generateDataWarehouseReport(companyId: string): Promise<Record<string, any>> {
    const dimensions = await this.getDimensionTables(companyId);
    const facts = await this.getFactTables(companyId);

    return {
      companyId,
      dimensions,
      facts,
      totalDimensions: dimensions.length,
      totalFacts: facts.length,
      totalRecords: dimensions.reduce((sum, d) => sum + d.recordCount, 0) +
                    facts.reduce((sum, f) => sum + f.recordCount, 0),
      generatedAt: new Date(),
    };
  }
}

export const dataWarehouse = new DataWarehouse();

