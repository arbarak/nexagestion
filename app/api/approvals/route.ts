import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const approvalSchema = z.object({
  entityType: z.string(),
  entityId: z.string(),
  requestedBy: z.string(),
  approvers: z.array(z.string()),
  reason: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

const approvalActionSchema = z.object({
  approvalId: z.string(),
  action: z.enum(['approve', 'reject']),
  comments: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const approvals = await prisma.approval.findMany({
      where: {
        companyId: session.companyId,
        ...(status && { status }),
      },
      include: { requestedByUser: true, approvers: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(approvals);
  } catch (error) {
    console.error('Failed to fetch approvals:', error);
    return NextResponse.json({ error: 'Failed to fetch approvals' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { entityType, entityId, requestedBy, approvers, reason, metadata } = approvalSchema.parse(body);

    const approval = await prisma.approval.create({
      data: {
        entityType,
        entityId,
        requestedBy,
        approvers,
        reason,
        metadata: metadata || {},
        status: 'pending',
        companyId: session.companyId,
      },
      include: { requestedByUser: true },
    });

    return NextResponse.json(approval, { status: 201 });
  } catch (error) {
    console.error('Failed to create approval:', error);
    return NextResponse.json({ error: 'Failed to create approval' }, { status: 500 });
  }
}

