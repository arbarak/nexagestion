import { NextRequest, NextResponse } from 'next/server';
import { defectTrackingService } from '@/lib/defect-tracking-service';
import { verifyAuth } from '@/lib/auth';
import { z } from 'zod';

const reportSchema = z.object({
  reportCode: z.string(),
  reportName: z.string(),
  defectType: z.enum(['design', 'manufacturing', 'material', 'assembly', 'other']),
  severity: z.enum(['critical', 'high', 'medium', 'low']),
  description: z.string(),
  reportedBy: z.string(),
});

const actionSchema = z.object({
  defectReportId: z.string(),
  actionCode: z.string(),
  actionName: z.string(),
  actionType: z.enum(['corrective', 'preventive', 'containment']),
  assignedTo: z.string(),
  dueDate: z.string().transform((s) => new Date(s)),
});

const statusSchema = z.object({
  reportId: z.string(),
  status: z.enum(['open', 'assigned', 'in-progress', 'resolved', 'closed']),
});

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'metrics') {
      const metrics = await defectTrackingService.getDefectMetrics(session.companyId);
      return NextResponse.json(metrics);
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error fetching defect data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch defect data' },
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

    if (action === 'create-report') {
      const body = await request.json();
      const { reportCode, reportName, defectType, severity, description, reportedBy } =
        reportSchema.parse(body);

      const report = await defectTrackingService.createDefectReport(
        session.companyId,
        reportCode,
        reportName,
        defectType,
        severity,
        description,
        reportedBy
      );

      return NextResponse.json(report, { status: 201 });
    } else if (action === 'create-action') {
      const body = await request.json();
      const { defectReportId, actionCode, actionName, actionType, assignedTo, dueDate } =
        actionSchema.parse(body);

      const defectAction = await defectTrackingService.createDefectAction(
        defectReportId,
        actionCode,
        actionName,
        actionType,
        assignedTo,
        dueDate
      );

      return NextResponse.json(defectAction, { status: 201 });
    } else if (action === 'update-status') {
      const body = await request.json();
      const { reportId, status } = statusSchema.parse(body);

      const report = await defectTrackingService.updateDefectStatus(reportId, status);
      if (!report) {
        return NextResponse.json({ error: 'Report not found' }, { status: 404 });
      }

      return NextResponse.json(report);
    } else if (action === 'complete-action') {
      const body = await request.json();
      const { actionId } = z.object({ actionId: z.string() }).parse(body);

      const defectAction = await defectTrackingService.completeDefectAction(actionId);
      if (!defectAction) {
        return NextResponse.json({ error: 'Action not found' }, { status: 404 });
      }

      return NextResponse.json(defectAction);
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error processing defect action:', error);
    return NextResponse.json(
      { error: 'Failed to process defect action' },
      { status: 500 }
    );
  }
}

