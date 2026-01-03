import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { employeeService } from '@/lib/employee-service';

export async function POST(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session || !session.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { employeeId, leaveType, startDate, endDate, reason, action } = await request.json();

    if (!employeeId || !leaveType || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'employeeId, leaveType, startDate, and endDate are required' },
        { status: 400 }
      );
    }

    if (action === 'request') {
      const leaveRequest = await employeeService.requestLeave(session.companyId, employeeId, {
        leaveType,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason,
      });

      return NextResponse.json(
        {
          status: 'success',
          message: 'Leave request submitted',
          leaveRequest,
        },
        { status: 201 }
      );
    } else if (action === 'approve') {
      const leaveRequestId = employeeId;
      const approved = await employeeService.approveLeave(
        session.companyId,
        leaveRequestId,
        session.userId
      );

      if (!approved) {
        return NextResponse.json(
          { error: 'Failed to approve leave request' },
          { status: 400 }
        );
      }

      return NextResponse.json({
        status: 'success',
        message: 'Leave request approved',
        leaveRequest: approved,
      });
    } else if (action === 'reject') {
      const leaveRequestId = employeeId;
      const rejected = await employeeService.rejectLeave(
        session.companyId,
        leaveRequestId,
        reason
      );

      if (!rejected) {
        return NextResponse.json(
          { error: 'Failed to reject leave request' },
          { status: 400 }
        );
      }

      return NextResponse.json({
        status: 'success',
        message: 'Leave request rejected',
        leaveRequest: rejected,
      });
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Leave request error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Request failed' },
      { status: 500 }
    );
  }
}
