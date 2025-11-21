export interface Payroll {
  id: string;
  companyId: string;
  employeeId: string;
  month: string;
  baseSalary: number;
  bonuses: number;
  deductions: number;
  netSalary: number;
  status: 'draft' | 'processed' | 'paid';
  processedDate?: Date;
  paidDate?: Date;
  createdAt: Date;
}

export interface Deduction {
  id: string;
  payrollId: string;
  type: 'tax' | 'insurance' | 'loan' | 'other';
  amount: number;
  description: string;
}

export interface Bonus {
  id: string;
  employeeId: string;
  month: string;
  amount: number;
  reason: string;
  approvedBy: string;
  createdAt: Date;
}

export interface PayrollReport {
  id: string;
  companyId: string;
  month: string;
  totalPayroll: number;
  totalBonuses: number;
  totalDeductions: number;
  employeeCount: number;
  averageSalary: number;
  createdAt: Date;
}

export class PayrollService {
  private payrolls: Map<string, Payroll> = new Map();
  private deductions: Deduction[] = [];
  private bonuses: Bonus[] = [];
  private reports: PayrollReport[] = [];

  async createPayroll(
    companyId: string,
    employeeId: string,
    month: string,
    baseSalary: number
  ): Promise<Payroll> {
    const payroll: Payroll = {
      id: Math.random().toString(36).substr(2, 9),
      companyId,
      employeeId,
      month,
      baseSalary,
      bonuses: 0,
      deductions: 0,
      netSalary: baseSalary,
      status: 'draft',
      createdAt: new Date(),
    };

    this.payrolls.set(payroll.id, payroll);
    console.log(`Payroll created: ${employeeId} for ${month}`);
    return payroll;
  }

  async addDeduction(
    payrollId: string,
    type: 'tax' | 'insurance' | 'loan' | 'other',
    amount: number,
    description: string
  ): Promise<Deduction> {
    const deduction: Deduction = {
      id: Math.random().toString(36).substr(2, 9),
      payrollId,
      type,
      amount,
      description,
    };

    this.deductions.push(deduction);

    const payroll = this.payrolls.get(payrollId);
    if (payroll) {
      payroll.deductions += amount;
      payroll.netSalary = payroll.baseSalary + payroll.bonuses - payroll.deductions;
      this.payrolls.set(payrollId, payroll);
    }

    console.log(`Deduction added: ${amount}`);
    return deduction;
  }

  async addBonus(
    employeeId: string,
    month: string,
    amount: number,
    reason: string,
    approvedBy: string
  ): Promise<Bonus> {
    const bonus: Bonus = {
      id: Math.random().toString(36).substr(2, 9),
      employeeId,
      month,
      amount,
      reason,
      approvedBy,
      createdAt: new Date(),
    };

    this.bonuses.push(bonus);
    console.log(`Bonus added: ${amount}`);
    return bonus;
  }

  async processPayroll(payrollId: string): Promise<Payroll | null> {
    const payroll = this.payrolls.get(payrollId);
    if (!payroll) return null;

    payroll.status = 'processed';
    payroll.processedDate = new Date();
    this.payrolls.set(payrollId, payroll);
    console.log(`Payroll processed: ${payrollId}`);
    return payroll;
  }

  async markAsPaid(payrollId: string): Promise<Payroll | null> {
    const payroll = this.payrolls.get(payrollId);
    if (!payroll) return null;

    payroll.status = 'paid';
    payroll.paidDate = new Date();
    this.payrolls.set(payrollId, payroll);
    console.log(`Payroll marked as paid: ${payrollId}`);
    return payroll;
  }

  async getPayrolls(companyId: string, month?: string): Promise<Payroll[]> {
    let payrolls = Array.from(this.payrolls.values()).filter(
      (p) => p.companyId === companyId
    );

    if (month) {
      payrolls = payrolls.filter((p) => p.month === month);
    }

    return payrolls;
  }

  async generatePayrollReport(
    companyId: string,
    month: string,
    payrolls: Payroll[]
  ): Promise<PayrollReport> {
    const totalPayroll = payrolls.reduce((sum, p) => sum + p.netSalary, 0);
    const totalBonuses = payrolls.reduce((sum, p) => sum + p.bonuses, 0);
    const totalDeductions = payrolls.reduce((sum, p) => sum + p.deductions, 0);
    const averageSalary = payrolls.length > 0 ? totalPayroll / payrolls.length : 0;

    const report: PayrollReport = {
      id: Math.random().toString(36).substr(2, 9),
      companyId,
      month,
      totalPayroll,
      totalBonuses,
      totalDeductions,
      employeeCount: payrolls.length,
      averageSalary,
      createdAt: new Date(),
    };

    this.reports.push(report);
    console.log(`Payroll report generated: ${month}`);
    return report;
  }

  async getPayrollReports(companyId: string, limit: number = 12): Promise<PayrollReport[]> {
    return this.reports
      .filter((r) => r.companyId === companyId)
      .slice(-limit);
  }
}

export const payrollService = new PayrollService();

