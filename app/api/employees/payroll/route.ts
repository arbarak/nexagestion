import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { employeeService } from '@/lib/employee-service';

export async function POST(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session || !session.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { payPeriodStart, payPeriodEnd } = await request.json();

    if (!payPeriodStart || !payPeriodEnd) {
      return NextResponse.json(
        { error: 'payPeriodStart and payPeriodEnd are required' },
        { status: 400 }
      );
    }

    const payrollRecords = await employeeService.generatePayroll(
      session.companyId,
      new Date(payPeriodStart),
      new Date(payPeriodEnd)
    );

    return NextResponse.json(
      {
        status: 'success',
        message: `Generated payroll for ${payrollRecords.length} employees`,
        payrollRecords,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Generate payroll error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate payroll' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session || !session.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const status = searchParams.get('status');

    const payrollRecords = await employeeService.getPayrollRecords(session.companyId, {
      employeeId: employeeId || undefined,
      status: status || undefined,
    });

    return NextResponse.json({
      status: 'success',
      payrollRecords,
      count: payrollRecords.length,
    });
  } catch (error) {
    console.error('Get payroll error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve payroll records' },
      { status: 500 }
    );
  }
}
