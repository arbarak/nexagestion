import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const auditLogSchema = z.object({
  action: z.string(),
  entityType: z.string(),
  entityId: z.string().optional(),
  changes: z.record(z.any()).optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session || !session.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');
    const action = searchParams.get('action');
    const entityType = searchParams.get('entityType');

    const logs = await prisma.securityAuditLog.findMany({
      where: {
        companyId: session.companyId,
        ...(action && { action }),
        ...(entityType && { entityType }),
      },
      include: { user: true },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    const total = await prisma.securityAuditLog.count({
      where: {
        companyId: session.companyId,
        ...(action && { action }),
        ...(entityType && { entityType }),
      },
    });

    return NextResponse.json({ logs, total, limit, offset });
  } catch (error) {
    console.error('Failed to fetch audit logs:', error);
    return NextResponse.json({ error: 'Failed to fetch audit logs' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session || !session.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, entityType, entityId, changes, ipAddress, userAgent } = auditLogSchema.parse(body);

    const log = await prisma.securityAuditLog.create({
      data: {
        companyId: session.companyId,
        userId: session.userId,
        action,
        entityType,
        entityId,
        changes: changes || {},
        ipAddress: ipAddress || request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: userAgent || request.headers.get('user-agent') || 'unknown',
      },
      include: { user: true },
    });

    return NextResponse.json(log, { status: 201 });
  } catch (error) {
    console.error('Failed to create audit log:', error);
    return NextResponse.json({ error: 'Failed to create audit log' }, { status: 500 });
  }
}


