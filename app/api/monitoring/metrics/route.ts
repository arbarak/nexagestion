import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const metricsSchema = z.object({
  type: z.enum(['cpu', 'memory', 'disk', 'network', 'api_response']),
  value: z.number(),
  unit: z.string(),
  tags: z.record(z.string()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session || !session.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type, value, unit, tags } = metricsSchema.parse(body);

    // Store metric
    const metric = await prisma.systemMetric.create({
      data: {
        companyId: session.companyId,
        type,
        value,
        unit,
        tags: tags || {},
        recordedAt: new Date(),
      },
    });

    return NextResponse.json(metric);
  } catch (error) {
    console.error('Failed to record metric:', error);
    return NextResponse.json({ error: 'Failed to record metric' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session || !session.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const hours = parseInt(searchParams.get('hours') || '24');

    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    const metrics = await prisma.systemMetric.findMany({
      where: {
        companyId: session.companyId,
        ...(type && { type }),
        recordedAt: { gte: since },
      },
      orderBy: { recordedAt: 'desc' },
      take: 1000,
    });

    // Calculate statistics
    const values = metrics.map(m => m.value);
    const stats = {
      count: metrics.length,
      average: values.length > 0 ? values.reduce((a: number, b: number) => a + b, 0) / values.length : 0,
      min: values.length > 0 ? Math.min(...values) : 0,
      max: values.length > 0 ? Math.max(...values) : 0,
      latest: metrics[0]?.value || 0,
    };

    return NextResponse.json({
      metrics,
      statistics: stats,
    });
  } catch (error) {
    console.error('Failed to fetch metrics:', error);
    return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 });
  }
}




