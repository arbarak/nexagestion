import { NextRequest, NextResponse } from 'next/server';
import { payrollService } from '@/lib/payroll-service';
import { verifyAuth } from '@/lib/auth';
import { z } from 'zod';

const payrollSchema = z.object({
  employeeId: z.string(),
  month: z.string(),
  baseSalary: z.number(),
});

const deductionSchema = z.object({
  payrollId: z.string(),
  type: z.enum(['tax', 'insurance', 'loan', 'other']),
  amount: z.number(),
  description: z.string(),
});

const bonusSchema = z.object({
  employeeId: z.string(),
  month: z.string(),
  amount: z.number(),
  reason: z.string(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session || !session.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const month = searchParams.get('month');

    if (action === 'payrolls') {
      const payrolls = await payrollService.getPayrolls(session.companyId, month || undefined);
      return NextResponse.json(payrolls);
    } else if (action === 'reports') {
      const reports = await payrollService.getPayrollReports(session.companyId);
      return NextResponse.json(reports);
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error fetching payroll data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payroll data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session || !session.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'create-payroll') {
      const body = await request.json();
      const { employeeId, month, baseSalary } = payrollSchema.parse(body);

      const payroll = await payrollService.createPayroll(
        session.companyId,
        employeeId,
        month,
        baseSalary
      );

      return NextResponse.json(payroll, { status: 201 });
    } else if (action === 'add-deduction') {
      const body = await request.json();
      const { payrollId, type, amount, description } = deductionSchema.parse(body);

      const deduction = await payrollService.addDeduction(
        payrollId,
        type,
        amount,
        description
      );

      return NextResponse.json(deduction, { status: 201 });
    } else if (action === 'add-bonus') {
      const body = await request.json();
      const { employeeId, month, amount, reason } = bonusSchema.parse(body);

      const bonus = await payrollService.addBonus(
        employeeId,
        month,
        amount,
        reason,
        session.userId
      );

      return NextResponse.json(bonus, { status: 201 });
    } else if (action === 'process-payroll') {
      const body = await request.json();
      const { payrollId } = z.object({ payrollId: z.string() }).parse(body);

      const payroll = await payrollService.processPayroll(payrollId);

      return NextResponse.json(payroll);
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error processing payroll action:', error);
    return NextResponse.json(
      { error: 'Failed to process payroll action' },
      { status: 500 }
    );
  }
}


