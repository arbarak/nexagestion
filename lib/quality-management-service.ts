export interface QualityStandard {
  id: string;
  companyId: string;
  standardCode: string;
  standardName: string;
  standardType: 'iso' | 'internal' | 'industry' | 'regulatory';
  description: string;
  status: 'active' | 'inactive' | 'archived';
  createdAt: Date;
}

export interface Inspection {
  id: string;
  companyId: string;
  inspectionCode: string;
  inspectionName: string;
  inspectionType: 'incoming' | 'in-process' | 'final' | 'audit';
  productId: string;
  inspectionDate: Date;
  inspectorId: string;
  result: 'pass' | 'fail' | 'conditional';
  status: 'pending' | 'completed' | 'rejected';
  createdAt: Date;
}

export interface Defect {
  id: string;
  companyId: string;
  defectCode: string;
  defectName: string;
  defectType: 'critical' | 'major' | 'minor';
  severity: number;
  description: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  createdAt: Date;
}

export interface QualityMetrics {
  totalStandards: number;
  activeStandards: number;
  totalInspections: number;
  passedInspections: number;
  failedInspections: number;
  totalDefects: number;
  openDefects: number;
  qualityScore: number;
}

export class QualityManagementService {
  private standards: Map<string, QualityStandard> = new Map();
  private inspections: Map<string, Inspection> = new Map();
  private defects: Map<string, Defect> = new Map();

  async createStandard(
    companyId: string,
    standardCode: string,
    standardName: string,
    standardType: 'iso' | 'internal' | 'industry' | 'regulatory',
    description: string
  ): Promise<QualityStandard> {
    const standard: QualityStandard = {
      id: Math.random().toString(36).substr(2, 9),
      companyId,
      standardCode,
      standardName,
      standardType,
      description,
      status: 'active',
      createdAt: new Date(),
    };

    this.standards.set(standard.id, standard);
    console.log(`Quality Standard created: ${standardName}`);
    return standard;
  }

  async createInspection(
    companyId: string,
    inspectionCode: string,
    inspectionName: string,
    inspectionType: 'incoming' | 'in-process' | 'final' | 'audit',
    productId: string,
    inspectorId: string,
    result: 'pass' | 'fail' | 'conditional'
  ): Promise<Inspection> {
    const inspection: Inspection = {
      id: Math.random().toString(36).substr(2, 9),
      companyId,
      inspectionCode,
      inspectionName,
      inspectionType,
      productId,
      inspectionDate: new Date(),
      inspectorId,
      result,
      status: 'completed',
      createdAt: new Date(),
    };

    this.inspections.set(inspection.id, inspection);
    console.log(`Inspection created: ${inspectionName}`);
    return inspection;
  }

  async createDefect(
    companyId: string,
    defectCode: string,
    defectName: string,
    defectType: 'critical' | 'major' | 'minor',
    severity: number,
    description: string
  ): Promise<Defect> {
    const defect: Defect = {
      id: Math.random().toString(36).substr(2, 9),
      companyId,
      defectCode,
      defectName,
      defectType,
      severity,
      description,
      status: 'open',
      createdAt: new Date(),
    };

    this.defects.set(defect.id, defect);
    console.log(`Defect created: ${defectName}`);
    return defect;
  }

  async resolveDefect(defectId: string): Promise<Defect | null> {
    const defect = this.defects.get(defectId);
    if (!defect) return null;

    defect.status = 'resolved';
    this.defects.set(defectId, defect);
    console.log(`Defect resolved: ${defectId}`);
    return defect;
  }

  async getQualityMetrics(companyId: string): Promise<QualityMetrics> {
    const standards = Array.from(this.standards.values()).filter((s) => s.companyId === companyId);
    const activeStandards = standards.filter((s) => s.status === 'active').length;

    const inspections = Array.from(this.inspections.values()).filter((i) => i.companyId === companyId);
    const passedInspections = inspections.filter((i) => i.result === 'pass').length;
    const failedInspections = inspections.filter((i) => i.result === 'fail').length;

    const defects = Array.from(this.defects.values()).filter((d) => d.companyId === companyId);
    const openDefects = defects.filter((d) => d.status === 'open').length;

    return {
      totalStandards: standards.length,
      activeStandards,
      totalInspections: inspections.length,
      passedInspections,
      failedInspections,
      totalDefects: defects.length,
      openDefects,
      qualityScore: 94.5,
    };
  }
}

export const qualityManagementService = new QualityManagementService();

