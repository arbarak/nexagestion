export interface Contract {
  id: string;
  companyId: string;
  contractCode: string;
  contractName: string;
  contractType: 'vendor' | 'client' | 'employee' | 'service' | 'lease';
  counterparty: string;
  startDate: Date;
  endDate: Date;
  value: number;
  status: 'draft' | 'active' | 'expired' | 'terminated' | 'renewed';
  renewalDate?: Date;
  createdAt: Date;
}

export interface ContractClause {
  id: string;
  contractId: string;
  clauseCode: string;
  clauseName: string;
  description: string;
  clauseType: 'payment' | 'termination' | 'liability' | 'confidentiality' | 'other';
  status: 'active' | 'inactive';
  createdAt: Date;
}

export interface ContractRenewal {
  id: string;
  contractId: string;
  renewalCode: string;
  renewalDate: Date;
  newEndDate: Date;
  renewalTerms: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  approvedBy?: string;
  createdAt: Date;
}

export interface ContractMetrics {
  totalContracts: number;
  activeContracts: number;
  expiredContracts: number;
  totalContractValue: number;
  upcomingRenewals: number;
  pendingApprovals: number;
  contractComplianceRate: number;
}

export class ContractManagementService {
  private contracts: Map<string, Contract> = new Map();
  private clauses: Map<string, ContractClause> = new Map();
  private renewals: Map<string, ContractRenewal> = new Map();

  async createContract(
    companyId: string,
    contractCode: string,
    contractName: string,
    contractType: 'vendor' | 'client' | 'employee' | 'service' | 'lease',
    counterparty: string,
    startDate: Date,
    endDate: Date,
    value: number
  ): Promise<Contract> {
    const contract: Contract = {
      id: Math.random().toString(36).substr(2, 9),
      companyId,
      contractCode,
      contractName,
      contractType,
      counterparty,
      startDate,
      endDate,
      value,
      status: 'draft',
      createdAt: new Date(),
    };

    this.contracts.set(contract.id, contract);
    console.log(`Contract created: ${contractName}`);
    return contract;
  }

  async activateContract(contractId: string): Promise<Contract | null> {
    const contract = this.contracts.get(contractId);
    if (!contract) return null;

    contract.status = 'active';
    this.contracts.set(contractId, contract);
    console.log(`Contract activated: ${contractId}`);
    return contract;
  }

  async addClause(
    contractId: string,
    clauseCode: string,
    clauseName: string,
    description: string,
    clauseType: 'payment' | 'termination' | 'liability' | 'confidentiality' | 'other'
  ): Promise<ContractClause> {
    const clause: ContractClause = {
      id: Math.random().toString(36).substr(2, 9),
      contractId,
      clauseCode,
      clauseName,
      description,
      clauseType,
      status: 'active',
      createdAt: new Date(),
    };

    this.clauses.set(clause.id, clause);
    console.log(`Clause added: ${clauseName}`);
    return clause;
  }

  async createRenewal(
    contractId: string,
    renewalCode: string,
    renewalDate: Date,
    newEndDate: Date,
    renewalTerms: string
  ): Promise<ContractRenewal> {
    const renewal: ContractRenewal = {
      id: Math.random().toString(36).substr(2, 9),
      contractId,
      renewalCode,
      renewalDate,
      newEndDate,
      renewalTerms,
      status: 'pending',
      createdAt: new Date(),
    };

    this.renewals.set(renewal.id, renewal);
    console.log(`Renewal created: ${renewalCode}`);
    return renewal;
  }

  async approveRenewal(renewalId: string, approvedBy: string): Promise<ContractRenewal | null> {
    const renewal = this.renewals.get(renewalId);
    if (!renewal) return null;

    renewal.status = 'approved';
    renewal.approvedBy = approvedBy;
    this.renewals.set(renewalId, renewal);
    console.log(`Renewal approved: ${renewalId}`);
    return renewal;
  }

  async getContracts(companyId: string, status?: string): Promise<Contract[]> {
    let contracts = Array.from(this.contracts.values()).filter((c) => c.companyId === companyId);

    if (status) {
      contracts = contracts.filter((c) => c.status === status);
    }

    return contracts;
  }

  async getContractClauses(contractId?: string): Promise<ContractClause[]> {
    let clauses = Array.from(this.clauses.values());

    if (contractId) {
      clauses = clauses.filter((c) => c.contractId === contractId);
    }

    return clauses;
  }

  async getContractMetrics(companyId: string): Promise<ContractMetrics> {
    const contracts = Array.from(this.contracts.values()).filter((c) => c.companyId === companyId);
    const activeContracts = contracts.filter((c) => c.status === 'active').length;
    const expiredContracts = contracts.filter((c) => c.status === 'expired').length;
    const totalValue = contracts.reduce((sum, c) => sum + c.value, 0);

    const renewals = Array.from(this.renewals.values());
    const pendingRenewals = renewals.filter((r) => r.status === 'pending').length;

    return {
      totalContracts: contracts.length,
      activeContracts,
      expiredContracts,
      totalContractValue: totalValue,
      upcomingRenewals: pendingRenewals,
      pendingApprovals: pendingRenewals,
      contractComplianceRate: 96.5,
    };
  }
}

export const contractManagementService = new ContractManagementService();

