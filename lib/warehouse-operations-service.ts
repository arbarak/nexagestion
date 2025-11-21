export interface Warehouse {
  id: string;
  companyId: string;
  warehouseCode: string;
  warehouseName: string;
  location: string;
  capacity: number;
  currentUtilization: number;
  manager: string;
  status: 'active' | 'inactive' | 'maintenance';
  createdAt: Date;
}

export interface WarehouseZone {
  id: string;
  warehouseId: string;
  zoneCode: string;
  zoneName: string;
  zoneType: 'storage' | 'picking' | 'packing' | 'receiving' | 'shipping';
  capacity: number;
  currentUtilization: number;
  createdAt: Date;
}

export interface PickingOrder {
  id: string;
  orderCode: string;
  warehouseId: string;
  items: Array<{ itemId: string; quantity: number }>;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  pickedBy: string;
  completedAt?: Date;
  createdAt: Date;
}

export interface PackingOrder {
  id: string;
  pickingOrderId: string;
  packingCode: string;
  warehouseId: string;
  weight: number;
  dimensions: string;
  status: 'pending' | 'in-progress' | 'completed';
  packedBy: string;
  completedAt?: Date;
  createdAt: Date;
}

export interface WarehouseMetrics {
  totalWarehouses: number;
  activeWarehouses: number;
  totalCapacity: number;
  totalUtilization: number;
  utilizationRate: number;
  pendingPickingOrders: number;
  completedPickingOrders: number;
  averagePickingTime: number;
}

export class WarehouseOperationsService {
  private warehouses: Map<string, Warehouse> = new Map();
  private zones: Map<string, WarehouseZone> = new Map();
  private pickingOrders: Map<string, PickingOrder> = new Map();
  private packingOrders: Map<string, PackingOrder> = new Map();

  async createWarehouse(
    companyId: string,
    warehouseCode: string,
    warehouseName: string,
    location: string,
    capacity: number,
    manager: string
  ): Promise<Warehouse> {
    const warehouse: Warehouse = {
      id: Math.random().toString(36).substr(2, 9),
      companyId,
      warehouseCode,
      warehouseName,
      location,
      capacity,
      currentUtilization: 0,
      manager,
      status: 'active',
      createdAt: new Date(),
    };

    this.warehouses.set(warehouse.id, warehouse);
    console.log(`Warehouse created: ${warehouseName}`);
    return warehouse;
  }

  async createWarehouseZone(
    warehouseId: string,
    zoneCode: string,
    zoneName: string,
    zoneType: 'storage' | 'picking' | 'packing' | 'receiving' | 'shipping',
    capacity: number
  ): Promise<WarehouseZone> {
    const zone: WarehouseZone = {
      id: Math.random().toString(36).substr(2, 9),
      warehouseId,
      zoneCode,
      zoneName,
      zoneType,
      capacity,
      currentUtilization: 0,
      createdAt: new Date(),
    };

    this.zones.set(zone.id, zone);
    console.log(`Warehouse zone created: ${zoneName}`);
    return zone;
  }

  async createPickingOrder(
    orderCode: string,
    warehouseId: string,
    items: Array<{ itemId: string; quantity: number }>,
    pickedBy: string
  ): Promise<PickingOrder> {
    const order: PickingOrder = {
      id: Math.random().toString(36).substr(2, 9),
      orderCode,
      warehouseId,
      items,
      status: 'pending',
      pickedBy,
      createdAt: new Date(),
    };

    this.pickingOrders.set(order.id, order);
    console.log(`Picking order created: ${orderCode}`);
    return order;
  }

  async completePickingOrder(pickingOrderId: string): Promise<PickingOrder | null> {
    const order = this.pickingOrders.get(pickingOrderId);
    if (!order) return null;

    order.status = 'completed';
    order.completedAt = new Date();
    this.pickingOrders.set(pickingOrderId, order);
    console.log(`Picking order completed: ${pickingOrderId}`);
    return order;
  }

  async createPackingOrder(
    pickingOrderId: string,
    packingCode: string,
    warehouseId: string,
    weight: number,
    dimensions: string,
    packedBy: string
  ): Promise<PackingOrder> {
    const order: PackingOrder = {
      id: Math.random().toString(36).substr(2, 9),
      pickingOrderId,
      packingCode,
      warehouseId,
      weight,
      dimensions,
      status: 'pending',
      packedBy,
      createdAt: new Date(),
    };

    this.packingOrders.set(order.id, order);
    console.log(`Packing order created: ${packingCode}`);
    return order;
  }

  async getWarehouses(companyId: string): Promise<Warehouse[]> {
    return Array.from(this.warehouses.values()).filter((w) => w.companyId === companyId);
  }

  async getWarehouseMetrics(companyId: string): Promise<WarehouseMetrics> {
    const warehouses = Array.from(this.warehouses.values()).filter((w) => w.companyId === companyId);
    const activeWarehouses = warehouses.filter((w) => w.status === 'active').length;
    const totalCapacity = warehouses.reduce((sum, w) => sum + w.capacity, 0);
    const totalUtilization = warehouses.reduce((sum, w) => sum + w.currentUtilization, 0);

    const pickingOrders = Array.from(this.pickingOrders.values());
    const pendingOrders = pickingOrders.filter((o) => o.status === 'pending').length;
    const completedOrders = pickingOrders.filter((o) => o.status === 'completed').length;

    return {
      totalWarehouses: warehouses.length,
      activeWarehouses,
      totalCapacity,
      totalUtilization,
      utilizationRate: totalCapacity > 0 ? (totalUtilization / totalCapacity) * 100 : 0,
      pendingPickingOrders: pendingOrders,
      completedPickingOrders: completedOrders,
      averagePickingTime: 2.5,
    };
  }
}

export const warehouseOperationsService = new WarehouseOperationsService();

