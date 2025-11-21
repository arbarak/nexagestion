import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const workflowSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  trigger: z.enum(['manual', 'order_created', 'invoice_created', 'payment_received']),
  steps: z.array(z.object({
    id: z.string(),
    type: z.string(),
    config: z.record(z.any()),
  })),
  enabled: z.boolean().default(true),
});

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const workflows = await prisma.workflow.findMany({
      where: { companyId: session.companyId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(workflows);
  } catch (error) {
    console.error('Failed to fetch workflows:', error);
    return NextResponse.json({ error: 'Failed to fetch workflows' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, trigger, steps, enabled } = workflowSchema.parse(body);

    const workflow = await prisma.workflow.create({
      data: {
        name,
        description,
        trigger,
        steps,
        enabled,
        companyId: session.companyId,
        createdBy: session.userId,
      },
    });

    return NextResponse.json(workflow, { status: 201 });
  } catch (error) {
    console.error('Failed to create workflow:', error);
    return NextResponse.json({ error: 'Failed to create workflow' }, { status: 500 });
  }
}

