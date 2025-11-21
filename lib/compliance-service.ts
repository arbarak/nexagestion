export interface ComplianceFramework {
  id: string;
  companyId: string;
  name: string;
  description: string;
  enabled: boolean;
  requirements: ComplianceRequirement[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ComplianceRequirement {
  id: string;
  frameworkId: string;
  requirement: string;
  description: string;
  status: 'compliant' | 'non-compliant' | 'in-progress';
  evidence: string[];
  dueDate?: Date;
  completedDate?: Date;
}

export interface ComplianceReport {
  id: string;
  companyId: string;
  frameworkId: string;
  generatedAt: Date;
  totalRequirements: number;
  compliantRequirements: number;
  nonCompliantRequirements: number;
  inProgressRequirements: number;
  compliancePercentage: number;
  recommendations: string[];
}

export class ComplianceService {
  private frameworks: Map<string, ComplianceFramework> = new Map();
  private reports: ComplianceReport[] = [];

  async createFramework(
    companyId: string,
    name: string,
    description: string
  ): Promise<ComplianceFramework> {
    const framework: ComplianceFramework = {
      id: Math.random().toString(36).substr(2, 9),
      companyId,
      name,
      description,
      enabled: true,
      requirements: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.frameworks.set(framework.id, framework);
    console.log(`Compliance framework created: ${name}`);
    return framework;
  }

  async addRequirement(
    frameworkId: string,
    requirement: string,
    description: string,
    dueDate?: Date
  ): Promise<ComplianceRequirement> {
    const framework = this.frameworks.get(frameworkId);
    if (!framework) {
      throw new Error('Framework not found');
    }

    const req: ComplianceRequirement = {
      id: Math.random().toString(36).substr(2, 9),
      frameworkId,
      requirement,
      description,
      status: 'in-progress',
      evidence: [],
      dueDate,
    };

    framework.requirements.push(req);
    this.frameworks.set(frameworkId, framework);
    console.log(`Requirement added: ${requirement}`);
    return req;
  }

  async updateRequirementStatus(
    frameworkId: string,
    requirementId: string,
    status: 'compliant' | 'non-compliant' | 'in-progress'
  ): Promise<ComplianceRequirement | null> {
    const framework = this.frameworks.get(frameworkId);
    if (!framework) return null;

    const requirement = framework.requirements.find((r) => r.id === requirementId);
    if (!requirement) return null;

    requirement.status = status;
    if (status === 'compliant') {
      requirement.completedDate = new Date();
    }

    this.frameworks.set(frameworkId, framework);
    console.log(`Requirement status updated: ${status}`);
    return requirement;
  }

  async addEvidence(
    frameworkId: string,
    requirementId: string,
    evidence: string
  ): Promise<ComplianceRequirement | null> {
    const framework = this.frameworks.get(frameworkId);
    if (!framework) return null;

    const requirement = framework.requirements.find((r) => r.id === requirementId);
    if (!requirement) return null;

    requirement.evidence.push(evidence);
    this.frameworks.set(frameworkId, framework);
    console.log(`Evidence added to requirement: ${requirementId}`);
    return requirement;
  }

  async getFrameworks(companyId: string): Promise<ComplianceFramework[]> {
    return Array.from(this.frameworks.values()).filter(
      (f) => f.companyId === companyId
    );
  }

  async generateReport(
    companyId: string,
    frameworkId: string
  ): Promise<ComplianceReport> {
    const framework = this.frameworks.get(frameworkId);
    if (!framework) {
      throw new Error('Framework not found');
    }

    const totalRequirements = framework.requirements.length;
    const compliantRequirements = framework.requirements.filter(
      (r) => r.status === 'compliant'
    ).length;
    const nonCompliantRequirements = framework.requirements.filter(
      (r) => r.status === 'non-compliant'
    ).length;
    const inProgressRequirements = framework.requirements.filter(
      (r) => r.status === 'in-progress'
    ).length;

    const compliancePercentage =
      totalRequirements > 0
        ? Math.round((compliantRequirements / totalRequirements) * 100)
        : 0;

    const recommendations: string[] = [];
    if (nonCompliantRequirements > 0) {
      recommendations.push(
        `Address ${nonCompliantRequirements} non-compliant requirements`
      );
    }
    if (inProgressRequirements > 0) {
      recommendations.push(
        `Complete ${inProgressRequirements} in-progress requirements`
      );
    }

    const report: ComplianceReport = {
      id: Math.random().toString(36).substr(2, 9),
      companyId,
      frameworkId,
      generatedAt: new Date(),
      totalRequirements,
      compliantRequirements,
      nonCompliantRequirements,
      inProgressRequirements,
      compliancePercentage,
      recommendations,
    };

    this.reports.push(report);
    console.log(`Compliance report generated: ${framework.name}`);
    return report;
  }

  async getReports(companyId: string, limit: number = 50): Promise<ComplianceReport[]> {
    return this.reports
      .filter((r) => r.companyId === companyId)
      .slice(-limit);
  }

  async getComplianceStatus(companyId: string): Promise<{
    frameworks: number;
    totalRequirements: number;
    compliantRequirements: number;
    averageCompliance: number;
  }> {
    const frameworks = Array.from(this.frameworks.values()).filter(
      (f) => f.companyId === companyId
    );

    let totalRequirements = 0;
    let compliantRequirements = 0;

    frameworks.forEach((f) => {
      totalRequirements += f.requirements.length;
      compliantRequirements += f.requirements.filter(
        (r) => r.status === 'compliant'
      ).length;
    });

    const averageCompliance =
      totalRequirements > 0
        ? Math.round((compliantRequirements / totalRequirements) * 100)
        : 0;

    return {
      frameworks: frameworks.length,
      totalRequirements,
      compliantRequirements,
      averageCompliance,
    };
  }
}

export const complianceService = new ComplianceService();

