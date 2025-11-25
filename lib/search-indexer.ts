import { searchService } from './search-service';
import { prisma } from './prisma';

export class SearchIndexer {
  async indexOrders(companyId: string): Promise<number> {
    const orders = await prisma.order.findMany({
      where: { companyId },
      include: {
        client: true,
        items: true,
      },
    });

    interface OrderDocument {
      id: string;
      data: {
        type: string;
        companyId: string;
        title: string;
        description: string;
        content: string;
        status: string;
        clientId: string;
        totalAmount: number;
        createdAt: Date;
        tags: string[];
      };
    }

    const documents: OrderDocument[] = orders.map((order: any) => ({
      id: order.id,
      data: {
        type: 'order',
        companyId,
        title: `Order #${order.orderNumber}`,
        description: `Order from ${order.client?.name || 'Unknown'}`,
        content: `Order ${order.orderNumber} - ${order.status}`,
        status: order.status,
        clientId: order.clientId,
        totalAmount: order.totalAmount,
        createdAt: order.createdAt,
        tags: ['order', order.status],
      },
    }));

    if (documents.length > 0) {
      await searchService.bulkIndex('orders', documents);
    }

    return documents.length;
  }

  async indexInvoices(companyId: string): Promise<number> {
    const invoices = await prisma.invoice.findMany({
      where: { companyId },
      include: {
        order: true,
      },
    });

    const documents = invoices.map((invoice: any) => ({
      id: invoice.id,
      data: {
        type: 'invoice',
        companyId,
        title: `Invoice #${invoice.invoiceNumber}`,
        description: `Invoice for order ${invoice.order?.orderNumber}`,
        content: `Invoice ${invoice.invoiceNumber} - ${invoice.status}`,
        status: invoice.status,
        orderId: invoice.orderId,
        amount: invoice.amount,
        createdAt: invoice.createdAt,
        tags: ['invoice', invoice.status],
      },
    }));

    if (documents.length > 0) {
      await searchService.bulkIndex('invoices', documents);
    }

    return documents.length;
  }

  async indexProducts(companyId: string): Promise<number> {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { groupId: true },
    });

    if (!company) return 0;

    const products = await prisma.product.findMany({
      where: { groupId: company.groupId },
      include: {
        category: true,
        brand: true,
      },
    });

    const documents = products.map((product: any) => ({
      id: product.id,
      data: {
        type: 'product',
        companyId,
        title: product.name,
        description: product.description,
        content: `${product.name} - ${product.category?.name || ''} - ${product.brand?.name || ''}`,
        status: 'active',
        categoryId: product.categoryId,
        brandId: product.brandId,
        price: product.price,
        createdAt: product.createdAt,
        tags: ['product', product.category?.name, product.brand?.name].filter(Boolean),
      },
    }));

    if (documents.length > 0) {
      await searchService.bulkIndex('products', documents);
    }

    return documents.length;
  }

  async indexClients(companyId: string): Promise<number> {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { groupId: true },
    });

    if (!company) return 0;

    const clients = await prisma.client.findMany({
      where: { groupId: company.groupId },
    });

    const documents = clients.map((client: any) => ({
      id: client.id,
      data: {
        type: 'client',
        companyId,
        title: client.name,
        description: client.email,
        content: `${client.name} - ${client.email} - ${client.phone}`,
        status: 'active',
        email: client.email,
        phone: client.phone,
        createdAt: client.createdAt,
        tags: ['client'],
      },
    }));

    if (documents.length > 0) {
      await searchService.bulkIndex('clients', documents);
    }

    return documents.length;
  }

  async indexDocuments(companyId: string): Promise<number> {
    const documents = await prisma.collaborationDocument.findMany({
      where: { companyId },
      include: {
        owner: true,
      },
    });

    const indexDocs = documents.map((doc: any) => ({
      id: doc.id,
      data: {
        type: 'document',
        companyId,
        title: doc.title,
        description: `Document by ${doc.owner?.firstName} ${doc.owner?.lastName}`,
        content: doc.content,
        status: 'published',
        ownerId: doc.ownerId,
        docType: doc.type,
        createdAt: doc.createdAt,
        tags: ['document', doc.type],
      },
    }));

    if (indexDocs.length > 0) {
      await searchService.bulkIndex('documents', indexDocs);
    }

    return indexDocs.length;
  }

  async indexAll(companyId: string): Promise<Record<string, number>> {
    const results = {
      orders: await this.indexOrders(companyId),
      invoices: await this.indexInvoices(companyId),
      products: await this.indexProducts(companyId),
      clients: await this.indexClients(companyId),
      documents: await this.indexDocuments(companyId),
    };

    return results;
  }
}

export const searchIndexer = new SearchIndexer();

