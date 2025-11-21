import { NextRequest, NextResponse } from 'next/server';
import { backupService } from '@/lib/backup-service';
import { verifyAuth } from '@/lib/auth';
import { z } from 'zod';

const backupSchema = z.object({
  name: z.string(),
  type: z.enum(['full', 'incremental', 'differential']).optional(),
});

const scheduleSchema = z.object({
  name: z.string(),
  frequency: z.enum(['daily', 'weekly', 'monthly']),
  type: z.enum(['full', 'incremental']),
  retentionDays: z.number().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session || !session.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'schedules') {
      const schedules = await backupService.getBackupSchedules(session.companyId);
      return NextResponse.json(schedules);
    }

    const backups = await backupService.getBackups(session.companyId);
    return NextResponse.json(backups);
  } catch (error) {
    console.error('Error fetching backups:', error);
    return NextResponse.json(
      { error: 'Failed to fetch backups' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session || !session.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'create-schedule') {
      const { name, frequency, type, retentionDays } = scheduleSchema.parse(body);
      const schedule = await backupService.createBackupSchedule(
        session.companyId,
        name,
        frequency,
        type,
        retentionDays
      );
      return NextResponse.json(schedule, { status: 201 });
    }

    const { name, type } = backupSchema.parse(body);
    const backup = await backupService.createBackup(
      session.companyId,
      name,
      type
    );

    return NextResponse.json(backup, { status: 201 });
  } catch (error) {
    console.error('Error creating backup:', error);
    return NextResponse.json(
      { error: 'Failed to create backup' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session || !session.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const backupId = searchParams.get('id');
    const scheduleId = searchParams.get('scheduleId');

    if (scheduleId) {
      await backupService.deleteBackupSchedule(session.companyId, scheduleId);
    } else if (backupId) {
      await backupService.deleteBackup(session.companyId, backupId);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting backup:', error);
    return NextResponse.json(
      { error: 'Failed to delete backup' },
      { status: 500 }
    );
  }
}


