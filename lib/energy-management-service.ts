export interface EnergyConsumption {
  id: string;
  companyId: string;
  facilityId: string;
  energyType: 'electricity' | 'gas' | 'water' | 'renewable';
  consumption: number;
  unit: 'kWh' | 'm3' | 'liters' | 'BTU';
  cost: number;
  date: Date;
  createdAt: Date;
}

export interface EnergyTarget {
  id: string;
  companyId: string;
  targetType: 'reduction' | 'efficiency' | 'renewable';
  targetValue: number;
  targetUnit: string;
  deadline: Date;
  status: 'active' | 'achieved' | 'missed';
  createdAt: Date;
}

export interface SustainabilityMetric {
  id: string;
  companyId: string;
  metricType: 'carbon-footprint' | 'waste-reduction' | 'water-usage' | 'renewable-energy';
  value: number;
  unit: string;
  date: Date;
  createdAt: Date;
}

export interface EnergyMetrics {
  totalConsumption: number;
  electricityUsage: number;
  gasUsage: number;
  waterUsage: number;
  renewableUsage: number;
  totalCost: number;
  averageCost: number;
  targetsAchieved: number;
  carbonFootprint: number;
}

export class EnergyManagementService {
  private consumptions: Map<string, EnergyConsumption> = new Map();
  private targets: Map<string, EnergyTarget> = new Map();
  private metrics: Map<string, SustainabilityMetric> = new Map();

  async recordEnergyConsumption(
    companyId: string,
    facilityId: string,
    energyType: 'electricity' | 'gas' | 'water' | 'renewable',
    consumption: number,
    unit: 'kWh' | 'm3' | 'liters' | 'BTU',
    cost: number
  ): Promise<EnergyConsumption> {
    const record: EnergyConsumption = {
      id: Math.random().toString(36).substr(2, 9),
      companyId,
      facilityId,
      energyType,
      consumption,
      unit,
      cost,
      date: new Date(),
      createdAt: new Date(),
    };

    this.consumptions.set(record.id, record);
    console.log(`Energy consumption recorded: ${energyType}`);
    return record;
  }

  async setEnergyTarget(
    companyId: string,
    targetType: 'reduction' | 'efficiency' | 'renewable',
    targetValue: number,
    targetUnit: string,
    deadline: Date
  ): Promise<EnergyTarget> {
    const target: EnergyTarget = {
      id: Math.random().toString(36).substr(2, 9),
      companyId,
      targetType,
      targetValue,
      targetUnit,
      deadline,
      status: 'active',
      createdAt: new Date(),
    };

    this.targets.set(target.id, target);
    console.log(`Energy target set: ${targetType}`);
    return target;
  }

  async recordSustainabilityMetric(
    companyId: string,
    metricType: 'carbon-footprint' | 'waste-reduction' | 'water-usage' | 'renewable-energy',
    value: number,
    unit: string
  ): Promise<SustainabilityMetric> {
    const metric: SustainabilityMetric = {
      id: Math.random().toString(36).substr(2, 9),
      companyId,
      metricType,
      value,
      unit,
      date: new Date(),
      createdAt: new Date(),
    };

    this.metrics.set(metric.id, metric);
    console.log(`Sustainability metric recorded: ${metricType}`);
    return metric;
  }

  async getEnergyConsumptions(companyId: string, energyType?: string): Promise<EnergyConsumption[]> {
    let consumptions = Array.from(this.consumptions.values()).filter(
      (c) => c.companyId === companyId
    );

    if (energyType) {
      consumptions = consumptions.filter((c) => c.energyType === energyType);
    }

    return consumptions;
  }

  async getEnergyTargets(companyId: string): Promise<EnergyTarget[]> {
    return Array.from(this.targets.values()).filter((t) => t.companyId === companyId);
  }

  async getSustainabilityMetrics(companyId: string): Promise<SustainabilityMetric[]> {
    return Array.from(this.metrics.values()).filter((m) => m.companyId === companyId);
  }

  async getEnergyMetrics(companyId: string): Promise<EnergyMetrics> {
    const consumptions = Array.from(this.consumptions.values()).filter(
      (c) => c.companyId === companyId
    );

    const totalConsumption = consumptions.reduce((sum, c) => sum + c.consumption, 0);
    const electricityUsage = consumptions
      .filter((c) => c.energyType === 'electricity')
      .reduce((sum, c) => sum + c.consumption, 0);
    const gasUsage = consumptions
      .filter((c) => c.energyType === 'gas')
      .reduce((sum, c) => sum + c.consumption, 0);
    const waterUsage = consumptions
      .filter((c) => c.energyType === 'water')
      .reduce((sum, c) => sum + c.consumption, 0);
    const renewableUsage = consumptions
      .filter((c) => c.energyType === 'renewable')
      .reduce((sum, c) => sum + c.consumption, 0);

    const totalCost = consumptions.reduce((sum, c) => sum + c.cost, 0);
    const averageCost = consumptions.length > 0 ? totalCost / consumptions.length : 0;

    const targets = Array.from(this.targets.values()).filter((t) => t.companyId === companyId);
    const targetsAchieved = targets.filter((t) => t.status === 'achieved').length;

    const carbonFootprint = renewableUsage > 0 ? totalConsumption - renewableUsage : totalConsumption;

    return {
      totalConsumption,
      electricityUsage,
      gasUsage,
      waterUsage,
      renewableUsage,
      totalCost,
      averageCost,
      targetsAchieved,
      carbonFootprint,
    };
  }
}

export const energyManagementService = new EnergyManagementService();

