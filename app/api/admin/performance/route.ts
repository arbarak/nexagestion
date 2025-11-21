import { NextRequest, NextResponse } from 'next/server';
import { performanceService } from '@/lib/performance-service';
import { verifyAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const endpoint = searchParams.get('endpoint');
    const method = searchParams.get('method');

    if (action === 'all-stats') {
      const stats = performanceService.getAllStats();
      return NextResponse.json(stats);
    }

    if (action === 'stats' && endpoint && method) {
      const stats = performanceService.getStats(endpoint, method);
      return NextResponse.json(stats);
    }

    if (action === 'slow-requests') {
      const threshold = parseInt(searchParams.get('threshold') || '1000');
      const limit = parseInt(searchParams.get('limit') || '10');
      const slowRequests = performanceService.getSlowRequests(threshold, limit);
      return NextResponse.json(slowRequests);
    }

    if (action === 'metrics') {
      const metrics = performanceService.getMetrics(endpoint || undefined, method || undefined);
      return NextResponse.json(metrics);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error getting performance data:', error);
    return NextResponse.json(
      { error: 'Failed to get performance data' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    performanceService.clearMetrics();

    return NextResponse.json({ message: 'Performance metrics cleared' });
  } catch (error) {
    console.error('Error clearing metrics:', error);
    return NextResponse.json(
      { error: 'Failed to clear metrics' },
      { status: 500 }
    );
  }
}

