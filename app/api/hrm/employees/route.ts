import { NextRequest, NextResponse } from 'next/server';
import { hrmService } from '@/lib/hrm-service';
import { verifyAuth } from '@/lib/auth';
import { z } from 'zod';

const employeeSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  phone: z.string(),
  department: z.string(),
  position: z.string(),
  salary: z.number(),
  hireDate: z.string(),
  manager: z.string().optional(),
});

const leaveRequestSchema = z.object({
  employeeId: z.string(),
  type: z.enum(['vacation', 'sick', 'personal', 'unpaid']),
  startDate: z.string(),
  endDate: z.string(),
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

    if (action === 'employees') {
      const employees = await hrmService.getEmployees(session.companyId);
      return NextResponse.json(employees);
    } else if (action === 'metrics') {
      const metrics = await hrmService.getHRMMetrics(session.companyId);
      return NextResponse.json(metrics);
    } else if (action === 'leave-requests') {
      const requests = await hrmService.getLeaveRequests(session.companyId);
      return NextResponse.json(requests);
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error fetching HRM data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch HRM data' },
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

    if (action === 'create-employee') {
      const body = await request.json();
      const { firstName, lastName, email, phone, department, position, salary, hireDate, manager } = employeeSchema.parse(body);

      const employee = await hrmService.createEmployee(
        session.companyId,
        firstName,
        lastName,
        email,
        phone,
        department,
        position,
        salary,
        new Date(hireDate),
        manager
      );

      return NextResponse.json(employee, { status: 201 });
    } else if (action === 'request-leave') {
      const body = await request.json();
      const { employeeId, type, startDate, endDate, reason } = leaveRequestSchema.parse(body);

      const leaveRequest = await hrmService.requestLeave(
        employeeId,
        type,
        new Date(startDate),
        new Date(endDate),
        reason
      );

      return NextResponse.json(leaveRequest, { status: 201 });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error processing HRM action:', error);
    return NextResponse.json(
      { error: 'Failed to process HRM action' },
      { status: 500 }
    );
  }
}


