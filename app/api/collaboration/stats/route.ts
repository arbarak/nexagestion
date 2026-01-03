import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { websocketService } from '@/lib/websocket-service';

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stats = websocketService.getStatistics();

    return NextResponse.json({
      status: 'success',
      statistics: stats,
    });
  } catch (error) {
    console.error('Get collaboration stats error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve statistics' },
      { status: 500 }
    );
  }
}
