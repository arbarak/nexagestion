import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { calendarService } from '@/lib/calendar-service';

export async function GET(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const session = await verifyAuth(request);
    if (!session || !session.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { eventId } = params;

    // In production, fetch event from database
    // const event = await prisma.calendarEvent.findUnique({ where: { id: eventId } });

    return NextResponse.json({
      status: 'success',
      message: 'Event details would be returned here',
    });
  } catch (error) {
    console.error('Get event error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve event' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const session = await verifyAuth(request);
    if (!session || !session.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { eventId } = params;
    const updates = await request.json();

    const event = await calendarService.updateEvent(session.companyId, eventId, updates);

    return NextResponse.json({
      status: 'success',
      event,
    });
  } catch (error) {
    console.error('Update event error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update event' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const session = await verifyAuth(request);
    if (!session || !session.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { eventId } = params;
    const { reason } = await request.json().catch(() => ({}));

    await calendarService.cancelEvent(session.companyId, eventId, reason);

    return NextResponse.json({
      status: 'success',
      message: 'Event cancelled successfully',
    });
  } catch (error) {
    console.error('Cancel event error:', error);
    return NextResponse.json(
      { error: 'Failed to cancel event' },
      { status: 500 }
    );
  }
}
