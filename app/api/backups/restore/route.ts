import { NextRequest, NextResponse } from 'next/server';
import { backupService } from '@/lib/backup-service';
import { verifyAuth } from '@/lib/auth';
import { z } from 'zod';

const restoreSchema = z.object({
  backupId: z.string(),
  targetTime: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { backupId, targetTime } = restoreSchema.parse(body);

    const restorePoint = await backupService.restoreFromBackup(
      session.companyId,
      backupId,
      targetTime ? new Date(targetTime) : undefined
    );

    return NextResponse.json(restorePoint, { status: 201 });
  } catch (error) {
    console.error('Error restoring backup:', error);
    return NextResponse.json(
      { error: 'Failed to restore backup' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const backupId = searchParams.get('backupId');
    const action = searchParams.get('action');

    if (action === 'verify') {
      const isValid = await backupService.verifyBackupIntegrity(backupId || '');
      return NextResponse.json({ valid: isValid });
    }

    if (action === 'estimate-time') {
      const estimatedTime = await backupService.estimateRestoreTime(backupId || '');
      return NextResponse.json({ estimatedSeconds: estimatedTime });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error getting restore info:', error);
    return NextResponse.json(
      { error: 'Failed to get restore info' },
      { status: 500 }
    );
  }
}

