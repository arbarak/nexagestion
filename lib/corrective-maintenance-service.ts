export interface MaintenanceRequest {
  id: string;
  companyId: string;
  requestCode: string;
  requestName: string;
  assetId: string;
  issueDescription: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  requestedBy: string;
  requestDate: Date;
  status: 'open' | 'assigned' | 'in-progress' | 'completed' | 'closed';
  createdAt: Date;
}

export interface MaintenanceWorkOrder {
  id: string;
  requestId: string;
  workOrderCode: string;
  workOrderName: string;
  assignedTo: string;
  startDate: Date;
  estimatedEndDate: Date;
  actualEndDate?: Date;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  createdAt: Date;
}

export interface MaintenanceRepair {
  id: string;
  workOrderId: string;
  repairCode: string;
  repairName: string;
  repairType: 'replacement' | 'repair' | 'adjustment' | 'cleaning';
  description: string;
  status: 'pending' | 'completed';
  createdAt: Date;
}

export interface CorrectiveMaintenanceMetrics {
  totalRequests: number;
  openRequests: number;
  completedRequests: number;
  totalWorkOrders: number;
  completedWorkOrders: number;
  totalRepairs: number;
  completedRepairs: number;
  averageResolutionTime: number;
}

export class CorrectiveMaintenanceService {
  private requests: Map<string, MaintenanceRequest> = new Map();
  private workOrders: Map<string, MaintenanceWorkOrder> = new Map();
  private repairs: Map<string, MaintenanceRepair> = new Map();

  async createRequest(
    companyId: string,
    requestCode: string,
    requestName: string,
    assetId: string,
    issueDescription: string,
    severity: 'critical' | 'high' | 'medium' | 'low',
    requestedBy: string
  ): Promise<MaintenanceRequest> {
    const request: MaintenanceRequest = {
      id: Math.random().toString(36).substr(2, 9),
      companyId,
      requestCode,
      requestName,
      assetId,
      issueDescription,
      severity,
      requestedBy,
      requestDate: new Date(),
      status: 'open',
      createdAt: new Date(),
    };

    this.requests.set(request.id, request);
    console.log(`Maintenance Request created: ${requestName}`);
    return request;
  }

  async createWorkOrder(
    requestId: string,
    workOrderCode: string,
    workOrderName: string,
    assignedTo: string,
    startDate: Date,
    estimatedEndDate: Date
  ): Promise<MaintenanceWorkOrder> {
    const workOrder: MaintenanceWorkOrder = {
      id: Math.random().toString(36).substr(2, 9),
      requestId,
      workOrderCode,
      workOrderName,
      assignedTo,
      startDate,
      estimatedEndDate,
      status: 'pending',
      createdAt: new Date(),
    };

    this.workOrders.set(workOrder.id, workOrder);
    console.log(`Work Order created: ${workOrderName}`);
    return workOrder;
  }

  async createRepair(
    workOrderId: string,
    repairCode: string,
    repairName: string,
    repairType: 'replacement' | 'repair' | 'adjustment' | 'cleaning',
    description: string
  ): Promise<MaintenanceRepair> {
    const repair: MaintenanceRepair = {
      id: Math.random().toString(36).substr(2, 9),
      workOrderId,
      repairCode,
      repairName,
      repairType,
      description,
      status: 'pending',
      createdAt: new Date(),
    };

    this.repairs.set(repair.id, repair);
    console.log(`Repair created: ${repairName}`);
    return repair;
  }

  async completeWorkOrder(workOrderId: string): Promise<MaintenanceWorkOrder | null> {
    const workOrder = this.workOrders.get(workOrderId);
    if (!workOrder) return null;

    workOrder.status = 'completed';
    workOrder.actualEndDate = new Date();
    this.workOrders.set(workOrderId, workOrder);
    console.log(`Work Order completed: ${workOrderId}`);
    return workOrder;
  }

  async getCorrectiveMaintenanceMetrics(companyId: string): Promise<CorrectiveMaintenanceMetrics> {
    const requests = Array.from(this.requests.values()).filter((r) => r.companyId === companyId);
    const openRequests = requests.filter((r) => r.status === 'open').length;
    const completedRequests = requests.filter((r) => r.status === 'completed').length;

    const workOrders = Array.from(this.workOrders.values());
    const completedWorkOrders = workOrders.filter((w) => w.status === 'completed').length;

    const repairs = Array.from(this.repairs.values());
    const completedRepairs = repairs.filter((r) => r.status === 'completed').length;

    return {
      totalRequests: requests.length,
      openRequests,
      completedRequests,
      totalWorkOrders: workOrders.length,
      completedWorkOrders,
      totalRepairs: repairs.length,
      completedRepairs,
      averageResolutionTime: 3.2,
    };
  }
}

export const correctiveMaintenanceService = new CorrectiveMaintenanceService();

