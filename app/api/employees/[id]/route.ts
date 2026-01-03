import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { employeeService } from '@/lib/employee-service';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await verifyAuth(request);
    if (!session || !session.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const employee = await employeeService.getEmployee(session.companyId, params.id);

    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    return NextResponse.json({
      status: 'success',
      employee,
    });
  } catch (error) {
    console.error('Get employee error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve employee' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await verifyAuth(request);
    if (!session || !session.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const updates = await request.json();

    const employee = await employeeService.updateEmployee(session.companyId, params.id, updates);

    if (!employee) {
      return NextResponse.json({ error: 'Failed to update employee' }, { status: 400 });
    }

    return NextResponse.json({
      status: 'success',
      employee,
    });
  } catch (error) {
    console.error('Update employee error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update employee' },
      { status: 500 }
    );
  }
}
