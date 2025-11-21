import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const complianceSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  type: z.enum(['gdpr', 'hipaa', 'pci_dss', 'iso27001', 'soc2', 'custom']),
  status: z.enum(['compliant', 'non_compliant', 'in_progress']).default('in_progress'),
  dueDate: z.string().optional(),
  requirements: z.array(z.string()).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');

    const compliance = await prisma.complianceRequirement.findMany({
      where: {
        companyId: session.companyId,
        ...(type && { type }),
        ...(status && { status }),
      },
      orderBy: { dueDate: 'asc' },
    });

    return NextResponse.json(compliance);
  } catch (error) {
    console.error('Failed to fetch compliance requirements:', error);
    return NextResponse.json({ error: 'Failed to fetch compliance requirements' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, type, status, dueDate, requirements } = complianceSchema.parse(body);

    const compliance = await prisma.complianceRequirement.create({
      data: {
        companyId: session.companyId,
        name,
        description,
        type,
        status,
        dueDate: dueDate ? new Date(dueDate) : null,
        requirements: requirements || [],
        createdBy: session.userId,
      },
    });

    return NextResponse.json(compliance, { status: 201 });
  } catch (error) {
    console.error('Failed to create compliance requirement:', error);
    return NextResponse.json({ error: 'Failed to create compliance requirement' }, { status: 500 });
  }
}

