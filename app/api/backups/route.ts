import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const backupSchema = z.object({
  type: z.enum(['full', 'incremental', 'differential']),
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
    const { type } = backupSchema.parse(body);

    // Create backup record
    const backup = await prisma.backupRecord.create({
      data: {
        companyId: session.companyId,
        type,
        status: 'pending',
        size: 0n,
        location: `s3://nexagestion-backups/${session.companyId}/${Date.now()}`,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });

    // Trigger backup process
    console.log(`Backup initiated: ${backup.id}`);

    return NextResponse.json(backup);
  } catch (error) {
    console.error('Failed to create backup:', error);
    return NextResponse.json({ error: 'Failed to create backup' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');

    const backups = await prisma.backupRecord.findMany({
      where: {
        companyId: session.companyId,
        ...(type && { type }),
        ...(status && { status }),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    // Calculate statistics
    const stats = {
      total: backups.length,
      successful: backups.filter(b => b.status === 'success').length,
      failed: backups.filter(b => b.status === 'failed').length,
      totalSize: backups.reduce((sum, b) => sum + b.size, 0n),
    };

    return NextResponse.json({
      backups,
      statistics: stats,
    });
  } catch (error) {
    console.error('Failed to fetch backups:', error);
    return NextResponse.json({ error: 'Failed to fetch backups' }, { status: 500 });
  }
}

