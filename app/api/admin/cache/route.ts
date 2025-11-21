import { NextRequest, NextResponse } from 'next/server';
import { cacheService } from '@/lib/cache-service';
import { verifyAuth } from '@/lib/auth';
import { z } from 'zod';

const cacheActionSchema = z.object({
  action: z.enum(['clear', 'invalidate', 'cleanup']),
  pattern: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'stats') {
      const stats = await cacheService.getStats();
      return NextResponse.json(stats);
    }

    if (action === 'top-keys') {
      const limit = parseInt(searchParams.get('limit') || '10');
      const topKeys = await cacheService.getTopKeys(limit);
      return NextResponse.json(topKeys);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error getting cache info:', error);
    return NextResponse.json(
      { error: 'Failed to get cache info' },
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

    const body = await request.json();
    const { action, pattern } = cacheActionSchema.parse(body);

    let result: any = {};

    switch (action) {
      case 'clear':
        await cacheService.clear();
        result = { message: 'Cache cleared' };
        break;

      case 'invalidate':
        if (!pattern) {
          return NextResponse.json(
            { error: 'Pattern is required for invalidate' },
            { status: 400 }
          );
        }
        const count = await cacheService.invalidatePattern(pattern);
        result = { message: `Invalidated ${count} entries` };
        break;

      case 'cleanup':
        const cleaned = await cacheService.cleanup();
        result = { message: `Cleaned up ${cleaned} expired entries` };
        break;
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error managing cache:', error);
    return NextResponse.json(
      { error: 'Failed to manage cache' },
      { status: 500 }
    );
  }
}

