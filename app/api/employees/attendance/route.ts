import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { employeeService } from '@/lib/employee-service';

export async function POST(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session || !session.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { employeeId, action, checkTime } = await request.json();

    if (!employeeId) {
      return NextResponse.json({ error: 'employeeId is required' }, { status: 400 });
    }

    const time = new Date(checkTime || new Date());

    if (action === 'check_in') {
      const record = await employeeService.recordAttendance(session.companyId, employeeId, time);

      return NextResponse.json(
        {
          status: 'success',
          message: 'Check-in recorded',
          record,
        },
        { status: 201 }
      );
    } else if (action === 'check_out') {
      const record = await employeeService.recordCheckOut(session.companyId, employeeId, time);

      if (!record) {
        return NextResponse.json(
          { error: 'No check-in found for today' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        status: 'success',
        message: 'Check-out recorded',
        record,
      });
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Attendance error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Request failed' },
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
    const startDate = new Date(searchParams.get('startDate') || new Date().toISOString());
    const endDate = new Date(searchParams.get('endDate') || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString());

    if (!employeeId) {
      return NextResponse.json({ error: 'employeeId is required' }, { status: 400 });
    }

    const records = await employeeService.getAttendanceRecords(
      session.companyId,
      employeeId,
      startDate,
      endDate
    );

    return NextResponse.json({
      status: 'success',
      records,
      count: records.length,
    });
  } catch (error) {
    console.error('Get attendance error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve attendance records' },
      { status: 500 }
    );
  }
}
