import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { websocketService } from '@/lib/websocket-service';

export async function POST(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session || !session.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { roomId, action, data } = await request.json();

    if (!roomId || !action) {
      return NextResponse.json(
        { error: 'roomId and action are required' },
        { status: 400 }
      );
    }

    const room = websocketService.getRoom(roomId);
    if (!room || room.companyId !== session.companyId) {
      return NextResponse.json({ error: 'Room not found or unauthorized' }, { status: 404 });
    }

    switch (action) {
      case 'update_cursor': {
        const { x, y, field } = data || {};
        if (x === undefined || y === undefined) {
          return NextResponse.json(
            { error: 'x and y coordinates are required' },
            { status: 400 }
          );
        }

        websocketService.updateUserCursor(roomId, session.userId, x, y, field);

        return NextResponse.json({
          status: 'success',
          message: 'Cursor updated',
        });
      }

      case 'update_typing': {
        const { isTyping } = data || {};

        websocketService.updateTypingStatus(roomId, session.userId, isTyping);

        return NextResponse.json({
          status: 'success',
          message: 'Typing status updated',
        });
      }

      case 'lock': {
        const locked = await websocketService.lockEntity(roomId, session.userId, session.companyId);

        return NextResponse.json({
          status: 'success',
          locked,
          lockedBy: locked ? session.userId : undefined,
          message: locked ? 'Entity locked successfully' : 'Entity is already locked by another user',
        });
      }

      case 'unlock': {
        const unlocked = await websocketService.unlockEntity(
          roomId,
          session.userId,
          session.companyId
        );

        return NextResponse.json({
          status: 'success',
          unlocked,
          message: unlocked ? 'Entity unlocked successfully' : 'You do not have permission to unlock this entity',
        });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Collaboration presence error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Request failed' },
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
    const roomId = searchParams.get('roomId');

    if (!roomId) {
      return NextResponse.json({ error: 'roomId is required' }, { status: 400 });
    }

    const room = websocketService.getRoom(roomId);

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    return NextResponse.json({
      status: 'success',
      room,
      activeUsers: room.activeUsers,
      locked: room.locked,
      lockedBy: room.lockedBy,
    });
  } catch (error) {
    console.error('Get room presence error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve room presence' },
      { status: 500 }
    );
  }
}
