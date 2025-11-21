import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const automationRuleSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  trigger: z.object({
    type: z.string(),
    conditions: z.record(z.any()),
  }),
  actions: z.array(z.object({
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

    const rules = await prisma.automationRule.findMany({
      where: { companyId: session.companyId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(rules);
  } catch (error) {
    console.error('Failed to fetch automation rules:', error);
    return NextResponse.json({ error: 'Failed to fetch automation rules' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, trigger, actions, enabled } = automationRuleSchema.parse(body);

    const rule = await prisma.automationRule.create({
      data: {
        name,
        description,
        trigger,
        actions,
        enabled,
        companyId: session.companyId,
        createdBy: session.userId,
      },
    });

    return NextResponse.json(rule, { status: 201 });
  } catch (error) {
    console.error('Failed to create automation rule:', error);
    return NextResponse.json({ error: 'Failed to create automation rule' }, { status: 500 });
  }
}

