import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const backupSchema = z.object({
  type: z.enum(['full', 'incremental', 'differential']).default('full'),
  description: z.string().optional(),
});

const restoreSchema = z.object({
  backupId: z.string(),
  targetDate: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const backups = await prisma.backup.findMany({
      where: { companyId: session.companyId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(backups);
  } catch (error) {
    console.error('Failed to fetch backups:', error);
    return NextResponse.json({ error: 'Failed to fetch backups' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type, description } = backupSchema.parse(body);

    // Create backup record
    const backup = await prisma.backup.create({
      data: {
        companyId: session.companyId,
        type,
        description,
        status: 'in_progress',
        startedAt: new Date(),
        createdBy: session.userId,
      },
    });

    // In production, trigger actual backup process
    // For now, simulate completion
    setTimeout(async () => {
      await prisma.backup.update({
        where: { id: backup.id },
        data: {
          status: 'completed',
          completedAt: new Date(),
          size: Math.floor(Math.random() * 1000000000), // Random size in bytes
        },
      });
    }, 5000);

    return NextResponse.json(backup, { status: 201 });
  } catch (error) {
    console.error('Failed to create backup:', error);
    return NextResponse.json({ error: 'Failed to create backup' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { backupId, targetDate } = restoreSchema.parse(body);

    // Verify backup exists
    const backup = await prisma.backup.findUnique({
      where: { id: backupId },
    });

    if (!backup || backup.companyId !== session.companyId) {
      return NextResponse.json({ error: 'Backup not found' }, { status: 404 });
    }

    // Create restore record
    const restore = await prisma.restore.create({
      data: {
        companyId: session.companyId,
        backupId,
        status: 'in_progress',
        startedAt: new Date(),
        targetDate: targetDate ? new Date(targetDate) : null,
        initiatedBy: session.userId,
      },
    });

    return NextResponse.json(restore, { status: 201 });
  } catch (error) {
    console.error('Failed to restore backup:', error);
    return NextResponse.json({ error: 'Failed to restore backup' }, { status: 500 });
  }
}

