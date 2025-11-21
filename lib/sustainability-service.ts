export interface WasteManagement {
  id: string;
  companyId: string;
  wasteType: 'organic' | 'recyclable' | 'hazardous' | 'general';
  quantity: number;
  unit: 'kg' | 'tons' | 'liters';
  disposalMethod: 'landfill' | 'recycling' | 'incineration' | 'composting';
  date: Date;
  createdAt: Date;
}

export interface GreenInitiative {
  id: string;
  companyId: string;
  initiativeName: string;
  description: string;
  category: 'energy' | 'waste' | 'water' | 'emissions' | 'other';
  status: 'planned' | 'in-progress' | 'completed';
  expectedSavings: number;
  actualSavings: number;
  startDate: Date;
  endDate?: Date;
  createdAt: Date;
}

export interface CarbonOffset {
  id: string;
  companyId: string;
  offsetType: 'tree-planting' | 'renewable-energy' | 'carbon-credits' | 'other';
  quantity: number;
  unit: string;
  cost: number;
  date: Date;
  createdAt: Date;
}

export interface SustainabilityMetrics {
  totalWaste: number;
  recycledWaste: number;
  wasteReductionRate: number;
  greenInitiativesCompleted: number;
  totalCarbonOffset: number;
  estimatedCarbonReduction: number;
  sustainabilityScore: number;
}

export class SustainabilityService {
  private wasteRecords: Map<string, WasteManagement> = new Map();
  private initiatives: Map<string, GreenInitiative> = new Map();
  private offsets: Map<string, CarbonOffset> = new Map();

  async recordWaste(
    companyId: string,
    wasteType: 'organic' | 'recyclable' | 'hazardous' | 'general',
    quantity: number,
    unit: 'kg' | 'tons' | 'liters',
    disposalMethod: 'landfill' | 'recycling' | 'incineration' | 'composting'
  ): Promise<WasteManagement> {
    const record: WasteManagement = {
      id: Math.random().toString(36).substr(2, 9),
      companyId,
      wasteType,
      quantity,
      unit,
      disposalMethod,
      date: new Date(),
      createdAt: new Date(),
    };

    this.wasteRecords.set(record.id, record);
    console.log(`Waste recorded: ${wasteType}`);
    return record;
  }

  async createGreenInitiative(
    companyId: string,
    initiativeName: string,
    description: string,
    category: 'energy' | 'waste' | 'water' | 'emissions' | 'other',
    expectedSavings: number
  ): Promise<GreenInitiative> {
    const initiative: GreenInitiative = {
      id: Math.random().toString(36).substr(2, 9),
      companyId,
      initiativeName,
      description,
      category,
      status: 'planned',
      expectedSavings,
      actualSavings: 0,
      startDate: new Date(),
      createdAt: new Date(),
    };

    this.initiatives.set(initiative.id, initiative);
    console.log(`Green initiative created: ${initiativeName}`);
    return initiative;
  }

  async recordCarbonOffset(
    companyId: string,
    offsetType: 'tree-planting' | 'renewable-energy' | 'carbon-credits' | 'other',
    quantity: number,
    unit: string,
    cost: number
  ): Promise<CarbonOffset> {
    const offset: CarbonOffset = {
      id: Math.random().toString(36).substr(2, 9),
      companyId,
      offsetType,
      quantity,
      unit,
      cost,
      date: new Date(),
      createdAt: new Date(),
    };

    this.offsets.set(offset.id, offset);
    console.log(`Carbon offset recorded: ${offsetType}`);
    return offset;
  }

  async getWasteRecords(companyId: string, wasteType?: string): Promise<WasteManagement[]> {
    let records = Array.from(this.wasteRecords.values()).filter((r) => r.companyId === companyId);

    if (wasteType) {
      records = records.filter((r) => r.wasteType === wasteType);
    }

    return records;
  }

  async getGreenInitiatives(companyId: string): Promise<GreenInitiative[]> {
    return Array.from(this.initiatives.values()).filter((i) => i.companyId === companyId);
  }

  async getCarbonOffsets(companyId: string): Promise<CarbonOffset[]> {
    return Array.from(this.offsets.values()).filter((o) => o.companyId === companyId);
  }

  async getSustainabilityMetrics(companyId: string): Promise<SustainabilityMetrics> {
    const wasteRecords = Array.from(this.wasteRecords.values()).filter(
      (r) => r.companyId === companyId
    );

    const totalWaste = wasteRecords.reduce((sum, r) => sum + r.quantity, 0);
    const recycledWaste = wasteRecords
      .filter((r) => r.disposalMethod === 'recycling')
      .reduce((sum, r) => sum + r.quantity, 0);
    const wasteReductionRate = totalWaste > 0 ? (recycledWaste / totalWaste) * 100 : 0;

    const initiatives = Array.from(this.initiatives.values()).filter((i) => i.companyId === companyId);
    const greenInitiativesCompleted = initiatives.filter((i) => i.status === 'completed').length;

    const offsets = Array.from(this.offsets.values()).filter((o) => o.companyId === companyId);
    const totalCarbonOffset = offsets.reduce((sum, o) => sum + o.quantity, 0);

    const estimatedCarbonReduction = totalCarbonOffset * 0.5;
    const sustainabilityScore = Math.min(100, wasteReductionRate + greenInitiativesCompleted * 10);

    return {
      totalWaste,
      recycledWaste,
      wasteReductionRate,
      greenInitiativesCompleted,
      totalCarbonOffset,
      estimatedCarbonReduction,
      sustainabilityScore,
    };
  }
}

export const sustainabilityService = new SustainabilityService();

