export interface AssetLocation {
  id: string;
  assetId: string;
  location: string;
  department: string;
  assignedTo: string;
  assignedDate: Date;
  status: 'in-use' | 'in-storage' | 'in-transit' | 'lost';
}

export interface DepreciationSchedule {
  id: string;
  assetId: string;
  depreciationMethod: 'straight-line' | 'declining-balance' | 'units-of-production';
  usefulLife: number;
  salvageValue: number;
  annualDepreciation: number;
  accumulatedDepreciation: number;
  bookValue: number;
  createdAt: Date;
}

export interface AssetDisposal {
  id: string;
  assetId: string;
  disposalDate: Date;
  disposalMethod: 'sale' | 'donation' | 'scrap' | 'trade-in';
  disposalPrice: number;
  bookValue: number;
  gainLoss: number;
  createdAt: Date;
}

export interface AssetTrackingMetrics {
  totalLocations: number;
  assetsInUse: number;
  assetsInStorage: number;
  assetsInTransit: number;
  assetsLost: number;
  totalDepreciation: number;
  totalDisposals: number;
  totalDisposalValue: number;
}

export class AssetTrackingService {
  private locations: Map<string, AssetLocation> = new Map();
  private depreciationSchedules: Map<string, DepreciationSchedule> = new Map();
  private disposals: Map<string, AssetDisposal> = new Map();

  async trackAssetLocation(
    assetId: string,
    location: string,
    department: string,
    assignedTo: string
  ): Promise<AssetLocation> {
    const tracking: AssetLocation = {
      id: Math.random().toString(36).substr(2, 9),
      assetId,
      location,
      department,
      assignedTo,
      assignedDate: new Date(),
      status: 'in-use',
    };

    this.locations.set(tracking.id, tracking);
    console.log(`Asset location tracked: ${assetId}`);
    return tracking;
  }

  async updateAssetLocation(
    assetId: string,
    location: string,
    status: 'in-use' | 'in-storage' | 'in-transit' | 'lost'
  ): Promise<AssetLocation | null> {
    const tracking = Array.from(this.locations.values()).find((l) => l.assetId === assetId);
    if (!tracking) return null;

    tracking.location = location;
    tracking.status = status;
    this.locations.set(tracking.id, tracking);
    console.log(`Asset location updated: ${assetId}`);
    return tracking;
  }

  async createDepreciationSchedule(
    assetId: string,
    depreciationMethod: 'straight-line' | 'declining-balance' | 'units-of-production',
    usefulLife: number,
    salvageValue: number,
    assetCost: number
  ): Promise<DepreciationSchedule> {
    const annualDepreciation = (assetCost - salvageValue) / usefulLife;

    const schedule: DepreciationSchedule = {
      id: Math.random().toString(36).substr(2, 9),
      assetId,
      depreciationMethod,
      usefulLife,
      salvageValue,
      annualDepreciation,
      accumulatedDepreciation: 0,
      bookValue: assetCost,
      createdAt: new Date(),
    };

    this.depreciationSchedules.set(schedule.id, schedule);
    console.log(`Depreciation schedule created: ${assetId}`);
    return schedule;
  }

  async recordDepreciation(scheduleId: string): Promise<DepreciationSchedule | null> {
    const schedule = this.depreciationSchedules.get(scheduleId);
    if (!schedule) return null;

    schedule.accumulatedDepreciation += schedule.annualDepreciation;
    schedule.bookValue -= schedule.annualDepreciation;
    this.depreciationSchedules.set(scheduleId, schedule);
    console.log(`Depreciation recorded: ${scheduleId}`);
    return schedule;
  }

  async disposeAsset(
    assetId: string,
    disposalMethod: 'sale' | 'donation' | 'scrap' | 'trade-in',
    disposalPrice: number,
    bookValue: number
  ): Promise<AssetDisposal> {
    const disposal: AssetDisposal = {
      id: Math.random().toString(36).substr(2, 9),
      assetId,
      disposalDate: new Date(),
      disposalMethod,
      disposalPrice,
      bookValue,
      gainLoss: disposalPrice - bookValue,
      createdAt: new Date(),
    };

    this.disposals.set(disposal.id, disposal);
    console.log(`Asset disposed: ${assetId}`);
    return disposal;
  }

  async getAssetLocations(assetId?: string): Promise<AssetLocation[]> {
    let locations = Array.from(this.locations.values());

    if (assetId) {
      locations = locations.filter((l) => l.assetId === assetId);
    }

    return locations;
  }

  async getDepreciationSchedules(assetId?: string): Promise<DepreciationSchedule[]> {
    let schedules = Array.from(this.depreciationSchedules.values());

    if (assetId) {
      schedules = schedules.filter((s) => s.assetId === assetId);
    }

    return schedules;
  }

  async getAssetTrackingMetrics(): Promise<AssetTrackingMetrics> {
    const locations = Array.from(this.locations.values());
    const assetsInUse = locations.filter((l) => l.status === 'in-use').length;
    const assetsInStorage = locations.filter((l) => l.status === 'in-storage').length;
    const assetsInTransit = locations.filter((l) => l.status === 'in-transit').length;
    const assetsLost = locations.filter((l) => l.status === 'lost').length;

    const schedules = Array.from(this.depreciationSchedules.values());
    const totalDepreciation = schedules.reduce((sum, s) => sum + s.accumulatedDepreciation, 0);

    const disposals = Array.from(this.disposals.values());
    const totalDisposalValue = disposals.reduce((sum, d) => sum + d.disposalPrice, 0);

    return {
      totalLocations: locations.length,
      assetsInUse,
      assetsInStorage,
      assetsInTransit,
      assetsLost,
      totalDepreciation,
      totalDisposals: disposals.length,
      totalDisposalValue,
    };
  }
}

export const assetTrackingService = new AssetTrackingService();

