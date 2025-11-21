import { NextRequest, NextResponse } from 'next/server';
import { workflowService } from '@/lib/workflow-service';
import { verifyAuth } from '@/lib/auth';
import { z } from 'zod';

const executeSchema = z.object({
  workflowId: z.string(),
  entityId: z.string(),
  data: z.record(z.any()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { workflowId, entityId, data } = executeSchema.parse(body);

    const execution = await workflowService.executeWorkflow(
      workflowId,
      entityId,
      data || {}
    );

    return NextResponse.json(execution, { status: 201 });
  } catch (error) {
    console.error('Error executing workflow:', error);
    return NextResponse.json(
      { error: 'Failed to execute workflow' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const workflowId = request.nextUrl.searchParams.get('workflowId');

    if (!workflowId) {
      return NextResponse.json(
        { error: 'Workflow ID is required' },
        { status: 400 }
      );
    }

    const history = await workflowService.getExecutionHistory(workflowId);

    return NextResponse.json(history);
  } catch (error) {
    console.error('Error fetching execution history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch execution history' },
      { status: 500 }
    );
  }
}

