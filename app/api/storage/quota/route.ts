import { NextRequest, NextResponse } from 'next/server';
import { fileStorageService } from '@/lib/file-storage-service';
import { verifyAuth } from '@/lib/auth';
import { z } from 'zod';

const upgradeSchema = z.object({
  newQuotaSize: z.number().min(1),
});

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stats = await fileStorageService.getStorageStats(session.companyId);
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching storage stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch storage stats' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'initialize') {
      const quota = await fileStorageService.initializeQuota(session.companyId);
      return NextResponse.json(quota, { status: 201 });
    } else if (action === 'upgrade') {
      const body = await request.json();
      const { newQuotaSize } = upgradeSchema.parse(body);

      const quota = await fileStorageService.upgradeQuota(session.companyId, newQuotaSize);
      if (!quota) {
        return NextResponse.json(
          { error: 'Quota not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(quota);
    } else if (action === 'cleanup') {
      const body = await request.json();
      const { expirationDays } = z.object({ expirationDays: z.number() }).parse(body);

      const cleanedCount = await fileStorageService.cleanupExpiredFiles(
        session.companyId,
        expirationDays
      );

      return NextResponse.json({ cleanedCount });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error processing storage action:', error);
    return NextResponse.json(
      { error: 'Failed to process action' },
      { status: 500 }
    );
  }
}

