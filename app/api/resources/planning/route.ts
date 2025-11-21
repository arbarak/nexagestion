import { NextRequest, NextResponse } from 'next/server';
import { resourcePlanningService } from '@/lib/resource-planning-service';
import { verifyAuth } from '@/lib/auth';
import { z } from 'zod';

const resourceSchema = z.object({
  resourceCode: z.string(),
  resourceName: z.string(),
  resourceType: z.enum(['human', 'equipment', 'material', 'facility']),
  availability: z.number(),
  costPerUnit: z.number(),
});

const allocationSchema = z.object({
  projectId: z.string(),
  resourceId: z.string(),
  allocationCode: z.string(),
  allocatedQuantity: z.number(),
  allocationStartDate: z.string().transform((s) => new Date(s)),
  allocationEndDate: z.string().transform((s) => new Date(s)),
});

const scheduleSchema = z.object({
  resourceId: z.string(),
  scheduleCode: z.string(),
  scheduleName: z.string(),
  startDate: z.string().transform((s) => new Date(s)),
  endDate: z.string().transform((s) => new Date(s)),
  allocatedHours: z.number(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'resources') {
      const resourceType = searchParams.get('resourceType');
      const resources = await resourcePlanningService.getResources(
        session.companyId,
        resourceType || undefined
      );
      return NextResponse.json(resources);
    } else if (action === 'allocations') {
      const projectId = searchParams.get('projectId');
      const allocations = await resourcePlanningService.getResourceAllocations(projectId || undefined);
      return NextResponse.json(allocations);
    } else if (action === 'metrics') {
      const metrics = await resourcePlanningService.getResourceMetrics(session.companyId);
      return NextResponse.json(metrics);
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error fetching resource data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch resource data' },
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

    if (action === 'create-resource') {
      const body = await request.json();
      const { resourceCode, resourceName, resourceType, availability, costPerUnit } =
        resourceSchema.parse(body);

      const resource = await resourcePlanningService.createResource(
        session.companyId,
        resourceCode,
        resourceName,
        resourceType,
        availability,
        costPerUnit
      );

      return NextResponse.json(resource, { status: 201 });
    } else if (action === 'allocate-resource') {
      const body = await request.json();
      const { projectId, resourceId, allocationCode, allocatedQuantity, allocationStartDate, allocationEndDate } =
        allocationSchema.parse(body);

      const allocation = await resourcePlanningService.allocateResource(
        projectId,
        resourceId,
        allocationCode,
        allocatedQuantity,
        allocationStartDate,
        allocationEndDate
      );

      return NextResponse.json(allocation, { status: 201 });
    } else if (action === 'create-schedule') {
      const body = await request.json();
      const { resourceId, scheduleCode, scheduleName, startDate, endDate, allocatedHours } =
        scheduleSchema.parse(body);

      const schedule = await resourcePlanningService.createResourceSchedule(
        resourceId,
        scheduleCode,
        scheduleName,
        startDate,
        endDate,
        allocatedHours
      );

      return NextResponse.json(schedule, { status: 201 });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error processing resource action:', error);
    return NextResponse.json(
      { error: 'Failed to process resource action' },
      { status: 500 }
    );
  }
}

