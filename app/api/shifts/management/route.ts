import { NextRequest, NextResponse } from 'next/server';
import { shiftManagementService } from '@/lib/shift-management-service';
import { verifyAuth } from '@/lib/auth';
import { z } from 'zod';

const shiftSchema = z.object({
  shiftCode: z.string(),
  shiftName: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  breakDuration: z.number(),
  workingHours: z.number(),
});

const assignmentSchema = z.object({
  employeeId: z.string(),
  shiftId: z.string(),
  assignmentCode: z.string(),
  assignmentDate: z.string().transform((s) => new Date(s)),
});

const swapSchema = z.object({
  requestingEmployeeId: z.string(),
  targetEmployeeId: z.string(),
  swapCode: z.string(),
  originalShiftDate: z.string().transform((s) => new Date(s)),
  targetShiftDate: z.string().transform((s) => new Date(s)),
  reason: z.string(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'shifts') {
      const shifts = await shiftManagementService.getShifts(session.companyId);
      return NextResponse.json(shifts);
    } else if (action === 'assignments') {
      const employeeId = searchParams.get('employeeId');
      const assignments = await shiftManagementService.getShiftAssignments(employeeId || undefined);
      return NextResponse.json(assignments);
    } else if (action === 'metrics') {
      const metrics = await shiftManagementService.getShiftMetrics(session.companyId);
      return NextResponse.json(metrics);
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error fetching shift data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shift data' },
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

    if (action === 'create-shift') {
      const body = await request.json();
      const { shiftCode, shiftName, startTime, endTime, breakDuration, workingHours } =
        shiftSchema.parse(body);

      const shift = await shiftManagementService.createShift(
        session.companyId,
        shiftCode,
        shiftName,
        startTime,
        endTime,
        breakDuration,
        workingHours
      );

      return NextResponse.json(shift, { status: 201 });
    } else if (action === 'assign-shift') {
      const body = await request.json();
      const { employeeId, shiftId, assignmentCode, assignmentDate } = assignmentSchema.parse(body);

      const assignment = await shiftManagementService.assignShift(
        employeeId,
        shiftId,
        assignmentCode,
        assignmentDate
      );

      return NextResponse.json(assignment, { status: 201 });
    } else if (action === 'complete-assignment') {
      const body = await request.json();
      const { assignmentId } = z.object({ assignmentId: z.string() }).parse(body);

      const assignment = await shiftManagementService.completeShiftAssignment(assignmentId);
      if (!assignment) {
        return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
      }

      return NextResponse.json(assignment);
    } else if (action === 'request-swap') {
      const body = await request.json();
      const { requestingEmployeeId, targetEmployeeId, swapCode, originalShiftDate, targetShiftDate, reason } =
        swapSchema.parse(body);

      const swap = await shiftManagementService.requestShiftSwap(
        requestingEmployeeId,
        targetEmployeeId,
        swapCode,
        originalShiftDate,
        targetShiftDate,
        reason
      );

      return NextResponse.json(swap, { status: 201 });
    } else if (action === 'approve-swap') {
      const body = await request.json();
      const { swapId, approvedBy } = z
        .object({ swapId: z.string(), approvedBy: z.string() })
        .parse(body);

      const swap = await shiftManagementService.approveShiftSwap(swapId, approvedBy);
      if (!swap) {
        return NextResponse.json({ error: 'Swap not found' }, { status: 404 });
      }

      return NextResponse.json(swap);
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error processing shift action:', error);
    return NextResponse.json(
      { error: 'Failed to process shift action' },
      { status: 500 }
    );
  }
}

