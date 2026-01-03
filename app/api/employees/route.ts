import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { employeeService } from '@/lib/employee-service';

export async function POST(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session || !session.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();

    const employee = await employeeService.createEmployee(session.companyId, data);

    return NextResponse.json(
      {
        status: 'success',
        employee,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create employee error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create employee' },
      { status: 400 }
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
    const status = searchParams.get('status');
    const department = searchParams.get('department');
    const position = searchParams.get('position');

    const employees = await employeeService.getEmployees(session.companyId, {
      status: status || undefined,
      department: department || undefined,
      position: position || undefined,
    });

    return NextResponse.json({
      status: 'success',
      employees,
      count: employees.length,
    });
  } catch (error) {
    console.error('Get employees error:', error);
    return NextResponse.json({ error: 'Failed to retrieve employees' }, { status: 500 });
  }
}
