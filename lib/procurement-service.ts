export interface PurchaseOrder {
  id: string;
  companyId: string;
  poNumber: string;
  vendorId: string;
  items: PurchaseOrderItem[];
  totalAmount: number;
  status: 'draft' | 'sent' | 'acknowledged' | 'received' | 'invoiced' | 'paid';
  orderDate: Date;
  deliveryDate?: Date;
  createdAt: Date;
}

export interface PurchaseOrderItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface GoodsReceipt {
  id: string;
  poId: string;
  receiptNumber: string;
  receivedQuantity: number;
  receivedDate: Date;
  inspectionStatus: 'pending' | 'passed' | 'failed';
  createdAt: Date;
}

export interface Invoice {
  id: string;
  poId: string;
  invoiceNumber: string;
  vendorId: string;
  amount: number;
  status: 'pending' | 'approved' | 'paid' | 'rejected';
  invoiceDate: Date;
  dueDate: Date;
  createdAt: Date;
}

export interface ProcurementMetrics {
  totalPurchaseOrders: number;
  pendingOrders: number;
  receivedOrders: number;
  totalOrderValue: number;
  averageOrderValue: number;
  totalInvoices: number;
  paidInvoices: number;
  totalInvoiceAmount: number;
}

export class ProcurementService {
  private purchaseOrders: Map<string, PurchaseOrder> = new Map();
  private goodsReceipts: Map<string, GoodsReceipt> = new Map();
  private invoices: Map<string, Invoice> = new Map();

  async createPurchaseOrder(
    companyId: string,
    poNumber: string,
    vendorId: string,
    items: PurchaseOrderItem[]
  ): Promise<PurchaseOrder> {
    const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0);

    const po: PurchaseOrder = {
      id: Math.random().toString(36).substr(2, 9),
      companyId,
      poNumber,
      vendorId,
      items,
      totalAmount,
      status: 'draft',
      orderDate: new Date(),
      createdAt: new Date(),
    };

    this.purchaseOrders.set(po.id, po);
    console.log(`Purchase order created: ${poNumber}`);
    return po;
  }

  async sendPurchaseOrder(poId: string): Promise<PurchaseOrder | null> {
    const po = this.purchaseOrders.get(poId);
    if (!po) return null;

    po.status = 'sent';
    this.purchaseOrders.set(poId, po);
    console.log(`Purchase order sent: ${poId}`);
    return po;
  }

  async receiveGoods(
    poId: string,
    receiptNumber: string,
    receivedQuantity: number
  ): Promise<GoodsReceipt> {
    const receipt: GoodsReceipt = {
      id: Math.random().toString(36).substr(2, 9),
      poId,
      receiptNumber,
      receivedQuantity,
      receivedDate: new Date(),
      inspectionStatus: 'pending',
      createdAt: new Date(),
    };

    this.goodsReceipts.set(receipt.id, receipt);

    const po = this.purchaseOrders.get(poId);
    if (po) {
      po.status = 'received';
      this.purchaseOrders.set(poId, po);
    }

    console.log(`Goods received: ${receiptNumber}`);
    return receipt;
  }

  async createInvoice(
    poId: string,
    invoiceNumber: string,
    vendorId: string,
    amount: number,
    dueDate: Date
  ): Promise<Invoice> {
    const invoice: Invoice = {
      id: Math.random().toString(36).substr(2, 9),
      poId,
      invoiceNumber,
      vendorId,
      amount,
      status: 'pending',
      invoiceDate: new Date(),
      dueDate,
      createdAt: new Date(),
    };

    this.invoices.set(invoice.id, invoice);
    console.log(`Invoice created: ${invoiceNumber}`);
    return invoice;
  }

  async approveInvoice(invoiceId: string): Promise<Invoice | null> {
    const invoice = this.invoices.get(invoiceId);
    if (!invoice) return null;

    invoice.status = 'approved';
    this.invoices.set(invoiceId, invoice);
    console.log(`Invoice approved: ${invoiceId}`);
    return invoice;
  }

  async getPurchaseOrders(companyId: string, status?: string): Promise<PurchaseOrder[]> {
    let orders = Array.from(this.purchaseOrders.values()).filter((o) => o.companyId === companyId);

    if (status) {
      orders = orders.filter((o) => o.status === status);
    }

    return orders;
  }

  async getInvoices(vendorId?: string, status?: string): Promise<Invoice[]> {
    let invoices = Array.from(this.invoices.values());

    if (vendorId) {
      invoices = invoices.filter((i) => i.vendorId === vendorId);
    }

    if (status) {
      invoices = invoices.filter((i) => i.status === status);
    }

    return invoices;
  }

  async getProcurementMetrics(companyId: string): Promise<ProcurementMetrics> {
    const orders = Array.from(this.purchaseOrders.values()).filter((o) => o.companyId === companyId);
    const pendingOrders = orders.filter((o) => o.status === 'draft' || o.status === 'sent').length;
    const receivedOrders = orders.filter((o) => o.status === 'received').length;
    const totalOrderValue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const averageOrderValue = orders.length > 0 ? totalOrderValue / orders.length : 0;

    const invoices = Array.from(this.invoices.values());
    const paidInvoices = invoices.filter((i) => i.status === 'paid').length;
    const totalInvoiceAmount = invoices.reduce((sum, i) => sum + i.amount, 0);

    return {
      totalPurchaseOrders: orders.length,
      pendingOrders,
      receivedOrders,
      totalOrderValue,
      averageOrderValue,
      totalInvoices: invoices.length,
      paidInvoices,
      totalInvoiceAmount,
    };
  }
}

export const procurementService = new ProcurementService();

