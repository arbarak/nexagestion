export interface Warehouse {
  id: string;
  companyId: string;
  name: string;
  location: string;
  capacity: number;
  currentUtilization: number;
  manager: string;
  status: 'active' | 'inactive' | 'maintenance';
  createdAt: Date;
}

export interface Route {
  id: string;
  companyId: string;
  name: string;
  origin: string;
  destination: string;
  distance: number;
  estimatedTime: number;
  cost: number;
  status: 'active' | 'inactive';
  createdAt: Date;
}

export interface Delivery {
  id: string;
  companyId: string;
  orderId: string;
  routeId: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  pickupTime?: Date;
  deliveryTime?: Date;
  driver: string;
  vehicle: string;
  createdAt: Date;
}

export interface LogisticsMetrics {
  totalDeliveries: number;
  completedDeliveries: number;
  failedDeliveries: number;
  averageDeliveryTime: number;
  warehouseUtilization: number;
  costPerDelivery: number;
}

export class LogisticsService {
  private warehouses: Map<string, Warehouse> = new Map();
  private routes: Map<string, Route> = new Map();
  private deliveries: Map<string, Delivery> = new Map();

  async createWarehouse(
    companyId: string,
    name: string,
    location: string,
    capacity: number,
    manager: string
  ): Promise<Warehouse> {
    const warehouse: Warehouse = {
      id: Math.random().toString(36).substr(2, 9),
      companyId,
      name,
      location,
      capacity,
      currentUtilization: 0,
      manager,
      status: 'active',
      createdAt: new Date(),
    };

    this.warehouses.set(warehouse.id, warehouse);
    console.log(`Warehouse created: ${name}`);
    return warehouse;
  }

  async createRoute(
    companyId: string,
    name: string,
    origin: string,
    destination: string,
    distance: number,
    estimatedTime: number,
    cost: number
  ): Promise<Route> {
    const route: Route = {
      id: Math.random().toString(36).substr(2, 9),
      companyId,
      name,
      origin,
      destination,
      distance,
      estimatedTime,
      cost,
      status: 'active',
      createdAt: new Date(),
    };

    this.routes.set(route.id, route);
    console.log(`Route created: ${name}`);
    return route;
  }

  async createDelivery(
    companyId: string,
    orderId: string,
    routeId: string,
    driver: string,
    vehicle: string
  ): Promise<Delivery> {
    const delivery: Delivery = {
      id: Math.random().toString(36).substr(2, 9),
      companyId,
      orderId,
      routeId,
      status: 'pending',
      driver,
      vehicle,
      createdAt: new Date(),
    };

    this.deliveries.set(delivery.id, delivery);
    console.log(`Delivery created: ${orderId}`);
    return delivery;
  }

  async updateDeliveryStatus(deliveryId: string, status: string): Promise<Delivery | null> {
    const delivery = this.deliveries.get(deliveryId);
    if (!delivery) return null;

    delivery.status = status as any;
    if (status === 'in-progress') {
      delivery.pickupTime = new Date();
    } else if (status === 'completed') {
      delivery.deliveryTime = new Date();
    }

    this.deliveries.set(deliveryId, delivery);
    console.log(`Delivery status updated: ${deliveryId}`);
    return delivery;
  }

  async getWarehouses(companyId: string): Promise<Warehouse[]> {
    return Array.from(this.warehouses.values()).filter(
      (w) => w.companyId === companyId
    );
  }

  async getRoutes(companyId: string): Promise<Route[]> {
    return Array.from(this.routes.values()).filter(
      (r) => r.companyId === companyId
    );
  }

  async getDeliveries(companyId: string, status?: string): Promise<Delivery[]> {
    let deliveries = Array.from(this.deliveries.values()).filter(
      (d) => d.companyId === companyId
    );

    if (status) {
      deliveries = deliveries.filter((d) => d.status === status);
    }

    return deliveries;
  }

  async getLogisticsMetrics(companyId: string): Promise<LogisticsMetrics> {
    const deliveries = Array.from(this.deliveries.values()).filter(
      (d) => d.companyId === companyId
    );
    const completedDeliveries = deliveries.filter((d) => d.status === 'completed').length;
    const failedDeliveries = deliveries.filter((d) => d.status === 'failed').length;

    const routes = Array.from(this.routes.values()).filter(
      (r) => r.companyId === companyId
    );
    const totalCost = routes.reduce((sum, r) => sum + r.cost, 0);
    const costPerDelivery = deliveries.length > 0 ? totalCost / deliveries.length : 0;

    const warehouses = Array.from(this.warehouses.values()).filter(
      (w) => w.companyId === companyId
    );
    const totalCapacity = warehouses.reduce((sum, w) => sum + w.capacity, 0);
    const totalUtilization = warehouses.reduce((sum, w) => sum + w.currentUtilization, 0);
    const warehouseUtilization = totalCapacity > 0 ? (totalUtilization / totalCapacity) * 100 : 0;

    return {
      totalDeliveries: deliveries.length,
      completedDeliveries,
      failedDeliveries,
      averageDeliveryTime: 2,
      warehouseUtilization,
      costPerDelivery,
    };
  }
}

export const logisticsService = new LogisticsService();

