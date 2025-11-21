import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const deploymentSchema = z.object({
  version: z.string(),
  environment: z.enum(['development', 'staging', 'production']),
});

export async function POST(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has admin role
    if (session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { version, environment } = deploymentSchema.parse(body);

    // Create deployment record
    const deployment = await prisma.deploymentRecord.create({
      data: {
        companyId: session.companyId,
        version,
        environment,
        status: 'pending',
        deployedBy: session.userId,
      },
    });

    // Trigger deployment process (webhook, CI/CD, etc.)
    // This would typically call your deployment service
    console.log(`Deployment initiated: ${deployment.id}`);

    return NextResponse.json(deployment);
  } catch (error) {
    console.error('Failed to create deployment:', error);
    return NextResponse.json({ error: 'Failed to create deployment' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const environment = searchParams.get('environment');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');

    const deployments = await prisma.deploymentRecord.findMany({
      where: {
        companyId: session.companyId,
        ...(environment && { environment }),
        ...(status && { status }),
      },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
      },
      orderBy: { deployedAt: 'desc' },
      take: limit,
    });

    return NextResponse.json(deployments);
  } catch (error) {
    console.error('Failed to fetch deployments:', error);
    return NextResponse.json({ error: 'Failed to fetch deployments' }, { status: 500 });
  }
}

