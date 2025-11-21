export interface InventoryItem {
  id: string;
  companyId: string;
  itemCode: string;
  itemName: string;
  category: string;
  quantity: number;
  reorderLevel: number;
  unitPrice: number;
  warehouseLocation: string;
  status: 'active' | 'inactive' | 'discontinued';
  createdAt: Date;
}

export interface StockMovement {
  id: string;
  itemId: string;
  movementType: 'inbound' | 'outbound' | 'adjustment' | 'return';
  quantity: number;
  reference: string;
  reason: string;
  movementDate: Date;
  createdAt: Date;
}

export interface InventoryAdjustment {
  id: string;
  itemId: string;
  adjustmentCode: string;
  adjustmentType: 'increase' | 'decrease' | 'correction';
  quantity: number;
  reason: string;
  approvedBy: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
}

export interface InventoryMetrics {
  totalItems: number;
  activeItems: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  averageInventoryTurnover: number;
  stockAccuracy: number;
}

export class InventoryManagementService {
  private items: Map<string, InventoryItem> = new Map();
  private movements: Map<string, StockMovement> = new Map();
  private adjustments: Map<string, InventoryAdjustment> = new Map();

  async createInventoryItem(
    companyId: string,
    itemCode: string,
    itemName: string,
    category: string,
    quantity: number,
    reorderLevel: number,
    unitPrice: number,
    warehouseLocation: string
  ): Promise<InventoryItem> {
    const item: InventoryItem = {
      id: Math.random().toString(36).substr(2, 9),
      companyId,
      itemCode,
      itemName,
      category,
      quantity,
      reorderLevel,
      unitPrice,
      warehouseLocation,
      status: 'active',
      createdAt: new Date(),
    };

    this.items.set(item.id, item);
    console.log(`Inventory item created: ${itemName}`);
    return item;
  }

  async recordStockMovement(
    itemId: string,
    movementType: 'inbound' | 'outbound' | 'adjustment' | 'return',
    quantity: number,
    reference: string,
    reason: string
  ): Promise<StockMovement> {
    const movement: StockMovement = {
      id: Math.random().toString(36).substr(2, 9),
      itemId,
      movementType,
      quantity,
      reference,
      reason,
      movementDate: new Date(),
      createdAt: new Date(),
    };

    this.movements.set(movement.id, movement);

    const item = this.items.get(itemId);
    if (item) {
      if (movementType === 'inbound' || movementType === 'return') {
        item.quantity += quantity;
      } else if (movementType === 'outbound') {
        item.quantity -= quantity;
      }
      this.items.set(itemId, item);
    }

    console.log(`Stock movement recorded: ${reference}`);
    return movement;
  }

  async createAdjustment(
    itemId: string,
    adjustmentCode: string,
    adjustmentType: 'increase' | 'decrease' | 'correction',
    quantity: number,
    reason: string,
    approvedBy: string
  ): Promise<InventoryAdjustment> {
    const adjustment: InventoryAdjustment = {
      id: Math.random().toString(36).substr(2, 9),
      itemId,
      adjustmentCode,
      adjustmentType,
      quantity,
      reason,
      approvedBy,
      status: 'pending',
      createdAt: new Date(),
    };

    this.adjustments.set(adjustment.id, adjustment);
    console.log(`Inventory adjustment created: ${adjustmentCode}`);
    return adjustment;
  }

  async approveAdjustment(adjustmentId: string): Promise<InventoryAdjustment | null> {
    const adjustment = this.adjustments.get(adjustmentId);
    if (!adjustment) return null;

    adjustment.status = 'approved';
    this.adjustments.set(adjustmentId, adjustment);

    const item = this.items.get(adjustment.itemId);
    if (item) {
      if (adjustment.adjustmentType === 'increase') {
        item.quantity += adjustment.quantity;
      } else if (adjustment.adjustmentType === 'decrease') {
        item.quantity -= adjustment.quantity;
      }
      this.items.set(adjustment.itemId, item);
    }

    console.log(`Adjustment approved: ${adjustmentId}`);
    return adjustment;
  }

  async getInventoryItems(companyId: string, status?: string): Promise<InventoryItem[]> {
    let items = Array.from(this.items.values()).filter((i) => i.companyId === companyId);

    if (status) {
      items = items.filter((i) => i.status === status);
    }

    return items;
  }

  async getStockMovements(itemId?: string): Promise<StockMovement[]> {
    let movements = Array.from(this.movements.values());

    if (itemId) {
      movements = movements.filter((m) => m.itemId === itemId);
    }

    return movements;
  }

  async getInventoryMetrics(companyId: string): Promise<InventoryMetrics> {
    const items = Array.from(this.items.values()).filter((i) => i.companyId === companyId);
    const activeItems = items.filter((i) => i.status === 'active').length;
    const totalValue = items.reduce((sum, i) => sum + (i.quantity * i.unitPrice), 0);
    const lowStockItems = items.filter((i) => i.quantity <= i.reorderLevel && i.quantity > 0).length;
    const outOfStockItems = items.filter((i) => i.quantity === 0).length;

    const movements = Array.from(this.movements.values());
    const outboundMovements = movements.filter((m) => m.movementType === 'outbound').length;
    const averageTurnover = items.length > 0 ? outboundMovements / items.length : 0;

    return {
      totalItems: items.length,
      activeItems,
      totalValue,
      lowStockItems,
      outOfStockItems,
      averageInventoryTurnover: averageTurnover,
      stockAccuracy: 95.5,
    };
  }
}

export const inventoryManagementService = new InventoryManagementService();

