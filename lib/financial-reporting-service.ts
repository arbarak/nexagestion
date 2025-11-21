export interface IncomeStatement {
  id: string;
  companyId: string;
  period: string;
  revenue: number;
  costOfGoodsSold: number;
  grossProfit: number;
  operatingExpenses: number;
  operatingIncome: number;
  interestExpense: number;
  taxExpense: number;
  netIncome: number;
  createdAt: Date;
}

export interface BalanceSheet {
  id: string;
  companyId: string;
  period: string;
  assets: { current: number; fixed: number; total: number };
  liabilities: { current: number; longTerm: number; total: number };
  equity: number;
  createdAt: Date;
}

export interface CashFlowStatement {
  id: string;
  companyId: string;
  period: string;
  operatingCashFlow: number;
  investingCashFlow: number;
  financingCashFlow: number;
  netCashFlow: number;
  beginningCash: number;
  endingCash: number;
  createdAt: Date;
}

export interface BudgetAllocation {
  id: string;
  companyId: string;
  department: string;
  category: string;
  allocatedAmount: number;
  spentAmount: number;
  variance: number;
  period: string;
  createdAt: Date;
}

export class FinancialReportingService {
  private incomeStatements: Map<string, IncomeStatement> = new Map();
  private balanceSheets: Map<string, BalanceSheet> = new Map();
  private cashFlowStatements: Map<string, CashFlowStatement> = new Map();
  private budgets: Map<string, BudgetAllocation> = new Map();

  async createIncomeStatement(
    companyId: string,
    period: string,
    revenue: number,
    costOfGoodsSold: number,
    operatingExpenses: number,
    interestExpense: number,
    taxExpense: number
  ): Promise<IncomeStatement> {
    const grossProfit = revenue - costOfGoodsSold;
    const operatingIncome = grossProfit - operatingExpenses;
    const netIncome = operatingIncome - interestExpense - taxExpense;

    const statement: IncomeStatement = {
      id: Math.random().toString(36).substr(2, 9),
      companyId,
      period,
      revenue,
      costOfGoodsSold,
      grossProfit,
      operatingExpenses,
      operatingIncome,
      interestExpense,
      taxExpense,
      netIncome,
      createdAt: new Date(),
    };

    this.incomeStatements.set(statement.id, statement);
    console.log(`Income statement created: ${period}`);
    return statement;
  }

  async createBalanceSheet(
    companyId: string,
    period: string,
    assets: { current: number; fixed: number },
    liabilities: { current: number; longTerm: number },
    equity: number
  ): Promise<BalanceSheet> {
    const sheet: BalanceSheet = {
      id: Math.random().toString(36).substr(2, 9),
      companyId,
      period,
      assets: { ...assets, total: assets.current + assets.fixed },
      liabilities: { ...liabilities, total: liabilities.current + liabilities.longTerm },
      equity,
      createdAt: new Date(),
    };

    this.balanceSheets.set(sheet.id, sheet);
    console.log(`Balance sheet created: ${period}`);
    return sheet;
  }

  async createCashFlowStatement(
    companyId: string,
    period: string,
    operatingCashFlow: number,
    investingCashFlow: number,
    financingCashFlow: number,
    beginningCash: number
  ): Promise<CashFlowStatement> {
    const netCashFlow = operatingCashFlow + investingCashFlow + financingCashFlow;
    const endingCash = beginningCash + netCashFlow;

    const statement: CashFlowStatement = {
      id: Math.random().toString(36).substr(2, 9),
      companyId,
      period,
      operatingCashFlow,
      investingCashFlow,
      financingCashFlow,
      netCashFlow,
      beginningCash,
      endingCash,
      createdAt: new Date(),
    };

    this.cashFlowStatements.set(statement.id, statement);
    console.log(`Cash flow statement created: ${period}`);
    return statement;
  }

  async allocateBudget(
    companyId: string,
    department: string,
    category: string,
    allocatedAmount: number,
    period: string
  ): Promise<BudgetAllocation> {
    const budget: BudgetAllocation = {
      id: Math.random().toString(36).substr(2, 9),
      companyId,
      department,
      category,
      allocatedAmount,
      spentAmount: 0,
      variance: allocatedAmount,
      period,
      createdAt: new Date(),
    };

    this.budgets.set(budget.id, budget);
    console.log(`Budget allocated: ${department} - ${category}`);
    return budget;
  }

  async recordBudgetSpending(budgetId: string, amount: number): Promise<BudgetAllocation | null> {
    const budget = this.budgets.get(budgetId);
    if (!budget) return null;

    budget.spentAmount += amount;
    budget.variance = budget.allocatedAmount - budget.spentAmount;
    this.budgets.set(budgetId, budget);
    console.log(`Budget spending recorded: ${budgetId}`);
    return budget;
  }

  async getIncomeStatements(companyId: string): Promise<IncomeStatement[]> {
    return Array.from(this.incomeStatements.values()).filter(
      (s) => s.companyId === companyId
    );
  }

  async getBalanceSheets(companyId: string): Promise<BalanceSheet[]> {
    return Array.from(this.balanceSheets.values()).filter(
      (s) => s.companyId === companyId
    );
  }

  async getCashFlowStatements(companyId: string): Promise<CashFlowStatement[]> {
    return Array.from(this.cashFlowStatements.values()).filter(
      (s) => s.companyId === companyId
    );
  }

  async getBudgets(companyId: string, period?: string): Promise<BudgetAllocation[]> {
    let budgets = Array.from(this.budgets.values()).filter(
      (b) => b.companyId === companyId
    );

    if (period) {
      budgets = budgets.filter((b) => b.period === period);
    }

    return budgets;
  }
}

export const financialReportingService = new FinancialReportingService();

