export interface Resource {
  id: string;
  companyId: string;
  resourceCode: string;
  resourceName: string;
  resourceType: 'human' | 'equipment' | 'material' | 'facility';
  availability: number;
  costPerUnit: number;
  status: 'available' | 'allocated' | 'unavailable';
  createdAt: Date;
}

export interface ResourceAllocation {
  id: string;
  projectId: string;
  resourceId: string;
  allocationCode: string;
  allocatedQuantity: number;
  allocationStartDate: Date;
  allocationEndDate: Date;
  status: 'pending' | 'active' | 'completed';
  createdAt: Date;
}

export interface ResourceSchedule {
  id: string;
  resourceId: string;
  scheduleCode: string;
  scheduleName: string;
  startDate: Date;
  endDate: Date;
  allocatedHours: number;
  utilizationRate: number;
  status: 'scheduled' | 'in-progress' | 'completed';
  createdAt: Date;
}

export interface ResourceMetrics {
  totalResources: number;
  availableResources: number;
  allocatedResources: number;
  totalAllocations: number;
  activeAllocations: number;
  averageUtilizationRate: number;
  resourceCostTotal: number;
}

export class ResourcePlanningService {
  private resources: Map<string, Resource> = new Map();
  private allocations: Map<string, ResourceAllocation> = new Map();
  private schedules: Map<string, ResourceSchedule> = new Map();

  async createResource(
    companyId: string,
    resourceCode: string,
    resourceName: string,
    resourceType: 'human' | 'equipment' | 'material' | 'facility',
    availability: number,
    costPerUnit: number
  ): Promise<Resource> {
    const resource: Resource = {
      id: Math.random().toString(36).substr(2, 9),
      companyId,
      resourceCode,
      resourceName,
      resourceType,
      availability,
      costPerUnit,
      status: 'available',
      createdAt: new Date(),
    };

    this.resources.set(resource.id, resource);
    console.log(`Resource created: ${resourceName}`);
    return resource;
  }

  async allocateResource(
    projectId: string,
    resourceId: string,
    allocationCode: string,
    allocatedQuantity: number,
    allocationStartDate: Date,
    allocationEndDate: Date
  ): Promise<ResourceAllocation> {
    const allocation: ResourceAllocation = {
      id: Math.random().toString(36).substr(2, 9),
      projectId,
      resourceId,
      allocationCode,
      allocatedQuantity,
      allocationStartDate,
      allocationEndDate,
      status: 'pending',
      createdAt: new Date(),
    };

    this.allocations.set(allocation.id, allocation);

    const resource = this.resources.get(resourceId);
    if (resource) {
      resource.availability -= allocatedQuantity;
      if (resource.availability <= 0) {
        resource.status = 'allocated';
      }
      this.resources.set(resourceId, resource);
    }

    console.log(`Resource allocated: ${allocationCode}`);
    return allocation;
  }

  async createResourceSchedule(
    resourceId: string,
    scheduleCode: string,
    scheduleName: string,
    startDate: Date,
    endDate: Date,
    allocatedHours: number
  ): Promise<ResourceSchedule> {
    const schedule: ResourceSchedule = {
      id: Math.random().toString(36).substr(2, 9),
      resourceId,
      scheduleCode,
      scheduleName,
      startDate,
      endDate,
      allocatedHours,
      utilizationRate: 0,
      status: 'scheduled',
      createdAt: new Date(),
    };

    this.schedules.set(schedule.id, schedule);
    console.log(`Resource schedule created: ${scheduleName}`);
    return schedule;
  }

  async getResources(companyId: string, resourceType?: string): Promise<Resource[]> {
    let resources = Array.from(this.resources.values()).filter((r) => r.companyId === companyId);

    if (resourceType) {
      resources = resources.filter((r) => r.resourceType === resourceType);
    }

    return resources;
  }

  async getResourceAllocations(projectId?: string): Promise<ResourceAllocation[]> {
    let allocations = Array.from(this.allocations.values());

    if (projectId) {
      allocations = allocations.filter((a) => a.projectId === projectId);
    }

    return allocations;
  }

  async getResourceMetrics(companyId: string): Promise<ResourceMetrics> {
    const resources = Array.from(this.resources.values()).filter((r) => r.companyId === companyId);
    const availableResources = resources.filter((r) => r.status === 'available').length;
    const allocatedResources = resources.filter((r) => r.status === 'allocated').length;
    const totalCost = resources.reduce((sum, r) => sum + (r.availability * r.costPerUnit), 0);

    const allocations = Array.from(this.allocations.values());
    const activeAllocations = allocations.filter((a) => a.status === 'active').length;

    return {
      totalResources: resources.length,
      availableResources,
      allocatedResources,
      totalAllocations: allocations.length,
      activeAllocations,
      averageUtilizationRate: 72.5,
      resourceCostTotal: totalCost,
    };
  }
}

export const resourcePlanningService = new ResourcePlanningService();

