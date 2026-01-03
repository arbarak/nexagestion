import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { calendarService } from '@/lib/calendar-service';

export async function POST(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session || !session.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();

    const event = await calendarService.createEvent(session.companyId, {
      ...data,
      organizerId: data.organizerId || session.userId,
    });

    return NextResponse.json({
      status: 'success',
      event,
    });
  } catch (error) {
    console.error('Create event error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create event' },
      { status: 400 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session || !session.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = new Date(searchParams.get('startDate') || new Date().toISOString());
    const endDate = new Date(searchParams.get('endDate') || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString());
    const viewType = (searchParams.get('viewType') || 'month') as 'day' | 'week' | 'month' | 'agenda';

    const calendarView = await calendarService.getCalendarView(
      session.companyId,
      viewType,
      startDate
    );

    return NextResponse.json({
      status: 'success',
      calendarView,
    });
  } catch (error) {
    console.error('Get calendar view error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve calendar' },
      { status: 500 }
    );
  }
}
