import { NextRequest, NextResponse } from 'next/server';
import { timeAttendanceService } from '@/lib/time-attendance-service';
import { verifyAuth } from '@/lib/auth';
import { z } from 'zod';

const attendanceSchema = z.object({
  employeeId: z.string(),
  attendanceDate: z.string().transform((s) => new Date(s)),
  checkInTime: z.string().transform((s) => new Date(s)),
  status: z.enum(['present', 'absent', 'late', 'half-day', 'leave']),
  remarks: z.string(),
});

const leaveRequestSchema = z.object({
  employeeId: z.string(),
  leaveCode: z.string(),
  leaveType: z.enum(['annual', 'sick', 'personal', 'maternity', 'unpaid']),
  startDate: z.string().transform((s) => new Date(s)),
  endDate: z.string().transform((s) => new Date(s)),
  reason: z.string(),
});

const timesheetSchema = z.object({
  employeeId: z.string(),
  timesheetCode: z.string(),
  weekStartDate: z.string().transform((s) => new Date(s)),
  weekEndDate: z.string().transform((s) => new Date(s)),
  totalHours: z.number(),
  overtimeHours: z.number(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session || !session.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'records') {
      const employeeId = searchParams.get('employeeId');
      const records = await timeAttendanceService.getAttendanceRecords(
        session.companyId,
        employeeId || undefined
      );
      return NextResponse.json(records);
    } else if (action === 'leave-requests') {
      const employeeId = searchParams.get('employeeId');
      const status = searchParams.get('status');
      const requests = await timeAttendanceService.getLeaveRequests(
        employeeId || undefined,
        status || undefined
      );
      return NextResponse.json(requests);
    } else if (action === 'metrics') {
      const metrics = await timeAttendanceService.getAttendanceMetrics(session.companyId);
      return NextResponse.json(metrics);
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error fetching attendance data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch attendance data' },
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

    if (action === 'record-attendance') {
      const body = await request.json();
      const { employeeId, attendanceDate, checkInTime, status, remarks } =
        attendanceSchema.parse(body);

      const record = await timeAttendanceService.recordAttendance(
        session.companyId,
        employeeId,
        attendanceDate,
        checkInTime,
        status,
        remarks
      );

      return NextResponse.json(record, { status: 201 });
    } else if (action === 'record-checkout') {
      const body = await request.json();
      const { recordId, checkOutTime } = z
        .object({ recordId: z.string(), checkOutTime: z.string().transform((s) => new Date(s)) })
        .parse(body);

      const record = await timeAttendanceService.recordCheckOut(recordId, checkOutTime);
      if (!record) {
        return NextResponse.json({ error: 'Record not found' }, { status: 404 });
      }

      return NextResponse.json(record);
    } else if (action === 'create-leave-request') {
      const body = await request.json();
      const { employeeId, leaveCode, leaveType, startDate, endDate, reason } =
        leaveRequestSchema.parse(body);

      const request = await timeAttendanceService.createLeaveRequest(
        employeeId,
        leaveCode,
        leaveType,
        startDate,
        endDate,
        reason
      );

      return NextResponse.json(request, { status: 201 });
    } else if (action === 'approve-leave-request') {
      const body = await request.json();
      const { leaveRequestId, approvedBy } = z
        .object({ leaveRequestId: z.string(), approvedBy: z.string() })
        .parse(body);

      const request = await timeAttendanceService.approveLeaveRequest(leaveRequestId, approvedBy);
      if (!request) {
        return NextResponse.json({ error: 'Leave request not found' }, { status: 404 });
      }

      return NextResponse.json(request);
    } else if (action === 'create-timesheet') {
      const body = await request.json();
      const { employeeId, timesheetCode, weekStartDate, weekEndDate, totalHours, overtimeHours } =
        timesheetSchema.parse(body);

      const timesheet = await timeAttendanceService.createTimeSheet(
        employeeId,
        timesheetCode,
        weekStartDate,
        weekEndDate,
        totalHours,
        overtimeHours
      );

      return NextResponse.json(timesheet, { status: 201 });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error processing attendance action:', error);
    return NextResponse.json(
      { error: 'Failed to process attendance action' },
      { status: 500 }
    );
  }
}


