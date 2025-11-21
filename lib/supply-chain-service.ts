export interface Supplier {
  id: string;
  companyId: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  rating: number;
  status: 'active' | 'inactive' | 'suspended';
  leadTime: number;
  createdAt: Date;
}

export interface PurchaseOrder {
  id: string;
  companyId: string;
  supplierId: string;
  orderNumber: string;
  items: { productId: string; quantity: number; unitPrice: number }[];
  totalAmount: number;
  status: 'draft' | 'sent' | 'confirmed' | 'delivered' | 'cancelled';
  orderDate: Date;
  expectedDelivery: Date;
  createdAt: Date;
}

export interface Shipment {
  id: string;
  purchaseOrderId: string;
  trackingNumber: string;
  carrier: string;
  status: 'pending' | 'in-transit' | 'delivered' | 'delayed';
  shippedDate: Date;
  estimatedDelivery: Date;
  actualDelivery?: Date;
  createdAt: Date;
}

export interface Inventory {
  id: string;
  companyId: string;
  productId: string;
  quantity: number;
  reorderLevel: number;
  reorderQuantity: number;
  lastRestockDate: Date;
  supplier?: string;
}

export class SupplyChainService {
  private suppliers: Map<string, Supplier> = new Map();
  private purchaseOrders: Map<string, PurchaseOrder> = new Map();
  private shipments: Map<string, Shipment> = new Map();
  private inventory: Map<string, Inventory> = new Map();

  async createSupplier(
    companyId: string,
    name: string,
    email: string,
    phone: string,
    address: string,
    city: string,
    country: string,
    leadTime: number
  ): Promise<Supplier> {
    const supplier: Supplier = {
      id: Math.random().toString(36).substr(2, 9),
      companyId,
      name,
      email,
      phone,
      address,
      city,
      country,
      rating: 5,
      status: 'active',
      leadTime,
      createdAt: new Date(),
    };

    this.suppliers.set(supplier.id, supplier);
    console.log(`Supplier created: ${name}`);
    return supplier;
  }

  async createPurchaseOrder(
    companyId: string,
    supplierId: string,
    items: { productId: string; quantity: number; unitPrice: number }[],
    expectedDelivery: Date
  ): Promise<PurchaseOrder> {
    const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const orderNumber = `PO-${Date.now()}`;

    const order: PurchaseOrder = {
      id: Math.random().toString(36).substr(2, 9),
      companyId,
      supplierId,
      orderNumber,
      items,
      totalAmount,
      status: 'draft',
      orderDate: new Date(),
      expectedDelivery,
      createdAt: new Date(),
    };

    this.purchaseOrders.set(order.id, order);
    console.log(`Purchase order created: ${orderNumber}`);
    return order;
  }

  async confirmPurchaseOrder(orderId: string): Promise<PurchaseOrder | null> {
    const order = this.purchaseOrders.get(orderId);
    if (!order) return null;

    order.status = 'confirmed';
    this.purchaseOrders.set(orderId, order);
    console.log(`Purchase order confirmed: ${orderId}`);
    return order;
  }

  async createShipment(
    purchaseOrderId: string,
    trackingNumber: string,
    carrier: string,
    estimatedDelivery: Date
  ): Promise<Shipment> {
    const shipment: Shipment = {
      id: Math.random().toString(36).substr(2, 9),
      purchaseOrderId,
      trackingNumber,
      carrier,
      status: 'pending',
      shippedDate: new Date(),
      estimatedDelivery,
      createdAt: new Date(),
    };

    this.shipments.set(shipment.id, shipment);
    console.log(`Shipment created: ${trackingNumber}`);
    return shipment;
  }

  async updateShipmentStatus(shipmentId: string, status: string): Promise<Shipment | null> {
    const shipment = this.shipments.get(shipmentId);
    if (!shipment) return null;

    shipment.status = status as any;
    if (status === 'delivered') {
      shipment.actualDelivery = new Date();
    }

    this.shipments.set(shipmentId, shipment);
    console.log(`Shipment status updated: ${shipmentId}`);
    return shipment;
  }

  async getSuppliers(companyId: string): Promise<Supplier[]> {
    return Array.from(this.suppliers.values()).filter(
      (s) => s.companyId === companyId
    );
  }

  async getPurchaseOrders(companyId: string, status?: string): Promise<PurchaseOrder[]> {
    let orders = Array.from(this.purchaseOrders.values()).filter(
      (o) => o.companyId === companyId
    );

    if (status) {
      orders = orders.filter((o) => o.status === status);
    }

    return orders;
  }

  async getSupplyChainMetrics(companyId: string): Promise<{
    totalSuppliers: number;
    activeSuppliers: number;
    totalOrders: number;
    pendingOrders: number;
    totalShipments: number;
    inTransitShipments: number;
    averageLeadTime: number;
  }> {
    const suppliers = Array.from(this.suppliers.values()).filter(
      (s) => s.companyId === companyId
    );
    const activeSuppliers = suppliers.filter((s) => s.status === 'active').length;
    const averageLeadTime = suppliers.length > 0
      ? suppliers.reduce((sum, s) => sum + s.leadTime, 0) / suppliers.length
      : 0;

    const orders = Array.from(this.purchaseOrders.values()).filter(
      (o) => o.companyId === companyId
    );
    const pendingOrders = orders.filter((o) => o.status === 'draft' || o.status === 'sent').length;

    const shipments = Array.from(this.shipments.values());
    const inTransitShipments = shipments.filter((s) => s.status === 'in-transit').length;

    return {
      totalSuppliers: suppliers.length,
      activeSuppliers,
      totalOrders: orders.length,
      pendingOrders,
      totalShipments: shipments.length,
      inTransitShipments,
      averageLeadTime,
    };
  }
}

export const supplyChainService = new SupplyChainService();

