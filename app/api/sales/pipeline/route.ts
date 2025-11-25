import { NextRequest, NextResponse } from 'next/server';
import { salesPipelineService } from '@/lib/sales-pipeline-service';
import { verifyAuth } from '@/lib/auth';
import { z } from 'zod';

const dealSchema = z.object({
  name: z.string(),
  customerId: z.string(),
  value: z.number(),
  expectedCloseDate: z.string(),
  assignedTo: z.string(),
});

const stageUpdateSchema = z.object({
  dealId: z.string(),
  stage: z.enum(['prospecting', 'qualification', 'proposal', 'negotiation', 'closed-won', 'closed-lost']),
  probability: z.number(),
});

const activitySchema = z.object({
  dealId: z.string(),
  type: z.enum(['call', 'email', 'meeting', 'task', 'note']),
  description: z.string(),
  dueDate: z.string(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session || !session.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'deals') {
      const stage = searchParams.get('stage');
      const deals = await salesPipelineService.getDeals(session.companyId, stage || undefined);
      return NextResponse.json(deals);
    } else if (action === 'metrics') {
      const metrics = await salesPipelineService.getPipelineMetrics(session.companyId);
      return NextResponse.json(metrics);
    } else if (action === 'forecasts') {
      const forecasts = await salesPipelineService.getForecasts(session.companyId);
      return NextResponse.json(forecasts);
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error fetching sales data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sales data' },
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

    if (action === 'create-deal') {
      const body = await request.json();
      const { name, customerId, value, expectedCloseDate, assignedTo } = dealSchema.parse(body);

      const deal = await salesPipelineService.createDeal(
        session.companyId,
        name,
        customerId,
        value,
        new Date(expectedCloseDate),
        assignedTo
      );

      return NextResponse.json(deal, { status: 201 });
    } else if (action === 'update-stage') {
      const body = await request.json();
      const { dealId, stage, probability } = stageUpdateSchema.parse(body);

      const deal = await salesPipelineService.updateDealStage(dealId, stage, probability);

      return NextResponse.json(deal);
    } else if (action === 'add-activity') {
      const body = await request.json();
      const { dealId, type, description, dueDate } = activitySchema.parse(body);

      const activity = await salesPipelineService.addActivity(
        dealId,
        type,
        description,
        new Date(dueDate),
        session.userId
      );

      return NextResponse.json(activity, { status: 201 });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error processing sales action:', error);
    return NextResponse.json(
      { error: 'Failed to process sales action' },
      { status: 500 }
    );
  }
}


