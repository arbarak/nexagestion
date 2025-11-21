import { NextRequest, NextResponse } from 'next/server';
import { goalTrackingService } from '@/lib/goal-tracking-service';
import { verifyAuth } from '@/lib/auth';
import { z } from 'zod';

const objectiveSchema = z.object({
  objectiveCode: z.string(),
  objectiveName: z.string(),
  objectiveDescription: z.string(),
  priority: z.enum(['high', 'medium', 'low']),
});

const keyResultSchema = z.object({
  objectiveId: z.string(),
  keyResultCode: z.string(),
  keyResultName: z.string(),
  targetValue: z.number(),
  unit: z.string(),
});

const progressSchema = z.object({
  keyResultId: z.string(),
  progressCode: z.string(),
  progressValue: z.number(),
  notes: z.string(),
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
      const metrics = await goalTrackingService.getGoalTrackingMetrics(session.companyId);
      return NextResponse.json(metrics);
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error fetching goal tracking data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch goal tracking data' },
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

    if (action === 'create-objective') {
      const body = await request.json();
      const { objectiveCode, objectiveName, objectiveDescription, priority } =
        objectiveSchema.parse(body);

      const objective = await goalTrackingService.createObjective(
        session.companyId,
        objectiveCode,
        objectiveName,
        objectiveDescription,
        priority
      );

      return NextResponse.json(objective, { status: 201 });
    } else if (action === 'create-key-result') {
      const body = await request.json();
      const { objectiveId, keyResultCode, keyResultName, targetValue, unit } =
        keyResultSchema.parse(body);

      const keyResult = await goalTrackingService.createKeyResult(
        objectiveId,
        keyResultCode,
        keyResultName,
        targetValue,
        unit
      );

      return NextResponse.json(keyResult, { status: 201 });
    } else if (action === 'update-progress') {
      const body = await request.json();
      const { keyResultId, progressCode, progressValue, notes } = progressSchema.parse(body);

      const progress = await goalTrackingService.updateProgress(
        keyResultId,
        progressCode,
        progressValue,
        notes
      );

      return NextResponse.json(progress, { status: 201 });
    } else if (action === 'complete-key-result') {
      const body = await request.json();
      const { keyResultId } = z.object({ keyResultId: z.string() }).parse(body);

      const keyResult = await goalTrackingService.completeKeyResult(keyResultId);
      if (!keyResult) {
        return NextResponse.json({ error: 'Key Result not found' }, { status: 404 });
      }

      return NextResponse.json(keyResult);
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error processing goal tracking action:', error);
    return NextResponse.json(
      { error: 'Failed to process goal tracking action' },
      { status: 500 }
    );
  }
}


