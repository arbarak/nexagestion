import { NextRequest, NextResponse } from 'next/server';
import { correctiveMaintenanceService } from '@/lib/corrective-maintenance-service';
import { verifyAuth } from '@/lib/auth';
import { z } from 'zod';

const requestSchema = z.object({
  requestCode: z.string(),
  requestName: z.string(),
  assetId: z.string(),
  issueDescription: z.string(),
  severity: z.enum(['critical', 'high', 'medium', 'low']),
  requestedBy: z.string(),
});

const workOrderSchema = z.object({
  requestId: z.string(),
  workOrderCode: z.string(),
  workOrderName: z.string(),
  assignedTo: z.string(),
  startDate: z.string().transform((s) => new Date(s)),
  estimatedEndDate: z.string().transform((s) => new Date(s)),
});

const repairSchema = z.object({
  workOrderId: z.string(),
  repairCode: z.string(),
  repairName: z.string(),
  repairType: z.enum(['replacement', 'repair', 'adjustment', 'cleaning']),
  description: z.string(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session || !session.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'metrics') {
      const metrics = await correctiveMaintenanceService.getCorrectiveMaintenanceMetrics(
        session.companyId
      );
      return NextResponse.json(metrics);
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error fetching corrective maintenance data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch corrective maintenance data' },
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

    if (action === 'create-request') {
      const body = await request.json();
      const { requestCode, requestName, assetId, issueDescription, severity, requestedBy } =
        requestSchema.parse(body);

      const maintenanceRequest = await correctiveMaintenanceService.createRequest(
        session.companyId,
        requestCode,
        requestName,
        assetId,
        issueDescription,
        severity,
        requestedBy
      );

      return NextResponse.json(maintenanceRequest, { status: 201 });
    } else if (action === 'create-work-order') {
      const body = await request.json();
      const { requestId, workOrderCode, workOrderName, assignedTo, startDate, estimatedEndDate } =
        workOrderSchema.parse(body);

      const workOrder = await correctiveMaintenanceService.createWorkOrder(
        requestId,
        workOrderCode,
        workOrderName,
        assignedTo,
        startDate,
        estimatedEndDate
      );

      return NextResponse.json(workOrder, { status: 201 });
    } else if (action === 'create-repair') {
      const body = await request.json();
      const { workOrderId, repairCode, repairName, repairType, description } = repairSchema.parse(body);

      const repair = await correctiveMaintenanceService.createRepair(
        workOrderId,
        repairCode,
        repairName,
        repairType,
        description
      );

      return NextResponse.json(repair, { status: 201 });
    } else if (action === 'complete-work-order') {
      const body = await request.json();
      const { workOrderId } = z.object({ workOrderId: z.string() }).parse(body);

      const workOrder = await correctiveMaintenanceService.completeWorkOrder(workOrderId);
      if (!workOrder) {
        return NextResponse.json({ error: 'Work Order not found' }, { status: 404 });
      }

      return NextResponse.json(workOrder);
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error processing corrective maintenance action:', error);
    return NextResponse.json(
      { error: 'Failed to process corrective maintenance action' },
      { status: 500 }
    );
  }
}


