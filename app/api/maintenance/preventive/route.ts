import { NextRequest, NextResponse } from 'next/server';
import { preventiveMaintenanceService } from '@/lib/preventive-maintenance-service';
import { verifyAuth } from '@/lib/auth';
import { z } from 'zod';

const planSchema = z.object({
  planCode: z.string(),
  planName: z.string(),
  assetId: z.string(),
  maintenanceType: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'annual']),
  description: z.string(),
});

const scheduleSchema = z.object({
  planId: z.string(),
  scheduleCode: z.string(),
  scheduleName: z.string(),
  scheduledDate: z.string().transform((s) => new Date(s)),
  assignedTo: z.string(),
  estimatedDuration: z.number(),
});

const taskSchema = z.object({
  scheduleId: z.string(),
  taskCode: z.string(),
  taskName: z.string(),
  taskDescription: z.string(),
  priority: z.enum(['high', 'medium', 'low']),
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
      const metrics = await preventiveMaintenanceService.getPreventiveMaintenanceMetrics(
        session.companyId
      );
      return NextResponse.json(metrics);
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error fetching preventive maintenance data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch preventive maintenance data' },
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

    if (action === 'create-plan') {
      const body = await request.json();
      const { planCode, planName, assetId, maintenanceType, description } = planSchema.parse(body);

      const plan = await preventiveMaintenanceService.createPlan(
        session.companyId,
        planCode,
        planName,
        assetId,
        maintenanceType,
        description
      );

      return NextResponse.json(plan, { status: 201 });
    } else if (action === 'create-schedule') {
      const body = await request.json();
      const { planId, scheduleCode, scheduleName, scheduledDate, assignedTo, estimatedDuration } =
        scheduleSchema.parse(body);

      const schedule = await preventiveMaintenanceService.createSchedule(
        planId,
        scheduleCode,
        scheduleName,
        scheduledDate,
        assignedTo,
        estimatedDuration
      );

      return NextResponse.json(schedule, { status: 201 });
    } else if (action === 'create-task') {
      const body = await request.json();
      const { scheduleId, taskCode, taskName, taskDescription, priority } = taskSchema.parse(body);

      const task = await preventiveMaintenanceService.createTask(
        scheduleId,
        taskCode,
        taskName,
        taskDescription,
        priority
      );

      return NextResponse.json(task, { status: 201 });
    } else if (action === 'complete-schedule') {
      const body = await request.json();
      const { scheduleId } = z.object({ scheduleId: z.string() }).parse(body);

      const schedule = await preventiveMaintenanceService.completeSchedule(scheduleId);
      if (!schedule) {
        return NextResponse.json({ error: 'Schedule not found' }, { status: 404 });
      }

      return NextResponse.json(schedule);
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error processing preventive maintenance action:', error);
    return NextResponse.json(
      { error: 'Failed to process preventive maintenance action' },
      { status: 500 }
    );
  }
}

