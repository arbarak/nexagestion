import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { calendarService } from '@/lib/calendar-service';

export async function POST(request: NextRequest) {
  try {
    const session = await verifyAuth(request);
    if (!session || !session.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { attendeeIds, durationMinutes, startDate, endDate, action } = await request.json();

    if (!attendeeIds || !durationMinutes || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'attendeeIds, durationMinutes, startDate, and endDate are required' },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (action === 'find_slots') {
      const slots = await calendarService.findAvailableSlots(
        session.companyId,
        start,
        end,
        durationMinutes,
        attendeeIds
      );

      return NextResponse.json({
        status: 'success',
        slots,
      });
    } else if (action === 'suggest_times') {
      const suggestedTimes = await calendarService.suggestMeetingTimes(
        session.companyId,
        attendeeIds,
        durationMinutes,
        start,
        end
      );

      return NextResponse.json({
        status: 'success',
        suggestedTimes,
      });
    } else if (action === 'schedule_automatic') {
      const title = request.headers.get('x-meeting-title') || 'Meeting';

      const event = await calendarService.scheduleMeetingAutomatic(
        session.companyId,
        title,
        attendeeIds,
        durationMinutes,
        start,
        end,
        session.userId
      );

      if (!event) {
        return NextResponse.json(
          { error: 'No available time slots found' },
          { status: 400 }
        );
      }

      return NextResponse.json({
        status: 'success',
        event,
      });
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Calendar availability error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Request failed' },
      { status: 500 }
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
    const attendeeId = searchParams.get('attendeeId') || session.userId;
    const startDate = new Date(searchParams.get('startDate') || new Date().toISOString());
    const endDate = new Date(searchParams.get('endDate') || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString());

    const availability = await calendarService.getAttendeeAvailability(
      session.companyId,
      attendeeId,
      startDate,
      endDate
    );

    return NextResponse.json({
      status: 'success',
      availability,
    });
  } catch (error) {
    console.error('Get attendee availability error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve availability' },
      { status: 500 }
    );
  }
}
