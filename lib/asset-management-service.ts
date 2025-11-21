export interface Asset {
  id: string;
  companyId: string;
  assetCode: string;
  name: string;
  category: string;
  purchaseDate: Date;
  purchasePrice: number;
  currentValue: number;
  location: string;
  status: 'active' | 'inactive' | 'maintenance' | 'retired';
  depreciation: number;
  createdAt: Date;
}

export interface MaintenanceSchedule {
  id: string;
  assetId: string;
  maintenanceType: 'preventive' | 'corrective' | 'predictive';
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  lastMaintenanceDate: Date;
  nextMaintenanceDate: Date;
  estimatedCost: number;
  status: 'scheduled' | 'in-progress' | 'completed' | 'overdue';
  createdAt: Date;
}

export interface MaintenanceRecord {
  id: string;
  scheduleId: string;
  assetId: string;
  description: string;
  cost: number;
  duration: number;
  technician: string;
  completedDate: Date;
  createdAt: Date;
}

export interface AssetMetrics {
  totalAssets: number;
  activeAssets: number;
  totalAssetValue: number;
  totalDepreciation: number;
  maintenanceScheduled: number;
  maintenanceOverdue: number;
  totalMaintenanceCost: number;
}

export class AssetManagementService {
  private assets: Map<string, Asset> = new Map();
  private schedules: Map<string, MaintenanceSchedule> = new Map();
  private records: MaintenanceRecord[] = [];

  async createAsset(
    companyId: string,
    assetCode: string,
    name: string,
    category: string,
    purchaseDate: Date,
    purchasePrice: number,
    location: string
  ): Promise<Asset> {
    const asset: Asset = {
      id: Math.random().toString(36).substr(2, 9),
      companyId,
      assetCode,
      name,
      category,
      purchaseDate,
      purchasePrice,
      currentValue: purchasePrice,
      location,
      status: 'active',
      depreciation: 0,
      createdAt: new Date(),
    };

    this.assets.set(asset.id, asset);
    console.log(`Asset created: ${assetCode}`);
    return asset;
  }

  async scheduleMaintenanceAsync(
    assetId: string,
    maintenanceType: 'preventive' | 'corrective' | 'predictive',
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly',
    estimatedCost: number
  ): Promise<MaintenanceSchedule> {
    const schedule: MaintenanceSchedule = {
      id: Math.random().toString(36).substr(2, 9),
      assetId,
      maintenanceType,
      frequency,
      lastMaintenanceDate: new Date(),
      nextMaintenanceDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      estimatedCost,
      status: 'scheduled',
      createdAt: new Date(),
    };

    this.schedules.set(schedule.id, schedule);
    console.log(`Maintenance scheduled: ${assetId}`);
    return schedule;
  }

  async recordMaintenance(
    scheduleId: string,
    assetId: string,
    description: string,
    cost: number,
    duration: number,
    technician: string
  ): Promise<MaintenanceRecord> {
    const record: MaintenanceRecord = {
      id: Math.random().toString(36).substr(2, 9),
      scheduleId,
      assetId,
      description,
      cost,
      duration,
      technician,
      completedDate: new Date(),
      createdAt: new Date(),
    };

    this.records.push(record);

    const schedule = this.schedules.get(scheduleId);
    if (schedule) {
      schedule.status = 'completed';
      schedule.lastMaintenanceDate = new Date();
      this.schedules.set(scheduleId, schedule);
    }

    console.log(`Maintenance recorded: ${scheduleId}`);
    return record;
  }

  async getAssets(companyId: string, status?: string): Promise<Asset[]> {
    let assets = Array.from(this.assets.values()).filter(
      (a) => a.companyId === companyId
    );

    if (status) {
      assets = assets.filter((a) => a.status === status);
    }

    return assets;
  }

  async getMaintenanceSchedules(assetId?: string): Promise<MaintenanceSchedule[]> {
    let schedules = Array.from(this.schedules.values());

    if (assetId) {
      schedules = schedules.filter((s) => s.assetId === assetId);
    }

    return schedules;
  }

  async getAssetMetrics(companyId: string): Promise<AssetMetrics> {
    const assets = Array.from(this.assets.values()).filter(
      (a) => a.companyId === companyId
    );

    const activeAssets = assets.filter((a) => a.status === 'active').length;
    const totalAssetValue = assets.reduce((sum, a) => sum + a.currentValue, 0);
    const totalDepreciation = assets.reduce((sum, a) => sum + a.depreciation, 0);

    const schedules = Array.from(this.schedules.values());
    const maintenanceScheduled = schedules.filter((s) => s.status === 'scheduled').length;
    const maintenanceOverdue = schedules.filter((s) => s.status === 'overdue').length;

    const totalMaintenanceCost = this.records.reduce((sum, r) => sum + r.cost, 0);

    return {
      totalAssets: assets.length,
      activeAssets,
      totalAssetValue,
      totalDepreciation,
      maintenanceScheduled,
      maintenanceOverdue,
      totalMaintenanceCost,
    };
  }
}

export const assetManagementService = new AssetManagementService();

