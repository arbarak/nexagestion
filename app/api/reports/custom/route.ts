import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const customReportSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  type: z.enum(['sales', 'inventory', 'financial', 'employees']),
  filters: z.record(z.any()).optional(),
  columns: z.array(z.string()),
});

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const reports = await prisma.customReport.findMany({
      where: { companyId: session.companyId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(reports);
  } catch (error) {
    console.error('Failed to fetch reports:', error);
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, type, filters, columns } = customReportSchema.parse(body);

    const report = await prisma.customReport.create({
      data: {
        name,
        description,
        type,
        filters: filters || {},
        columns,
        companyId: session.companyId,
        createdBy: session.userId,
      },
    });

    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    console.error('Failed to create report:', error);
    return NextResponse.json({ error: 'Failed to create report' }, { status: 500 });
  }
}

