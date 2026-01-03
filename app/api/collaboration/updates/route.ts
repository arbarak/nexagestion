import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { websocketService } from '@/lib/websocket-service';

export async function POST(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session || !session.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { roomId, changeType, fieldName, oldValue, newValue } = await request.json();

    if (!roomId) {
      return NextResponse.json({ error: 'roomId is required' }, { status: 400 });
    }

    const room = websocketService.getRoom(roomId);
    if (!room || room.companyId !== session.companyId) {
      return NextResponse.json({ error: 'Room not found or unauthorized' }, { status: 404 });
    }

    const update = await websocketService.processUpdate({
      type: 'update',
      roomId,
      userId: session.userId,
      companyId: session.companyId,
      data: {
        changeType: changeType || 'update',
        fieldName,
        oldValue,
        newValue,
      },
    });

    return NextResponse.json({
      status: 'success',
      update,
    });
  } catch (error) {
    console.error('Collaboration update error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Update failed' },
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
    const entityType = searchParams.get('entityType');
    const entityId = searchParams.get('entityId');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!entityType || !entityId) {
      return NextResponse.json(
        { error: 'entityType and entityId are required' },
        { status: 400 }
      );
    }

    const history = await websocketService.getCollaborationHistory(
      entityType,
      entityId,
      limit
    );

    return NextResponse.json({
      status: 'success',
      history,
      count: history.length,
    });
  } catch (error) {
    console.error('Get collaboration history error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve history' },
      { status: 500 }
    );
  }
}
