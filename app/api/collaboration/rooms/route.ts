import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { websocketService } from '@/lib/websocket-service';

export async function POST(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session || !session.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { entityType, entityId, action } = await request.json();

    if (!entityType || !entityId) {
      return NextResponse.json(
        { error: 'entityType and entityId are required' },
        { status: 400 }
      );
    }

    if (action === 'create') {
      const room = await websocketService.createRoom(
        entityType,
        entityId,
        session.companyId
      );

      return NextResponse.json({
        status: 'success',
        room,
      });
    } else if (action === 'join') {
      const clientId = Math.random().toString(36).substr(2, 9);
      const roomId = `${entityType}:${entityId}`;

      const { room, snapshot } = await websocketService.joinRoom(
        roomId,
        session.userId,
        session.userName || 'Unknown User',
        session.userEmail || '',
        session.companyId,
        clientId
      );

      return NextResponse.json({
        status: 'success',
        room,
        snapshot,
        clientId,
      });
    } else if (action === 'leave') {
      const roomId = `${entityType}:${entityId}`;
      await websocketService.leaveRoom(roomId, session.userId, session.companyId);

      return NextResponse.json({
        status: 'success',
        message: 'Left collaboration room',
      });
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Collaboration room error:', error);
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

    const userRooms = websocketService.getUserRooms(session.userId);

    return NextResponse.json({
      status: 'success',
      rooms: userRooms,
      count: userRooms.length,
    });
  } catch (error) {
    console.error('Get collaboration rooms error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve rooms' },
      { status: 500 }
    );
  }
}
