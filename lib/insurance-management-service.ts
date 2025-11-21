export interface InsurancePolicy {
  id: string;
  companyId: string;
  policyCode: string;
  policyName: string;
  insuranceType: 'liability' | 'property' | 'health' | 'cyber' | 'directors-officers';
  provider: string;
  coverageAmount: number;
  premium: number;
  startDate: Date;
  endDate: Date;
  status: 'active' | 'expired' | 'cancelled' | 'renewed';
  createdAt: Date;
}

export interface InsuranceClaim {
  id: string;
  policyId: string;
  claimCode: string;
  claimName: string;
  claimDate: Date;
  claimAmount: number;
  description: string;
  status: 'filed' | 'under-review' | 'approved' | 'rejected' | 'paid';
  approvedAmount?: number;
  createdAt: Date;
}

export interface InsuranceMetrics {
  totalPolicies: number;
  activePolicies: number;
  totalCoverage: number;
  totalPremiums: number;
  totalClaims: number;
  approvedClaims: number;
  claimApprovalRate: number;
  insuranceCostRatio: number;
}

export class InsuranceManagementService {
  private policies: Map<string, InsurancePolicy> = new Map();
  private claims: Map<string, InsuranceClaim> = new Map();

  async createPolicy(
    companyId: string,
    policyCode: string,
    policyName: string,
    insuranceType: 'liability' | 'property' | 'health' | 'cyber' | 'directors-officers',
    provider: string,
    coverageAmount: number,
    premium: number,
    startDate: Date,
    endDate: Date
  ): Promise<InsurancePolicy> {
    const policy: InsurancePolicy = {
      id: Math.random().toString(36).substr(2, 9),
      companyId,
      policyCode,
      policyName,
      insuranceType,
      provider,
      coverageAmount,
      premium,
      startDate,
      endDate,
      status: 'active',
      createdAt: new Date(),
    };

    this.policies.set(policy.id, policy);
    console.log(`Insurance policy created: ${policyName}`);
    return policy;
  }

  async fileClaim(
    policyId: string,
    claimCode: string,
    claimName: string,
    claimDate: Date,
    claimAmount: number,
    description: string
  ): Promise<InsuranceClaim> {
    const claim: InsuranceClaim = {
      id: Math.random().toString(36).substr(2, 9),
      policyId,
      claimCode,
      claimName,
      claimDate,
      claimAmount,
      description,
      status: 'filed',
      createdAt: new Date(),
    };

    this.claims.set(claim.id, claim);
    console.log(`Insurance claim filed: ${claimName}`);
    return claim;
  }

  async approveClaim(claimId: string, approvedAmount: number): Promise<InsuranceClaim | null> {
    const claim = this.claims.get(claimId);
    if (!claim) return null;

    claim.status = 'approved';
    claim.approvedAmount = approvedAmount;
    this.claims.set(claimId, claim);
    console.log(`Claim approved: ${claimId}`);
    return claim;
  }

  async rejectClaim(claimId: string): Promise<InsuranceClaim | null> {
    const claim = this.claims.get(claimId);
    if (!claim) return null;

    claim.status = 'rejected';
    this.claims.set(claimId, claim);
    console.log(`Claim rejected: ${claimId}`);
    return claim;
  }

  async getPolicies(companyId: string, status?: string): Promise<InsurancePolicy[]> {
    let policies = Array.from(this.policies.values()).filter((p) => p.companyId === companyId);

    if (status) {
      policies = policies.filter((p) => p.status === status);
    }

    return policies;
  }

  async getClaims(policyId?: string): Promise<InsuranceClaim[]> {
    let claims = Array.from(this.claims.values());

    if (policyId) {
      claims = claims.filter((c) => c.policyId === policyId);
    }

    return claims;
  }

  async getInsuranceMetrics(companyId: string): Promise<InsuranceMetrics> {
    const policies = Array.from(this.policies.values()).filter((p) => p.companyId === companyId);
    const activePolicies = policies.filter((p) => p.status === 'active').length;
    const totalCoverage = policies.reduce((sum, p) => sum + p.coverageAmount, 0);
    const totalPremiums = policies.reduce((sum, p) => sum + p.premium, 0);

    const claims = Array.from(this.claims.values());
    const approvedClaims = claims.filter((c) => c.status === 'approved').length;
    const approvalRate = claims.length > 0 ? (approvedClaims / claims.length) * 100 : 0;

    return {
      totalPolicies: policies.length,
      activePolicies,
      totalCoverage,
      totalPremiums,
      totalClaims: claims.length,
      approvedClaims,
      claimApprovalRate: approvalRate,
      insuranceCostRatio: 2.5,
    };
  }
}

export const insuranceManagementService = new InsuranceManagementService();

