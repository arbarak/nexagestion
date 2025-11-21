import { NextRequest, NextResponse } from 'next/server';
import { financialReportingService } from '@/lib/financial-reporting-service';
import { verifyAuth } from '@/lib/auth';
import { z } from 'zod';

const incomeStatementSchema = z.object({
  period: z.string(),
  revenue: z.number(),
  costOfGoodsSold: z.number(),
  operatingExpenses: z.number(),
  interestExpense: z.number(),
  taxExpense: z.number(),
});

const balanceSheetSchema = z.object({
  period: z.string(),
  assets: z.object({ current: z.number(), fixed: z.number() }),
  liabilities: z.object({ current: z.number(), longTerm: z.number() }),
  equity: z.number(),
});

const cashFlowSchema = z.object({
  period: z.string(),
  operatingCashFlow: z.number(),
  investingCashFlow: z.number(),
  financingCashFlow: z.number(),
  beginningCash: z.number(),
});

const budgetSchema = z.object({
  department: z.string(),
  category: z.string(),
  allocatedAmount: z.number(),
  period: z.string(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'income-statements') {
      const statements = await financialReportingService.getIncomeStatements(session.companyId);
      return NextResponse.json(statements);
    } else if (action === 'balance-sheets') {
      const sheets = await financialReportingService.getBalanceSheets(session.companyId);
      return NextResponse.json(sheets);
    } else if (action === 'cash-flow-statements') {
      const statements = await financialReportingService.getCashFlowStatements(session.companyId);
      return NextResponse.json(statements);
    } else if (action === 'budgets') {
      const period = searchParams.get('period');
      const budgets = await financialReportingService.getBudgets(session.companyId, period || undefined);
      return NextResponse.json(budgets);
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error fetching financial reports:', error);
    return NextResponse.json(
      { error: 'Failed to fetch financial reports' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'create-income-statement') {
      const body = await request.json();
      const { period, revenue, costOfGoodsSold, operatingExpenses, interestExpense, taxExpense } =
        incomeStatementSchema.parse(body);

      const statement = await financialReportingService.createIncomeStatement(
        session.companyId,
        period,
        revenue,
        costOfGoodsSold,
        operatingExpenses,
        interestExpense,
        taxExpense
      );

      return NextResponse.json(statement, { status: 201 });
    } else if (action === 'create-balance-sheet') {
      const body = await request.json();
      const { period, assets, liabilities, equity } = balanceSheetSchema.parse(body);

      const sheet = await financialReportingService.createBalanceSheet(
        session.companyId,
        period,
        assets,
        liabilities,
        equity
      );

      return NextResponse.json(sheet, { status: 201 });
    } else if (action === 'create-cash-flow') {
      const body = await request.json();
      const { period, operatingCashFlow, investingCashFlow, financingCashFlow, beginningCash } =
        cashFlowSchema.parse(body);

      const statement = await financialReportingService.createCashFlowStatement(
        session.companyId,
        period,
        operatingCashFlow,
        investingCashFlow,
        financingCashFlow,
        beginningCash
      );

      return NextResponse.json(statement, { status: 201 });
    } else if (action === 'allocate-budget') {
      const body = await request.json();
      const { department, category, allocatedAmount, period } = budgetSchema.parse(body);

      const budget = await financialReportingService.allocateBudget(
        session.companyId,
        department,
        category,
        allocatedAmount,
        period
      );

      return NextResponse.json(budget, { status: 201 });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error processing financial report action:', error);
    return NextResponse.json(
      { error: 'Failed to process financial report action' },
      { status: 500 }
    );
  }
}

