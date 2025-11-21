export interface Risk {
  id: string;
  companyId: string;
  riskCode: string;
  riskName: string;
  riskType: 'operational' | 'financial' | 'strategic' | 'compliance' | 'reputational';
  probability: 'low' | 'medium' | 'high' | 'critical';
  impact: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  mitigation: string;
  status: 'identified' | 'assessed' | 'mitigated' | 'monitored' | 'closed';
  createdAt: Date;
}

export interface RiskAssessment {
  id: string;
  riskId: string;
  assessmentCode: string;
  assessmentDate: Date;
  riskScore: number;
  residualRisk: number;
  assessor: string;
  findings: string;
  status: 'pending' | 'completed' | 'approved';
  createdAt: Date;
}

export interface RiskMitigation {
  id: string;
  riskId: string;
  mitigationCode: string;
  mitigationName: string;
  description: string;
  owner: string;
  dueDate: Date;
  status: 'planned' | 'in-progress' | 'completed' | 'on-hold';
  createdAt: Date;
}

export interface RiskMetrics {
  totalRisks: number;
  highRisks: number;
  criticalRisks: number;
  mitigatedRisks: number;
  averageRiskScore: number;
  riskTrend: string;
  complianceRiskRate: number;
}

export class RiskManagementService {
  private risks: Map<string, Risk> = new Map();
  private assessments: Map<string, RiskAssessment> = new Map();
  private mitigations: Map<string, RiskMitigation> = new Map();

  async createRisk(
    companyId: string,
    riskCode: string,
    riskName: string,
    riskType: 'operational' | 'financial' | 'strategic' | 'compliance' | 'reputational',
    probability: 'low' | 'medium' | 'high' | 'critical',
    impact: 'low' | 'medium' | 'high' | 'critical',
    description: string,
    mitigation: string
  ): Promise<Risk> {
    const risk: Risk = {
      id: Math.random().toString(36).substr(2, 9),
      companyId,
      riskCode,
      riskName,
      riskType,
      probability,
      impact,
      description,
      mitigation,
      status: 'identified',
      createdAt: new Date(),
    };

    this.risks.set(risk.id, risk);
    console.log(`Risk created: ${riskName}`);
    return risk;
  }

  async assessRisk(
    riskId: string,
    assessmentCode: string,
    assessmentDate: Date,
    riskScore: number,
    residualRisk: number,
    assessor: string,
    findings: string
  ): Promise<RiskAssessment> {
    const assessment: RiskAssessment = {
      id: Math.random().toString(36).substr(2, 9),
      riskId,
      assessmentCode,
      assessmentDate,
      riskScore,
      residualRisk,
      assessor,
      findings,
      status: 'completed',
      createdAt: new Date(),
    };

    this.assessments.set(assessment.id, assessment);
    console.log(`Risk assessed: ${riskId}`);
    return assessment;
  }

  async createMitigation(
    riskId: string,
    mitigationCode: string,
    mitigationName: string,
    description: string,
    owner: string,
    dueDate: Date
  ): Promise<RiskMitigation> {
    const mitigation: RiskMitigation = {
      id: Math.random().toString(36).substr(2, 9),
      riskId,
      mitigationCode,
      mitigationName,
      description,
      owner,
      dueDate,
      status: 'planned',
      createdAt: new Date(),
    };

    this.mitigations.set(mitigation.id, mitigation);
    console.log(`Mitigation created: ${mitigationName}`);
    return mitigation;
  }

  async completeMitigation(mitigationId: string): Promise<RiskMitigation | null> {
    const mitigation = this.mitigations.get(mitigationId);
    if (!mitigation) return null;

    mitigation.status = 'completed';
    this.mitigations.set(mitigationId, mitigation);
    console.log(`Mitigation completed: ${mitigationId}`);
    return mitigation;
  }

  async getRisks(companyId: string, riskType?: string): Promise<Risk[]> {
    let risks = Array.from(this.risks.values()).filter((r) => r.companyId === companyId);

    if (riskType) {
      risks = risks.filter((r) => r.riskType === riskType);
    }

    return risks;
  }

  async getRiskMetrics(companyId: string): Promise<RiskMetrics> {
    const risks = Array.from(this.risks.values()).filter((r) => r.companyId === companyId);
    const highRisks = risks.filter((r) => r.probability === 'high' || r.impact === 'high').length;
    const criticalRisks = risks.filter((r) => r.probability === 'critical' || r.impact === 'critical').length;
    const mitigatedRisks = risks.filter((r) => r.status === 'mitigated').length;

    const assessments = Array.from(this.assessments.values());
    const avgScore = assessments.length > 0
      ? assessments.reduce((sum, a) => sum + a.riskScore, 0) / assessments.length
      : 0;

    return {
      totalRisks: risks.length,
      highRisks,
      criticalRisks,
      mitigatedRisks,
      averageRiskScore: avgScore,
      riskTrend: 'Stable',
      complianceRiskRate: 12.5,
    };
  }
}

export const riskManagementService = new RiskManagementService();

